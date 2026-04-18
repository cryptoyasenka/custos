import type { PublicKey } from "@solana/web3.js";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export type Cluster = "mainnet" | "devnet" | "testnet";

export interface AccountChangeEvent {
  kind: "account_change";
  program: PublicKey;
  account: PublicKey;
  data: Buffer;
  previousData: Buffer | null;
  slot: number;
  signature: string | null;
  timestamp: number;
  cluster: Cluster;
}

export interface TransactionEvent {
  kind: "transaction";
  program: PublicKey;
  signature: string;
  slot: number;
  timestamp: number;
  cluster: Cluster;
  instructions: ParsedInstruction[];
}

export interface ParsedInstruction {
  programId: PublicKey;
  accounts: PublicKey[];
  data: Buffer;
}

export type SolanaEvent = AccountChangeEvent | TransactionEvent;

export interface Alert {
  detector: string;
  severity: AlertSeverity;
  subject: string;
  txSignature: string | null;
  cluster: Cluster;
  timestamp: number;
  explorerLink: string;
  context: Record<string, unknown>;
}

export interface Detector {
  name: string;
  description: string;
  inspect(event: SolanaEvent): Promise<Alert | null>;
}
