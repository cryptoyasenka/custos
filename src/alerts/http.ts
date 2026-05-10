import { type IncomingMessage, type Server, type ServerResponse, createServer } from "node:http";
import type { Alert } from "../types/events.js";
import { type AlertSink, safeStringify } from "./stdout.js";

// Public-readable HTTP endpoint that the dashboard polls to render the live
// mainnet feed. Buffers the last N alerts in memory and serves them as JSON.
// No auth: alerts about public DAOs are themselves public, and the watchlist
// is documented in the repo. CORS = *.
//
// Routes:
//   GET /         human-readable HTML landing (so judges hitting the bare URL
//                 don't see a raw 404)
//   GET /events   { events: Alert[], total: number, since: number | null }
//   GET /health   { ok: true, watching: number, uptime: number, lastEventAt: number | null, alertsServed: number }

export interface HttpEventSinkOptions {
  port: number;
  // Bind address. Defaults to "0.0.0.0"; see CUSTOS_HTTP_HOST in config.ts.
  host?: string;
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
  private readonly host: string;
  private readonly getWatchCount: () => number;
  private readonly now: () => number;
  private readonly onError: (err: unknown) => void;
  private readonly startedAt: number;
  private server: Server | null = null;
  private alertsServed = 0;
  private lastEventAt: number | null = null;

  constructor(opts: HttpEventSinkOptions) {
    this.port = opts.port;
    this.host = opts.host ?? "0.0.0.0";
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
      server.listen(this.port, this.host, () => {
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
    if (url.pathname === "/" || url.pathname === "") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(this.renderLanding());
      return;
    }
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
  }

  private renderLanding(): string {
    const watching = this.getWatchCount();
    const uptimeSec = Math.floor((this.now() - this.startedAt) / 1000);
    const lastEvent =
      this.lastEventAt === null ? "no events yet" : new Date(this.lastEventAt).toISOString();
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Custos Nox — daemon</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 48px 24px; font: 15px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace; background: #0a0e0c; color: #d8e0db; }
  main { max-width: 720px; margin: 0 auto; }
  h1 { margin: 0 0 8px; font-size: 28px; letter-spacing: 0.5px; color: #7fc99a; font-family: ui-sans-serif, system-ui, sans-serif; }
  .tag { display: inline-block; padding: 2px 8px; margin-bottom: 24px; border: 1px solid #2a3530; border-radius: 999px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #7fc99a; }
  p { color: #a8b3ad; margin: 0 0 16px; }
  .grid { display: grid; gap: 8px; grid-template-columns: max-content 1fr; padding: 16px; margin: 24px 0; border: 1px solid #1f2a25; border-radius: 8px; background: #0d1311; }
  .grid dt { color: #6b7872; }
  .grid dd { margin: 0; color: #d8e0db; }
  ul { padding-left: 20px; }
  li { margin: 4px 0; }
  code, a code { background: #131a17; padding: 2px 6px; border-radius: 4px; color: #c4d1ca; font-size: 13px; }
  a { color: #7fc99a; }
  a:hover { color: #a8e0bb; }
  hr { border: none; border-top: 1px solid #1f2a25; margin: 32px 0; }
  footer { color: #6b7872; font-size: 12px; }
</style>
</head>
<body>
<main>
  <span class="tag">● daemon online</span>
  <h1>Custos Nox</h1>
  <p>Open-source watchtower for Solana DAO multisigs and SPL Governance forks.<br>This URL is the daemon's machine API. The human dashboard is a separate frontend that polls this endpoint.</p>

  <dl class="grid">
    <dt>watching</dt><dd>${watching} mainnet PDAs</dd>
    <dt>uptime</dt><dd>${uptimeSec}s</dd>
    <dt>alerts buffered</dt><dd>${this.buffer.length}</dd>
    <dt>alerts served</dt><dd>${this.alertsServed}</dd>
    <dt>last event</dt><dd>${lastEvent}</dd>
  </dl>

  <p>API endpoints:</p>
  <ul>
    <li><a href="/health"><code>GET /health</code></a> — liveness probe + counters</li>
    <li><a href="/events"><code>GET /events</code></a> — buffered alerts (last 100)</li>
    <li><code>GET /events?since=&lt;unix-seconds&gt;</code> — alerts after timestamp</li>
  </ul>

  <hr />
  <footer>
    Project: <a href="https://github.com/cryptoyasenka/custos-nox">github.com/cryptoyasenka/custos-nox</a><br>
    Built for the Solana Frontier Hackathon — Ukrainian Sidetrack &amp; Public Goods Award.
  </footer>
</main>
</body>
</html>`;
  }
}
