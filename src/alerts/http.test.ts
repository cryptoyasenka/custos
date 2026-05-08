import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Alert } from "../types/events.js";
import { HttpEventSink } from "./http.js";

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    detector: "squads-timelock-removal",
    severity: "critical",
    subject: "Timelock removed on multisig ABC",
    txSignature: "sig123",
    cluster: "mainnet",
    timestamp: 1700000000,
    explorerLink: "https://solscan.io/tx/sig123",
    context: { reason: "timelock_reduced" },
    ...overrides,
  };
}

// Pulls the actual port back out so tests that started on :0 can hit the server.
function port(sink: HttpEventSink): number {
  const internal = sink as unknown as { server: { address(): AddressInfo | string | null } | null };
  const addr = internal.server?.address();
  if (!addr || typeof addr === "string") throw new Error("no address");
  return addr.port;
}

async function fetchJson(
  url: string,
): Promise<{ status: number; headers: Headers; body: unknown }> {
  const res = await fetch(url);
  const body = await res.json();
  return { status: res.status, headers: res.headers, body };
}

describe("HttpEventSink", () => {
  let sink: HttpEventSink;

  beforeEach(() => {
    // port: 0 = let the OS pick a free port so tests don't collide.
    sink = new HttpEventSink({ port: 0, getWatchCount: () => 7 });
  });

  afterEach(async () => {
    await sink.stop();
  });

  it("buffers handled alerts", () => {
    sink.handle(makeAlert());
    sink.handle(makeAlert({ subject: "second" }));
    const internal = sink as unknown as { buffer: Alert[] };
    expect(internal.buffer).toHaveLength(2);
  });

  it("evicts oldest when buffer exceeds bufferSize", () => {
    const small = new HttpEventSink({ port: 0, bufferSize: 2 });
    small.handle(makeAlert({ subject: "a" }));
    small.handle(makeAlert({ subject: "b" }));
    small.handle(makeAlert({ subject: "c" }));
    const internal = small as unknown as { buffer: Alert[] };
    expect(internal.buffer).toHaveLength(2);
    expect(internal.buffer[0]?.subject).toBe("b");
    expect(internal.buffer[1]?.subject).toBe("c");
  });

  it("serves buffered alerts from GET /events with CORS", async () => {
    await sink.start();
    sink.handle(makeAlert({ subject: "alpha" }));
    sink.handle(makeAlert({ subject: "beta" }));

    const { status, headers, body } = await fetchJson(`http://127.0.0.1:${port(sink)}/events`);
    expect(status).toBe(200);
    expect(headers.get("access-control-allow-origin")).toBe("*");
    const parsed = body as { events: Alert[]; total: number; since: number | null };
    expect(parsed.events).toHaveLength(2);
    expect(parsed.events[0]?.subject).toBe("alpha");
    expect(parsed.total).toBe(2);
  });

  it("filters /events by ?since=<timestamp>", async () => {
    await sink.start();
    sink.handle(makeAlert({ subject: "old", timestamp: 1000 }));
    sink.handle(makeAlert({ subject: "new", timestamp: 2000 }));

    const { body } = await fetchJson(`http://127.0.0.1:${port(sink)}/events?since=1500`);
    const parsed = body as { events: Alert[] };
    expect(parsed.events).toHaveLength(1);
    expect(parsed.events[0]?.subject).toBe("new");
  });

  it("GET /health reports watch count via getWatchCount and ok=true", async () => {
    await sink.start();
    sink.handle(makeAlert());

    const { status, body } = await fetchJson(`http://127.0.0.1:${port(sink)}/health`);
    expect(status).toBe(200);
    const parsed = body as {
      ok: boolean;
      watching: number;
      uptime: number;
      lastEventAt: number | null;
      alertsServed: number;
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.watching).toBe(7);
    expect(parsed.alertsServed).toBe(1);
    expect(parsed.lastEventAt).not.toBeNull();
    expect(typeof parsed.uptime).toBe("number");
  });

  it("returns 404 for unknown routes", async () => {
    await sink.start();
    const res = await fetch(`http://127.0.0.1:${port(sink)}/nope`);
    expect(res.status).toBe(404);
  });

  it("handles CORS preflight (OPTIONS) with 204 + headers", async () => {
    await sink.start();
    const res = await fetch(`http://127.0.0.1:${port(sink)}/events`, { method: "OPTIONS" });
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(res.headers.get("access-control-allow-methods")).toContain("GET");
  });

  it("rejects non-GET methods with 405", async () => {
    await sink.start();
    const res = await fetch(`http://127.0.0.1:${port(sink)}/events`, { method: "POST" });
    expect(res.status).toBe(405);
  });

  it("stop() is idempotent", async () => {
    await sink.start();
    await sink.stop();
    await expect(sink.stop()).resolves.toBeUndefined();
  });
});
