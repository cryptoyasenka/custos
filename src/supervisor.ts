import { type AccountInfo, Connection, type Context } from "@solana/web3.js";
import type { AlertSink } from "./alerts/stdout.js";
import type { DaemonConfig, WatchEntry } from "./config.js";
import { dispatch } from "./registry.js";
import type { AccountChangeEvent, Detector } from "./types/events.js";

const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 60_000;
const DEFAULT_HEALTH_CHECK_INTERVAL_MS = 30_000;

export function nextBackoff(current: number): number {
  return Math.min(current * 2, MAX_BACKOFF_MS);
}

export interface SupervisorOptions {
  config: DaemonConfig;
  sink: AlertSink;
  detectors: Detector[];
  // Pluggable for tests so we can feed in a fake Connection that simulates
  // disconnects / slot advancement. Defaults to constructing a real
  // Connection from the config.
  connectionFactory?: (config: DaemonConfig) => Connection;
  healthCheckIntervalMs?: number;
  log?: (msg: string) => void;
}

export interface Supervisor {
  stop: () => Promise<void>;
}

export async function startSupervisor(opts: SupervisorOptions): Promise<Supervisor> {
  const {
    config,
    sink,
    detectors,
    healthCheckIntervalMs = DEFAULT_HEALTH_CHECK_INTERVAL_MS,
    log = (msg) => process.stdout.write(`[custos] ${msg}\n`),
  } = opts;

  const connectionFactory =
    opts.connectionFactory ??
    ((c: DaemonConfig) =>
      new Connection(c.rpcUrl, { wsEndpoint: c.wsUrl, commitment: "confirmed" }));

  const previous = new Map<string, Buffer>();
  let connection: Connection | null = null;
  let healthTimer: NodeJS.Timeout | null = null;
  let backoffMs = INITIAL_BACKOFF_MS;
  let stopping = false;
  let reconnecting = false;

  async function seedBaseline(conn: Connection, entry: WatchEntry): Promise<void> {
    const key = entry.account.toBase58();
    try {
      const initial = await conn.getAccountInfo(entry.account, "confirmed");
      const current = initial ? Buffer.from(initial.data) : null;
      const prev = previous.get(key) ?? null;
      // On reconnect, we already hold the baseline from before the drop. If
      // the on-chain state shifted during the disconnect window, feed the
      // diff through the detectors as a synthesized change so we don't
      // silently lose an attack step that landed while the WS was down.
      if (prev && current && !prev.equals(current)) {
        log(`reconcile diff on ${key} after reconnect — dispatching synthetic event`);
        const event: AccountChangeEvent = {
          kind: "account_change",
          program: entry.program,
          account: entry.account,
          data: current,
          previousData: prev,
          slot: 0,
          signature: null,
          timestamp: Math.floor(Date.now() / 1000),
          cluster: config.cluster,
        };
        dispatch(event, detectors)
          .then((alerts) => {
            for (const alert of alerts) sink.handle(alert);
          })
          .catch((err) => {
            process.stderr.write(`[custos] reconcile dispatch error: ${String(err)}\n`);
          });
      }
      if (current) {
        previous.set(key, current);
      }
    } catch (err) {
      log(`  baseline fetch failed for ${key}: ${String(err)}`);
    }
  }

  function subscribe(conn: Connection, entry: WatchEntry): void {
    const key = entry.account.toBase58();
    log(`subscribe account=${key} program=${entry.program.toBase58()}`);
    conn.onAccountChange(
      entry.account,
      (info: AccountInfo<Buffer>, ctx: Context) => {
        const prev = previous.get(key) ?? null;
        const data = Buffer.from(info.data);
        previous.set(key, data);
        const event: AccountChangeEvent = {
          kind: "account_change",
          program: entry.program,
          account: entry.account,
          data,
          previousData: prev,
          slot: ctx.slot,
          signature: null,
          timestamp: Math.floor(Date.now() / 1000),
          cluster: config.cluster,
        };
        dispatch(event, detectors)
          .then((alerts) => {
            for (const alert of alerts) sink.handle(alert);
          })
          .catch((err) => {
            process.stderr.write(`[custos] dispatch error: ${String(err)}\n`);
          });
      },
      "confirmed",
    );
  }

  async function connectAndSubscribe(): Promise<void> {
    connection = connectionFactory(config);
    await Promise.all(config.watch.map((entry) => seedBaseline(connection as Connection, entry)));
    for (const entry of config.watch) {
      subscribe(connection, entry);
    }
  }

  async function reconnect(reason: string): Promise<void> {
    if (stopping || reconnecting) return;
    reconnecting = true;
    log(`reconnecting (${reason}), backoff=${backoffMs}ms`);
    connection = null; // drop old connection; GC closes underlying WS
    await sleep(backoffMs);
    if (stopping) {
      reconnecting = false;
      return;
    }
    try {
      await connectAndSubscribe();
      log("reconnected");
      backoffMs = INITIAL_BACKOFF_MS;
    } catch (err) {
      log(`reconnect failed: ${String(err)}`);
      backoffMs = nextBackoff(backoffMs);
    } finally {
      reconnecting = false;
    }
  }

  async function healthCheck(): Promise<void> {
    if (stopping || !connection || reconnecting) return;
    try {
      await connection.getSlot("confirmed");
    } catch (err) {
      log(`health check failed: ${String(err)}`);
      void reconnect("rpc health check failed");
    }
  }

  await connectAndSubscribe();
  healthTimer = setInterval(() => {
    void healthCheck();
  }, healthCheckIntervalMs);

  return {
    async stop(): Promise<void> {
      stopping = true;
      if (healthTimer) {
        clearInterval(healthTimer);
        healthTimer = null;
      }
      // Give in-flight dispatches a brief moment to finish before dropping.
      await sleep(50);
      connection = null;
    },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
