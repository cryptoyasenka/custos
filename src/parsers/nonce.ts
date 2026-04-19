import { PublicKey } from "@solana/web3.js";

// System Program "Nonce" account layout. Solana's state is 80 bytes total:
//   u32 version  (currently 0 for V1, but some docs use 1 = Current)
//   u32 state    (0 = Uninitialized, 1 = Initialized)
//   32  authorized_pubkey
//   32  blockhash (nonce)
//   u64 fee_calculator.lamports_per_signature
// The first 4 bytes are not a version field in the classic sense but a state
// discriminator that has historically been 0 (uninitialized) or non-zero. We
// trust the second u32 as the state indicator.

export const SYSTEM_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

export const NONCE_ACCOUNT_LENGTH = 80;

export type NonceState = "uninitialized" | "initialized";

export interface ParsedNonce {
  state: NonceState;
  authority: PublicKey | null;
}

export function parseNonceAccount(buf: Buffer): ParsedNonce | null {
  if (buf.length !== NONCE_ACCOUNT_LENGTH) return null;

  const state = buf.readUInt32LE(4);
  if (state === 0) return { state: "uninitialized", authority: null };
  if (state !== 1) return null;

  const authorityBytes = buf.subarray(8, 8 + 32);
  let authority: PublicKey;
  try {
    authority = new PublicKey(authorityBytes);
  } catch {
    return null;
  }
  return { state: "initialized", authority };
}
