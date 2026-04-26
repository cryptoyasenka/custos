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
    detector: "squads-signer-set-change",
    severity: "high",
    subject: "Multisig AjULUVaCpzdGvCXgUkHLitkBR6nmn1M7AsHJ8sGgMZNy: 1 signer(s) removed, 1 added",
    txSignature: null,
    cluster: "devnet",
    minutesAgo: 4,
    explorerLink:
      "https://solscan.io/account/AjULUVaCpzdGvCXgUkHLitkBR6nmn1M7AsHJ8sGgMZNy?cluster=devnet",
    // Real detector context has `added` and `removed` as string[] (sorted base58).
    // For the demo this rotation involves one signer each, so we render them as
    // single base58 strings to match the existing AlertRow's truncation pattern.
    context: {
      reason: "signer_set_changed",
      account: "AjULUVaCpzdGvCXgUkHLitkBR6nmn1M7AsHJ8sGgMZNy",
      removed: "8wNTaRpyQqvBNeUpu5sHEiVj4kCksWpsLWQGcgctKuaB",
      added: "GpojCu8tiL1FCnA1pMGxqYDpLJyJjPZN7vSkPCFyx5Yh",
      previousCount: "5",
      currentCount: "5",
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
    detector: "stale-nonce-execution",
    severity: "high",
    subject:
      "Stale nonce 9rK8Ke7ZazGS7Knaj1i6oh9HBa2ocJCNhF9eDQegnfAS advanced 73 min after creation (authority: E9Q5UGyezdKVCZ8GDiAFRQfDarRb3REpTrYN3ytgEMzs)",
    txSignature: null,
    cluster: "devnet",
    minutesAgo: 8,
    explorerLink:
      "https://solscan.io/account/9rK8Ke7ZazGS7Knaj1i6oh9HBa2ocJCNhF9eDQegnfAS?cluster=devnet",
    context: {
      reason: "stale_nonce_advanced",
      account: "9rK8Ke7ZazGS7Knaj1i6oh9HBa2ocJCNhF9eDQegnfAS",
      authority: "E9Q5UGyezdKVCZ8GDiAFRQfDarRb3REpTrYN3ytgEMzs",
      staleMs: "4380000",
      staleMins: "73",
      thresholdMs: "3600000",
      firstSeenAt: "2026-04-01T07:12:00.000Z",
    },
  },
];
