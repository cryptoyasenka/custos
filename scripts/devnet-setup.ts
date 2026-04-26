// Bootstraps a devnet keypair for running the smoke harness.
//
//   npm run setup:devnet
//
// Creates ~/.config/solana/id.json (the file every other smoke script
// looks for by default) if it does not already exist, then tops it up
// via the devnet faucet if the balance is below MIN_BALANCE_SOL. Idempotent:
// re-running with a funded keypair is a no-op that just prints the state.
//
// This is a devnet-only hot wallet. Do not reuse on mainnet.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

const RPC_URL = process.env.CUSTOS_RPC_URL ?? "https://api.devnet.solana.com";
const KEYPAIR_PATH = process.env.SOLANA_KEYPAIR ?? join(homedir(), ".config", "solana", "id.json");
const MIN_BALANCE_SOL = 0.5;
const AIRDROP_SOL = 1;

function loadKeypair(): Keypair {
  const raw = JSON.parse(readFileSync(KEYPAIR_PATH, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

function ensureKeypair(): { keypair: Keypair; created: boolean } {
  // Try-load-first, no existsSync gate — that pattern is the TOCTOU race.
  // ENOENT means "no keypair yet, create one"; anything else is a real error.
  try {
    return { keypair: loadKeypair(), created: false };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }

  mkdirSync(dirname(KEYPAIR_PATH), { recursive: true });
  const keypair = Keypair.generate();
  try {
    // flag "wx" = exclusive create (EEXIST if a concurrent run created it
    // between our load attempt and this write). mode 0o600 keeps the secret
    // key readable only by the owner.
    writeFileSync(KEYPAIR_PATH, JSON.stringify(Array.from(keypair.secretKey)), {
      flag: "wx",
      mode: 0o600,
    });
    return { keypair, created: true };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "EEXIST") {
      return { keypair: loadKeypair(), created: false };
    }
    throw err;
  }
}

async function main(): Promise<void> {
  const { keypair, created } = ensureKeypair();
  console.log(`[setup] keypair path: ${KEYPAIR_PATH}`);
  console.log(`[setup] pubkey:       ${keypair.publicKey.toBase58()}`);
  console.log(`[setup] ${created ? "CREATED new keypair" : "reusing existing keypair"}`);

  const connection = new Connection(RPC_URL, "confirmed");
  const balanceLamports = await connection.getBalance(keypair.publicKey, "confirmed");
  const balanceSol = balanceLamports / LAMPORTS_PER_SOL;
  console.log(`[setup] balance:      ${balanceSol.toFixed(4)} SOL (rpc=${RPC_URL})`);

  if (balanceSol >= MIN_BALANCE_SOL) {
    console.log("[setup] balance is sufficient — no airdrop needed.");
    return;
  }

  console.log(`[setup] requesting ${AIRDROP_SOL} SOL airdrop...`);
  try {
    const sig = await connection.requestAirdrop(keypair.publicKey, AIRDROP_SOL * LAMPORTS_PER_SOL);
    const latest = await connection.getLatestBlockhash("confirmed");
    await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");
    console.log(`[setup] airdrop confirmed: ${sig}`);
    const newBalance = await connection.getBalance(keypair.publicKey, "confirmed");
    console.log(`[setup] new balance:  ${(newBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
  } catch (err) {
    console.error(
      `[setup] airdrop failed: ${err instanceof Error ? err.message : String(err)}\n       Devnet faucet is rate-limited. Try again in a minute or use a web faucet:\n         https://faucet.solana.com/?pubkey=${keypair.publicKey.toBase58()}`,
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(
    `[setup] fatal: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
  );
  process.exit(1);
});
