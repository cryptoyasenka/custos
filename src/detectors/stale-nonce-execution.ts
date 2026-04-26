import { NONCE_ACCOUNT_LENGTH, SYSTEM_PROGRAM_ID, parseNonceAccount } from "../parsers/nonce.js";
import type { Alert, Detector, SolanaEvent } from "../types/events.js";
import { buildExplorerLink } from "./_shared.js";

export const STALE_NONCE_DETECTOR_NAME = "stale-nonce-execution";

// Nonce account layout (80 bytes):
//   u32 @0  version/discriminator
//   u32 @4  state (0=uninit, 1=init)
//   32  @8  authorized_pubkey
//   32  @40 current blockhash (the "nonce" value)
//   u64 @72 fee_calculator
const BLOCKHASH_OFFSET = 40;
const BLOCKHASH_LENGTH = 32;

// Default: nonce created ≥1 hour before use is considered stale.
export const DEFAULT_STALE_THRESHOLD_SECS = 3600;

// Hard cap on tracked nonces. With the default 1h threshold and a 100-event
// eviction cadence this is generous; it only matters if an operator points the
// daemon at thousands of nonces with a multi-decade staleSecs.
export const MAX_TRACKED_NONCES = 10_000;

// Eviction runs every Nth call to keep per-event overhead negligible.
export const EVICTION_CADENCE = 100;

// Entries older than `thresholdMs * STALE_RETENTION_MULTIPLIER` cannot trigger
// any future alert that wasn't already triggered, so they are safe to drop.
const STALE_RETENTION_MULTIPLIER = 2;

export function evictStale(
  map: Map<string, number>,
  nowMsValue: number,
  thresholdMs: number,
  maxTracked: number = MAX_TRACKED_NONCES,
): void {
  const cutoffMs = nowMsValue - thresholdMs * STALE_RETENTION_MULTIPLIER;
  for (const [key, ts] of map) {
    if (ts < cutoffMs) map.delete(key);
  }
  if (map.size > maxTracked) {
    const excess = map.size - maxTracked;
    const oldest = [...map.entries()].sort((a, b) => a[1] - b[1]).slice(0, excess);
    for (const [key] of oldest) map.delete(key);
  }
}

export interface StaleNonceExecutionDetectorOptions {
  staleSecs?: number;
  nowMs?: () => number;
  maxTracked?: number;
  evictionCadence?: number;
}

export function makeStaleNonceExecutionDetector(
  opts: StaleNonceExecutionDetectorOptions = {},
): Detector {
  const thresholdMs = (opts.staleSecs ?? DEFAULT_STALE_THRESHOLD_SECS) * 1000;
  const nowMs = opts.nowMs ?? (() => Date.now());
  const maxTracked = opts.maxTracked ?? MAX_TRACKED_NONCES;
  const evictionCadence = opts.evictionCadence ?? EVICTION_CADENCE;

  // account base58 → timestamp (ms) when nonce was first seen as initialized
  const firstSeenAt = new Map<string, number>();
  let inspectCount = 0;

  function maybeEvict(): void {
    inspectCount += 1;
    if (inspectCount % evictionCadence !== 0) return;
    evictStale(firstSeenAt, nowMs(), thresholdMs, maxTracked);
  }

  return {
    name: STALE_NONCE_DETECTOR_NAME,
    description:
      "Alerts when a watched durable-nonce account is advanced (used in a transaction) " +
      "significantly after it was first initialized. In the Drift April 2026 attack chain, " +
      "the attacker pre-signed a draining transaction using a nonce they had seeded days earlier. " +
      "A stale-nonce alert would have fired the moment that pre-signed transaction executed.",

    async inspect(event: SolanaEvent): Promise<Alert | null> {
      if (event.kind !== "account_change") return null;
      if (!event.program.equals(SYSTEM_PROGRAM_ID)) return null;
      if (event.data.length !== NONCE_ACCOUNT_LENGTH) return null;

      const curr = parseNonceAccount(event.data);
      if (!curr || curr.state !== "initialized") return null;

      const accountBase58 = event.account.toBase58();

      // First time we see this account: seed the creation time and exit.
      if (event.previousData === null) {
        if (!firstSeenAt.has(accountBase58)) {
          firstSeenAt.set(accountBase58, event.timestamp * 1000);
          maybeEvict();
        }
        return null;
      }

      // Nonce changed but was previously uninitialized: record seed time.
      const prev = parseNonceAccount(event.previousData);
      if (!prev || prev.state !== "initialized") {
        if (!firstSeenAt.has(accountBase58)) {
          firstSeenAt.set(accountBase58, event.timestamp * 1000);
          maybeEvict();
        }
        return null;
      }

      // Both prev and curr are initialized. Check if blockhash changed.
      const prevBlockhash = event.previousData.subarray(
        BLOCKHASH_OFFSET,
        BLOCKHASH_OFFSET + BLOCKHASH_LENGTH,
      );
      const currBlockhash = event.data.subarray(
        BLOCKHASH_OFFSET,
        BLOCKHASH_OFFSET + BLOCKHASH_LENGTH,
      );
      if (prevBlockhash.equals(currBlockhash)) return null;

      // Blockhash advanced = AdvanceNonce instruction executed = a transaction used this nonce.
      const seenAt = firstSeenAt.get(accountBase58);
      if (seenAt === undefined) {
        // Daemon started after nonce was created; record now and skip.
        firstSeenAt.set(accountBase58, nowMs());
        maybeEvict();
        return null;
      }

      const staleMs = nowMs() - seenAt;
      if (staleMs < thresholdMs) return null;

      const staleMins = Math.round(staleMs / 60_000);
      const authority = curr.authority?.toBase58() ?? "unknown";

      return {
        detector: STALE_NONCE_DETECTOR_NAME,
        severity: "high",
        subject: `Stale nonce ${accountBase58} advanced ${staleMins} min after creation (authority: ${authority})`,
        txSignature: event.signature,
        cluster: event.cluster,
        timestamp: event.timestamp,
        explorerLink: buildExplorerLink(event.signature, event.account, event.cluster),
        context: {
          reason: "stale_nonce_advanced",
          account: accountBase58,
          authority,
          staleMs,
          staleMins,
          thresholdMs,
          firstSeenAt: new Date(seenAt).toISOString(),
        },
      };
    },
  };
}

export const StaleNonceExecutionDetector = makeStaleNonceExecutionDetector();
