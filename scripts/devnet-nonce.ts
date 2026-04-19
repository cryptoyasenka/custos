import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  NONCE_ACCOUNT_LENGTH,
  PublicKey,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const RPC_URL = process.env.CUSTOS_RPC_URL ?? "https://api.devnet.solana.com";
const SYSTEM_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");
const KEYPAIR_FILE = ".smoke-nonce.json";

function loadLocalKeypair(): Keypair {
  const p = process.env.SOLANA_KEYPAIR ?? join(homedir(), ".config", "solana", "id.json");
  const raw = JSON.parse(readFileSync(p, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

function savedKeypairPath(): string {
  return join(process.cwd(), KEYPAIR_FILE);
}

function saveNonceKeypair(kp: Keypair): void {
  writeFileSync(savedKeypairPath(), JSON.stringify(Array.from(kp.secretKey)));
}

function loadNonceKeypair(): Keypair {
  const path = savedKeypairPath();
  if (!existsSync(path)) {
    throw new Error(`${KEYPAIR_FILE} not found — run 'npm run smoke:nonce-plan' first`);
  }
  const raw = JSON.parse(readFileSync(path, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

async function plan(): Promise<void> {
  if (existsSync(savedKeypairPath())) {
    console.log(
      `[smoke] ${KEYPAIR_FILE} already exists — overwriting with a fresh keypair. If the prior nonce was already initialized on-chain, it stays there (attacker can still use it).`,
    );
  }
  const nonce = Keypair.generate();
  saveNonceKeypair(nonce);
  console.log(`[smoke] nonce pubkey: ${nonce.publicKey.toBase58()}`);
  console.log(`[smoke] keypair saved to ${KEYPAIR_FILE} (gitignored)`);
  console.log("");
  console.log("Next steps:");
  console.log("  1. Add the nonce account to CUSTOS_WATCH in .env:");
  console.log(`     CUSTOS_WATCH=${SYSTEM_PROGRAM_ID.toBase58()}:${nonce.publicKey.toBase58()}`);
  console.log("     (append to an existing value with a comma if already set)");
  console.log("  2. (Re)start the daemon in another terminal: npm run dev");
  console.log("  3. Initialize the nonce: npm run smoke:nonce-init");
}

async function init(): Promise<void> {
  const funder = loadLocalKeypair();
  const nonce = loadNonceKeypair();
  const connection = new Connection(RPC_URL, "confirmed");

  const existing = await connection.getAccountInfo(nonce.publicKey, "confirmed");
  if (existing && existing.data.length === NONCE_ACCOUNT_LENGTH) {
    console.log(
      `[smoke] nonce already initialized at ${nonce.publicKey.toBase58()} — nothing to do.`,
    );
    return;
  }
  if (existing) {
    throw new Error(
      `account ${nonce.publicKey.toBase58()} already exists with ${existing.data.length} bytes — not a nonce account. Refusing to overwrite.`,
    );
  }

  const rent = await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH);
  const balance = await connection.getBalance(funder.publicKey, "confirmed");
  const txFeeBudget = 10_000;
  if (balance < rent + txFeeBudget) {
    throw new Error(
      `insufficient balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL, ` +
        `need ≈${((rent + txFeeBudget) / LAMPORTS_PER_SOL).toFixed(4)} SOL ` +
        `(rent ${rent} + fee budget ${txFeeBudget})`,
    );
  }

  console.log(`[smoke] funder:    ${funder.publicKey.toBase58()}`);
  console.log(`[smoke] nonce:     ${nonce.publicKey.toBase58()}`);
  console.log(`[smoke] authority: ${funder.publicKey.toBase58()}`);
  console.log(`[smoke] rent:      ${rent} lamports (${(rent / LAMPORTS_PER_SOL).toFixed(6)} SOL)`);

  // `SystemProgram.createNonceAccount` bundles both a system createAccount and
  // a nonceInitialize into a single atomic Transaction. The nonce account
  // itself signs to prove control of the new pubkey during creation.
  const tx = SystemProgram.createNonceAccount({
    fromPubkey: funder.publicKey,
    noncePubkey: nonce.publicKey,
    authorizedPubkey: funder.publicKey,
    lamports: rent,
  });

  const sig = await sendAndConfirmTransaction(connection, tx, [funder, nonce], {
    commitment: "confirmed",
  });
  console.log(`[smoke] init tx: ${sig}`);
  console.log("");
  console.log("If the daemon was watching this pubkey, it should now have printed:");
  console.log(
    `  CRITICAL [privileged-nonce] Nonce account ${nonce.publicKey.toBase58()} initialized ` +
      `with authority ${funder.publicKey.toBase58()}`,
  );
}

async function main(): Promise<void> {
  const cmd = process.argv[2];
  if (cmd === "--plan") {
    await plan();
    return;
  }
  if (cmd === "--init") {
    await init();
    return;
  }
  console.error("usage: tsx scripts/devnet-nonce.ts [--plan | --init]");
  process.exit(1);
}

main().catch((err) => {
  console.error(
    `[smoke] fatal: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
  );
  process.exit(1);
});
