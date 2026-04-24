import type { Alert, AlertSeverity } from "../types/events.js";
import type { AlertSink } from "./stdout.js";
import { safeStringify } from "./stdout.js";

// Discord embeds are colored by a decimal RGB int. These match the severity
// scheme used by the stdout sink: red/orange/yellow/cyan.
const DISCORD_COLOR: Record<AlertSeverity, number> = {
  critical: 0xb91c1c,
  high: 0xea580c,
  medium: 0xf59e0b,
  low: 0x0891b2,
};

export interface WebhookAlertSinkOptions {
  url: string;
  label: string;
  now?: () => Date;
  // Injected for tests so we don't hit real webhook endpoints.
  fetchImpl?: typeof fetch;
  // If the webhook POST fails, where to log the error. Defaults to stderr.
  onError?: (err: unknown) => void;
}

export function buildDiscordPayload(alert: Alert, now: () => Date): unknown {
  const timestamp = now().toISOString();
  return {
    username: "Custos Nox",
    embeds: [
      {
        title: `[${alert.severity.toUpperCase()}] ${alert.subject}`,
        color: DISCORD_COLOR[alert.severity],
        ...(alert.explorerLink ? { url: alert.explorerLink } : {}),
        timestamp,
        fields: [
          { name: "Detector", value: alert.detector, inline: true },
          { name: "Cluster", value: alert.cluster, inline: true },
          {
            name: "Context",
            value: `\`\`\`json\n${safeStringify(alert.context)}\n\`\`\``,
          },
        ],
      },
    ],
  };
}

export function buildSlackPayload(alert: Alert): unknown {
  const linkSuffix = alert.explorerLink ? `\n<${alert.explorerLink}|View on Solscan>` : "";
  return {
    text: `[${alert.severity.toUpperCase()}] ${alert.subject}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*[${alert.severity.toUpperCase()}]* \`${alert.detector}\` — ${alert.subject}${linkSuffix}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\`\`\`${safeStringify(alert.context)}\`\`\``,
        },
      },
    ],
  };
}

export class DiscordAlertSink implements AlertSink {
  private readonly url: string;
  private readonly label: string;
  private readonly now: () => Date;
  private readonly fetchImpl: typeof fetch;
  private readonly onError: (err: unknown) => void;

  constructor(opts: WebhookAlertSinkOptions) {
    this.url = opts.url;
    this.label = opts.label;
    this.now = opts.now ?? (() => new Date());
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.onError =
      opts.onError ?? ((err) => process.stderr.write(`[${this.label}] ${String(err)}\n`));
  }

  handle(alert: Alert): void {
    // Fire and forget; we don't want to block other sinks on a slow webhook.
    void this.dispatch(alert);
  }

  private async dispatch(alert: Alert): Promise<void> {
    try {
      const res = await this.fetchImpl(this.url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildDiscordPayload(alert, this.now)),
      });
      if (!res.ok) {
        this.onError(new Error(`webhook returned ${res.status} ${res.statusText}`));
      }
    } catch (err) {
      this.onError(err);
    }
  }
}

export class SlackAlertSink implements AlertSink {
  private readonly url: string;
  private readonly fetchImpl: typeof fetch;
  private readonly onError: (err: unknown) => void;

  constructor(opts: Omit<WebhookAlertSinkOptions, "now">) {
    this.url = opts.url;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.onError =
      opts.onError ?? ((err) => process.stderr.write(`[slack-webhook] ${String(err)}\n`));
  }

  handle(alert: Alert): void {
    void this.dispatch(alert);
  }

  private async dispatch(alert: Alert): Promise<void> {
    try {
      const res = await this.fetchImpl(this.url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildSlackPayload(alert)),
      });
      if (!res.ok) {
        this.onError(new Error(`slack webhook returned ${res.status} ${res.statusText}`));
      }
    } catch (err) {
      this.onError(err);
    }
  }
}

export class FanOutAlertSink implements AlertSink {
  private readonly sinks: readonly AlertSink[];

  constructor(sinks: readonly AlertSink[]) {
    this.sinks = sinks;
  }

  handle(alert: Alert): void {
    for (const s of this.sinks) {
      try {
        s.handle(alert);
      } catch (err) {
        process.stderr.write(`[custos] sink threw: ${String(err)}\n`);
      }
    }
  }
}
