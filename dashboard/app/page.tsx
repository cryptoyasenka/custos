import { DetectorCard } from "@/components/detector-card";
import { DriftTimeline } from "@/components/drift-timeline";
import { LiveFeed } from "@/components/live-feed";
import { LiveStatusBar } from "@/components/live-status-bar";
import { DETECTORS } from "@/lib/detectors";
import Image from "next/image";
import Link from "next/link";

const GITHUB_URL = "https://github.com/cryptoyasenka/custos-nox";

const STATS = [
  { label: "Detectors live", value: "5" },
  { label: "Tests passing", value: "215" },
  { label: "Drift loss tracked", value: "$285M" },
  { label: "Alert latency", value: "< 1s" },
];

export default function Home() {
  const productionDetectors = DETECTORS.filter((d) => d.status === "production");
  const roadmapDetectors = DETECTORS.filter((d) => d.status === "roadmap");

  return (
    <div className="relative flex min-h-screen flex-col">
      <nav className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Custos Nox" width={32} height={32} priority />
            <span className="font-semibold tracking-tight">Custos Nox</span>
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <div className="hidden items-center gap-5 sm:flex">
              <a
                href="#detectors"
                className="text-muted-strong transition-colors hover:text-foreground"
              >
                Detectors
              </a>
              <a
                href="#timeline"
                className="text-muted-strong transition-colors hover:text-foreground"
              >
                Timeline
              </a>
              <a href="#live" className="text-muted-strong transition-colors hover:text-foreground">
                Live
              </a>
              <a
                href="#install"
                className="text-muted-strong transition-colors hover:text-foreground"
              >
                Install
              </a>
            </div>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-border px-3 py-1.5 font-mono text-xs tracking-wide text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              GitHub →
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-20 lg:py-28">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-strong">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  v0.3 · 5 detectors · MIT
                </span>
                <LiveStatusBar />
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Watch the chain
                <br />
                <span className="text-accent">before it drains your treasury</span>
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-strong">
                Custos Nox is an open-source real-time attack monitor for Solana multisigs and DAOs.
                It detects every on-chain step of the $285M Drift drain on April 1, 2026 — plus an
                adjacent signer-rotation vector — before the stolen funds leave the chain.
              </p>
              <div className="max-w-2xl rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm text-muted-strong">
                <span className="text-foreground">Solana Foundation&apos;s STRIDE program</span>{" "}
                monitors protocols with $10M+ TVL — roughly 50 protocols.{" "}
                <span className="text-accent">
                  The other 10,000+ multisigs and DAOs have nothing
                </span>{" "}
                — Custos Nox is for them
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-muted-strong"
                >
                  View on GitHub
                </a>
                <a
                  href="#install"
                  className="inline-flex items-center gap-2 rounded-md border border-border-strong px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  Install in 5 min
                </a>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dd className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                    {stat.value}
                  </dd>
                  <dt className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="detectors" className="border-b border-border">
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <div className="mb-10 flex flex-col gap-3">
              <h2 className="text-3xl font-semibold tracking-tight">What it catches</h2>
              <p className="max-w-2xl text-muted-strong">
                Every detector maps directly to a step in the Drift April 2026 attack chain. Any
                single one firing would have bought hours of response time.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {productionDetectors.map((detector) => (
                <DetectorCard key={detector.id} detector={detector} />
              ))}
            </div>
            {roadmapDetectors.length > 0 && (
              <div className="mt-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                    Roadmap
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {roadmapDetectors.map((detector) => (
                    <DetectorCard key={detector.id} detector={detector} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-border bg-surface/40">
          <div className="mx-auto w-full max-w-5xl px-6 py-16">
            <div className="mb-10 flex flex-col gap-3">
              <h2 className="text-3xl font-semibold tracking-tight">Who should run this</h2>
              <p className="max-w-2xl text-muted-strong">
                If you control a Squads multisig or an SPL Governance realm, Custos Nox watches it
                for you. Setup takes five minutes.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
                <div className="font-mono text-[11px] uppercase tracking-wider text-accent">
                  DAO treasuries
                </div>
                <p className="text-sm leading-relaxed text-muted-strong">
                  Your multisig PDA is one environment variable. Add a Discord, Slack, or Telegram
                  webhook. Any threshold change, timelock removal, or signer rotation fires an alert
                  to your team within a second.
                </p>
              </div>
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
                <div className="font-mono text-[11px] uppercase tracking-wider text-accent">
                  Grant committees
                </div>
                <p className="text-sm leading-relaxed text-muted-strong">
                  Grant multisigs often have fewer signers and less oversight than protocol
                  treasuries. Custos Nox gives them the same real-time coverage as a full-time
                  security team — for free.
                </p>
              </div>
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
                <div className="font-mono text-[11px] uppercase tracking-wider text-accent">
                  Security researchers
                </div>
                <p className="text-sm leading-relaxed text-muted-strong">
                  Point Custos Nox at any set of Squads or SPL Governance accounts and get real-time
                  feed of config changes. Useful for monitoring suspicious multisigs or building
                  public watchdog dashboards.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-surface/20">
          <div className="mx-auto w-full max-w-5xl px-6 py-16">
            <div className="mb-8 flex flex-col gap-3">
              <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
              <p className="max-w-2xl text-muted-strong">
                A WebSocket daemon, five independent detectors, parallel alert fan-out — sub-second
                latency from on-chain change to alert in your team&apos;s channel
              </p>
            </div>
            <div className="flex flex-col items-center gap-0 font-mono text-sm">
              <div className="rounded-lg border border-accent/40 bg-accent/5 px-6 py-3 text-center">
                <div className="font-semibold text-foreground">Solana Chain</div>
                <div className="mt-0.5 text-xs text-muted">account state changes</div>
              </div>
              <div className="flex h-8 flex-col items-center justify-center">
                <div className="h-full w-px bg-border" />
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  WebSocket · &lt;1s
                </div>
                <div className="h-2 w-px bg-border" />
              </div>
              <div className="w-full max-w-lg rounded-lg border border-border bg-surface px-6 py-4 text-center">
                <div className="font-semibold text-foreground">Custos Nox Daemon</div>
                <div className="mt-3 grid grid-cols-5 gap-1">
                  {["Timelock", "Weakening", "Priv. Nonce", "Stale Nonce", "Signer Set"].map(
                    (d) => (
                      <div
                        key={d}
                        className="rounded bg-accent/10 px-1 py-1.5 text-center text-[10px] text-accent leading-tight"
                      >
                        {d}
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="flex h-8 flex-col items-center justify-center">
                <div className="h-2 w-px bg-border" />
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  parallel fan-out
                </div>
                <div className="h-2 w-px bg-border" />
              </div>
              <div className="grid w-full max-w-lg grid-cols-4 gap-3">
                {[
                  { label: "Discord", sub: "embeds" },
                  { label: "Slack", sub: "blocks" },
                  { label: "Telegram", sub: "bot" },
                  { label: "stdout", sub: "always on" },
                ].map((sink) => (
                  <div
                    key={sink.label}
                    className="rounded-lg border border-border bg-surface px-3 py-2.5 text-center"
                  >
                    <div className="font-semibold text-foreground">{sink.label}</div>
                    <div className="mt-0.5 text-[10px] text-muted">{sink.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-6 text-center font-mono text-xs text-muted">
              TypeScript · Solana web3.js · 215 tests · MIT · zero Rust
            </p>
          </div>
        </section>

        <section id="timeline" className="border-b border-border">
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <div className="mb-10 flex flex-col gap-3">
              <h2 className="text-3xl font-semibold tracking-tight">
                How the Drift attack unfolded
              </h2>
              <p className="max-w-2xl text-muted-strong">
                The April 2026 Drift exploit was not a zero-day — it was a 9-day on-chain
                preparation. Every step was observable. None were flagged.
              </p>
            </div>
            <DriftTimeline />
          </div>
        </section>

        <section id="live" className="border-b border-border">
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <div className="mb-10 flex flex-col gap-3">
              <h2 className="text-3xl font-semibold tracking-tight">
                Live mainnet — 12 Solana DAOs under continuous watch
              </h2>
              <p className="max-w-2xl text-muted-strong">
                Custos Nox is running on mainnet right now, subscribed to the governance accounts of
                12 ecosystem DAOs (Mango, Marinade, Pyth, Solend, Jupiter, Raydium, Orca, Bonk,
                Helius, Squads, Superteam, MonkeDAO). The feed below polls the daemon every 5
                seconds. When configs are calm the dots stay green; if any of the five detectors
                fires, the alert lands here within a second.
              </p>
              <p className="max-w-2xl font-mono text-xs uppercase tracking-wider text-muted">
                Falls back to a devnet attack-simulation sample when the daemon is unreachable so
                you can still see what an active alert looks like.
              </p>
            </div>
            <LiveFeed />
          </div>
        </section>

        <section id="install" className="border-b border-border">
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <div className="mb-8 flex flex-col gap-3">
              <h2 className="text-3xl font-semibold tracking-tight">Self-host in 5 minutes</h2>
              <p className="max-w-2xl text-muted-strong">
                One binary, zero vendor lock-in. Runs on any Node.js 20+ or Docker. Free-tier Helius
                RPC is enough to get started.
              </p>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-surface p-5">
                <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-accent font-mono text-sm font-semibold text-background">
                  1
                </div>
                <div className="mb-1.5 font-semibold text-foreground">Get a free RPC key</div>
                <p className="text-sm text-muted-strong">
                  Sign up at{" "}
                  <a
                    href="https://helius.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline-offset-2 hover:underline"
                  >
                    helius.dev
                  </a>{" "}
                  — free tier, no credit card. Copy your endpoint URL into{" "}
                  <code className="rounded bg-surface-elevated px-1 font-mono text-xs">
                    CUSTOS_RPC_URL
                  </code>
                  .
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-5">
                <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-accent font-mono text-sm font-semibold text-background">
                  2
                </div>
                <div className="mb-1.5 font-semibold text-foreground">
                  Point it at your multisig
                </div>
                <p className="text-sm text-muted-strong">
                  Set{" "}
                  <code className="rounded bg-surface-elevated px-1 font-mono text-xs">
                    CUSTOS_WATCH
                  </code>{" "}
                  to your Squads PDA or SPL Governance realm. Comma-separate multiple accounts.
                  Optionally add a Discord, Slack, or Telegram webhook.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-5">
                <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-accent font-mono text-sm font-semibold text-background">
                  3
                </div>
                <div className="mb-1.5 font-semibold text-foreground">Start the daemon</div>
                <p className="text-sm text-muted-strong">
                  Run{" "}
                  <code className="rounded bg-surface-elevated px-1 font-mono text-xs">
                    npm run dev
                  </code>{" "}
                  or the Docker one-liner below. Alerts arrive in Discord, Slack, Telegram, or
                  stdout within a second of any config change.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="border-b border-border bg-surface-elevated px-4 py-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                  npm
                </span>
              </div>
              <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-relaxed">
                <code>{`git clone https://github.com/cryptoyasenka/custos-nox
cd custos-nox
npm install
cp .env.example .env        # set CUSTOS_RPC_URL and CUSTOS_WATCH
npm run dev                 # daemon connects, seeds baseline, starts watching`}</code>
              </pre>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
              <div className="border-b border-border bg-surface-elevated px-4 py-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                  docker
                </span>
              </div>
              <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-relaxed">
                <code>{`docker build -t custos .
docker run -d --name custos --restart unless-stopped --env-file .env custos
docker logs -f custos`}</code>
              </pre>
            </div>

            <div className="mt-6 grid gap-4 text-sm text-muted-strong sm:grid-cols-3">
              <div>
                <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                  Prereqs
                </div>
                Node.js 20+, an RPC endpoint (Helius free tier works), accounts to watch (Squads
                PDA, SPL Governance realm, or nonce account).
              </div>
              <div>
                <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                  Alerts go to
                </div>
                stdout by default. Optional Discord, Slack, and Telegram webhooks fan out every
                alert to every configured sink.
              </div>
              <div>
                <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                  Reliability
                </div>
                WebSocket reconnect with exponential backoff, baseline seeding before subscribe, 5s
                per-detector timeout with low-severity surfaced errors.
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="" width={20} height={20} />
            <span className="text-muted-strong">Custos Nox</span>
            <span>· MIT · Built for the Solana Frontier Hackathon</span>
          </div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs tracking-wide text-muted-strong transition-colors hover:text-accent"
          >
            github.com/cryptoyasenka/custos-nox →
          </a>
        </div>
      </footer>
    </div>
  );
}
