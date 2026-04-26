import type { AccountInfo, Connection, Context, PublicKey } from "@solana/web3.js";
import { PublicKey as PK } from "@solana/web3.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AlertSink } from "./alerts/stdout.js";
import type { DaemonConfig, WatchEntry } from "./config.js";
import { nextBackoff, startSupervisor } from "./supervisor.js";
import type { Alert, Detector, SolanaEvent } from "./types/events.js";

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

// A fake Connection that lets a test drive baseline fetch results, health
// checks, and account-change notifications on demand.
interface FakeHandle {
  fireChange: (account: PublicKey, data: Buffer, slot?: number) => void;
  getAccountInfoMock: ReturnType<typeof vi.fn>;
  getSlotMock: ReturnType<typeof vi.fn>;
  onAccountChangeMock: ReturnType<typeof vi.fn>;
  removeListenerMock: ReturnType<typeof vi.fn>;
  getSignaturesForAddressMock: ReturnType<typeof vi.fn>;
}

function makeFakeConnection(opts?: {
  baselines?: Map<string, Buffer>;
  slotImpl?: () => Promise<number>;
  signaturesImpl?: (account: PublicKey, slot: number) => Array<{ signature: string; slot: number }>;
}): { connection: Connection; handle: FakeHandle } {
  const listeners = new Map<string, (info: AccountInfo<Buffer>, ctx: Context) => void>();

  const getAccountInfoMock = vi.fn(async (pk: PublicKey): Promise<AccountInfo<Buffer> | null> => {
    const baseline = opts?.baselines?.get(pk.toBase58());
    if (!baseline) return null;
    return {
      data: baseline,
      executable: false,
      lamports: 1,
      owner: pk,
      rentEpoch: 0,
    };
  });

  const getSlotMock = vi.fn(async (): Promise<number> => {
    if (opts?.slotImpl) return opts.slotImpl();
    return 1;
  });

  let nextSubId = 1;
  const onAccountChangeMock = vi.fn(
    (account: PublicKey, cb: (info: AccountInfo<Buffer>, ctx: Context) => void) => {
      listeners.set(account.toBase58(), cb);
      return nextSubId++;
    },
  );

  const removeListenerMock = vi.fn(async (_id: number): Promise<void> => {
    // Real Connection clears its server-side subscription. We don't model that
    // here — tests only assert the call happened.
  });

  const getSignaturesForAddressMock = vi.fn(
    async (account: PublicKey, conf: { limit?: number }, _commitment?: string) => {
      if (opts?.signaturesImpl) {
        // Slot is best-effort context; pass 0 if unknown.
        return opts.signaturesImpl(account, 0).slice(0, conf.limit ?? 10);
      }
      return [];
    },
  );

  const connection = {
    getAccountInfo: getAccountInfoMock,
    getSlot: getSlotMock,
    onAccountChange: onAccountChangeMock,
    removeAccountChangeListener: removeListenerMock,
    getSignaturesForAddress: getSignaturesForAddressMock,
  } as unknown as Connection;

  const handle: FakeHandle = {
    fireChange: (account, data, slot = 2) => {
      const cb = listeners.get(account.toBase58());
      if (!cb) throw new Error(`no subscription for ${account.toBase58()}`);
      const info: AccountInfo<Buffer> = {
        data,
        executable: false,
        lamports: 1,
        owner: account,
        rentEpoch: 0,
      };
      cb(info, { slot });
    },
    getAccountInfoMock,
    getSlotMock,
    onAccountChangeMock,
    removeListenerMock,
    getSignaturesForAddressMock,
  };

  return { connection, handle };
}

const SYSTEM_PROGRAM = new PK("11111111111111111111111111111111");
const WATCH_ACCOUNT = new PK("11111111111111111111111111111112");

function makeConfig(): DaemonConfig {
  const watch: WatchEntry[] = [{ program: SYSTEM_PROGRAM, account: WATCH_ACCOUNT }];
  return {
    rpcUrl: "http://fake",
    wsUrl: "ws://fake",
    cluster: "devnet",
    watch,
    discordWebhookUrl: null,
    slackWebhookUrl: null,
  };
}

function makeSink(received: Alert[]): AlertSink {
  return {
    name: "capture",
    handle: (a: Alert) => {
      received.push(a);
    },
  };
}

function recordingDetector(name: string, onEvent: (e: SolanaEvent) => void): Detector {
  return {
    name,
    description: "",
    inspect: async (event) => {
      onEvent(event);
      return null;
    },
  };
}

describe("startSupervisor integration", () => {
  beforeEach(() => {
    // Silence the default stdout logger during tests.
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("seeds baseline before subscribing so the first change is diffed", async () => {
    const baselineBytes = Buffer.from([1, 2, 3]);
    const { connection, handle } = makeFakeConnection({
      baselines: new Map([[WATCH_ACCOUNT.toBase58(), baselineBytes]]),
    });

    const seen: SolanaEvent[] = [];
    const detector = recordingDetector("rec", (e) => {
      seen.push(e);
    });

    const sup = await startSupervisor({
      config: makeConfig(),
      sink: makeSink([]),
      detectors: [detector],
      connectionFactory: () => connection,
      healthCheckIntervalMs: 60_000,
    });

    // getAccountInfo must be called before onAccountChange — i.e. baseline
    // is fetched before subscribing.
    const baselineCallOrder = handle.getAccountInfoMock.mock.invocationCallOrder[0];
    const subscribeCallOrder = handle.onAccountChangeMock.mock.invocationCallOrder[0];
    expect(baselineCallOrder).toBeLessThan(subscribeCallOrder ?? Number.POSITIVE_INFINITY);

    const newBytes = Buffer.from([9, 9, 9]);
    handle.fireChange(WATCH_ACCOUNT, newBytes);
    await vi.waitFor(() => expect(seen.length).toBe(1));

    expect(seen[0]?.kind).toBe("account_change");
    if (seen[0]?.kind === "account_change") {
      expect(seen[0].previousData?.equals(baselineBytes)).toBe(true);
      expect(seen[0].data.equals(newBytes)).toBe(true);
    }

    await sup.stop();
  });

  it("first change is diffed against null when the account did not exist at startup", async () => {
    const { connection, handle } = makeFakeConnection();

    const seen: SolanaEvent[] = [];
    const detector = recordingDetector("rec", (e) => {
      seen.push(e);
    });

    const sup = await startSupervisor({
      config: makeConfig(),
      sink: makeSink([]),
      detectors: [detector],
      connectionFactory: () => connection,
      healthCheckIntervalMs: 60_000,
    });

    handle.fireChange(WATCH_ACCOUNT, Buffer.from([1]));
    await vi.waitFor(() => expect(seen.length).toBe(1));
    if (seen[0]?.kind === "account_change") {
      expect(seen[0].previousData).toBeNull();
    }

    await sup.stop();
  });

  it("delivers alerts returned by a detector to the sink", async () => {
    const received: Alert[] = [];
    const { connection, handle } = makeFakeConnection();

    const firing: Detector = {
      name: "firing",
      description: "",
      inspect: async (event) => ({
        detector: "firing",
        severity: "high",
        subject: "x",
        txSignature: null,
        cluster: event.cluster,
        timestamp: event.timestamp,
        explorerLink: "",
        context: {},
      }),
    };

    const sup = await startSupervisor({
      config: makeConfig(),
      sink: makeSink(received),
      detectors: [firing],
      connectionFactory: () => connection,
      healthCheckIntervalMs: 60_000,
    });

    handle.fireChange(WATCH_ACCOUNT, Buffer.from([1]));
    await vi.waitFor(() => expect(received.length).toBe(1));
    expect(received[0]?.detector).toBe("firing");

    await sup.stop();
  });

  it("reconnects after a health-check failure", async () => {
    let slotCalls = 0;
    const { connection: conn1 } = makeFakeConnection({
      slotImpl: async () => {
        slotCalls += 1;
        if (slotCalls === 1) throw new Error("rpc dead");
        return 1;
      },
    });
    const { connection: conn2 } = makeFakeConnection();

    const factory = vi.fn().mockReturnValueOnce(conn1).mockReturnValueOnce(conn2);

    const sup = await startSupervisor({
      config: makeConfig(),
      sink: makeSink([]),
      detectors: [],
      connectionFactory: factory,
      healthCheckIntervalMs: 20,
    });

    expect(factory).toHaveBeenCalledTimes(1);

    // healthCheckIntervalMs=20 + INITIAL_BACKOFF_MS=1000 + slop. Real timers
    // so we pay the full backoff — ~1.2s per run. Cheap enough.
    await vi.waitFor(() => expect(factory).toHaveBeenCalledTimes(2), { timeout: 3_000 });

    await sup.stop();
  }, 10_000);

  it("reconciles a state change that landed during the disconnect window", async () => {
    const baselineA = Buffer.from([1, 2, 3]);
    const baselineB = Buffer.from([9, 9, 9]);

    let slotCalls = 0;
    // First connection seeds baseline A, then fails its first health check.
    const { connection: conn1 } = makeFakeConnection({
      baselines: new Map([[WATCH_ACCOUNT.toBase58(), baselineA]]),
      slotImpl: async () => {
        slotCalls += 1;
        if (slotCalls === 1) throw new Error("rpc dead");
        return 1;
      },
    });
    // Second connection: the on-chain state has moved to B while we were down.
    const { connection: conn2 } = makeFakeConnection({
      baselines: new Map([[WATCH_ACCOUNT.toBase58(), baselineB]]),
    });
    const factory = vi.fn().mockReturnValueOnce(conn1).mockReturnValueOnce(conn2);

    const seen: SolanaEvent[] = [];
    const detector = recordingDetector("rec", (e) => {
      seen.push(e);
    });

    const sup = await startSupervisor({
      config: makeConfig(),
      sink: makeSink([]),
      detectors: [detector],
      connectionFactory: factory,
      healthCheckIntervalMs: 20,
    });

    // Wait for the reconnect + reconcile to fire a synthetic event.
    await vi.waitFor(() => expect(seen.length).toBe(1), { timeout: 3_000 });

    expect(seen[0]?.kind).toBe("account_change");
    if (seen[0]?.kind === "account_change") {
      expect(seen[0].previousData?.equals(baselineA)).toBe(true);
      expect(seen[0].data.equals(baselineB)).toBe(true);
    }

    await sup.stop();
  }, 10_000);

  it("removes the account-change listener on reconnect", async () => {
    let slotCalls = 0;
    const { connection: conn1, handle: h1 } = makeFakeConnection({
      slotImpl: async () => {
        slotCalls += 1;
        if (slotCalls === 1) throw new Error("rpc dead");
        return 1;
      },
    });
    const { connection: conn2 } = makeFakeConnection();
    const factory = vi.fn().mockReturnValueOnce(conn1).mockReturnValueOnce(conn2);

    const sup = await startSupervisor({
      config: makeConfig(),
      sink: makeSink([]),
      detectors: [],
      connectionFactory: factory,
      healthCheckIntervalMs: 20,
    });

    // Initial subscribe registered exactly one listener with id=1.
    expect(h1.onAccountChangeMock).toHaveBeenCalledTimes(1);
    expect(h1.removeListenerMock).not.toHaveBeenCalled();

    // After reconnect, the supervisor should have unregistered the old listener.
    await vi.waitFor(() => expect(h1.removeListenerMock).toHaveBeenCalledTimes(1), {
      timeout: 3_000,
    });
    expect(h1.removeListenerMock).toHaveBeenCalledWith(1);

    await sup.stop();
  }, 10_000);

  it("removes account-change listeners on stop()", async () => {
    const { connection, handle } = makeFakeConnection();
    const sup = await startSupervisor({
      config: makeConfig(),
      sink: makeSink([]),
      detectors: [],
      connectionFactory: () => connection,
      healthCheckIntervalMs: 60_000,
    });

    expect(handle.removeListenerMock).not.toHaveBeenCalled();
    await sup.stop();
    expect(handle.removeListenerMock).toHaveBeenCalledTimes(1);
    expect(handle.removeListenerMock).toHaveBeenCalledWith(1);
  });

  it("backfills txSignature via getSignaturesForAddress when an alert fires", async () => {
    const received: Alert[] = [];
    const { connection, handle } = makeFakeConnection({
      signaturesImpl: () => [{ signature: "backfilled-sig-abc", slot: 2 }],
    });

    const firing: Detector = {
      name: "firing",
      description: "",
      inspect: async (event) => ({
        detector: "firing",
        severity: "high",
        subject: "x",
        txSignature: null,
        cluster: event.cluster,
        timestamp: event.timestamp,
        explorerLink: "",
        context: {},
      }),
    };

    const sup = await startSupervisor({
      config: makeConfig(),
      sink: makeSink(received),
      detectors: [firing],
      connectionFactory: () => connection,
      healthCheckIntervalMs: 60_000,
    });

    handle.fireChange(WATCH_ACCOUNT, Buffer.from([1]), 2);
    await vi.waitFor(() => expect(received.length).toBe(1));
    expect(handle.getSignaturesForAddressMock).toHaveBeenCalledTimes(1);
    expect(received[0]?.txSignature).toBe("backfilled-sig-abc");
    expect(received[0]?.explorerLink).toContain("/tx/backfilled-sig-abc");

    await sup.stop();
  });

  it("does not call getSignaturesForAddress when no detector fires", async () => {
    const { connection, handle } = makeFakeConnection();
    const silent = recordingDetector("silent", () => {});

    const sup = await startSupervisor({
      config: makeConfig(),
      sink: makeSink([]),
      detectors: [silent],
      connectionFactory: () => connection,
      healthCheckIntervalMs: 60_000,
    });

    handle.fireChange(WATCH_ACCOUNT, Buffer.from([1]));
    // Give dispatch a tick to settle.
    await new Promise((r) => setTimeout(r, 30));
    expect(handle.getSignaturesForAddressMock).not.toHaveBeenCalled();

    await sup.stop();
  });

  it("falls back to alert with null signature when backfill returns empty", async () => {
    const received: Alert[] = [];
    const { connection, handle } = makeFakeConnection({
      signaturesImpl: () => [],
    });

    const firing: Detector = {
      name: "firing",
      description: "",
      inspect: async (event) => ({
        detector: "firing",
        severity: "high",
        subject: "x",
        txSignature: null,
        cluster: event.cluster,
        timestamp: event.timestamp,
        explorerLink: "fallback-link",
        context: {},
      }),
    };

    const sup = await startSupervisor({
      config: makeConfig(),
      sink: makeSink(received),
      detectors: [firing],
      connectionFactory: () => connection,
      healthCheckIntervalMs: 60_000,
    });

    handle.fireChange(WATCH_ACCOUNT, Buffer.from([1]));
    await vi.waitFor(() => expect(received.length).toBe(1));
    expect(received[0]?.txSignature).toBeNull();
    expect(received[0]?.explorerLink).toBe("fallback-link");

    await sup.stop();
  });

  it("stop() prevents further reconnects", async () => {
    const { connection: conn1 } = makeFakeConnection({
      slotImpl: async () => {
        throw new Error("rpc dead");
      },
    });
    const factory = vi.fn().mockReturnValue(conn1);

    const sup = await startSupervisor({
      config: makeConfig(),
      sink: makeSink([]),
      detectors: [],
      connectionFactory: factory,
      healthCheckIntervalMs: 20,
    });

    await sup.stop();

    // Wait well past several health-check intervals + a full backoff window.
    await new Promise((r) => setTimeout(r, 1_400));

    // Only the initial connect should have happened; stop() killed the loop.
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
