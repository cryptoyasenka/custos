import type { AlertSeverity, SampleAlert } from "@/lib/sample-alerts";

const ORDER: AlertSeverity[] = ["critical", "high", "medium", "low"];

const colorVar: Record<AlertSeverity, string> = {
  critical: "var(--sev-critical)",
  high: "var(--sev-high)",
  medium: "var(--sev-medium)",
  low: "var(--sev-low)",
};

const labels: Record<AlertSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function SeverityChart({ alerts }: { alerts: SampleAlert[] }) {
  const counts = ORDER.map((sev) => ({
    severity: sev,
    count: alerts.filter((a) => a.severity === sev).length,
  }));
  const maxCount = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-end justify-between gap-3">
        {counts.map(({ severity, count }) => {
          const heightPct = (count / maxCount) * 100;
          return (
            <div
              key={severity}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="font-mono text-lg font-semibold tabular-nums text-foreground">
                {count}
              </div>
              <div className="relative h-32 w-full overflow-hidden rounded border border-border bg-surface-elevated/50">
                <div
                  className="absolute inset-x-0 bottom-0 transition-[height]"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: colorVar[severity],
                    opacity: count === 0 ? 0.15 : 0.85,
                  }}
                />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {labels[severity]}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        Severity breakdown — {alerts.length} sample events
      </p>
    </div>
  );
}
