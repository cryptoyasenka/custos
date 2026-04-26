import { Keypair, PublicKey } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { squadsMultisigDiscriminator } from "../parsers/squads.js";
import type { AccountChangeEvent, TransactionEvent } from "../types/events.js";
import { SignerSetChangeDetector } from "./signer-set-change.js";
import { SQUADS_V4_PROGRAM_ID } from "./timelock-removal.js";

function buildSquadsBuffer(opts: {
  signers: PublicKey[];
  threshold?: number;
  timeLock?: number;
  disc?: Buffer;
}): Buffer {
  const disc = opts.disc ?? squadsMultisigDiscriminator();
  const createKey = Buffer.alloc(32, 0x11);
  const configAuthority = Buffer.alloc(32, 0x22);
  const threshold = Buffer.alloc(2);
  threshold.writeUInt16LE(opts.threshold ?? 3, 0);
  const timeLock = Buffer.alloc(4);
  timeLock.writeUInt32LE(opts.timeLock ?? 86_400, 0);
  const memberCount = Buffer.alloc(4);
  memberCount.writeUInt32LE(opts.signers.length, 0);
  const membersBytes = Buffer.concat(
    opts.signers.map((s) => Buffer.concat([s.toBuffer(), Buffer.from([0x07])])),
  );
  return Buffer.concat([
    disc,
    createKey,
    configAuthority,
    threshold,
    timeLock,
    memberCount,
    membersBytes,
  ]);
}

const STUB_ACCOUNT = new PublicKey("11111111111111111111111111111112");
const OTHER_PROGRAM = new PublicKey("11111111111111111111111111111113");

function accountChangeEvent(opts: {
  data: Buffer;
  previousData: Buffer | null;
  program?: PublicKey;
  signature?: string | null;
  cluster?: "mainnet" | "devnet" | "testnet";
}): AccountChangeEvent {
  return {
    kind: "account_change",
    program: opts.program ?? SQUADS_V4_PROGRAM_ID,
    account: STUB_ACCOUNT,
    data: opts.data,
    previousData: opts.previousData,
    slot: 100,
    signature: opts.signature === undefined ? "sigABC" : opts.signature,
    timestamp: 1700000000,
    cluster: opts.cluster ?? "mainnet",
  };
}

describe("SignerSetChangeDetector", () => {
  it("returns null for TransactionEvent", async () => {
    const event: TransactionEvent = {
      kind: "transaction",
      program: SQUADS_V4_PROGRAM_ID,
      signature: "sig",
      slot: 1,
      timestamp: 1,
      cluster: "mainnet",
      instructions: [],
    };
    expect(await SignerSetChangeDetector.inspect(event)).toBeNull();
  });

  it("returns null when account is not owned by Squads v4", async () => {
    const a = Keypair.generate().publicKey;
    const event = accountChangeEvent({
      data: buildSquadsBuffer({ signers: [a] }),
      previousData: buildSquadsBuffer({ signers: [a, Keypair.generate().publicKey] }),
      program: OTHER_PROGRAM,
    });
    expect(await SignerSetChangeDetector.inspect(event)).toBeNull();
  });

  it("returns null when previousData is null (first time we see this account)", async () => {
    const a = Keypair.generate().publicKey;
    const event = accountChangeEvent({
      data: buildSquadsBuffer({ signers: [a] }),
      previousData: null,
    });
    expect(await SignerSetChangeDetector.inspect(event)).toBeNull();
  });

  it("returns null when data is byte-equal to previousData", async () => {
    const a = Keypair.generate().publicKey;
    const buf = buildSquadsBuffer({ signers: [a] });
    const event = accountChangeEvent({ data: buf, previousData: Buffer.from(buf) });
    expect(await SignerSetChangeDetector.inspect(event)).toBeNull();
  });

  it("returns null when signer set is unchanged but other bytes differ (threshold-only edit)", async () => {
    const a = Keypair.generate().publicKey;
    const b = Keypair.generate().publicKey;
    const event = accountChangeEvent({
      data: buildSquadsBuffer({ signers: [a, b], threshold: 1 }),
      previousData: buildSquadsBuffer({ signers: [a, b], threshold: 2 }),
    });
    expect(await SignerSetChangeDetector.inspect(event)).toBeNull();
  });

  it("emits HIGH alert when a signer is removed", async () => {
    const a = Keypair.generate().publicKey;
    const b = Keypair.generate().publicKey;
    const c = Keypair.generate().publicKey;
    const event = accountChangeEvent({
      data: buildSquadsBuffer({ signers: [a, b] }),
      previousData: buildSquadsBuffer({ signers: [a, b, c] }),
    });
    const alert = await SignerSetChangeDetector.inspect(event);
    expect(alert).not.toBeNull();
    expect(alert?.severity).toBe("high");
    expect(alert?.detector).toBe("squads-signer-set-change");
    expect(alert?.subject).toContain("1 signer(s) removed");
    expect(alert?.context).toMatchObject({
      reason: "signer_set_changed",
      removed: [c.toBase58()],
      added: [],
      previousCount: 3,
      currentCount: 2,
    });
  });

  it("emits MEDIUM alert when a signer is added (no removals)", async () => {
    const a = Keypair.generate().publicKey;
    const b = Keypair.generate().publicKey;
    const newKey = Keypair.generate().publicKey;
    const event = accountChangeEvent({
      data: buildSquadsBuffer({ signers: [a, b, newKey] }),
      previousData: buildSquadsBuffer({ signers: [a, b] }),
    });
    const alert = await SignerSetChangeDetector.inspect(event);
    expect(alert?.severity).toBe("medium");
    expect(alert?.subject).toContain("1 signer(s) added");
    expect(alert?.context).toMatchObject({
      reason: "signer_set_changed",
      added: [newKey.toBase58()],
      removed: [],
      previousCount: 2,
      currentCount: 3,
    });
  });

  it("emits HIGH alert on rotation (some removed, some added)", async () => {
    const keep = Keypair.generate().publicKey;
    const evicted = Keypair.generate().publicKey;
    const attacker = Keypair.generate().publicKey;
    const event = accountChangeEvent({
      data: buildSquadsBuffer({ signers: [keep, attacker] }),
      previousData: buildSquadsBuffer({ signers: [keep, evicted] }),
    });
    const alert = await SignerSetChangeDetector.inspect(event);
    expect(alert?.severity).toBe("high");
    expect(alert?.subject).toContain("1 signer(s) removed, 1 added");
    expect(alert?.context).toMatchObject({
      reason: "signer_set_changed",
      removed: [evicted.toBase58()],
      added: [attacker.toBase58()],
      previousCount: 2,
      currentCount: 2,
    });
  });

  it("emits HIGH alert when every signer is replaced (full takeover)", async () => {
    const oldA = Keypair.generate().publicKey;
    const oldB = Keypair.generate().publicKey;
    const newA = Keypair.generate().publicKey;
    const newB = Keypair.generate().publicKey;
    const event = accountChangeEvent({
      data: buildSquadsBuffer({ signers: [newA, newB] }),
      previousData: buildSquadsBuffer({ signers: [oldA, oldB] }),
    });
    const alert = await SignerSetChangeDetector.inspect(event);
    expect(alert?.severity).toBe("high");
    expect(alert?.subject).toContain("2 signer(s) removed, 2 added");
    const ctx = alert?.context as { added: string[]; removed: string[] };
    expect(ctx.removed.sort()).toEqual([oldA.toBase58(), oldB.toBase58()].sort());
    expect(ctx.added.sort()).toEqual([newA.toBase58(), newB.toBase58()].sort());
  });

  it("emits MEDIUM parse_failure alert when prev parsed but curr cannot", async () => {
    const a = Keypair.generate().publicKey;
    const b = Keypair.generate().publicKey;
    const event = accountChangeEvent({
      data: buildSquadsBuffer({
        signers: [a, b],
        disc: Buffer.from("DEADBEEFDEADBEEF", "hex"),
      }),
      previousData: buildSquadsBuffer({ signers: [a, b] }),
    });
    const alert = await SignerSetChangeDetector.inspect(event);
    expect(alert?.severity).toBe("medium");
    expect(alert?.subject).toContain("members vector became unparseable");
    expect(alert?.context).toMatchObject({
      reason: "parse_failure",
      previousCount: 2,
    });
  });

  it("returns null when both prev and curr fail to parse (no usable signal)", async () => {
    const a = Keypair.generate().publicKey;
    const wrong = Buffer.from("DEADBEEFDEADBEEF", "hex");
    const event = accountChangeEvent({
      data: buildSquadsBuffer({ signers: [a], disc: wrong }),
      previousData: buildSquadsBuffer({
        signers: [Keypair.generate().publicKey],
        disc: wrong,
      }),
    });
    expect(await SignerSetChangeDetector.inspect(event)).toBeNull();
  });

  it("includes a tx explorer link when signature is set", async () => {
    const a = Keypair.generate().publicKey;
    const event = accountChangeEvent({
      data: buildSquadsBuffer({ signers: [a] }),
      previousData: buildSquadsBuffer({ signers: [a, Keypair.generate().publicKey] }),
    });
    const alert = await SignerSetChangeDetector.inspect(event);
    expect(alert?.explorerLink).toBe("https://solscan.io/tx/sigABC");
  });

  it("falls back to account explorer link with cluster query when signature null + devnet", async () => {
    const a = Keypair.generate().publicKey;
    const event = accountChangeEvent({
      data: buildSquadsBuffer({ signers: [a] }),
      previousData: buildSquadsBuffer({ signers: [a, Keypair.generate().publicKey] }),
      signature: null,
      cluster: "devnet",
    });
    const alert = await SignerSetChangeDetector.inspect(event);
    expect(alert?.explorerLink).toBe(
      `https://solscan.io/account/${STUB_ACCOUNT.toBase58()}?cluster=devnet`,
    );
  });

  // Boundary: empty members vector → first signer added. Real-world this
  // happens during multisig genesis. Pure addition, MEDIUM.
  it("emits MEDIUM when going from zero signers to one (genesis case)", async () => {
    const first = Keypair.generate().publicKey;
    const event = accountChangeEvent({
      data: buildSquadsBuffer({ signers: [first] }),
      previousData: buildSquadsBuffer({ signers: [] }),
    });
    const alert = await SignerSetChangeDetector.inspect(event);
    expect(alert?.severity).toBe("medium");
    expect(alert?.subject).toContain("1 signer(s) added");
    expect(alert?.context).toMatchObject({
      added: [first.toBase58()],
      removed: [],
      previousCount: 0,
      currentCount: 1,
    });
  });

  // Boundary: every signer removed. Pathological but observable on-chain.
  // HIGH (multiple removals, no additions).
  it("emits HIGH when every signer is removed (multisig fully purged)", async () => {
    const a = Keypair.generate().publicKey;
    const b = Keypair.generate().publicKey;
    const event = accountChangeEvent({
      data: buildSquadsBuffer({ signers: [] }),
      previousData: buildSquadsBuffer({ signers: [a, b] }),
    });
    const alert = await SignerSetChangeDetector.inspect(event);
    expect(alert?.severity).toBe("high");
    expect(alert?.subject).toContain("2 signer(s) removed");
    const ctx = alert?.context as { added: string[]; removed: string[] };
    expect(ctx.added).toEqual([]);
    expect(ctx.removed.sort()).toEqual([a.toBase58(), b.toBase58()].sort());
  });

  // Context shape contract: added/removed always arrays (never undefined),
  // previousCount/currentCount always numbers. Webhook formatters depend on
  // this — a missing field would crash the Discord embed builder.
  it("guarantees stable context shape (added/removed always arrays, counts always numbers)", async () => {
    const a = Keypair.generate().publicKey;
    const b = Keypair.generate().publicKey;
    const event = accountChangeEvent({
      data: buildSquadsBuffer({ signers: [a, b] }),
      previousData: buildSquadsBuffer({ signers: [a] }),
    });
    const alert = await SignerSetChangeDetector.inspect(event);
    const ctx = alert?.context as Record<string, unknown>;
    expect(Array.isArray(ctx.added)).toBe(true);
    expect(Array.isArray(ctx.removed)).toBe(true);
    expect(typeof ctx.previousCount).toBe("number");
    expect(typeof ctx.currentCount).toBe("number");
    expect(ctx.reason).toBe("signer_set_changed");
    expect(typeof ctx.account).toBe("string");
  });
});
