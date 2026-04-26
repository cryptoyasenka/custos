# ARENA SUBMISSION — PASTE-READY COPY
# arena.colosseum.org → your project → Edit submission
# Use this on May 9-10. All fields verified against ARENA-SUBMISSION-DRAFT.md.

---

## TAGLINE (A5) — paste as-is

Open-source attack detection for Solana multisigs and DAOs

---

## SHORT DESCRIPTION (A6, ≤280 chars — currently 220 ✓)

Custos Nox monitors Solana multisigs and DAOs for attack-chain precursors in real time. Detects all 4 on-chain steps of the April 2026 Drift exploit ($285M drained). Self-host in 5 minutes. MIT licensed, zero paid tiers.

---

## LONG DESCRIPTION (A7) — strip ** and ### if Arena doesn't support markdown

In April 2026, Drift Protocol lost $285M to an attack that spent days setting up on-chain before executing. Three governance config changes (timelock removal, multisig weakening, privileged-nonce creation) happened in full public view — but no tool alerted anyone.

Solana Foundation's STRIDE monitoring program targets protocols with $10M+ TVL. The other 99% — small DAOs, grant committees, treasury multisigs — have nothing.

---

Custos Nox is an open-source daemon that watches Solana accounts over WebSocket and fires alerts the moment a config change matches a known attack pattern.

Four detectors run live today, covering the full Drift April 2026 attack chain:

• TimelockRemovalDetector — fires when a governance timelock drops to zero or below half (Squads v4 + SPL Governance programs).
• MultisigWeakeningDetector — fires when a Squads v4 signer threshold is reduced (e.g. 5-of-7 → 1-of-7).
• PrivilegedNonceDetector — fires when a watched System Program nonce account is initialized or has its authority rotated.
• StaleNonceExecutionDetector — fires when a durable nonce is advanced (pre-signed transaction executes) more than 1 hour after initialization. Catches the final step: the moment the attacker's pre-signed drain tx lands.

Each detector maps directly to one step in the Drift April 2026 attack chain. Any single alert would have bought hours of response time.

---

Architecture highlights:

• TypeScript daemon, zero Rust, pure npm — contributors don't need a Solana dev environment to build or test.
• WebSocket with exponential backoff (1s → 60s) and 30-second slot health checks.
• Alert fan-out to Discord webhooks, Slack webhooks, and stdout — all sinks receive every alert; one failing sink doesn't block the others.
• Per-detector 5s timeout: a hanging detector surfaces a low-severity operational alert instead of silently blocking the pipeline.
• 164 unit + integration tests; GitHub Actions CI on every push.

---

A devnet smoke harness (scripts/) reproduces all three on-chain Drift attack-chain steps end-to-end. Each script fires a real on-chain transaction; the daemon prints the corresponding alert within seconds.

Live dashboard: https://custos-nox-production.up.railway.app
GitHub: https://github.com/cryptoyasenka/custos-nox

---

Roadmap:
• API mode and hosted alert feed — for teams that can't self-host.
• Mainnet watchlist — pre-configured list of top 50 Squads multisigs by TVL.

---

## TRACK (A8)

Primary: Security (or "Treasury / Security" if that option exists)
Secondary: Public Goods (or Infrastructure)

If only one track allowed: Security / DeFi Infrastructure

---

## PROJECT WEBSITE (A4)

https://custos-nox-production.up.railway.app

---

## GITHUB REPO (A3)

https://github.com/cryptoyasenka/custos-nox

---

## PROJECT TWITTER / X (A9) — CREATE @CustosNox FIRST

https://x.com/CustosNox

---

## PITCH VIDEO (A10) — record F2 first

[paste Loom URL after recording planning/PITCH-SCRIPT-F2.md]

---

## TECH DEMO VIDEO (A11) — record F3 first

[paste Loom URL after recording planning/TECH-DEMO-SCRIPT-F3.md]

---

## FINAL CHECKLIST BEFORE CLICKING SUBMIT

- [ ] @CustosNox X account created and linked
- [ ] Pitch video (F2) uploaded to Loom — URL ready
- [ ] Tech demo (F3) uploaded to Loom — URL ready
- [ ] "Superteam Ukraine" affiliation marked in form (mandatory for Ukrainian Sidetrack)
- [ ] Character count on A6 verified in actual form field
- [ ] If Arena doesn't support markdown in A7: remove all ** and # formatting
- [ ] Deadline: 2026-05-10 23:59 PDT (act as if May 10, not May 11)
