import { PublicKey } from "@solana/web3.js";
import type { Cluster } from "./types/events.js";

export interface WatchEntry {
  program: PublicKey;
  account: PublicKey;
}

export interface DaemonConfig {
  rpcUrl: string;
  wsUrl: string;
  cluster: Cluster;
  watch: WatchEntry[];
}

const VALID_CLUSTERS: readonly Cluster[] = ["mainnet", "devnet", "testnet"];

function deriveWsUrl(rpcUrl: string): string {
  if (rpcUrl.startsWith("https://")) return `wss://${rpcUrl.slice("https://".length)}`;
  if (rpcUrl.startsWith("http://")) return `ws://${rpcUrl.slice("http://".length)}`;
  return rpcUrl;
}

export function loadConfigFromEnv(env: NodeJS.ProcessEnv = process.env): DaemonConfig {
  const rpcUrl = env.CUSTOS_RPC_URL;
  if (!rpcUrl) {
    throw new Error(
      "CUSTOS_RPC_URL is required (e.g. https://mainnet.helius-rpc.com/?api-key=...)",
    );
  }

  const wsUrl = env.CUSTOS_WS_URL ?? deriveWsUrl(rpcUrl);

  const clusterRaw = env.CUSTOS_CLUSTER ?? "mainnet";
  if (!(VALID_CLUSTERS as readonly string[]).includes(clusterRaw)) {
    throw new Error(`CUSTOS_CLUSTER must be one of ${VALID_CLUSTERS.join("|")}, got ${clusterRaw}`);
  }
  const cluster = clusterRaw as Cluster;

  const watchRaw = env.CUSTOS_WATCH ?? "";
  const watch: WatchEntry[] = watchRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const parts = entry.split(":");
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        throw new Error(
          `CUSTOS_WATCH entry must be '<programPubkey>:<accountPubkey>', got '${entry}'`,
        );
      }
      try {
        return { program: new PublicKey(parts[0]), account: new PublicKey(parts[1]) };
      } catch {
        throw new Error(`CUSTOS_WATCH entry '${entry}' contains an invalid base58 pubkey`);
      }
    });

  return { rpcUrl, wsUrl, cluster, watch };
}
