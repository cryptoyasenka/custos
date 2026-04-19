import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL = process.env.HELIUS_RPC_URL ?? "https://api.mainnet-beta.solana.com";
const FIXTURES_DIR = resolve(process.cwd(), "src/parsers/__fixtures__");

async function fetchAccount(address: string, label: string): Promise<void> {
  const connection = new Connection(RPC_URL, "confirmed");
  const pubkey = new PublicKey(address);
  const info = await connection.getAccountInfo(pubkey);
  if (!info) {
    console.error(`account not found: ${address}`);
    process.exit(1);
  }
  const payload = {
    address,
    owner: info.owner.toBase58(),
    lamports: info.lamports,
    executable: info.executable,
    dataBase64: info.data.toString("base64"),
    dataLength: info.data.length,
    fetchedAt: new Date().toISOString(),
    rpc: RPC_URL,
  };
  mkdirSync(FIXTURES_DIR, { recursive: true });
  const out = resolve(FIXTURES_DIR, `${label}.json`);
  writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`wrote ${out} (${info.data.length} bytes)`);
}

const [, , address, label] = process.argv;
if (!address || !label) {
  console.error("usage: npm run fetch-fixture -- <address> <label>");
  process.exit(1);
}
await fetchAccount(address, label);
