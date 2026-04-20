# Custos Nox — idea summary

Open-source, self-hostable real-time monitor for Solana multisigs and SPL Governance realms. Detects the Drift-class attack chain: privileged durable nonce creation + timelock removal + stale pre-signed execution. Free unlimited. Alerts to Discord, Slack, webhook, CLI.

## Why now

- Drift lost $285M on 2026-04-01 to exactly this chain (see `../../planning/DRIFT-ATTACK-FORENSICS.md`)
- Solana Foundation launched STRIDE + SIRN on 2026-04-07 — but those cover only $10M+ TVL protocols
- Custos Nox covers the 99% below that: DAOs, grant committees, treasury multisigs, solo-builder wallets
- Zero open-source competitors at start. Range, Sec3, Hypernative are commercial and enterprise-priced.

## Positioning

- STRIDE funds the whales. **Custos Nox is for everyone else.**
- Not a SaaS gatekeeper. MIT license, self-host in five minutes.
- Compose over build: Squads SDK + SPL Governance + Helius RPC, thin detector layer on top.

## Target users

- Squads multisig holders (any size)
- SPL Governance realms (DAO treasuries)
- Protocol security teams wanting an open-source second layer alongside Range / Sec3

## MVP scope (by 2026-05-11)

- 4 detectors (see `../ARCHITECTURE.md`)
- Node daemon (TypeScript)
- Minimal CLI: `custos watch --multisig <pda>`
- Discord + Slack webhook support
- Live demo on devnet that replays the Drift attack chain

## Out of MVP scope

- Dashboard web UI (text alerts first; UI in v2)
- Multi-tenant hosting
- Collateral-risk scorer (v2 — Drift also fell because of washed CVT)
- Historical replay UI (CLI replay OK for MVP)

## Demo narrative (90 seconds)

See `VIDEO-SCRIPT.md` — technical demo section. Replays three real Drift tx hashes on Solscan with Custos Nox reactions overlaid.

## Roadmap after hackathon

- v1.0 (June) — dashboard UI, 8 detectors, historical replay
- v1.1 (July) — SAS on-chain attestation integration
- v2.0 (fall) — optional SaaS tier with managed monitoring for protocols that want it; core stays free

## How this wins the hackathon (criterion mapping)

See `../../planning/SUBMISSION-RULES.md` for full table. Strongest against:
- (c) **Novelty** — zero open-source competitors at start
- (e) **Open-source** — MIT, composes with Solana primitives
- (b) **Potential Impact** — every Solana multisig is a target user
