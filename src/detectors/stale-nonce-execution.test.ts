import { PublicKey } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { NONCE_ACCOUNT_LENGTH, SYSTEM_PROGRAM_ID } from "../parsers/nonce.js";
import type { AccountChangeEvent, TransactionEvent } from "../types/events.js";
import {
  DEFAULT_STALE_THRESHOLD_SECS,
  STALE_NONCE_DETECTOR_NAME,
  evictStale,
  makeStaleNonceExecutionDetector,
} from "./stale-nonce-execution.js";

const WATCHED_NONCE = new PublicKey("NonceTestAccountXXXXXXXXXXXXXXXXXXXXXXXXXXX".slice(0, 44));
const AUTH_A = new PublicKey("11111111111111111111111111111111");
const OTHER_PROGRAM = new PublicKey("SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf");

const T0 = 1_700_000_000; // seconds — creation time
const STALE_SECS = DEFAULT_STALE_THRESHOLD_SECS;

function nonceBuffer(state: 0 | 1, authority: PublicKey, blockhashByte = 0): Buffer {
  const buf = Buffer.alloc(NONCE_ACCOUNT_LENGTH);
  buf.writeUInt32LE(0, 0);
  buf.writeUInt32LE(state, 4);
  authority.toBuffer().copy(buf, 8);
  buf.fill(blockhashByte, 40, 72); // blockhash field at bytes 40–72
  return buf;
}

function makeEvent(overrides: Partial<AccountChangeEvent> = {}): AccountChangeEvent {
  return {
    kind: "account_change",
    program: SYSTEM_PROGRAM_ID,
    account: WATCHED_NONCE,
    data: nonceBuffer(1, AUTH_A, 0xaa),
    previousData: null,
    slot: 1000,
    signature: "sig1",
    timestamp: T0,
    cluster: "devnet",
    ...overrides,
  };
}

function makeTxEvent(): TransactionEvent {
  return {
    kind: "transaction",
    program: SYSTEM_PROGRAM_ID,
    signature: "txsig",
    slot: 1,
    timestamp: 0,
    cluster: "devnet",
    instructions: [],
  };
}

describe("StaleNonceExecutionDetector", () => {
  it("ignores non-account-change events", async () => {
    const detector = makeStaleNonceExecutionDetector();
    expect(await detector.inspect(makeTxEvent())).toBeNull();
  });

  it("ignores accounts not owned by the system program", async () => {
    const detector = makeStaleNonceExecutionDetector();
    expect(await detector.inspect(makeEvent({ program: OTHER_PROGRAM }))).toBeNull();
  });

  it("ignores non-80-byte buffers", async () => {
    const detector = makeStaleNonceExecutionDetector();
    expect(await detector.inspect(makeEvent({ data: Buffer.alloc(40) }))).toBeNull();
  });

  it("ignores uninitialized nonces", async () => {
    const detector = makeStaleNonceExecutionDetector();
    expect(
      await detector.inspect(makeEvent({ data: nonceBuffer(0, AUTH_A), previousData: null })),
    ).toBeNull();
  });

  it("seeds creation time on first account appearance (prev=null) and returns null", async () => {
    const detector = makeStaleNonceExecutionDetector({ staleSecs: 60 });
    const alert = await detector.inspect(
      makeEvent({ data: nonceBuffer(1, AUTH_A, 0x01), previousData: null, timestamp: T0 }),
    );
    expect(alert).toBeNull();
  });

  it("seeds creation time on uninitialized → initialized transition and returns null", async () => {
    const detector = makeStaleNonceExecutionDetector({ staleSecs: 60 });
    const alert = await detector.inspect(
      makeEvent({
        data: nonceBuffer(1, AUTH_A, 0x01),
        previousData: nonceBuffer(0, AUTH_A, 0x00),
        timestamp: T0,
      }),
    );
    expect(alert).toBeNull();
  });

  it("returns null when blockhash has NOT changed (authority rotation, no advance)", async () => {
    const OTHER_AUTH = new PublicKey("SysvarRent111111111111111111111111111111111");
    const detector = makeStaleNonceExecutionDetector({ staleSecs: 60 });
    // Seed the nonce first
    await detector.inspect(makeEvent({ data: nonceBuffer(1, AUTH_A, 0xaa), previousData: null }));
    // Authority rotated but blockhash unchanged
    const alert = await detector.inspect(
      makeEvent({
        data: nonceBuffer(1, OTHER_AUTH, 0xaa), // same blockhash byte
        previousData: nonceBuffer(1, AUTH_A, 0xaa),
        timestamp: T0 + STALE_SECS + 100,
      }),
    );
    expect(alert).toBeNull();
  });

  it("returns null when nonce is advanced but was recently created (below threshold)", async () => {
    const detector = makeStaleNonceExecutionDetector({
      staleSecs: 3600,
      nowMs: () => (T0 + 1800) * 1000, // 30 min after creation
    });
    // Seed
    await detector.inspect(makeEvent({ data: nonceBuffer(1, AUTH_A, 0x01), previousData: null }));
    // Advance (blockhash changes)
    const alert = await detector.inspect(
      makeEvent({
        data: nonceBuffer(1, AUTH_A, 0x02), // new blockhash
        previousData: nonceBuffer(1, AUTH_A, 0x01),
        timestamp: T0 + 1800,
      }),
    );
    expect(alert).toBeNull();
  });

  it("fires HIGH when nonce is advanced well past the staleness threshold", async () => {
    const STALE_S = 3600;
    const advanceTime = T0 + STALE_S + 600; // 10 min over threshold
    const detector = makeStaleNonceExecutionDetector({
      staleSecs: STALE_S,
      nowMs: () => advanceTime * 1000,
    });
    // Seed at T0
    await detector.inspect(makeEvent({ data: nonceBuffer(1, AUTH_A, 0x01), previousData: null }));
    // Advance (blockhash changes) past threshold
    const alert = await detector.inspect(
      makeEvent({
        data: nonceBuffer(1, AUTH_A, 0x02),
        previousData: nonceBuffer(1, AUTH_A, 0x01),
        timestamp: advanceTime,
      }),
    );
    expect(alert).not.toBeNull();
    expect(alert?.severity).toBe("high");
    expect(alert?.detector).toBe(STALE_NONCE_DETECTOR_NAME);
    expect(alert?.subject).toContain("Stale nonce");
    expect(alert?.subject).toContain("after creation");
    expect(alert?.context.reason).toBe("stale_nonce_advanced");
    expect(alert?.context.staleMs).toBeGreaterThan(STALE_S * 1000);
    expect(alert?.context.firstSeenAt).toBeDefined();
  });

  it("includes authority and timing in context", async () => {
    const STALE_S = 100;
    const advanceTime = T0 + STALE_S + 50;
    const detector = makeStaleNonceExecutionDetector({
      staleSecs: STALE_S,
      nowMs: () => advanceTime * 1000,
    });
    await detector.inspect(makeEvent({ data: nonceBuffer(1, AUTH_A, 0x01), previousData: null }));
    const alert = await detector.inspect(
      makeEvent({
        data: nonceBuffer(1, AUTH_A, 0x02),
        previousData: nonceBuffer(1, AUTH_A, 0x01),
        timestamp: advanceTime,
      }),
    );
    expect(alert?.context.authority).toBe(AUTH_A.toBase58());
    expect(alert?.context.thresholdMs).toBe(STALE_S * 1000);
    expect(typeof alert?.context.staleMins).toBe("number");
  });

  it("handles daemon restart gracefully: seeds at first advance and returns null", async () => {
    const detector = makeStaleNonceExecutionDetector({
      staleSecs: 60,
      nowMs: () => (T0 + 3600) * 1000,
    });
    // Daemon starts; nonce already initialized (no prev-null seed event)
    const alert = await detector.inspect(
      makeEvent({
        data: nonceBuffer(1, AUTH_A, 0x02), // new blockhash
        previousData: nonceBuffer(1, AUTH_A, 0x01), // prev initialized
        timestamp: T0 + 3600,
      }),
    );
    // No prior seed → should NOT fire (can't determine real staleness)
    expect(alert).toBeNull();
  });

  it("evicts entries older than 2x threshold from firstSeenAt", () => {
    const map = new Map<string, number>();
    const thresholdMs = 1_000;
    const nowMsValue = 10_000;
    // 3000 < (10000 - 2*1000) = 8000 → fresh entry actually older than cutoff → evict
    map.set("old", 3_000);
    // 9000 > 8000 → kept
    map.set("fresh", 9_000);
    evictStale(map, nowMsValue, thresholdMs);
    expect(map.has("old")).toBe(false);
    expect(map.has("fresh")).toBe(true);
  });

  it("respects MAX_TRACKED hard cap by dropping the oldest entries", () => {
    const map = new Map<string, number>();
    // All entries are inside the 2x threshold window so the time-based pass
    // doesn't touch them — only the cap should fire.
    const nowMsValue = 100_000;
    const thresholdMs = 1_000_000;
    map.set("a", 90_000);
    map.set("b", 91_000);
    map.set("c", 92_000);
    evictStale(map, nowMsValue, thresholdMs, 2);
    expect(map.size).toBe(2);
    expect(map.has("a")).toBe(false);
    expect(map.has("b")).toBe(true);
    expect(map.has("c")).toBe(true);
  });

  it("uses account explorer link when signature is null", async () => {
    const STALE_S = 10;
    const advanceTime = T0 + STALE_S + 10;
    const detector = makeStaleNonceExecutionDetector({
      staleSecs: STALE_S,
      nowMs: () => advanceTime * 1000,
    });
    await detector.inspect(makeEvent({ data: nonceBuffer(1, AUTH_A, 0x01), previousData: null }));
    const alert = await detector.inspect(
      makeEvent({
        data: nonceBuffer(1, AUTH_A, 0x02),
        previousData: nonceBuffer(1, AUTH_A, 0x01),
        signature: null,
        timestamp: advanceTime,
      }),
    );
    expect(alert?.explorerLink).toContain("/account/");
  });
});
