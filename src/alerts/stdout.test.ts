import { describe, expect, it } from "vitest";
import type { Alert } from "../types/events.js";
import { formatAlert, safeStringify } from "./stdout.js";

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    detector: "squads-timelock-removal",
    severity: "critical",
    subject: "Timelock removed on multisig ABC",
    txSignature: "sig123",
    cluster: "devnet",
    timestamp: 1700000000,
    explorerLink: "https://solscan.io/tx/sig123?cluster=devnet",
    context: { reason: "timelock_reduced", previousTimelockSeconds: 86400 },
    ...overrides,
  };
}

const FIXED_NOW = () => new Date("2026-04-19T12:00:00.000Z");

describe("formatAlert", () => {
  it("includes ISO timestamp, severity, detector, subject, link, and context", () => {
    const text = formatAlert(makeAlert(), { color: false, now: FIXED_NOW });
    expect(text).toContain("2026-04-19T12:00:00.000Z");
    expect(text).toContain("CRITICAL");
    expect(text).toContain("[squads-timelock-removal]");
    expect(text).toContain("Timelock removed on multisig ABC");
    expect(text).toContain("https://solscan.io/tx/sig123?cluster=devnet");
    expect(text).toContain('"reason":"timelock_reduced"');
  });

  it("omits ANSI escapes when color=false", () => {
    const text = formatAlert(makeAlert(), { color: false, now: FIXED_NOW });
    // biome-ignore lint/suspicious/noControlCharactersInRegex: escape char intended
    expect(text).not.toMatch(/\x1b\[/);
  });

  it("includes ANSI escapes when color=true", () => {
    const text = formatAlert(makeAlert(), { color: true, now: FIXED_NOW });
    // biome-ignore lint/suspicious/noControlCharactersInRegex: escape char intended
    expect(text).toMatch(/\x1b\[/);
  });

  it("survives BigInt in context (Solana slot numbers in newer web3.js)", () => {
    const alert = makeAlert({ context: { slot: 12345n, reason: "test" } });
    const text = formatAlert(alert, { color: false, now: FIXED_NOW });
    expect(text).toContain('"slot":"12345"');
    expect(text).toContain('"reason":"test"');
  });

  it("survives circular references in context without throwing", () => {
    const circular: Record<string, unknown> = { a: 1 };
    circular.self = circular;
    const alert = makeAlert({ context: circular });
    expect(() => formatAlert(alert, { color: false, now: FIXED_NOW })).not.toThrow();
    const text = formatAlert(alert, { color: false, now: FIXED_NOW });
    expect(text).toContain("[circular]");
  });

  it("pads severity label to fixed width for alignment", () => {
    const textHigh = formatAlert(makeAlert({ severity: "high" }), { color: false, now: FIXED_NOW });
    const textMedium = formatAlert(makeAlert({ severity: "medium" }), {
      color: false,
      now: FIXED_NOW,
    });
    // "HIGH    " and "MEDIUM  " both 8 chars
    expect(textHigh).toContain("HIGH    ");
    expect(textMedium).toContain("MEDIUM  ");
  });
});

describe("safeStringify", () => {
  it("converts BigInt to string", () => {
    expect(safeStringify({ n: 42n })).toBe('{"n":"42"}');
  });

  it("replaces circular refs with [circular]", () => {
    const a: Record<string, unknown> = {};
    a.self = a;
    expect(safeStringify(a)).toBe('{"self":"[circular]"}');
  });

  it("returns [unserializable] on unexpected throw", () => {
    const poison = {
      toJSON(): never {
        throw new Error("no JSON for you");
      },
    };
    expect(safeStringify(poison)).toBe("[unserializable]");
  });

  it("passes through plain objects unchanged", () => {
    expect(safeStringify({ a: 1, b: "x" })).toBe('{"a":1,"b":"x"}');
  });
});
