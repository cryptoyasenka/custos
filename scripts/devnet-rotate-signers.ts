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

const { Permissions } = multisig.types;

const RPC_URL = process.env.CUSTOS_RPC_URL ?? "https://api.devnet.solana.com";

function loadLocalKeypair(): Keypair {
  const p = process.env.SOLANA_KEYPAIR ?? join(homedir(), ".config", "solana", "id.json");
  const raw = JSON.parse(readFileSync(p, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

async function main(): Promise<void> {
  const pdaArg = process.argv[2];
  if (!pdaArg) {
    console.error("usage: npm run smoke:rotate-signers -- <multisigPda>");
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
  console.log(`[smoke] multisig:        ${multisigPda.toBase58()}`);
  console.log(`[smoke] members before:  ${before.members.length}`);
  for (const m of before.members) console.log(`           - ${m.key.toBase58()}`);

  // Keep the creator (it owns configAuthority, so removing it would brick the
  // multisig and prevent further smoke steps). Evict the first member that
  // is not the creator and replace them with a freshly generated key,
  // mirroring the takeover shape: honest co-signer out, attacker key in.
  const evicted = before.members.find((m) => !m.key.equals(creator.publicKey));
  if (!evicted) {
    console.error(
      "[smoke] multisig has only the creator as a member; nothing safe to rotate. " +
        "Recreate it via `npm run smoke:create` (which seeds 5 members).",
    );
    process.exit(1);
  }
  const attacker = Keypair.generate().publicKey;

  console.log("");
  console.log(`[smoke] evicting:        ${evicted.key.toBase58()}`);
  console.log(`[smoke] adding:          ${attacker.toBase58()}  (fresh key, simulated attacker)`);

  // Bundle remove + add in one transaction. The members vector is rewritten
  // once on the account, the daemon sees a single AccountChangeEvent, and
  // SignerSetChangeDetector should classify it as HIGH (rotation).
  const removeIx = multisig.instructions.multisigRemoveMember({
    multisigPda,
    configAuthority: creator.publicKey,
    oldMember: evicted.key,
  });
  const addIx = multisig.instructions.multisigAddMember({
    multisigPda,
    configAuthority: creator.publicKey,
    rentPayer: creator.publicKey,
    newMember: { key: attacker, permissions: Permissions.all() },
  });

  const tx = new Transaction().add(removeIx, addIx);
  const sig = await sendAndConfirmTransaction(connection, tx, [creator], {
    commitment: "confirmed",
  });
  console.log("");
  console.log(`[smoke] rotate tx: ${sig}`);

  const after = await multisig.accounts.Multisig.fromAccountAddress(connection, multisigPda);
  console.log(`[smoke] members after:   ${after.members.length}`);
  for (const m of after.members) console.log(`           - ${m.key.toBase58()}`);
  console.log("");
  console.log("If the daemon was watching, it should now have printed:");
  console.log(
    `  HIGH     [squads-signer-set-change] Multisig ${multisigPda.toBase58()}: 1 signer(s) removed, 1 added`,
  );
}

main().catch((err) => {
  console.error(
    `[smoke] fatal: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
  );
  process.exit(1);
});
