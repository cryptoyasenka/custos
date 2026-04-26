import { AlertRow } from "@/components/alert-row";
import { DetectorCard } from "@/components/detector-card";
import { DriftTimeline } from "@/components/drift-timeline";
import { SeverityChart } from "@/components/severity-chart";
import { DETECTORS } from "@/lib/detectors";
import { SAMPLE_ALERTS } from "@/lib/sample-alerts";
import Image from "next/image";

const GITHUB_URL = "https://github.com/cryptoyasenka/custos-nox";

const STATS = [
  { label: "Detectors live", value: "4" },
  { label: "Tests passing", value: "164" },
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
          <a href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Custos Nox" width={32} height={32} priority />
            <span className="font-semibold tracking-tight">Custos Nox</span>
          </a>
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
                Replay
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
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-strong">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                v0.3 · 4 detectors · MIT
              </span>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Watch the chain
                <br />
                <span className="text-accent">before it drains your treasury.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-strong">
                Custos Nox is an open-source real-time attack monitor for Solana multisigs and DAOs.
                It detects all 4 on-chain vectors used to drain $285M from Drift on April 1, 2026 —
                before the stolen funds leave the chain.
              </p>
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
              <h2 className="text-3xl font-semibold tracking-tight">Attack chain replay</h2>
              <p className="max-w-2xl text-muted-strong">
                All four Drift attack steps replayed against a devnet harness. Each fires a distinct
                detector within a second — the same sequence that went undetected on mainnet in
                April 2026.
              </p>
              <p className="max-w-2xl font-mono text-xs uppercase tracking-wider text-muted">
                ⚠ Not live mainnet data — sample events for demo purposes
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <div className="rounded-lg border border-border bg-surface p-5">
                <SeverityChart alerts={SAMPLE_ALERTS} />
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-surface">
                <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-2.5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                    Alert feed · devnet
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {SAMPLE_ALERTS.length} events
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {SAMPLE_ALERTS.map((alert) => (
                    <AlertRow key={`${alert.detector}-${alert.minutesAgo}`} alert={alert} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="install" className="border-b border-border">
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <div className="mb-8 flex flex-col gap-3">
              <h2 className="text-3xl font-semibold tracking-tight">Self-host in 5 minutes</h2>
              <p className="max-w-2xl text-muted-strong">
                One binary, zero vendor lock-in. Runs on any Node.js 20+ or the published Docker
                image. Free-tier Helius or the public devnet RPC is enough to get started.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="border-b border-border bg-surface-elevated px-4 py-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                  bash
                </span>
              </div>
              <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-relaxed">
                <code>{`git clone https://github.com/cryptoyasenka/custos-nox
cd custos-nox
npm install
cp .env.example .env        # edit CUSTOS_WATCH with your accounts
npm run dev                 # daemon connects, seeds baseline, starts watching`}</code>
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
                stdout by default. Optional Discord and Slack webhooks fan out every alert to every
                configured sink.
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
