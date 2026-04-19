# Custos

Open-source real-time monitor for Solana multisigs and DAOs. Detects the attack chain that drained $285M from Drift on April 1, 2026.

## What it catches

Four detectors run 24/7 against your Squads multisig or SPL Governance realm:

- **TimelockRemovalDetector** — alerts when a governance timelock is removed or bypassed
- **MultisigWeakeningDetector** — alerts on signer threshold reductions (e.g. 5/5 → 2/5)
- **PrivilegedNonceDetector** — alerts when an authority creates a durable nonce account
- **StaleNonceExecutionDetector** — alerts when a pre-signed transaction older than N hours executes

Alerts fan out to Discord, Slack, webhook, or CLI.

## Positioning

Solana Foundation's STRIDE program funds commercial monitoring for protocols with $10M+ TVL. Custos is for the 99% below that line — small DAOs, grant committees, treasury multisigs, solo-builder wallets. Self-host in five minutes. MIT licensed.

## Status

Pre-release. Built for the Solana Frontier Hackathon (submission 2026-05-10 23:59 PDT).
First detector runs live on devnet.

## Quick start

See [DEV-ENV-SETUP.md](./DEV-ENV-SETUP.md).

## Running the devnet demo

End-to-end proof that Custos catches a real on-chain threshold drop.
You need a funded devnet keypair at `~/.config/solana/id.json`
(or set `SOLANA_KEYPAIR` to its path). `scripts/devnet-create.ts` will request
a 1 SOL airdrop if your balance is below 0.5 SOL.

```bash
cp .env.example .env
npm install

# Terminal 1 — create a 3-of-5 Squads multisig on devnet.
# Copy the printed MULTISIG PDA.
npm run smoke:create

# Edit .env and paste the PDA into CUSTOS_WATCH.

# Terminal 2 — start the daemon.
npm run dev

# Terminal 1 — drop the threshold to 1, simulating an attacker takeover.
npm run smoke:weaken -- <MULTISIG_PDA>
```

The daemon in Terminal 2 should print a `HIGH` alert from the
`squads-multisig-weakening` detector within a few seconds of the config
transaction confirming.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## License

MIT. See [LICENSE](./LICENSE).
