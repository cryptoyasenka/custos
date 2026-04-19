import { describe, expect, it, vi } from "vitest";
import type { Alert } from "../types/events.js";
import {
  DiscordAlertSink,
  FanOutAlertSink,
  SlackAlertSink,
  buildDiscordPayload,
  buildSlackPayload,
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

  it("reports non-2xx responses to onError", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 429 }));
    const onError = vi.fn();
    const sink = new DiscordAlertSink({
      url: "https://discord.com/api/webhooks/1/abc",
      label: "discord-webhook",
      now: FIXED_NOW,
      fetchImpl,
      onError,
    });
    sink.handle(makeAlert());
    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    const err = onError.mock.calls[0]?.[0] as Error;
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toContain("429");
  });

  it("reports fetch throws (network errors) to onError", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNRESET"));
    const onError = vi.fn();
    const sink = new DiscordAlertSink({
      url: "https://discord.com/api/webhooks/1/abc",
      label: "discord-webhook",
      now: FIXED_NOW,
      fetchImpl,
      onError,
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
