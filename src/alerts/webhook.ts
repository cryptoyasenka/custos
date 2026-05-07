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

const DEFAULT_MAX_ATTEMPTS = 4;
const DEFAULT_BASE_DELAY_MS = 500;
const MAX_BACKOFF_DELAY_MS = 60_000;

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  sleepImpl?: (ms: number) => Promise<void>;
}

export interface WebhookAlertSinkOptions extends RetryOptions {
  url: string;
  label: string;
  now?: () => Date;
  // Injected for tests so we don't hit real webhook endpoints.
  fetchImpl?: typeof fetch;
  // If the webhook POST fails, where to log the error. Defaults to stderr.
  onError?: (err: unknown) => void;
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pickRetryOptions(opts: RetryOptions): RetryOptions {
  // exactOptionalPropertyTypes forbids passing undefined explicitly into an
  // optional property — only set keys that the caller actually provided.
  const out: RetryOptions = {};
  if (opts.maxAttempts !== undefined) out.maxAttempts = opts.maxAttempts;
  if (opts.baseDelayMs !== undefined) out.baseDelayMs = opts.baseDelayMs;
  if (opts.sleepImpl !== undefined) out.sleepImpl = opts.sleepImpl;
  return out;
}

// Discord and Slack both return Retry-After in seconds (Discord may also
// include sub-second floats). RFC 7231 also allows an HTTP-date here, but
// neither service uses that form in practice — we cap at 60s to bound delay.
export function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  return Math.min(Math.ceil(seconds * 1000), MAX_BACKOFF_DELAY_MS);
}

export async function postWithRetry(
  url: string,
  body: unknown,
  fetchImpl: typeof fetch,
  opts: RetryOptions = {},
): Promise<Response> {
  const maxAttempts = opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const baseDelayMs = opts.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const sleepImpl = opts.sleepImpl ?? defaultSleep;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetchImpl(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) return res;
      // 429 + 5xx are retryable. Other 4xx (auth, payload) won't resolve on
      // retry — bubble up immediately so onError sees the real status.
      const retryable = res.status === 429 || res.status >= 500;
      if (!retryable || attempt === maxAttempts) return res;
      const retryAfterMs = parseRetryAfter(res.headers.get("retry-after"));
      const backoffMs = baseDelayMs * 2 ** (attempt - 1);
      await sleepImpl(retryAfterMs ?? Math.min(backoffMs, MAX_BACKOFF_DELAY_MS));
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts) throw err;
      const backoffMs = baseDelayMs * 2 ** (attempt - 1);
      await sleepImpl(Math.min(backoffMs, MAX_BACKOFF_DELAY_MS));
    }
  }
  throw lastErr ?? new Error("postWithRetry: unreachable");
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
  private readonly retryOpts: RetryOptions;

  constructor(opts: WebhookAlertSinkOptions) {
    this.url = opts.url;
    this.label = opts.label;
    this.now = opts.now ?? (() => new Date());
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.onError =
      opts.onError ?? ((err) => process.stderr.write(`[${this.label}] ${String(err)}\n`));
    this.retryOpts = pickRetryOptions(opts);
  }

  handle(alert: Alert): void {
    // Fire and forget; we don't want to block other sinks on a slow webhook.
    void this.dispatch(alert);
  }

  private async dispatch(alert: Alert): Promise<void> {
    try {
      const res = await postWithRetry(
        this.url,
        buildDiscordPayload(alert, this.now),
        this.fetchImpl,
        this.retryOpts,
      );
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
  private readonly retryOpts: RetryOptions;

  constructor(opts: Omit<WebhookAlertSinkOptions, "now">) {
    this.url = opts.url;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.onError =
      opts.onError ?? ((err) => process.stderr.write(`[slack-webhook] ${String(err)}\n`));
    this.retryOpts = pickRetryOptions(opts);
  }

  handle(alert: Alert): void {
    void this.dispatch(alert);
  }

  private async dispatch(alert: Alert): Promise<void> {
    try {
      const res = await postWithRetry(
        this.url,
        buildSlackPayload(alert),
        this.fetchImpl,
        this.retryOpts,
      );
      if (!res.ok) {
        this.onError(new Error(`slack webhook returned ${res.status} ${res.statusText}`));
      }
    } catch (err) {
      this.onError(err);
    }
  }
}

export interface TelegramAlertSinkOptions extends RetryOptions {
  botToken: string;
  chatId: string;
  fetchImpl?: typeof fetch;
  onError?: (err: unknown) => void;
}

export function buildTelegramPayload(alert: Alert): unknown {
  const severity = alert.severity.toUpperCase();
  const linkLine = alert.explorerLink
    ? `\n<a href="${alert.explorerLink}">🔗 View on Solscan</a>`
    : "";
  return {
    parse_mode: "HTML",
    text: `<b>[${severity}]</b> ${alert.subject}${linkLine}\n\n<b>Detector:</b> <code>${alert.detector}</code>\n<b>Cluster:</b> ${alert.cluster}\n\n<pre>${safeStringify(alert.context)}</pre>`,
  };
}

export class TelegramAlertSink implements AlertSink {
  private readonly botToken: string;
  private readonly chatId: string;
  private readonly fetchImpl: typeof fetch;
  private readonly onError: (err: unknown) => void;
  private readonly retryOpts: RetryOptions;

  constructor(opts: TelegramAlertSinkOptions) {
    this.botToken = opts.botToken;
    this.chatId = opts.chatId;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.onError =
      opts.onError ?? ((err) => process.stderr.write(`[telegram-bot] ${String(err)}\n`));
    this.retryOpts = pickRetryOptions(opts);
  }

  handle(alert: Alert): void {
    void this.dispatch(alert);
  }

  private async dispatch(alert: Alert): Promise<void> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    try {
      const payload = buildTelegramPayload(alert) as Record<string, unknown>;
      const res = await postWithRetry(
        url,
        { chat_id: this.chatId, ...payload },
        this.fetchImpl,
        this.retryOpts,
      );
      if (!res.ok) {
        this.onError(new Error(`telegram bot returned ${res.status} ${res.statusText}`));
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
