import { type AccountInfo, Connection, type Context } from "@solana/web3.js";
import { type AlertSink, StdoutAlertSink } from "./alerts/stdout.js";
import { type DaemonConfig, type WatchEntry, loadConfigFromEnv } from "./config.js";
import { SquadsMultisigWeakeningDetector } from "./detectors/multisig-weakening.js";
import {
  SplGovernanceTimelockRemovalDetector,
  SquadsTimelockRemovalDetector,
} from "./detectors/timelock-removal.js";
import { dispatch } from "./registry.js";
import type { AccountChangeEvent, Detector } from "./types/events.js";

const DETECTORS: Detector[] = [
  SquadsTimelockRemovalDetector,
  SplGovernanceTimelockRemovalDetector,
  SquadsMultisigWeakeningDetector,
];

function log(msg: string): void {
  process.stdout.write(`[custos] ${msg}\n`);
}

function subscribeWatch(
  connection: Connection,
  entry: WatchEntry,
  config: DaemonConfig,
  sink: AlertSink,
  previous: Map<string, Buffer>,
): void {
  const key = entry.account.toBase58();
  log(`subscribe account=${key} program=${entry.program.toBase58()}`);

  connection.onAccountChange(
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

      dispatch(event, DETECTORS)
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

export async function run(config: DaemonConfig, sink: AlertSink): Promise<void> {
  log(
    `rpc=${config.rpcUrl} cluster=${config.cluster} watching=${config.watch.length} detectors=${DETECTORS.length}`,
  );
  if (config.watch.length === 0) {
    log("WARN: no watch entries configured. Set CUSTOS_WATCH=<program>:<account>[,...]");
  }

  const connection = new Connection(config.rpcUrl, {
    wsEndpoint: config.wsUrl,
    commitment: "confirmed",
  });

  const previous = new Map<string, Buffer>();
  for (const entry of config.watch) {
    subscribeWatch(connection, entry, config, sink, previous);
  }

  const shutdown = (signal: string): void => {
    log(`received ${signal}, shutting down`);
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  await new Promise<never>(() => {
    /* run forever */
  });
}

async function main(): Promise<void> {
  const config = loadConfigFromEnv();
  const sink = new StdoutAlertSink();
  await run(config, sink);
}

main().catch((err) => {
  process.stderr.write(`[custos] fatal: ${String(err)}\n`);
  process.exit(1);
});
