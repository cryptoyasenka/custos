# Architecture

## Components

```
Solana RPC             Supervisor               Detectors               Alert sinks
(WebSocket)       ───→  baseline fetch    ───→  3 live + 1 roadmap ───→ Discord, Slack,
CUSTOS_RPC_URL         onAccountChange          5s timeout each         stdout
                       reconnect + health                               fan-out
```

The daemon is a single Node process. `src/supervisor.ts` owns the
Connection lifecycle; `src/registry.ts` fans each event out to every
detector; `src/alerts/*` fans each resulting alert out to every
configured sink.

## Watched programs

| Program        | Address                                          | Why                                                         | Watched account kind                |
| -------------- | ------------------------------------------------ | ----------------------------------------------------------- | ----------------------------------- |
| Squads v4      | `SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf`    | Multisig config changes: threshold, signer set, `time_lock` | Multisig PDA                        |
| SPL Governance | `GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw`   | Per-governance timelock, vote thresholds                    | `GovernanceV2` PDA (not the realm)  |
| System Program | `11111111111111111111111111111111`               | Durable nonce init / authority rotation                     | Nonce account (80 bytes)            |

Addresses verified against Solana mainnet as of 2026-04. Update if
programs redeploy.

## Event model

```ts
type SolanaEvent = AccountChangeEvent | TransactionEvent;

interface AccountChangeEvent {
  kind: "account_change";
  program: PublicKey;
  account: PublicKey;
  data: Buffer;
  previousData: Buffer | null;   // null only for the first event per account,
                                 // and only when baseline seed failed
  slot: number;
  signature: string | null;
  timestamp: number;
  cluster: Cluster;
}
```

`TransactionEvent` is defined but not yet produced — reserved for the
roadmap `StaleNonceExecutionDetector` which requires an `onLogs`
ingestor path.

## Detector contract

```ts
interface Detector {
  name: string;
  description: string;
  inspect(event: SolanaEvent): Promise<Alert | null>;
}
```

Each detector is pure (no shared state), takes a deserialized Solana
event, returns an `Alert` or `null`. Severity lives on `Alert`
(per-event) so the same detector can emit different severities for
different transitions. Tests are table-driven.

## Alert contract

```ts
interface Alert {
  detector: string;
  severity: "low" | "medium" | "high" | "critical";
  subject: string;                   // e.g. "Squads multisig threshold dropped"
  txSignature: string | null;        // nullable — not every event is tx-bound
  cluster: "mainnet" | "devnet" | "testnet";
  timestamp: number;
  explorerLink: string;
  context: Record<string, unknown>;
}
```

## Supervisor

`startSupervisor()` in `src/supervisor.ts`:

- **Baseline seeding.** Before subscribing, fetches `getAccountInfo`
  for every watch entry. `onAccountChange` does not deliver an initial
  snapshot, so the first change event would otherwise have
  `previousData = null` and detectors would see "startup, not an
  attack."
- **Reconcile on reconnect.** When the supervisor reconnects, it
  refetches each watched account and compares the bytes against the
  in-memory baseline from before the drop. If they differ, it
  synthesizes an `account_change` event (`previousData = old baseline`,
  `data = current`) and dispatches it through the detector pipeline.
  Without this, a config change that lands during the WS disconnect
  window would get absorbed silently into the new baseline. Initial
  startup is unaffected — the baseline map is empty, nothing to
  reconcile.
- **Reconnect.** Exponential backoff 1s → 60s cap. Resets to 1s on
  successful reconnect. Old `Connection` is dropped (`connection = null`);
  GC closes the underlying WebSocket (web3.js has no explicit close).
- **Health check.** `getSlot("confirmed")` every 30s. Failure triggers
  a reconnect rather than waiting for the WebSocket to notice it's
  dead. A `reconnecting` flag prevents concurrent reconnect loops.
- **Graceful stop.** `stop()` clears the health-check interval, waits
  50ms to let in-flight dispatches drain, then drops the connection.
  `daemon.ts` awaits `stop()` from SIGINT/SIGTERM before resolving
  `run()`.

## Registry (fan-in)

`dispatch(event, detectors, { timeoutMs })` in `src/registry.ts`:

- Every detector sees every event, in parallel (`Promise.all`).
- Each detector is raced against a timeout (default 5s). A timeout
  emits a low-severity operational alert with `context.reason =
  "detector_timeout"`; a thrown error emits one with `context.reason =
  "detector_error"`. Both go through the normal sink fan-out so
  operators see them on the channels they already watch — not lost to
  stderr.

## Alert sinks (fan-out)

`FanOutAlertSink` wraps N inner sinks. Each `handle()` call is wrapped
in a try/catch so a misbehaving sink (throw, timeout) cannot block the
others. Built-in sinks:

- `StdoutAlertSink` — always on; hardened against `BigInt` and
  circular `context` values.
- `DiscordAlertSink` — severity-colored embed, fire-and-forget POST.
- `SlackAlertSink` — `mrkdwn` blocks, fire-and-forget POST.

Webhook URLs are user-owned; Custos Nox stores no secrets.

## Config

Env-var driven (see `.env.example`):

| Var                      | Required | Meaning                                                      |
| ------------------------ | -------- | ------------------------------------------------------------ |
| `CUSTOS_RPC_URL`         | yes      | HTTP RPC endpoint                                            |
| `CUSTOS_WS_URL`          | no       | WebSocket endpoint if different from default                 |
| `CUSTOS_CLUSTER`         | yes      | `mainnet` \| `devnet` \| `testnet` (tags alerts)             |
| `CUSTOS_WATCH`           | yes      | Comma-separated `<program>:<account>` pairs                  |
| `CUSTOS_DISCORD_WEBHOOK` | no       | Discord webhook URL                                          |
| `CUSTOS_SLACK_WEBHOOK`   | no       | Slack webhook URL                                            |

## Dashboard (marketing site)

`dashboard/` is a Next.js static site with a detector catalog and
sample event feed. It is a marketing/landing page with hardcoded sample
data — it is NOT connected to a live daemon. A real-time monitoring
dashboard that subscribes to a running daemon is roadmap.

## Out of MVP scope

- `StaleNonceExecutionDetector` (roadmap — needs `onLogs` ingestor and
  nonce-creation-time tracking)
- Real-time monitoring dashboard (live alert feed from a running daemon)
- Multi-tenant SaaS
- Historical replay UI (CLI replay in MVP)
