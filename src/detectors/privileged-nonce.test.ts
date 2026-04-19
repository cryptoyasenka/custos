import { PublicKey } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { NONCE_ACCOUNT_LENGTH, SYSTEM_PROGRAM_ID } from "../parsers/nonce.js";
import type { AccountChangeEvent, TransactionEvent } from "../types/events.js";
import { PrivilegedNonceDetector } from "./privileged-nonce.js";

const WATCHED_NONCE = new PublicKey("NonceTestAccountXXXXXXXXXXXXXXXXXXXXXXXXXXX".slice(0, 44));
const AUTH_A = new PublicKey("11111111111111111111111111111111");
const AUTH_B = new PublicKey("SysvarRent111111111111111111111111111111111");
const OTHER_PROGRAM = new PublicKey("SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf");

function nonceBuffer(state: 0 | 1, authority: PublicKey): Buffer {
  const buf = Buffer.alloc(NONCE_ACCOUNT_LENGTH);
  buf.writeUInt32LE(0, 0);
  buf.writeUInt32LE(state, 4);
  authority.toBuffer().copy(buf, 8);
  return buf;
}

function makeEvent(overrides: Partial<AccountChangeEvent> = {}): AccountChangeEvent {
  return {
    kind: "account_change",
    program: SYSTEM_PROGRAM_ID,
    account: WATCHED_NONCE,
    data: nonceBuffer(1, AUTH_A),
    previousData: null,
    slot: 1000,
    signature: null,
    timestamp: 1700000000,
    cluster: "devnet",
    ...overrides,
  };
}

function makeTxEvent(): TransactionEvent {
  return {
    kind: "transaction",
    program: SYSTEM_PROGRAM_ID,
    signature: "abc",
    slot: 1,
    timestamp: 0,
    cluster: "mainnet",
    instructions: [],
  };
}

describe("PrivilegedNonceDetector", () => {
  it("ignores non-account-change events", async () => {
    const alert = await PrivilegedNonceDetector.inspect(makeTxEvent());
    expect(alert).toBeNull();
  });

  it("ignores accounts not owned by the system program", async () => {
    const alert = await PrivilegedNonceDetector.inspect(makeEvent({ program: OTHER_PROGRAM }));
    expect(alert).toBeNull();
  });

  it("ignores buffers that aren't 80 bytes", async () => {
    const alert = await PrivilegedNonceDetector.inspect(makeEvent({ data: Buffer.alloc(40) }));
    expect(alert).toBeNull();
  });

  it("short-circuits when data equals previousData", async () => {
    const data = nonceBuffer(1, AUTH_A);
    const alert = await PrivilegedNonceDetector.inspect(makeEvent({ data, previousData: data }));
    expect(alert).toBeNull();
  });

  it("fires CRITICAL when a nonce is initialized with previousData null", async () => {
    const alert = await PrivilegedNonceDetector.inspect(
      makeEvent({ data: nonceBuffer(1, AUTH_A), previousData: null }),
    );
    expect(alert).not.toBeNull();
    expect(alert?.severity).toBe("critical");
    expect(alert?.detector).toBe("privileged-nonce");
    expect(alert?.subject).toContain("initialized with authority");
    expect(alert?.context.reason).toBe("nonce_initialized");
    expect(alert?.context.authority).toBe(AUTH_A.toBase58());
  });

  it("fires CRITICAL on uninitialized → initialized transition", async () => {
    const alert = await PrivilegedNonceDetector.inspect(
      makeEvent({
        data: nonceBuffer(1, AUTH_A),
        previousData: nonceBuffer(0, AUTH_A),
      }),
    );
    expect(alert?.severity).toBe("critical");
  });

  it("fires HIGH on authority rotation", async () => {
    const alert = await PrivilegedNonceDetector.inspect(
      makeEvent({
        data: nonceBuffer(1, AUTH_B),
        previousData: nonceBuffer(1, AUTH_A),
      }),
    );
    expect(alert?.severity).toBe("high");
    expect(alert?.subject).toContain("→");
    expect(alert?.context.reason).toBe("nonce_authority_rotated");
    expect(alert?.context.previousAuthority).toBe(AUTH_A.toBase58());
    expect(alert?.context.currentAuthority).toBe(AUTH_B.toBase58());
  });

  it("does not fire when a nonce transitions from initialized to uninitialized (close)", async () => {
    const alert = await PrivilegedNonceDetector.inspect(
      makeEvent({
        data: nonceBuffer(0, AUTH_A),
        previousData: nonceBuffer(1, AUTH_A),
      }),
    );
    expect(alert).toBeNull();
  });

  it("does not fire when authority stays the same", async () => {
    const buf = nonceBuffer(1, AUTH_A);
    const other = nonceBuffer(1, AUTH_A);
    // Change a blockhash byte (routine nonce advance) so buffers aren't byte-equal.
    other.writeUInt8(0xff, 40);
    const alert = await PrivilegedNonceDetector.inspect(
      makeEvent({ data: other, previousData: buf }),
    );
    expect(alert).toBeNull();
  });

  it("uses an account explorer link when signature is null", async () => {
    const alert = await PrivilegedNonceDetector.inspect(makeEvent({ signature: null }));
    expect(alert?.explorerLink).toContain("/account/");
    expect(alert?.explorerLink).toContain("cluster=devnet");
  });
});
