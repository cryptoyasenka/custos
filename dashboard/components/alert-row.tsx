import type { SampleAlert } from "@/lib/sample-alerts";
import { SeverityBadge } from "./severity-badge";

function formatAgo(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function truncateKey(key: string): string {
  if (key.length <= 16) return key;
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

export function AlertRow({ alert }: { alert: SampleAlert }) {
  const contextEntries = Object.entries(alert.context);
  return (
    <li className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex items-center gap-2 sm:w-28 sm:shrink-0 sm:flex-col sm:items-start sm:gap-1 sm:pt-0.5">
        <SeverityBadge severity={alert.severity} />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          {formatAgo(alert.minutesAgo)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[11px] uppercase tracking-wider text-accent">
          {alert.detector}
        </div>
        <div className="mt-0.5 text-sm leading-relaxed text-foreground">
          {alert.subject}
        </div>
        {contextEntries.length > 0 && (
          <dl className="mt-2 grid gap-x-4 gap-y-0.5 font-mono text-[11px] text-muted-strong sm:grid-cols-[auto_1fr]">
            {contextEntries.map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="text-muted">{key}</dt>
                <dd className="truncate">{truncateKey(String(value))}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </li>
  );
}
