import type { Alert, AlertSeverity } from "../types/events.js";

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  critical: "\x1b[1;41m",
  high: "\x1b[1;31m",
  medium: "\x1b[1;33m",
  low: "\x1b[1;36m",
};
const RESET = "\x1b[0m";

export interface FormatOptions {
  color?: boolean;
  now?: () => Date;
}

export function safeStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(value, (_key, val) => {
      if (typeof val === "bigint") return val.toString();
      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) return "[circular]";
        seen.add(val);
      }
      return val;
    });
  } catch {
    return "[unserializable]";
  }
}

export function formatAlert(alert: Alert, opts: FormatOptions = {}): string {
  const color = opts.color ?? true;
  const now = opts.now ?? (() => new Date());
  const timestamp = now().toISOString();
  const sev = alert.severity.toUpperCase().padEnd(8);
  const tag = color ? `${SEVERITY_COLOR[alert.severity]}${sev}${RESET}` : sev;
  const contextJson = safeStringify(alert.context);
  return [
    `${timestamp} ${tag} [${alert.detector}] ${alert.subject}`,
    `  link: ${alert.explorerLink}`,
    `  ctx:  ${contextJson}`,
  ].join("\n");
}

export interface AlertSink {
  handle(alert: Alert): void;
}

export class StdoutAlertSink implements AlertSink {
  private readonly color: boolean;

  constructor(opts: { color?: boolean } = {}) {
    this.color = opts.color ?? process.stdout.isTTY === true;
  }

  handle(alert: Alert): void {
    process.stdout.write(`${formatAlert(alert, { color: this.color })}\n`);
  }
}
