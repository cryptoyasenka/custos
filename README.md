# Custos

[![ci](https://github.com/cryptoyasenka/custos/actions/workflows/ci.yml/badge.svg)](https://github.com/cryptoyasenka/custos/actions/workflows/ci.yml)

Open-source real-time monitor for Solana multisigs and DAOs. Detects the
attack chain that drained $285M from Drift on April 1, 2026.

## What it catches

Three detectors run 24/7 today; a fourth is on the roadmap:

- **TimelockRemovalDetector** — alerts when a governance timelock is
  removed or dropped below half (Squads v4 + SPL Governance).
- **MultisigWeakeningDetector** — alerts on signer threshold reductions
  (e.g. 5-of-7 → 1-of-7) on Squads v4 multisigs.
- **PrivilegedNonceDetector** — alerts when a watched System Program
  nonce account is initialized or has its authority rotated.
- *Roadmap:* **StaleNonceExecutionDetector** — alerts when a pre-signed
  transaction older than N hours executes. Requires transaction-log
  ingestion (designed, not yet built).

Alerts fan out to Discord, Slack, and CLI. Every configured sink
receives every alert; webhook failures are logged but do not block
other sinks. Detectors that throw or hang are surfaced as low-severity
operational alerts rather than disappearing into stderr.

## How this catches the Drift attack chain

The April 2026 Drift exploit chained three on-chain config changes and
one pre-signed execution. Custos's detectors map directly to those
steps:

| Attack step                                         | Detector                       | Severity |
| --------------------------------------------------- | ------------------------------ | -------- |
| Realm timelock reduced from 6 days → 0             | `spl-governance-timelock-removal` | critical |
| Squads threshold dropped from 5-of-9 → 1-of-9      | `squads-multisig-weakening`    | critical |
| Durable nonce created under attacker-controlled key | `privileged-nonce`             | critical |
| Pre-signed withdrawal tx executed from stale nonce  | *(roadmap)* `stale-nonce-execution` | high     |

Any single detector firing would have bought hours of response time.
Custos catches all three that changed on-chain state; roadmap item
covers the final execution step.

## Positioning

Solana Foundation's STRIDE program funds commercial monitoring for
protocols with $10M+ TVL. Custos is for the 99% below that line —
small DAOs, grant committees, treasury multisigs, solo-builder
wallets. Self-host in five minutes. MIT licensed.

## Reliability

- WebSocket supervisor reconnects with exponential backoff (1s → 60s)
  after connection drops or a failed 30s slot health check.
- Baseline account state is fetched before subscribing, so the first
  change after startup is always diffed correctly (web3.js
  `onAccountChange` does not deliver the initial snapshot).
- SIGINT/SIGTERM trigger a graceful shutdown that drains in-flight
  dispatches before exiting.
- Per-detector 5s timeout; timeouts and throws emit a low-severity
  alert rather than silently disappearing.

## Status

Pre-release. Built for the Solana Frontier Hackathon
(submission 2026-05-10 23:59 PDT). Three detectors are running live
on devnet; devnet smoke harness in `scripts/` reproduces the
threshold-weakening step of the Drift chain end-to-end.

## Quick start

See [DEV-ENV-SETUP.md](./DEV-ENV-SETUP.md).

## Running the devnet demo

End-to-end proof that Custos catches real on-chain config changes.
You need a funded devnet keypair at `~/.config/solana/id.json`
(or set `SOLANA_KEYPAIR` to its path). `scripts/devnet-create.ts` will
request a 1 SOL airdrop if your balance is below 0.5 SOL.

```bash
cp .env.example .env
npm install

# Terminal 1 — create a 3-of-5 Squads multisig on devnet with a 1-day
# time_lock. Copy the printed MULTISIG PDA.
npm run smoke:create

# Edit .env and paste the PDA into CUSTOS_WATCH.

# Terminal 2 — start the daemon.
npm run dev

# Terminal 1 — simulate the Drift attack chain, one step at a time.
# Each command triggers an alert in Terminal 2.
npm run smoke:timelock -- <MULTISIG_PDA>   # CRITICAL: timelock removed
npm run smoke:weaken   -- <MULTISIG_PDA>   # HIGH: 3-of-5 → 1-of-5
```

Within a few seconds of each config transaction confirming, the daemon
in Terminal 2 should print one alert per step — both from the same
multisig account, both using the same detectors that would catch the
real Drift exploit on mainnet.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## License

MIT. See [LICENSE](./LICENSE).
