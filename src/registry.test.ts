import { PublicKey } from "@solana/web3.js";
import { describe, expect, it, vi } from "vitest";
import { dispatch } from "./registry.js";
import type { Alert, Detector, SolanaEvent } from "./types/events.js";

const NOOP_EVENT: SolanaEvent = {
  kind: "account_change",
  program: new PublicKey("11111111111111111111111111111111"),
  account: new PublicKey("11111111111111111111111111111112"),
  data: Buffer.alloc(0),
  previousData: null,
  slot: 1,
  signature: null,
  timestamp: 0,
  cluster: "devnet",
};

function detectorReturning(name: string, alert: Alert | null): Detector {
  return {
    name,
    description: "",
    inspect: vi.fn().mockResolvedValue(alert),
  };
}

function dummyAlert(name: string): Alert {
  return {
    detector: name,
    severity: "high",
    subject: "test",
    txSignature: null,
    cluster: "devnet",
    timestamp: 0,
    explorerLink: "",
    context: {},
  };
}

describe("dispatch", () => {
  it("returns only non-null alerts", async () => {
    const a = dummyAlert("a");
    const detectors = [
      detectorReturning("a", a),
      detectorReturning("b", null),
      detectorReturning("c", dummyAlert("c")),
    ];
    const alerts = await dispatch(NOOP_EVENT, detectors);
    expect(alerts.map((x) => x.detector)).toEqual(["a", "c"]);
  });

  it("calls every detector exactly once per event", async () => {
    const detectors = [detectorReturning("a", null), detectorReturning("b", null)];
    await dispatch(NOOP_EVENT, detectors);
    for (const d of detectors) {
      expect(d.inspect).toHaveBeenCalledTimes(1);
      expect(d.inspect).toHaveBeenCalledWith(NOOP_EVENT);
    }
  });

  it("swallows detector errors and keeps the rest running", async () => {
    const throwing: Detector = {
      name: "boom",
      description: "",
      inspect: vi.fn().mockRejectedValue(new Error("bad parse")),
    };
    const good = detectorReturning("ok", dummyAlert("ok"));
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const alerts = await dispatch(NOOP_EVENT, [throwing, good]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.detector).toBe("ok");
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it("returns empty array when no detectors", async () => {
    expect(await dispatch(NOOP_EVENT, [])).toEqual([]);
  });
});
