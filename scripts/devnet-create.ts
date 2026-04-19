import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as multisig from "@sqds/multisig";

const { Permissions } = multisig.types;

const SQUADS_V4_PROGRAM_ID = new PublicKey("SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf");
const RPC_URL = process.env.CUSTOS_RPC_URL ?? "https://api.devnet.solana.com";
const MIN_BALANCE_SOL = 0.5;
const AIRDROP_SOL = 1;
// Baseline timelock so `smoke:timelock` has something meaningful to remove.
// One day is both realistic and short enough that nothing blocks on devnet.
const INITIAL_TIME_LOCK_SECONDS = 86_400;

function loadLocalKeypair(): Keypair {
  const p = process.env.SOLANA_KEYPAIR ?? join(homedir(), ".config", "solana", "id.json");
  const raw = JSON.parse(readFileSync(p, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

async function ensureFunded(connection: Connection, pubkey: PublicKey): Promise<void> {
  const balance = await connection.getBalance(pubkey, "confirmed");
  const balanceSol = balance / LAMPORTS_PER_SOL;
  console.log(`[smoke] balance: ${balanceSol.toFixed(4)} SOL`);
  if (balanceSol >= MIN_BALANCE_SOL) return;
  console.log(`[smoke] requesting ${AIRDROP_SOL} SOL airdrop...`);
  const sig = await connection.requestAirdrop(pubkey, AIRDROP_SOL * LAMPORTS_PER_SOL);
  const latest = await connection.getLatestBlockhash("confirmed");
  await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");
  console.log(`[smoke] airdrop confirmed: ${sig}`);
}

async function main(): Promise<void> {
  const creator = loadLocalKeypair();
  console.log(`[smoke] creator:  ${creator.publicKey.toBase58()}`);
  console.log(`[smoke] rpc:      ${RPC_URL}`);

  const connection = new Connection(RPC_URL, "confirmed");
  await ensureFunded(connection, creator.publicKey);

  const createKey = Keypair.generate();
  const [multisigPda] = multisig.getMultisigPda({ createKey: createKey.publicKey });

  // Five distinct member keys. Only the creator is a real signer; the other
  // four are random pubkeys that demonstrate a 3-of-5 ratio on-chain. We set
  // configAuthority = creator so a single key can re-thresh without proposal
  // flow (not realistic, but this is precisely the attacker-takeover shape
  // Custos is designed to catch).
  const members = Array.from({ length: 5 }, (_, i) => ({
    key: i === 0 ? creator.publicKey : Keypair.generate().publicKey,
    permissions: Permissions.all(),
  }));

  const programConfigPda = multisig.getProgramConfigPda({})[0];
  const programConfig = await multisig.accounts.ProgramConfig.fromAccountAddress(
    connection,
    programConfigPda,
  );

  console.log(
    `[smoke] creating 3-of-5 Squads multisig at ${multisigPda.toBase58()} ` +
      `with time_lock=${INITIAL_TIME_LOCK_SECONDS}s`,
  );
  const sig = await multisig.rpc.multisigCreateV2({
    connection,
    treasury: programConfig.treasury,
    createKey,
    creator,
    multisigPda,
    configAuthority: creator.publicKey,
    threshold: 3,
    members,
    timeLock: INITIAL_TIME_LOCK_SECONDS,
    rentCollector: null,
  });
  console.log(`[smoke] create tx: ${sig}`);
  console.log("");
  console.log("========================================================");
  console.log(`MULTISIG PDA:  ${multisigPda.toBase58()}`);
  console.log("");
  console.log("Next steps:");
  console.log("  1. Copy the PDA above into .env:");
  console.log(`     CUSTOS_WATCH=${SQUADS_V4_PROGRAM_ID.toBase58()}:${multisigPda.toBase58()}`);
  console.log("  2. Start the daemon in a second terminal: npm run dev");
  console.log("  3. Run attack steps (in any order, each should alert):");
  console.log("       npm run smoke:timelock -- <PDA>   # drops time_lock to 0");
  console.log("       npm run smoke:weaken   -- <PDA>   # drops threshold to 1");
  console.log("========================================================");
}

main().catch((err) => {
  console.error(
    `[smoke] fatal: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
  );
  process.exit(1);
});
