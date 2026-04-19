import { PublicKey } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { NONCE_ACCOUNT_LENGTH, parseNonceAccount } from "./nonce.js";

const KEY_A = new PublicKey("11111111111111111111111111111111");
const KEY_B = new PublicKey("SysvarRent111111111111111111111111111111111");

function makeNonceBuffer(state: 0 | 1, authority: PublicKey): Buffer {
  const buf = Buffer.alloc(NONCE_ACCOUNT_LENGTH);
  buf.writeUInt32LE(0, 0); // version
  buf.writeUInt32LE(state, 4); // state
  authority.toBuffer().copy(buf, 8);
  // remaining 32 (blockhash) + 8 (lamports_per_signature) stay zeroed
  return buf;
}

describe("parseNonceAccount", () => {
  it("returns null for wrong buffer length", () => {
    expect(parseNonceAccount(Buffer.alloc(0))).toBeNull();
    expect(parseNonceAccount(Buffer.alloc(79))).toBeNull();
    expect(parseNonceAccount(Buffer.alloc(81))).toBeNull();
  });

  it("parses an uninitialized nonce account", () => {
    const parsed = parseNonceAccount(makeNonceBuffer(0, KEY_A));
    expect(parsed).toEqual({ state: "uninitialized", authority: null });
  });

  it("parses an initialized nonce account and decodes its authority", () => {
    const parsed = parseNonceAccount(makeNonceBuffer(1, KEY_B));
    expect(parsed?.state).toBe("initialized");
    expect(parsed?.authority?.equals(KEY_B)).toBe(true);
  });

  it("returns null for unknown state value", () => {
    const buf = makeNonceBuffer(1, KEY_A);
    buf.writeUInt32LE(2, 4);
    expect(parseNonceAccount(buf)).toBeNull();
  });
});
