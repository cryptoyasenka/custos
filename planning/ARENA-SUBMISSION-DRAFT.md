# Arena Submission Draft — Custos Nox

**Status:** Draft 1 (2026-04-24). Verify fields against live Arena form before pasting.
**Form URL:** arena.colosseum.org → your project → Edit submission

---

## A5 — Project name + tagline

**Name (already set):** Custos Nox

**Tagline options (pick one — ~10 words):**

> Option A (incident-focused):
> "Real-time on-chain monitor that catches Drift-class attacks"

> Option B (audience-focused):
> "Open-source attack detection for Solana multisigs and DAOs"

> Option C (action-focused):
> "Alerts you before the governance vote to drain your treasury"

**Recommendation:** Option B — clearest for judges who scan 300 projects.

---

## A6 — Short description (≤280 chars)

> Custos Nox monitors Solana multisigs and DAOs for attack-chain precursors in real time. Detects all 4 on-chain steps of the April 2026 Drift exploit ($285M drained). Self-host in 5 minutes. MIT licensed, zero paid tiers.

**Character count: 220** ✓ (60 chars left to add a link or detail)

Optional add-on if space allows:
> Live at custos-nox-production.up.railway.app

---

## A7 — Long description / writeup

### Problem

In April 2026, Drift Protocol lost $285M to an attack that spent days setting
up on-chain before executing. Three governance config changes (timelock removal,
multisig weakening, privileged-nonce creation) happened in full public view —
but no tool alerted anyone.

Solana Foundation's STRIDE monitoring program targets protocols with $10M+ TVL.
The other 99% — small DAOs, grant committees, treasury multisigs — have nothing.

### Solution

Custos Nox is an open-source daemon that watches Solana accounts over WebSocket
and fires alerts the moment a config change matches a known attack pattern.

Five detectors run live today. Four cover every on-chain step of the Drift
April 2026 attack chain; the fifth catches an adjacent multisig takeover vector
that has hit other Solana protocols.

- **TimelockRemovalDetector** — fires when a governance timelock drops to zero
  or below half (Squads v4 + SPL Governance programs).
- **MultisigWeakeningDetector** — fires when a Squads v4 signer threshold is
  reduced (e.g. 5-of-7 → 1-of-7).
- **PrivilegedNonceDetector** — fires when a watched System Program nonce
  account is initialized or has its authority rotated.
- **StaleNonceExecutionDetector** — fires when a durable nonce is advanced
  (pre-signed transaction executes) more than 1 hour after initialization.
  Catches the final step: the moment the attacker's pre-signed drain tx lands.
- **SignerSetChangeDetector** — fires when a Squads v4 multisig's members
  vector is mutated. Removal or rotation of a legitimate signer is HIGH; pure
  additions are MEDIUM. The vector Drift didn't use, but other protocols have.

Four of the detectors map directly to one step each in the Drift April 2026
attack chain; the fifth covers an adjacent signer-set takeover vector. Any
single alert would have bought hours of response time.

### Architecture highlights

- TypeScript daemon, zero Rust, pure npm — contributors don't need a Solana
  dev environment to build or test.
- WebSocket with exponential backoff (1s → 60s) and 30-second slot health checks.
- Alert fan-out to Discord webhooks, Slack webhooks, and stdout — all sinks
  receive every alert; one failing sink doesn't block the others.
- Per-detector 5s timeout: a hanging detector surfaces a low-severity operational
  alert instead of silently blocking the pipeline.
- 205 unit + integration tests; GitHub Actions CI on every push.

### Demo

A devnet smoke harness (`scripts/`) reproduces three core Drift attack-chain
steps end-to-end on chain (timelock removal, multisig weakening, privileged-nonce
init), plus the adjacent signer-set rotation that the fifth detector catches.
Each script fires a real on-chain transaction; the daemon prints the
corresponding alert within seconds. The fourth Drift step — stale-nonce
execution — is covered by 12 unit tests that match the exact Drift pattern.

Live dashboard: https://custos-nox-production.up.railway.app
GitHub: https://github.com/cryptoyasenka/custos-nox

### What's next (roadmap)

- **API mode and hosted alert feed** — for teams that can't self-host, serve
  alerts via REST endpoint with webhook fan-out to any consumer.
- **Mainnet watchlist** — pre-configured list of the top 50 Squads multisigs
  by TVL for zero-config monitoring.

---

## A8 — Track selection

**Primary track (Build Path):** Treasury / Security

**Secondary track (if allowed):** Governance (DAOs) / Public Goods

**Rationale:**
- Custos Nox protects treasury multisigs → Treasury
- It's a security detection tool → Security
- It's MIT-licensed open-source infra for the whole ecosystem → Public Goods

**Note:** Exact track names visible only after login to Arena form. Match closest
to "Security", "DeFi Infrastructure", "Public Goods" if those are the options.
If only one track allowed, choose **Security / DeFi Infrastructure**.

---

## A9 — Project X / Twitter account

**Required field** (per Superteam UA guide — submission form asks for project Twitter handle).

→ Create `@CustosNox` account first. Full setup guide: `planning/X-PROJECT-ACCOUNT.md`

Once created: `https://x.com/CustosNox`

---

## A10 — Pitch video URL (≤2 min, English)

⬜ TODO — script outline in `planning/ARENA-SUBMISSION-DRAFT.md` A7 (Problem/Solution/Demo sections).

Record on Loom (preferred by judges per guide). Or YouTube unlisted.

---

## A11 — Tech demo video URL (2–3 min, English)

⬜ TODO — show: daemon start → alert for each of the 4 detectors (timelock-removal, multisig-weakening, privileged-nonce, stale-nonce-execution) → architecture diagram. NOTE: this is the older DRAFT; final submission copy lives in `ARENA-SUBMISSION-COPY.md` (already updated to "Four detectors run live today").

Anti-pattern to avoid: recording IDE/GitHub with voiceover — must show product running.

---

## Arena form checklist before paste

- [ ] Create project X account `@CustosNox` (needed for A9 field)
- [ ] Verify character count for A6 in Arena's actual input field
- [ ] Check if Arena allows markdown in A7 (if not, strip `**` / `###` formatting)
- [ ] Check if Arena lets you select multiple tracks (A8)
- [ ] Videos F2 + F3 recorded and uploaded (Loom preferred)
- [ ] Mark "Superteam Ukraine" affiliation in form (mandatory for Ukrainian Sidetrack)
- [ ] Click SUBMIT before 2026-05-10 23:59 PDT
