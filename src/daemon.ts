import { pathToFileURL } from "node:url";
import { type AlertSink, StdoutAlertSink } from "./alerts/stdout.js";
import { DiscordAlertSink, FanOutAlertSink, SlackAlertSink } from "./alerts/webhook.js";
import { type DaemonConfig, loadConfigFromEnv } from "./config.js";
import { SquadsMultisigWeakeningDetector } from "./detectors/multisig-weakening.js";
import { PrivilegedNonceDetector } from "./detectors/privileged-nonce.js";
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
  PrivilegedNonceDetector,
];

function log(msg: string): void {
  process.stdout.write(`[custos] ${msg}\n`);
}

export async function run(config: DaemonConfig, sink: AlertSink): Promise<void> {
  log(
    `rpc=${config.rpcUrl} cluster=${config.cluster} watching=${config.watch.length} detectors=${DETECTORS.length}`,
  );
  if (config.watch.length === 0) {
    log("WARN: no watch entries configured. Set CUSTOS_WATCH=<program>:<account>[,...]");
  }

  const supervisor = await startSupervisor({ config, sink, detectors: DETECTORS, log });

  await new Promise<void>((resolve) => {
    const shutdown = async (signal: string): Promise<void> => {
      log(`received ${signal}, shutting down`);
      await supervisor.stop();
      resolve();
    };
    process.once("SIGINT", () => void shutdown("SIGINT"));
    process.once("SIGTERM", () => void shutdown("SIGTERM"));
  });
}

export function buildSinkFromConfig(config: DaemonConfig): AlertSink {
  const sinks: AlertSink[] = [new StdoutAlertSink()];
  if (config.discordWebhookUrl) {
    sinks.push(new DiscordAlertSink({ url: config.discordWebhookUrl, label: "discord-webhook" }));
  }
  if (config.slackWebhookUrl) {
    sinks.push(new SlackAlertSink({ url: config.slackWebhookUrl, label: "slack-webhook" }));
  }
  return sinks.length === 1 ? (sinks[0] as AlertSink) : new FanOutAlertSink(sinks);
}

async function main(): Promise<void> {
  const config = loadConfigFromEnv();
  const sink = buildSinkFromConfig(config);
  await run(config, sink);
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
