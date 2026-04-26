# Custos Nox

[![ci](https://github.com/cryptoyasenka/custos-nox/actions/workflows/ci.yml/badge.svg)](https://github.com/cryptoyasenka/custos-nox/actions/workflows/ci.yml)

Open-source real-time monitor for Solana multisigs and DAOs. Detects the
attack chain that drained $285M from Drift on April 1, 2026.

**Live:** <https://custos-nox-production.up.railway.app>

**Dashboard:** marketing site, detector catalog, and sample event feed
live in [`dashboard/`](./dashboard) (Next.js 16, static build).

## What it catches

Five detectors run live today. Four cover every on-chain step of the
Drift April 2026 attack chain; the fifth catches an adjacent multisig
takeover vector (signer-set rotation) that is common in similar
exploits but was not exercised in Drift specifically.

- **TimelockRemovalDetector** — alerts when a governance timelock is
  removed or dropped below half (Squads v4 + SPL Governance).
- **MultisigWeakeningDetector** — alerts on signer threshold reductions
  (e.g. 5-of-7 → 1-of-7) on Squads v4 multisigs.
- **SignerSetChangeDetector** — alerts when a Squads v4 multisig's
  members vector is mutated. Removal of a legitimate signer or rotation
  fires HIGH; pure additions fire MEDIUM.
- **PrivilegedNonceDetector** — alerts when a watched System Program
  nonce account is initialized or has its authority rotated.
- **StaleNonceExecutionDetector** — alerts when a durable nonce is
  advanced (a pre-signed transaction executes) significantly after the
  nonce was first initialized. Fires when the gap exceeds a configurable
  threshold (default 1 hour).

Alerts fan out to Discord, Slack, and CLI. Every configured sink
receives every alert; webhook failures are logged but do not block
other sinks. Detectors that throw or hang are surfaced as low-severity
operational alerts rather than disappearing into stderr.

## How this catches the Drift attack chain

The April 2026 Drift exploit chained three on-chain config changes and
one pre-signed execution. Custos Nox's detectors map directly to those
steps:

| Attack step                                         | Detector                       | Severity |
| --------------------------------------------------- | ------------------------------ | -------- |
| Realm timelock reduced from 6 days → 0             | `spl-governance-timelock-removal` | critical |
| Squads threshold dropped from 5-of-9 → 1-of-9      | `squads-multisig-weakening`    | high     |
| Durable nonce created under attacker-controlled key | `privileged-nonce`             | critical |
| Pre-signed withdrawal tx executed from stale nonce  | `stale-nonce-execution`        | high     |

Any single detector firing would have bought hours of response time.
Custos Nox catches all four steps of the attack chain.

Beyond the Drift chain, the fifth detector covers an adjacent multisig
takeover vector that has hit other Solana protocols — an attacker with
config-authority access rewriting the members vector to evict legitimate
signers. The vector is independent of the Drift chain (Drift used a
threshold reduction, not a member rotation), but the same baseline-
seeding and account-diff machinery catches it for free:

| Adjacent vector                                    | Detector                       | Severity |
| -------------------------------------------------- | ------------------------------ | -------- |
| Members vector mutated (signer rotation/eviction)  | `squads-signer-set-change`     | high     |

## Positioning

Solana Foundation's STRIDE program funds commercial monitoring for
protocols with $10M+ TVL. Custos Nox is for the 99% below that line —
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

## Hardening notes (v0.3, 2026-04-26)

A senior code review pass landed four reliability fixes between the
v0.2 hackathon submission and the v0.3 polish. All four are now in
`main`:

1. **WebSocket subscription cleanup on reconnect** (commit `0adf543`).
   The supervisor captures subscription IDs from `onAccountChange` and
   calls `removeAccountChangeListener` on both reconnect and shutdown,
   instead of relying on `Connection` GC to close stale WebSocket
   subscriptions. Prevents zombie callbacks after long sessions.

2. **Live `txSignature` backfill** (commit `0adf543`).
   `onAccountChange` doesn't include the triggering tx signature. The
   supervisor now calls `getSignaturesForAddress` (limit 5,
   slot-matched) when an alert fires, so Solscan links go to `/tx/`
   instead of `/account/`. Backfill failures fall back to the
   original null-signature alert — delivery is never blocked.

3. **Webhook delivery retry** (commit `0a442e3`).
   Discord/Slack 429 + 5xx responses now trigger exponential backoff
   (base 500 ms, capped at 60 s) with `Retry-After` honoring (Discord's
   sub-second floats supported). 4xx other than 429 do not retry.

4. **Stale-nonce in-memory state bound** (commit `25a0491`).
   `StaleNonceExecutionDetector` prunes `firstSeenAt` entries older
   than 2× threshold every 100 inspect calls, with a 10 000-entry hard
   cap as a safety net.

Test coverage grew from 147 to 164 across these changes.

## Status

Pre-release. Built for the Solana Frontier Hackathon
(submission 2026-05-10 23:59 PDT). All five detectors are running live;
devnet smoke harness in `scripts/` reproduces three steps end-to-end
on-chain (timelock removal, multisig weakening, privileged-nonce init).
The stale-nonce detector activates after the PrivilegedNonce init step —
the same account is watched by both detectors simultaneously. The
signer-set-change detector is exercised by the unit tests; live coverage
needs a multisig whose members vector is mutated, which the smoke
script does not currently produce.

## Quick start

See [DEV-ENV-SETUP.md](./DEV-ENV-SETUP.md).

## Running the devnet demo

End-to-end proof that Custos Nox catches real on-chain config changes.
You need a funded devnet keypair at `~/.config/solana/id.json`
(or set `SOLANA_KEYPAIR` to its path). `scripts/devnet-create.ts` will
request a 1 SOL airdrop if your balance is below 0.5 SOL.

The demo walks through three steps of the Drift attack chain, each
firing a distinct detector:

```bash
cp .env.example .env
npm install

# Terminal 1 — create a 3-of-5 Squads multisig on devnet with a 1-day
# time_lock. Copy the printed MULTISIG PDA.
npm run smoke:create

# Generate a fresh Keypair for the privileged-nonce step. This prints
# the pubkey to add to CUSTOS_WATCH. The account does not exist on
# chain yet — we wire it into the daemon BEFORE it gets initialized.
npm run smoke:nonce-plan

# Edit .env and set CUSTOS_WATCH to both the MULTISIG PDA and the
# nonce pubkey (comma-separated, each as program:account).

# Terminal 2 — start the daemon.
npm run dev

# Terminal 1 — simulate the Drift attack chain, one step at a time.
# Each command triggers an alert in Terminal 2.
npm run smoke:timelock  -- <MULTISIG_PDA>   # CRITICAL: timelock removed
npm run smoke:weaken    -- <MULTISIG_PDA>   # HIGH:     3-of-5 → 1-of-5
npm run smoke:nonce-init                    # CRITICAL: nonce initialized
```

Within a few seconds of each config transaction confirming, the daemon
in Terminal 2 prints one alert per step — three of the four live
detectors firing on this quickstart chain. The fourth
(`StaleNonceExecutionDetector`) arms automatically once the nonce is
initialized and would fire later, when a stale pre-signed transaction
advances it — i.e. the actual drain step on mainnet.

### Verifying your RPC before recording the demo

The nonce step relies on the RPC delivering an `onAccountChange`
notification when the watched pubkey transitions from "does not exist"
to "initialized". Providers differ; run the diagnostic once before
recording to confirm yours does:

```bash
npm run check:null-subscribe
```

Exit 0 means the detector will fire on `smoke:nonce-init`. Exit 1
means the provider silently drops null-baseline notifications — switch
to a provider that honors them, or fall back to polling.

## Self-host with Docker

```bash
docker build -t custos .
docker run -d --name custos --restart unless-stopped --env-file .env custos
docker logs -f custos
```

The image runs as the built-in unprivileged `node` user and reads the
same `CUSTOS_*` env vars documented in `.env.example`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The short version: add a detector,
write ≥10 unit tests, pass lint and typecheck.

## Security

To report a vulnerability in Custos Nox itself, see [SECURITY.md](./SECURITY.md).
Do not open a public issue for security reports.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## License

MIT. See [LICENSE](./LICENSE).
