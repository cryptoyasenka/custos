# Video scripts — submission

Two videos required by Colosseum Frontier (see `../../planning/SUBMISSION-RULES.md`). Drafts below; iterate after detector #1 ships.

## Pitch video (≤3 minutes)

Purpose: problem + solution + traction + team. Judges shortlist based on this.

### 0:00–0:20 — Hook
"On April 1, 2026, a single pre-signed transaction drained $285M from Drift in twelve minutes. The transaction had been created a week earlier. Nobody was watching."

Visual: Solscan tab showing tx `2HvMSgDE...` at timestamp 2026-04-01 16:05:18 UTC. Dollar counter ticking up.

### 0:20–0:50 — Problem
"Drift-class attacks chain four mistakes: social engineering compromises an admin; the admin creates durable nonces; governance votes remove the timelock; the week-old transaction executes. No open-source tool watches this chain. Commercial alternatives start at ten million dollars TVL — everyone smaller is blind."

Visual: attack chain diagram, four steps annotated.

### 0:50–1:30 — Solution
"Custos Nox is a free, open-source, self-hosted monitor. Four detectors watch the full chain. Alerts hit Discord, Slack, or webhook in under five hundred milliseconds. You run it yourself — we hold no data. MIT license from day one."

Visual: GitHub repo page, four detector names, live alert popup in Discord.

### 1:30–2:10 — Target and validation
"Every Solana multisig. Every DAO treasury. Every grant committee. Solana Foundation's STRIDE program funds monitoring for protocols above ten million TVL — Custos Nox is for the ninety-nine percent below that line. Early conversations with [DAO-1], [DAO-2]: interest confirmed."

Visual: Squads dashboard, SPL Governance realms list.

### 2:10–2:40 — Team
"Solo developer. Background: TEE and crypto infrastructure, Colosseum Arena as cryptoyasenka, open-source contributor to the OpenGradient model hub. Built fast because the gap is obvious."

Visual: Arena profile, past projects.

### 2:40–3:00 — CTA
"github.com/cryptoyasenka/custos-nox. Self-host in five minutes. If you hold a Solana multisig, you need this."

Visual: GitHub URL, fade to logo.

## Technical demo (2–3 minutes)

Purpose: how it works, Solana-specific reasoning.

### 0:00–0:20 — Architecture
"Helius RPC WebSocket feeds a detector pipeline. Four plugins run independently. Alerts fan out to user-owned endpoints."

Visual: `ARCHITECTURE.md` diagram animated.

### 0:20–1:00 — Live demo on devnet
"I spun up a three-of-five Squads on devnet. I'm the admin. Watch what happens when I simulate the Drift chain."
- Remove timelock → Custos Nox fires critical alert in Discord
- Create durable nonce → high-severity alert
- Wait ten seconds → execute stale nonce → critical alert

### 1:00–1:40 — Code walkthrough
`TimelockRemovalDetector.ts` — around fifty lines. Parses the SPL Governance instruction, compares before/after realm config. No AI, no heuristics — deterministic rules, table-driven tests.

Visual: VS Code, scroll through detector source.

### 1:40–2:10 — Why Solana specifically
"Durable nonces are a Solana feature — Ethereum has no equivalent. Squads v4's intent API exposes the exact instruction set we watch. Helius enhanced transactions handle deserialization. Custos Nox could not be ported cleanly from EVM."

Visual: durable nonce docs page, Squads SDK page side by side.

### 2:10–2:45 — Replay real Drift
"Three real transaction hashes from Chainalysis. Replayed through Custos Nox's historical parser."
- `9zJGh…` (2026-03-26 timelock removal) → would have alerted
- `2HvMS…` (2026-04-01 admin transfer) → would have alerted
- `4BKBm…` (2026-04-01 execution) → would have alerted

"Five days of warning before $285M moved."

Visual: Solscan tabs for the three hashes, Custos Nox output overlay.

### 2:45–3:00 — Roadmap
"GitHub Action for CI integration. Collateral risk scorer next. Open-source first, forever. Star the repo."

Visual: stars counter, repo README fade.

## B-roll and shot list

All pulled from `../../planning/DRIFT-ATTACK-FORENSICS.md`:
- Solscan screenshots for three tx hashes (headless Playwright at 1920×1080)
- Arena profile screenshot
- GitHub repo, Discord alert, Slack alert (OBS capture)
- Devnet Squads dashboard

## Production notes

- English only (per submission rules)
- Narration: ElevenLabs ($5 / month, or free tier), or self-record
- Music: Uppbeat free tier
- Captions: auto from transcript, manual edit pass
- Upload: YouTube unlisted + Vimeo mirror
