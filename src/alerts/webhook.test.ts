import { describe, expect, it, vi } from "vitest";
import type { Alert } from "../types/events.js";
import {
  DiscordAlertSink,
  FanOutAlertSink,
  SlackAlertSink,
  TelegramAlertSink,
  buildDiscordPayload,
  buildSlackPayload,
  buildTelegramPayload,
  parseRetryAfter,
  postWithRetry,
} from "./webhook.js";

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    detector: "squads-multisig-weakening",
    severity: "high",
    subject: "Threshold weakened 3 → 1 on multisig ABC",
    txSignature: null,
    cluster: "devnet",
    timestamp: 1700000000,
    explorerLink: "https://solscan.io/account/ABC?cluster=devnet",
    context: { reason: "threshold_reduced", previousThreshold: 3, currentThreshold: 1 },
    ...overrides,
  };
}

const FIXED_NOW = () => new Date("2026-04-19T12:00:00.000Z");

describe("buildDiscordPayload", () => {
  it("uses severity color and includes subject, link, cluster, detector, and context", () => {
    const payload = buildDiscordPayload(makeAlert(), FIXED_NOW) as {
      embeds: Array<{
        title: string;
        color: number;
        url: string;
        timestamp: string;
        fields: Array<{ name: string; value: string }>;
      }>;
    };
    const embed = payload.embeds[0];
    expect(embed).toBeDefined();
    if (!embed) return;
    expect(embed.title).toContain("HIGH");
    expect(embed.title).toContain("Threshold weakened 3 → 1");
    expect(embed.color).toBe(0xea580c);
    expect(embed.url).toBe("https://solscan.io/account/ABC?cluster=devnet");
    expect(embed.timestamp).toBe("2026-04-19T12:00:00.000Z");
    const fieldNames = embed.fields.map((f) => f.name);
    expect(fieldNames).toEqual(["Detector", "Cluster", "Context"]);
    const ctx = embed.fields.find((f) => f.name === "Context");
    expect(ctx?.value).toContain("threshold_reduced");
  });

  it("colors critical red", () => {
    const payload = buildDiscordPayload(makeAlert({ severity: "critical" }), FIXED_NOW) as {
      embeds: Array<{ color: number }>;
    };
    expect(payload.embeds[0]?.color).toBe(0xb91c1c);
  });

  it("omits url field when explorerLink is empty (operational alerts)", () => {
    const payload = buildDiscordPayload(makeAlert({ explorerLink: "" }), FIXED_NOW) as {
      embeds: Array<Record<string, unknown>>;
    };
    expect("url" in (payload.embeds[0] ?? {})).toBe(false);
  });
});

describe("buildSlackPayload", () => {
  it("includes severity, detector, subject, link, and context block", () => {
    const payload = buildSlackPayload(makeAlert()) as {
      text: string;
      blocks: Array<{ text: { text: string } }>;
    };
    expect(payload.text).toContain("HIGH");
    expect(payload.text).toContain("Threshold weakened 3 → 1");
    expect(payload.blocks[0]?.text.text).toContain("squads-multisig-weakening");
    expect(payload.blocks[0]?.text.text).toContain("solscan.io");
    expect(payload.blocks[1]?.text.text).toContain("threshold_reduced");
  });

  it("omits the Solscan link when explorerLink is empty (operational alerts)", () => {
    const payload = buildSlackPayload(makeAlert({ explorerLink: "" })) as {
      blocks: Array<{ text: { text: string } }>;
    };
    expect(payload.blocks[0]?.text.text).not.toContain("View on Solscan");
    expect(payload.blocks[0]?.text.text).not.toContain("<|");
  });
});

describe("DiscordAlertSink", () => {
  it("POSTs a Discord-shaped payload to the webhook URL", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const sink = new DiscordAlertSink({
      url: "https://discord.com/api/webhooks/1/abc",
      label: "discord-webhook",
      now: FIXED_NOW,
      fetchImpl,
    });
    sink.handle(makeAlert());
    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(1));
    const [url, init] = fetchImpl.mock.calls[0] ?? [];
    expect(url).toBe("https://discord.com/api/webhooks/1/abc");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({ "content-type": "application/json" });
    const body = JSON.parse((init?.body as string | undefined) ?? "{}");
    expect(body.embeds[0].title).toContain("HIGH");
  });

  it("reports non-2xx responses to onError after retries are exhausted", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 429 }));
    const sleepImpl = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn();
    const sink = new DiscordAlertSink({
      url: "https://discord.com/api/webhooks/1/abc",
      label: "discord-webhook",
      now: FIXED_NOW,
      fetchImpl,
      sleepImpl,
      onError,
      maxAttempts: 2,
      baseDelayMs: 10,
    });
    sink.handle(makeAlert());
    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    const err = onError.mock.calls[0]?.[0] as Error;
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toContain("429");
  });

  it("reports fetch throws (network errors) to onError after retries are exhausted", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNRESET"));
    const sleepImpl = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn();
    const sink = new DiscordAlertSink({
      url: "https://discord.com/api/webhooks/1/abc",
      label: "discord-webhook",
      now: FIXED_NOW,
      fetchImpl,
      sleepImpl,
      onError,
      maxAttempts: 2,
      baseDelayMs: 10,
    });
    sink.handle(makeAlert());
    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    expect((onError.mock.calls[0]?.[0] as Error).message).toBe("ECONNRESET");
  });
});

describe("SlackAlertSink", () => {
  it("POSTs a Slack-shaped payload", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    const sink = new SlackAlertSink({
      url: "https://hooks.slack.com/services/T/B/X",
      label: "slack-webhook",
      fetchImpl,
    });
    sink.handle(makeAlert());
    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(1));
    const body = JSON.parse((fetchImpl.mock.calls[0]?.[1]?.body as string | undefined) ?? "{}");
    expect(body.text).toContain("HIGH");
    expect(body.blocks).toBeInstanceOf(Array);
  });
});

describe("buildTelegramPayload", () => {
  it("includes severity, subject, detector, cluster, context, and Solscan link", () => {
    const payload = buildTelegramPayload(makeAlert()) as { parse_mode: string; text: string };
    expect(payload.parse_mode).toBe("HTML");
    expect(payload.text).toContain("[HIGH]");
    expect(payload.text).toContain("Threshold weakened 3 → 1");
    expect(payload.text).toContain("squads-multisig-weakening");
    expect(payload.text).toContain("devnet");
    expect(payload.text).toContain("threshold_reduced");
    expect(payload.text).toContain("solscan.io");
  });

  it("omits link line when explorerLink is empty", () => {
    const payload = buildTelegramPayload(makeAlert({ explorerLink: "" })) as { text: string };
    expect(payload.text).not.toContain("Solscan");
    expect(payload.text).not.toContain("🔗");
  });
});

describe("TelegramAlertSink", () => {
  it("POSTs to the correct Telegram Bot API URL with chat_id", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    const sink = new TelegramAlertSink({
      botToken: "123:ABC",
      chatId: "-100123",
      fetchImpl,
    });
    sink.handle(makeAlert());
    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(1));
    const [url, init] = fetchImpl.mock.calls[0] ?? [];
    expect(url).toBe("https://api.telegram.org/bot123:ABC/sendMessage");
    const body = JSON.parse((init?.body as string | undefined) ?? "{}");
    expect(body.chat_id).toBe("-100123");
    expect(body.parse_mode).toBe("HTML");
    expect(body.text).toContain("[HIGH]");
  });

  it("reports non-2xx to onError after retries exhausted", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 400 }));
    const onError = vi.fn();
    const sink = new TelegramAlertSink({
      botToken: "tok",
      chatId: "-1",
      fetchImpl,
      onError,
      maxAttempts: 1,
    });
    sink.handle(makeAlert());
    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    expect((onError.mock.calls[0]?.[0] as Error).message).toContain("400");
  });

  it("reports fetch throws to onError", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNRESET"));
    const sleepImpl = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn();
    const sink = new TelegramAlertSink({
      botToken: "tok",
      chatId: "-1",
      fetchImpl,
      sleepImpl,
      onError,
      maxAttempts: 2,
      baseDelayMs: 1,
    });
    sink.handle(makeAlert());
    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    expect((onError.mock.calls[0]?.[0] as Error).message).toBe("ECONNRESET");
  });
});

describe("parseRetryAfter", () => {
  it("returns null for missing/invalid headers", () => {
    expect(parseRetryAfter(null)).toBeNull();
    expect(parseRetryAfter("")).toBeNull();
    expect(parseRetryAfter("not-a-number")).toBeNull();
    expect(parseRetryAfter("-1")).toBeNull();
  });

  it("converts seconds to ms (Discord float form supported)", () => {
    expect(parseRetryAfter("2")).toBe(2_000);
    expect(parseRetryAfter("0.5")).toBe(500);
  });

  it("caps at 60 seconds to bound delay", () => {
    expect(parseRetryAfter("3600")).toBe(60_000);
  });
});

describe("postWithRetry", () => {
  it("retries on 429 and honors Retry-After", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 429, headers: { "retry-after": "0.5" } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const sleepImpl = vi.fn().mockResolvedValue(undefined);
    const res = await postWithRetry("https://x", { a: 1 }, fetchImpl, { sleepImpl });
    expect(res.status).toBe(204);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleepImpl).toHaveBeenCalledTimes(1);
    expect(sleepImpl).toHaveBeenCalledWith(500);
  });

  it("retries on 500 with exponential backoff", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(new Response(null, { status: 502 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    const sleepImpl = vi.fn().mockResolvedValue(undefined);
    const res = await postWithRetry("https://x", { a: 1 }, fetchImpl, {
      sleepImpl,
      baseDelayMs: 100,
    });
    expect(res.status).toBe(200);
    expect(sleepImpl).toHaveBeenCalledTimes(2);
    // First retry: baseDelay * 2^0 = 100
    expect(sleepImpl).toHaveBeenNthCalledWith(1, 100);
    // Second retry: baseDelay * 2^1 = 200
    expect(sleepImpl).toHaveBeenNthCalledWith(2, 200);
  });

  it("does not retry on 4xx other than 429", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    const sleepImpl = vi.fn().mockResolvedValue(undefined);
    const res = await postWithRetry("https://x", { a: 1 }, fetchImpl, { sleepImpl });
    expect(res.status).toBe(404);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(sleepImpl).not.toHaveBeenCalled();
  });

  it("returns the last response after maxAttempts retryable failures", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 503 }));
    const sleepImpl = vi.fn().mockResolvedValue(undefined);
    const res = await postWithRetry("https://x", { a: 1 }, fetchImpl, {
      sleepImpl,
      maxAttempts: 3,
      baseDelayMs: 10,
    });
    expect(res.status).toBe(503);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    // Sleep happens between attempts 1→2 and 2→3, not after the last failure.
    expect(sleepImpl).toHaveBeenCalledTimes(2);
  });

  it("retries on fetch throw and rethrows after maxAttempts", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNRESET"));
    const sleepImpl = vi.fn().mockResolvedValue(undefined);
    await expect(
      postWithRetry("https://x", { a: 1 }, fetchImpl, {
        sleepImpl,
        maxAttempts: 2,
        baseDelayMs: 10,
      }),
    ).rejects.toThrow("ECONNRESET");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleepImpl).toHaveBeenCalledTimes(1);
  });
});

describe("DiscordAlertSink retries", () => {
  it("retries 429 then succeeds — onError not called", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 429, headers: { "retry-after": "0.1" } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const sleepImpl = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn();
    const sink = new DiscordAlertSink({
      url: "https://discord.com/api/webhooks/1/abc",
      label: "discord-webhook",
      now: FIXED_NOW,
      fetchImpl,
      sleepImpl,
      onError,
    });
    sink.handle(makeAlert());
    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(2));
    expect(onError).not.toHaveBeenCalled();
  });

  it("calls onError after exhausting retries on persistent 500", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    const sleepImpl = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn();
    const sink = new DiscordAlertSink({
      url: "https://discord.com/api/webhooks/1/abc",
      label: "discord-webhook",
      now: FIXED_NOW,
      fetchImpl,
      sleepImpl,
      onError,
      maxAttempts: 2,
      baseDelayMs: 10,
    });
    sink.handle(makeAlert());
    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect((onError.mock.calls[0]?.[0] as Error).message).toContain("500");
  });
});

describe("FanOutAlertSink", () => {
  it("dispatches to every child sink", () => {
    const a = { handle: vi.fn() };
    const b = { handle: vi.fn() };
    const fan = new FanOutAlertSink([a, b]);
    const alert = makeAlert();
    fan.handle(alert);
    expect(a.handle).toHaveBeenCalledWith(alert);
    expect(b.handle).toHaveBeenCalledWith(alert);
  });

  it("continues when one sink throws", () => {
    const boom = {
      handle: vi.fn().mockImplementation(() => {
        throw new Error("boom");
      }),
    };
    const good = { handle: vi.fn() };
    const fan = new FanOutAlertSink([boom, good]);
    fan.handle(makeAlert());
    expect(boom.handle).toHaveBeenCalled();
    expect(good.handle).toHaveBeenCalled();
  });
});
