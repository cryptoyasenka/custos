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
"Custos Nox is a free, open-source, self-hosted monitor. Three detectors are live today and cover all on-chain steps of the Drift attack chain — a fourth that catches the pre-signed execution itself is on the roadmap. Alerts hit Discord, Slack, or stdout in seconds. You run it yourself — we hold no data. MIT license from day one."

Visual: GitHub repo page, three production detector names, live alert popup in terminal.

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
"Helius RPC WebSocket feeds a detector pipeline. Three detectors run independently with a 5-second timeout each. Alerts fan out to user-owned Discord or Slack webhooks."

Visual: `ARCHITECTURE.md` diagram animated.

### 0:20–1:00 — Live demo on devnet
"I spun up a three-of-five Squads on devnet. Watch what happens when I simulate three steps of the Drift attack chain."
- Remove timelock → CRITICAL alert: squads-timelock-removal fires
- Weaken multisig threshold 3→1 → HIGH alert: squads-multisig-weakening fires
- Initialize durable nonce under attacker key → CRITICAL alert: privileged-nonce fires

Visual: terminal showing three alert lines, each within seconds of the on-chain tx confirming.

### 1:00–1:40 — Code walkthrough
`src/detectors/timelock-removal.ts` — concise TypeScript. Parses the raw account buffer bytes, compares before/after timelock field. No AI, no heuristics — pure deterministic rules. 135 table-driven tests cover every edge case.

Visual: VS Code showing detector source + test file side by side.

### 1:40–2:10 — Why Solana specifically
"Durable nonces are a Solana feature — Ethereum has no equivalent. Squads v4's intent API exposes the exact instruction set we watch. Helius enhanced transactions handle deserialization. Custos Nox could not be ported cleanly from EVM."

Visual: durable nonce docs page, Squads SDK page side by side.

### 2:10–2:45 — What would have happened on mainnet
"The Drift attacker made the same three moves we just ran on devnet — on Drift's mainnet accounts. Custos Nox watches for exactly these patterns."
- Timelock removal: Solscan tx 9zJGh… (2026-03-26) would have fired a CRITICAL timelock alert
- Nonce initialization: the nonce account that held the pre-signed tx would have fired CRITICAL
- If the Squads threshold was also dropped → HIGH alert

"Any one of those alerts, days before the drain."

Visual: Solscan tabs for the real tx hashes side-by-side with the devnet demo output showing the same alert format.

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
