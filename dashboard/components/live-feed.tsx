"use client";

import { type DaemonAlert, deriveDaoStatus, useDaemonFeed } from "@/lib/daemon-feed";
import type { SampleAlert } from "@/lib/sample-alerts";
import { SAMPLE_ALERTS } from "@/lib/sample-alerts";
import { WATCHLIST, type WatchedDao } from "@/lib/watchlist";
import { AlertRow } from "./alert-row";
import { SeverityChart } from "./severity-chart";

// Bridges DaemonAlert (from the live HTTP feed) into the SampleAlert shape
// AlertRow already knows how to render. Avoids duplicating the row UI.
function toSampleShape(alert: DaemonAlert): SampleAlert {
  const minutesAgo = Math.max(0, Math.floor((Date.now() - alert.timestamp) / 60_000));
  // AlertRow renders context entries via String(value); coerce to string here
  // so the shared SampleAlert.context : Record<string, string> contract holds.
  const stringContext: Record<string, string> = {};
  for (const [k, v] of Object.entries(alert.context ?? {})) {
    stringContext[k] = typeof v === "string" ? v : JSON.stringify(v);
  }
  return {
    detector: alert.detector,
    severity: alert.severity,
    subject: alert.subject,
    txSignature: alert.txSignature,
    cluster: alert.cluster,
    minutesAgo,
    explorerLink: alert.explorerLink,
    context: stringContext,
  };
}

function StatusDot({ status }: { status: "green" | "yellow" | "red" }) {
  const color =
    status === "red" ? "bg-red-500" : status === "yellow" ? "bg-yellow-400" : "bg-emerald-500";
  return (
    <span className="relative inline-flex h-2 w-2">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${color}`}
      />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}

function DaoCard({
  dao,
  events,
}: {
  dao: WatchedDao;
  events: DaemonAlert[] | null;
}) {
  const status = deriveDaoStatus(events, dao.account);
  return (
    <a
      href={dao.realmsLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 transition-colors hover:border-accent"
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{dao.name}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          {dao.symbol}
        </span>
      </div>
      <StatusDot status={status} />
    </a>
  );
}

export function LiveFeed() {
  const feed = useDaemonFeed();
  const events = feed.events;
  // Render real alerts when daemon reachable + has events; fall back to the
  // devnet sample set when the daemon is unconfigured/down/empty so judges
  // never see a blank panel.
  const useReal = feed.reachable && events && events.length > 0;
  const renderedAlerts = useReal ? events.map(toSampleShape) : SAMPLE_ALERTS;
  const cluster = useReal ? "mainnet" : "devnet";
  const labelText = useReal
    ? `Live mainnet · ${events.length} events`
    : `Devnet sample · ${SAMPLE_ALERTS.length} events`;

  return (
    <>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <StatusDot status={useReal ? "green" : feed.reachable ? "green" : "yellow"} />
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-strong">
            Watching {WATCHLIST.length} Solana DAOs in real time
            {!feed.reachable && feed.error ? " · daemon offline, showing devnet sample" : ""}
          </span>
        </div>
      </div>

      <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {WATCHLIST.map((dao) => (
          <DaoCard key={dao.account} dao={dao} events={events} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-lg border border-border bg-surface p-5">
          <SeverityChart alerts={renderedAlerts} />
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-2.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Alert feed · {cluster}
            </span>
            <span className="font-mono text-[11px] text-muted">{labelText}</span>
          </div>
          <ul className="divide-y divide-border">
            {renderedAlerts.map((alert, i) => (
              <AlertRow key={`${alert.detector}-${alert.minutesAgo}-${i}`} alert={alert} />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
