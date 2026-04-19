import { describe, expect, it } from "vitest";
import { nextBackoff } from "./supervisor.js";

describe("nextBackoff", () => {
  it("doubles until cap", () => {
    expect(nextBackoff(1_000)).toBe(2_000);
    expect(nextBackoff(2_000)).toBe(4_000);
    expect(nextBackoff(30_000)).toBe(60_000);
  });

  it("caps at 60 seconds", () => {
    expect(nextBackoff(60_000)).toBe(60_000);
    expect(nextBackoff(120_000)).toBe(60_000);
  });
});
