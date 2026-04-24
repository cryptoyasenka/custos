export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface SampleAlert {
  detector: string;
  severity: AlertSeverity;
  subject: string;
  txSignature: string | null;
  cluster: "mainnet" | "devnet" | "testnet";
  minutesAgo: number;
  explorerLink: string | null;
  context: Record<string, string>;
}

// Subjects and context keys match real daemon output from the devnet smoke run.
export const SAMPLE_ALERTS: SampleAlert[] = [
  {
    detector: "squads-timelock-removal",
    severity: "critical",
    subject: "Timelock removed on multisig AjULUVaCpzdGvCXgUkHLitkBR6nmn1M7AsHJ8sGgMZNy",
    txSignature: null,
    cluster: "devnet",
    minutesAgo: 1,
    explorerLink:
      "https://solscan.io/account/AjULUVaCpzdGvCXgUkHLitkBR6nmn1M7AsHJ8sGgMZNy?cluster=devnet",
    context: {
      reason: "timelock_reduced",
      previousTimelockSeconds: "86400",
      currentTimelockSeconds: "0",
      account: "AjULUVaCpzdGvCXgUkHLitkBR6nmn1M7AsHJ8sGgMZNy",
    },
  },
  {
    detector: "squads-multisig-weakening",
    severity: "high",
    subject: "Threshold weakened 3 → 1 on multisig AjULUVaCpzdGvCXgUkHLitkBR6nmn1M7AsHJ8sGgMZNy",
    txSignature: null,
    cluster: "devnet",
    minutesAgo: 3,
    explorerLink:
      "https://solscan.io/account/AjULUVaCpzdGvCXgUkHLitkBR6nmn1M7AsHJ8sGgMZNy?cluster=devnet",
    context: {
      reason: "threshold_reduced",
      previousThreshold: "3",
      currentThreshold: "1",
      account: "AjULUVaCpzdGvCXgUkHLitkBR6nmn1M7AsHJ8sGgMZNy",
    },
  },
  {
    detector: "privileged-nonce",
    severity: "critical",
    subject:
      "Nonce account 9rK8Ke7ZazGS7Knaj1i6oh9HBa2ocJCNhF9eDQegnfAS initialized with authority E9Q5UGyezdKVCZ8GDiAFRQfDarRb3REpTrYN3ytgEMzs",
    txSignature: null,
    cluster: "devnet",
    minutesAgo: 5,
    explorerLink:
      "https://solscan.io/account/9rK8Ke7ZazGS7Knaj1i6oh9HBa2ocJCNhF9eDQegnfAS?cluster=devnet",
    context: {
      reason: "nonce_initialized",
      account: "9rK8Ke7ZazGS7Knaj1i6oh9HBa2ocJCNhF9eDQegnfAS",
      authority: "E9Q5UGyezdKVCZ8GDiAFRQfDarRb3REpTrYN3ytgEMzs",
    },
  },
  {
    detector: "squads-multisig-weakening",
    severity: "low",
    subject:
      "Detector squads-multisig-weakening timed out processing AjULUVaCpzdGvCXgUkHLitkBR6nmn1M7AsHJ8sGgMZNy",
    txSignature: null,
    cluster: "devnet",
    minutesAgo: 14,
    explorerLink: null,
    context: {
      reason: "detector_timeout",
      timeoutMs: "5000",
      account: "AjULUVaCpzdGvCXgUkHLitkBR6nmn1M7AsHJ8sGgMZNy",
    },
  },
];
