// One-shot diagnostic: does this RPC+WS pair actually deliver
// onAccountChange notifications when a watched pubkey goes from
// "does not exist" to "created"? If yes, smoke:nonce-init will
// trigger the PrivilegedNonceDetector. If no, we need a fallback
// (periodic polling or programSubscribe on System Program) before
// the video demo.
//
//   npm run check:null-subscribe
//
// Exits 0 if a notification arrived within the wait window.
// Exits 1 if no notification arrived — treat that as a real finding
// and switch to a polling-based fallback for nonce-creation detection.

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const RPC_URL = process.env.CUSTOS_RPC_URL ?? "https://api.devnet.solana.com";
const WS_URL = process.env.CUSTOS_WS_URL ?? RPC_URL.replace(/^http/, "ws");
const WAIT_AFTER_TX_MS = 10_000;
const SETTLE_BEFORE_TX_MS = 2_000;
const CREATE_LAMPORTS = Math.floor(LAMPORTS_PER_SOL / 1_000);

function loadLocalKeypair(): Keypair {
  const p = process.env.SOLANA_KEYPAIR ?? join(homedir(), ".config", "solana", "id.json");
  const raw = JSON.parse(readFileSync(p, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

async function main(): Promise<void> {
  const funder = loadLocalKeypair();
  const target = Keypair.generate();
  const connection = new Connection(RPC_URL, {
    wsEndpoint: WS_URL,
    commitment: "confirmed",
  });

  console.log(`[check] rpc: ${RPC_URL}`);
  console.log(`[check] ws:  ${WS_URL}`);
  console.log(`[check] subscribing to ${target.publicKey.toBase58()} (does not exist yet)`);

  let fired = false;
  const subId = connection.onAccountChange(
    target.publicKey,
    (info, ctx) => {
      fired = true;
      console.log(
        `[check] ✓ onAccountChange fired at slot=${ctx.slot} lamports=${info.lamports} size=${info.data.length}`,
      );
    },
    "confirmed",
  );

  // Let the WS settle the subscription before we submit the tx.
  await new Promise((r) => setTimeout(r, SETTLE_BEFORE_TX_MS));

  console.log("[check] submitting createAccount tx...");
  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: funder.publicKey,
      newAccountPubkey: target.publicKey,
      lamports: CREATE_LAMPORTS,
      space: 0,
      programId: SystemProgram.programId,
    }),
  );
  const sig = await sendAndConfirmTransaction(connection, tx, [funder, target], {
    commitment: "confirmed",
  });
  console.log(`[check] tx confirmed: ${sig}`);
  console.log(`[check] waiting up to ${WAIT_AFTER_TX_MS}ms for the WS notification...`);

  const deadline = Date.now() + WAIT_AFTER_TX_MS;
  while (!fired && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 500));
  }

  try {
    await connection.removeAccountChangeListener(subId);
  } catch {
    // best-effort cleanup — not fatal.
  }

  if (fired) {
    console.log(
      "[check] VERDICT: RPC delivers null->exists notifications. smoke:nonce-init will alert.",
    );
    process.exit(0);
  }
  console.log(
    "[check] VERDICT: no notification arrived for the null->exists transition. " +
      "PrivilegedNonceDetector's 'nonce_initialized' case will be silent on this RPC. " +
      "Fallback options: (a) periodic getAccountInfo poll per watched pubkey, " +
      "(b) programSubscribe on SystemProgram filtered to NONCE_ACCOUNT_LENGTH, " +
      "(c) onLogs on SystemProgram filtering InitializeNonceAccount ix.",
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(
    `[check] fatal: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
  );
  process.exit(1);
});
