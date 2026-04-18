import { describe, expect, it } from "vitest";
import { parseGovernanceTimelock } from "./spl-governance.js";

describe("parseGovernanceTimelock — input validation", () => {
  it("returns null for empty buffer", () => {
    expect(parseGovernanceTimelock(Buffer.alloc(0))).toBeNull();
  });

  it("returns null for buffer shorter than minimum header", () => {
    expect(parseGovernanceTimelock(Buffer.alloc(79))).toBeNull();
  });

  it("returns null for account_type below GovernanceV2 range (e.g. RealmV2=16)", () => {
    const buf = Buffer.alloc(300);
    buf[0] = 16;
    expect(parseGovernanceTimelock(buf)).toBeNull();
  });

  it("returns null for account_type above GovernanceV2 range (e.g. 22)", () => {
    const buf = Buffer.alloc(300);
    buf[0] = 22;
    expect(parseGovernanceTimelock(buf)).toBeNull();
  });

  it("returns null for GovernanceV1 account_type (legacy, out of scope)", () => {
    const buf = Buffer.alloc(300);
    buf[0] = 3;
    expect(parseGovernanceTimelock(buf)).toBeNull();
  });

  it("returns null for garbage bytes after valid account_type (SDK decode fails)", () => {
    const buf = Buffer.alloc(300, 0xff);
    buf[0] = 18;
    expect(parseGovernanceTimelock(buf)).toBeNull();
  });

  it("returns null for uninitialized account (account_type=0)", () => {
    const buf = Buffer.alloc(300);
    buf[0] = 0;
    expect(parseGovernanceTimelock(buf)).toBeNull();
  });
});
