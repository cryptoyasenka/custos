import { type IncomingMessage, type Server, type ServerResponse, createServer } from "node:http";
import type { Alert } from "../types/events.js";
import { type AlertSink, safeStringify } from "./stdout.js";

// Public-readable HTTP endpoint that the dashboard polls to render the live
// mainnet feed. Buffers the last N alerts in memory and serves them as JSON.
// No auth: alerts about public DAOs are themselves public, and the watchlist
// is documented in the repo. CORS = *.
//
// Routes:
//   GET /events   { events: Alert[], total: number, since: number | null }
//   GET /health   { ok: true, watching: number, uptime: number, lastEventAt: number | null, alertsServed: number }

export interface HttpEventSinkOptions {
  port: number;
  bufferSize?: number;
  // Lets daemon.ts pass watch-list size into /health.
  getWatchCount?: () => number;
  // Tests inject a synthetic clock.
  now?: () => number;
  onError?: (err: unknown) => void;
}

export class HttpEventSink implements AlertSink {
  private readonly buffer: Alert[] = [];
  private readonly bufferSize: number;
  private readonly port: number;
  private readonly getWatchCount: () => number;
  private readonly now: () => number;
  private readonly onError: (err: unknown) => void;
  private readonly startedAt: number;
  private server: Server | null = null;
  private alertsServed = 0;
  private lastEventAt: number | null = null;

  constructor(opts: HttpEventSinkOptions) {
    this.port = opts.port;
    this.bufferSize = opts.bufferSize ?? 100;
    this.getWatchCount = opts.getWatchCount ?? (() => 0);
    this.now = opts.now ?? (() => Date.now());
    this.onError =
      opts.onError ?? ((err) => process.stderr.write(`[custos-http] ${String(err)}\n`));
    this.startedAt = this.now();
  }

  handle(alert: Alert): void {
    this.buffer.push(alert);
    if (this.buffer.length > this.bufferSize) this.buffer.shift();
    this.lastEventAt = this.now();
    this.alertsServed += 1;
  }

  async start(): Promise<void> {
    this.server = createServer((req, res) => this.route(req, res));
    await new Promise<void>((resolve, reject) => {
      const server = this.server;
      if (!server) {
        reject(new Error("server not initialized"));
        return;
      }
      server.once("error", reject);
      server.listen(this.port, () => {
        server.off("error", reject);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (!this.server) return;
    const server = this.server;
    this.server = null;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  private route(req: IncomingMessage, res: ServerResponse): void {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-methods", "GET");
    res.setHeader("cache-control", "no-store");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.method !== "GET") {
      res.writeHead(405, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "method not allowed" }));
      return;
    }
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname === "/events") {
      const sinceParam = url.searchParams.get("since");
      const since = sinceParam ? Number(sinceParam) : null;
      const events =
        since && Number.isFinite(since)
          ? this.buffer.filter((a) => a.timestamp > since)
          : this.buffer;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(safeStringify({ events, total: events.length, since }));
      return;
    }
    if (url.pathname === "/health") {
      const body = {
        ok: true,
        watching: this.getWatchCount(),
        uptime: Math.floor((this.now() - this.startedAt) / 1000),
        lastEventAt: this.lastEventAt,
        alertsServed: this.alertsServed,
      };
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
      return;
    }
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
  }
}
