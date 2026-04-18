import { describe, expect, it } from "vitest";
import {
  SQUADS_MAX_TIME_LOCK,
  parseSquadsMultisigTimelock,
  squadsMultisigDiscriminator,
} from "./squads.js";

function buildMultisigBuffer(opts: {
  timeLock: number;
  discriminator?: Buffer;
  threshold?: number;
  extraBytes?: number;
}): Buffer {
  const disc = opts.discriminator ?? squadsMultisigDiscriminator();
  const createKey = Buffer.alloc(32, 0x11);
  const configAuthority = Buffer.alloc(32, 0x22);
  const threshold = Buffer.alloc(2);
  threshold.writeUInt16LE(opts.threshold ?? 3, 0);
  const timeLock = Buffer.alloc(4);
  timeLock.writeUInt32LE(opts.timeLock, 0);
  const tail = Buffer.alloc(opts.extraBytes ?? 32, 0);
  return Buffer.concat([disc, createKey, configAuthority, threshold, timeLock, tail]);
}

describe("parseSquadsMultisigTimelock", () => {
  it("reads a valid time_lock at byte offset 74", () => {
    const buf = buildMultisigBuffer({ timeLock: 86_400 });
    expect(parseSquadsMultisigTimelock(buf)).toBe(86_400);
  });

  it("reads zero timelock", () => {
    const buf = buildMultisigBuffer({ timeLock: 0 });
    expect(parseSquadsMultisigTimelock(buf)).toBe(0);
  });

  it("reads the maximum allowed timelock (~3 months)", () => {
    const buf = buildMultisigBuffer({ timeLock: SQUADS_MAX_TIME_LOCK });
    expect(parseSquadsMultisigTimelock(buf)).toBe(SQUADS_MAX_TIME_LOCK);
  });

  it("returns null when the value exceeds Squads MAX_TIME_LOCK (likely corrupt)", () => {
    const buf = buildMultisigBuffer({ timeLock: SQUADS_MAX_TIME_LOCK + 1 });
    expect(parseSquadsMultisigTimelock(buf)).toBeNull();
  });

  it("returns null for a completely empty buffer", () => {
    expect(parseSquadsMultisigTimelock(Buffer.alloc(0))).toBeNull();
  });

  it("returns null when buffer is shorter than the minimum header", () => {
    expect(parseSquadsMultisigTimelock(Buffer.alloc(77))).toBeNull();
  });

  it("returns null when discriminator does not match account:Multisig", () => {
    const wrongDisc = Buffer.from("DEADBEEFDEADBEEF", "hex");
    const buf = buildMultisigBuffer({ timeLock: 3600, discriminator: wrongDisc });
    expect(parseSquadsMultisigTimelock(buf)).toBeNull();
  });

  it("accepts a buffer with trailing members vector without reading past time_lock", () => {
    const buf = buildMultisigBuffer({ timeLock: 172_800, extraBytes: 1024 });
    expect(parseSquadsMultisigTimelock(buf)).toBe(172_800);
  });

  it("time_lock byte offset is exactly 74 (anchor disc + create_key + config_authority + threshold)", () => {
    const buf = buildMultisigBuffer({ timeLock: 12_345 });
    expect(buf.readUInt32LE(74)).toBe(12_345);
  });

  it("discriminator is exactly 8 bytes of sha256('account:Multisig')", () => {
    const disc = squadsMultisigDiscriminator();
    expect(disc.length).toBe(8);
  });
});
