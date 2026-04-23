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

export const SAMPLE_ALERTS: SampleAlert[] = [
  {
    detector: "privileged-nonce",
    severity: "critical",
    subject: "Durable nonce initialized with privileged authority",
    txSignature: null,
    cluster: "devnet",
    minutesAgo: 1,
    explorerLink: null,
    context: {
      account: "D4nxJXbksGiHmWaQ8QFXEE6aozy1AtS7fNw1vSgmUBCM",
      authority: "E9Q5UGyezdKVCZ8GDiAFRQfDarRb3REpTrYN3ytgEMzs",
      event: "initialization",
    },
  },
  {
    detector: "squads-multisig-weakening",
    severity: "high",
    subject: "Multisig threshold reduced 3-of-5 → 1-of-5",
    txSignature: null,
    cluster: "devnet",
    minutesAgo: 3,
    explorerLink: null,
    context: {
      multisig: "J99VK4xkxkaDXwnPazfgs2nr2Ysi6b4vszUTDX97Tvii",
      thresholdBefore: "3",
      thresholdAfter: "1",
    },
  },
  {
    detector: "spl-governance-timelock-removal",
    severity: "critical",
    subject: "Timelock removed (86400s → 0s) on Squads vault",
    txSignature: null,
    cluster: "devnet",
    minutesAgo: 5,
    explorerLink: null,
    context: {
      multisig: "J99VK4xkxkaDXwnPazfgs2nr2Ysi6b4vszUTDX97Tvii",
      timelockBefore: "86400",
      timelockAfter: "0",
    },
  },
  {
    detector: "squads-multisig-weakening",
    severity: "low",
    subject: "Detector timeout after 5000ms — auto-retry queued",
    txSignature: null,
    cluster: "devnet",
    minutesAgo: 14,
    explorerLink: null,
    context: {
      note: "operational signal, not an attack",
      multisig: "J99VK4xkxkaDXwnPazfgs2nr2Ysi6b4vszUTDX97Tvii",
    },
  },
];
