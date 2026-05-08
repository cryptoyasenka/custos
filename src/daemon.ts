import { pathToFileURL } from "node:url";
import { Connection } from "@solana/web3.js";
import { HttpEventSink } from "./alerts/http.js";
import { type AlertSink, StdoutAlertSink } from "./alerts/stdout.js";
import {
  DiscordAlertSink,
  FanOutAlertSink,
  SlackAlertSink,
  TelegramAlertSink,
} from "./alerts/webhook.js";
import { type DaemonConfig, loadConfigFromEnv } from "./config.js";
import { SquadsMultisigWeakeningDetector } from "./detectors/multisig-weakening.js";
import { PrivilegedNonceDetector } from "./detectors/privileged-nonce.js";
import { SignerSetChangeDetector } from "./detectors/signer-set-change.js";
import { StaleNonceExecutionDetector } from "./detectors/stale-nonce-execution.js";
import {
  SplGovernanceTimelockRemovalDetector,
  SquadsTimelockRemovalDetector,
} from "./detectors/timelock-removal.js";
import { startSupervisor } from "./supervisor.js";
import type { Detector } from "./types/events.js";

const DETECTORS: Detector[] = [
  SquadsTimelockRemovalDetector,
  SplGovernanceTimelockRemovalDetector,
  SquadsMultisigWeakeningDetector,
  SignerSetChangeDetector,
  PrivilegedNonceDetector,
  StaleNonceExecutionDetector,
];

function log(msg: string): void {
  process.stdout.write(`[custos] ${msg}\n`);
}

// Helius/QuickNode put the API key in the URL (?api-key=…, /v2/<key>/…).
// Logging the raw rpcUrl on startup leaks it to anything that scrapes stdout
// (Railway logs, journald, dev terminals shared on a stream). Strip path and
// query, keep host so operators can still see which RPC is in use.
export function redactRpcUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "<unparseable rpc url>";
  }
}

export interface RunOptions {
  // HttpEventSink also conforms to AlertSink and is included in the sink fan-out
  // by buildSinkFromConfig, but it owns a Node http server so it needs explicit
  // start/stop alongside the supervisor lifecycle.
  httpServer?: HttpEventSink | null;
}

export async function run(
  config: DaemonConfig,
  sink: AlertSink,
  opts: RunOptions = {},
): Promise<void> {
  log(
    `rpc=${redactRpcUrl(config.rpcUrl)} cluster=${config.cluster} watching=${config.watch.length} detectors=${DETECTORS.length}`,
  );
  if (config.watch.length === 0) {
    log("WARN: no watch entries configured. Set CUSTOS_WATCH=<program>:<account>[,...]");
  }

  if (opts.httpServer) {
    await opts.httpServer.start();
    log(`http endpoint listening on :${config.httpPort}`);
  }

  const supervisor = await startSupervisor({ config, sink, detectors: DETECTORS, log });

  await new Promise<void>((resolve) => {
    const shutdown = async (signal: string): Promise<void> => {
      log(`received ${signal}, shutting down`);
      await supervisor.stop();
      if (opts.httpServer) await opts.httpServer.stop();
      resolve();
    };
    process.once("SIGINT", () => void shutdown("SIGINT"));
    process.once("SIGTERM", () => void shutdown("SIGTERM"));
  });
}

export function buildSinkFromConfig(config: DaemonConfig, extraSinks: AlertSink[] = []): AlertSink {
  const sinks: AlertSink[] = [new StdoutAlertSink()];
  if (config.discordWebhookUrl) {
    sinks.push(new DiscordAlertSink({ url: config.discordWebhookUrl, label: "discord-webhook" }));
  }
  if (config.slackWebhookUrl) {
    sinks.push(new SlackAlertSink({ url: config.slackWebhookUrl, label: "slack-webhook" }));
  }
  if (config.telegramBotToken && config.telegramChatId) {
    sinks.push(
      new TelegramAlertSink({ botToken: config.telegramBotToken, chatId: config.telegramChatId }),
    );
  }
  for (const extra of extraSinks) sinks.push(extra);
  return sinks.length === 1 ? (sinks[0] as AlertSink) : new FanOutAlertSink(sinks);
}

export interface ValidateOptions {
  // Lets tests inject a fake Connection. Defaults to constructing a real one.
  connectionFactory?: (config: DaemonConfig) => Pick<Connection, "getSlot" | "getAccountInfo">;
  log?: (msg: string) => void;
}

export interface ValidateResult {
  ok: boolean;
  // Per-watch-entry status, in the order they appear in config.watch.
  accounts: { account: string; program: string; exists: boolean }[];
  rpcReachable: boolean;
  errors: string[];
}

// Loads config, checks RPC reachability, and probes each watched account once.
// Used by the --validate / --dry-run CLI flag so operators can sanity-check
// their setup without firing real alerts or holding a long-lived subscription.
export async function validate(
  config: DaemonConfig,
  opts: ValidateOptions = {},
): Promise<ValidateResult> {
  const log = opts.log ?? ((msg: string) => process.stdout.write(`[custos] ${msg}\n`));
  const factory =
    opts.connectionFactory ??
    ((c: DaemonConfig) =>
      new Connection(c.rpcUrl, { wsEndpoint: c.wsUrl, commitment: "confirmed" }));

  const conn = factory(config);
  const errors: string[] = [];
  let rpcReachable = false;

  log(
    `validating: rpc=${redactRpcUrl(config.rpcUrl)} cluster=${config.cluster} watching=${config.watch.length}`,
  );

  try {
    await conn.getSlot("confirmed");
    rpcReachable = true;
    log("  rpc reachable");
  } catch (err) {
    errors.push(`rpc unreachable: ${String(err)}`);
    log(`  rpc unreachable: ${String(err)}`);
  }

  const accounts: ValidateResult["accounts"] = [];
  for (const entry of config.watch) {
    const accountB58 = entry.account.toBase58();
    const programB58 = entry.program.toBase58();
    let exists = false;
    if (rpcReachable) {
      try {
        const info = await conn.getAccountInfo(entry.account, "confirmed");
        exists = info !== null;
        log(`  ${accountB58} ${exists ? "exists" : "(not yet on-chain — OK for nonce-init)"}`);
      } catch (err) {
        errors.push(`getAccountInfo failed for ${accountB58}: ${String(err)}`);
        log(`  ${accountB58} fetch failed: ${String(err)}`);
      }
    }
    accounts.push({ account: accountB58, program: programB58, exists });
  }

  const ok = rpcReachable && errors.length === 0;
  log(ok ? "validation OK" : `validation FAILED (${errors.length} errors)`);
  return { ok, accounts, rpcReachable, errors };
}

// Recognized CLI flags. Anything else is rejected so a typo doesn't silently
// fall through to the daemon.
const VALIDATE_FLAGS = new Set(["--validate", "--dry-run"]);
const HELP_FLAGS = new Set(["--help", "-h"]);

function printHelp(): void {
  process.stdout.write(
    [
      "Custos Nox — Solana multisig and DAO attack monitor",
      "",
      "Usage:",
      "  custos                Run the daemon (subscribe + alert until SIGINT/SIGTERM)",
      "  custos --validate     Load config, ping RPC, probe each watched account, exit",
      "  custos --dry-run      Alias for --validate",
      "  custos --help         Show this message",
      "",
      "Configuration is read from env vars; see .env.example.",
      "",
    ].join("\n"),
  );
}

async function main(argv: string[] = process.argv.slice(2)): Promise<void> {
  if (argv.some((a) => HELP_FLAGS.has(a))) {
    printHelp();
    return;
  }

  const config = loadConfigFromEnv();

  if (argv.some((a) => VALIDATE_FLAGS.has(a))) {
    const result = await validate(config);
    if (!result.ok) process.exit(1);
    return;
  }

  const httpServer =
    config.httpPort != null
      ? new HttpEventSink({
          port: config.httpPort,
          getWatchCount: () => config.watch.length,
        })
      : null;
  const sink = buildSinkFromConfig(config, httpServer ? [httpServer] : []);
  await run(config, sink, { httpServer });
}

// Only auto-start when this file is executed as the entry point (e.g. via
// `node dist/daemon.js` or `tsx src/daemon.ts`). Importing it for its
// exports — `run`, `buildSinkFromConfig` — must not kick off the daemon.
// pathToFileURL normalizes Windows paths (drive letter, backslashes) so the
// comparison with import.meta.url works on every platform.
const entryPath = process.argv[1];
const isEntryPoint = entryPath !== undefined && import.meta.url === pathToFileURL(entryPath).href;
if (isEntryPoint) {
  main().catch((err) => {
    process.stderr.write(`[custos] fatal: ${String(err)}\n`);
    process.exit(1);
  });
}
