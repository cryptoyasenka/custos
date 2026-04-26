import { SeverityBadge } from "./severity-badge";

interface TimelineStep {
  date: string;
  leadTime: string | null;
  event: string;
  detector: string;
  severity: "critical" | "high";
  description: string;
}

const STEPS: TimelineStep[] = [
  {
    date: "Mar 23, 2026",
    leadTime: "9 days before drain",
    event: "Nonce initialized",
    detector: "PrivilegedNonceDetector",
    severity: "critical",
    description:
      "Attacker creates a durable nonce under a privileged key. A pre-signed drain tx is now valid and waiting.",
  },
  {
    date: "Mar 26, 2026",
    leadTime: "6 days before drain",
    event: "Timelock removed",
    detector: "TimelockRemovalDetector",
    severity: "critical",
    description:
      "Governance timelock dropped from 6 days to 0, closing the community's response window.",
  },
  {
    date: "Mar 26, 2026",
    leadTime: "6 days before drain",
    event: "Multisig migrated",
    detector: "MultisigWeakeningDetector",
    severity: "high",
    description:
      "Security Council multisig migrated to a new 2-of-5 threshold with zero timelock — minimum quorum, instant execution.",
  },
  {
    date: "Apr 1, 2026",
    leadTime: null,
    event: "$285M drained",
    detector: "StaleNonceExecutionDetector",
    severity: "high",
    description:
      "Week-old pre-signed admin transfer executes. Funds move to attacker wallet within 12 minutes.",
  },
];

export function DriftTimeline() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-sev-critical/30 bg-sev-critical/5 px-5 py-4">
        <p className="font-mono text-sm font-semibold text-sev-critical">
          First alert fires 9 days before the drain.
        </p>
        <p className="mt-1 text-sm text-muted-strong">
          Any single one of these detectors firing would have given treasury managers days to
          respond — pause withdrawals, rotate signers, or escalate to the community.
        </p>
      </div>

      <div className="relative">
        {/* Connector line (desktop) */}
        <div className="absolute top-5 right-0 left-0 hidden h-px bg-border md:block" />

        <div className="grid gap-4 md:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.event} className="relative flex flex-col gap-3">
              {/* Dot on the line */}
              <div className="hidden items-start md:flex">
                <div
                  className={`relative z-10 mt-3 h-3 w-3 shrink-0 rounded-full border-2 ${
                    step.severity === "critical"
                      ? "border-sev-critical bg-sev-critical"
                      : "border-sev-high bg-sev-high"
                  }`}
                />
              </div>

              {/* Card */}
              <div
                className={`flex flex-col gap-2.5 rounded-lg border p-4 ${
                  step.leadTime === null
                    ? "border-border bg-surface/50 opacity-60"
                    : "border-border bg-surface hover:border-border-strong"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <SeverityBadge severity={step.severity} />
                  {step.leadTime ? (
                    <span className="font-mono text-[10px] text-muted">{step.leadTime}</span>
                  ) : (
                    <span className="font-mono text-[10px] font-semibold text-sev-critical">
                      DRAIN
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    {step.date}
                  </p>
                  <p className="mt-1 font-semibold tracking-tight">{step.event}</p>
                </div>
                <p className="font-mono text-[10px] text-accent">{step.detector}</p>
                <p className="text-xs leading-relaxed text-muted-strong">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
