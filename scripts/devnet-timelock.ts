import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as multisig from "@sqds/multisig";

const RPC_URL = process.env.CUSTOS_RPC_URL ?? "https://api.devnet.solana.com";
const NEW_TIME_LOCK = 0;

function loadLocalKeypair(): Keypair {
  const p = process.env.SOLANA_KEYPAIR ?? join(homedir(), ".config", "solana", "id.json");
  const raw = JSON.parse(readFileSync(p, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

async function main(): Promise<void> {
  const pdaArg = process.argv[2];
  if (!pdaArg) {
    console.error("usage: npm run smoke:timelock -- <multisigPda>");
    process.exit(1);
  }

  let multisigPda: PublicKey;
  try {
    multisigPda = new PublicKey(pdaArg);
  } catch {
    console.error(`invalid base58 pubkey: ${pdaArg}`);
    process.exit(1);
  }

  const creator = loadLocalKeypair();
  const connection = new Connection(RPC_URL, "confirmed");

  const before = await multisig.accounts.Multisig.fromAccountAddress(connection, multisigPda);
  console.log(`[smoke] multisig:          ${multisigPda.toBase58()}`);
  console.log(`[smoke] current time_lock: ${before.timeLock}s`);
  console.log(`[smoke] target time_lock:  ${NEW_TIME_LOCK}s`);

  if (before.timeLock === NEW_TIME_LOCK) {
    console.log("[smoke] time_lock already at target; nothing to do.");
    return;
  }

  const ix = multisig.instructions.multisigSetTimeLock({
    multisigPda,
    configAuthority: creator.publicKey,
    timeLock: NEW_TIME_LOCK,
  });

  const tx = new Transaction().add(ix);
  const sig = await sendAndConfirmTransaction(connection, tx, [creator], {
    commitment: "confirmed",
  });
  console.log(`[smoke] timelock tx: ${sig}`);

  const after = await multisig.accounts.Multisig.fromAccountAddress(connection, multisigPda);
  console.log(`[smoke] new time_lock:     ${after.timeLock}s`);
  console.log("");
  console.log("If the daemon was watching, it should now have printed:");
  console.log(
    `  CRITICAL [squads-timelock-removal] Timelock removed on multisig ${multisigPda.toBase58()}`,
  );
}

main().catch((err) => {
  console.error(
    `[smoke] fatal: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
  );
  process.exit(1);
});
