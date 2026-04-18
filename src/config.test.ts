import { describe, expect, it } from "vitest";
import { loadConfigFromEnv } from "./config.js";

const GOOD_PROGRAM = "SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf";
const GOOD_ACCOUNT = "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw";

describe("loadConfigFromEnv", () => {
  it("throws when CUSTOS_RPC_URL missing", () => {
    expect(() => loadConfigFromEnv({})).toThrow(/CUSTOS_RPC_URL/);
  });

  it("derives wss:// ws endpoint from https:// RPC URL", () => {
    const cfg = loadConfigFromEnv({ CUSTOS_RPC_URL: "https://mainnet.helius-rpc.com/?api-key=x" });
    expect(cfg.wsUrl).toBe("wss://mainnet.helius-rpc.com/?api-key=x");
  });

  it("derives ws:// from http:// RPC URL", () => {
    const cfg = loadConfigFromEnv({ CUSTOS_RPC_URL: "http://localhost:8899" });
    expect(cfg.wsUrl).toBe("ws://localhost:8899");
  });

  it("uses CUSTOS_WS_URL override when provided", () => {
    const cfg = loadConfigFromEnv({
      CUSTOS_RPC_URL: "https://a.com",
      CUSTOS_WS_URL: "wss://b.com/?x",
    });
    expect(cfg.wsUrl).toBe("wss://b.com/?x");
  });

  it("defaults cluster to mainnet", () => {
    const cfg = loadConfigFromEnv({ CUSTOS_RPC_URL: "https://a.com" });
    expect(cfg.cluster).toBe("mainnet");
  });

  it("accepts devnet / testnet", () => {
    for (const c of ["devnet", "testnet"] as const) {
      const cfg = loadConfigFromEnv({ CUSTOS_RPC_URL: "https://a.com", CUSTOS_CLUSTER: c });
      expect(cfg.cluster).toBe(c);
    }
  });

  it("rejects unknown cluster", () => {
    expect(() =>
      loadConfigFromEnv({ CUSTOS_RPC_URL: "https://a.com", CUSTOS_CLUSTER: "localnet" }),
    ).toThrow(/CUSTOS_CLUSTER/);
  });

  it("parses empty watch list when CUSTOS_WATCH unset", () => {
    const cfg = loadConfigFromEnv({ CUSTOS_RPC_URL: "https://a.com" });
    expect(cfg.watch).toEqual([]);
  });

  it("parses comma-separated program:account pairs", () => {
    const cfg = loadConfigFromEnv({
      CUSTOS_RPC_URL: "https://a.com",
      CUSTOS_WATCH: `${GOOD_PROGRAM}:${GOOD_ACCOUNT}`,
    });
    expect(cfg.watch).toHaveLength(1);
    expect(cfg.watch[0]?.program.toBase58()).toBe(GOOD_PROGRAM);
    expect(cfg.watch[0]?.account.toBase58()).toBe(GOOD_ACCOUNT);
  });

  it("trims whitespace around entries", () => {
    const cfg = loadConfigFromEnv({
      CUSTOS_RPC_URL: "https://a.com",
      CUSTOS_WATCH: `  ${GOOD_PROGRAM}:${GOOD_ACCOUNT}  ,  ${GOOD_ACCOUNT}:${GOOD_PROGRAM}`,
    });
    expect(cfg.watch).toHaveLength(2);
  });

  it("rejects malformed watch entry", () => {
    expect(() =>
      loadConfigFromEnv({ CUSTOS_RPC_URL: "https://a.com", CUSTOS_WATCH: "onlyOnePart" }),
    ).toThrow(/CUSTOS_WATCH/);
  });

  it("rejects invalid base58 pubkey in watch entry", () => {
    expect(() =>
      loadConfigFromEnv({
        CUSTOS_RPC_URL: "https://a.com",
        CUSTOS_WATCH: `not_a_pubkey:${GOOD_ACCOUNT}`,
      }),
    ).toThrow(/invalid base58/);
  });
});
