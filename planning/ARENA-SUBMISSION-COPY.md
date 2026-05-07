# ARENA SUBMISSION — PASTE-READY COPY
# arena.colosseum.org → your project → Edit submission
# Use this on May 9-10. All fields verified against ARENA-SUBMISSION-DRAFT.md.

---

## TAGLINE (A5) — paste as-is

Open-source attack detection for Solana multisigs and DAOs

---

## SHORT DESCRIPTION (A6, ≤280 chars — currently 224 ✓)

Custos Nox monitors Solana multisigs and DAOs for attack-chain precursors in real time. 5 detectors covering every step of the April 2026 Drift exploit ($285M) plus adjacent vectors. Self-host in 5 min. MIT, no paid tiers.

---

## LONG DESCRIPTION (A7) — strip ** and ### if Arena doesn't support markdown

In April 2026, Drift Protocol lost $285M to an attack that spent days setting up on-chain before executing. Three governance config changes (timelock removal, multisig weakening, privileged-nonce creation) happened in full public view — but no tool alerted anyone.

Solana Foundation's STRIDE monitoring program targets protocols with $10M+ TVL. The other 99% — small DAOs, grant committees, treasury multisigs — have nothing.

---

Custos Nox is an open-source daemon that watches Solana accounts over WebSocket and fires alerts the moment a config change matches a known attack pattern.

Five detectors run live today. Four cover every on-chain step of the Drift April 2026 attack chain; the fifth catches an adjacent multisig takeover vector that has hit other Solana protocols.

• TimelockRemovalDetector — fires when a governance timelock drops to zero or below half (Squads v4 + SPL Governance programs).
• MultisigWeakeningDetector — fires when a Squads v4 signer threshold is reduced (e.g. 5-of-7 → 1-of-7).
• PrivilegedNonceDetector — fires when a watched System Program nonce account is initialized or has its authority rotated.
• StaleNonceExecutionDetector — fires when a durable nonce is advanced (pre-signed transaction executes) more than 1 hour after initialization. Catches the final step: the moment the attacker's pre-signed drain tx lands.
• SignerSetChangeDetector — fires when a Squads v4 multisig's members vector is mutated. Removal or rotation of a legitimate signer is HIGH; pure additions are MEDIUM. The vector Drift didn't use, but other protocols have.

Four of the detectors map directly to one step each in the Drift April 2026 attack chain; the fifth covers an adjacent signer-set takeover vector. Any single alert would have bought hours of response time.

---

Architecture highlights:

• TypeScript daemon, zero Rust, pure npm — contributors don't need a Solana dev environment to build or test.
• WebSocket with exponential backoff (1s → 60s) and 30-second slot health checks.
• Alert fan-out to Discord, Slack, and Telegram webhooks, plus stdout — all sinks receive every alert; one failing sink doesn't block the others.
• Per-detector 5s timeout: a hanging detector surfaces a low-severity operational alert instead of silently blocking the pipeline.
• 215 unit + integration tests; GitHub Actions CI on every push.

---

A devnet smoke harness (scripts/) reproduces three core Drift attack-chain steps end-to-end on chain (timelock removal, multisig weakening, privileged-nonce init), plus the adjacent signer-set rotation that the fifth detector catches. Each script fires a real on-chain transaction; the daemon prints the corresponding alert within seconds. The fourth Drift step — stale-nonce execution — is covered by 12 unit tests that match the exact Drift pattern.

Live dashboard: https://custos-nox.up.railway.app
GitHub: https://github.com/cryptoyasenka/custos-nox

---

Roadmap:
• Telegram bot alerts — the third major channel alongside Discord and Slack (implemented in v0.4, shipping May 2026).
• API mode and hosted alert feed — for teams that can't self-host.
• Mainnet watchlist — pre-configured coverage of the top 50 Squads multisigs by TVL.

---

Team:

Solo founder. Full-stack developer with two years building in the Solana ecosystem. Built Custos Nox out of direct frustration: after the Drift exploit I went looking for a tool that would have caught the attack chain before the drain, and found nothing that worked outside STRIDE's $10M+ TVL threshold. Started building the next day. Intend to maintain and grow this as an open-source security primitive for the ecosystem.

---

Go-to-market:

Target: the 10,000+ Squads v4 multisig owners visible on-chain today — DAOs, grant committees, protocol core teams that fall below STRIDE's TVL threshold.

Acquisition path:
• GitHub organic: developers searching "solana multisig monitor" or "squads alert" — the README and dashboard are written to rank for exactly these queries.
• Squads ecosystem: the Squads Discord and governance channels host exactly the teams who need this. Plan to share in the #security and #dao-ops channels post-hackathon.
• Superteam network: 15+ country chapters with active developer communities. Superteam Ukraine has already been briefed; wider rollout through country leads after submission.
• Security researchers and auditors: publicly watching multisigs is useful for building watchdog dashboards; the MIT license makes it forkable with zero friction.

Monetization:
• v1 (now): Free, MIT, self-hosted — community trust and adoption first.
• v2: Hosted alert feed subscription ($10–30/month) for teams who want managed delivery without running infrastructure.
• v3: Mainnet watchlist as a service — subscribe to any public multisig, API access, public threat feed for the ecosystem.

The self-hosted tier stays free permanently. The paid tiers fund maintenance, new detectors, and the eventual hosted platform.

---

## TRACK (A8)

Primary: Security (or "Treasury / Security" if that option exists)
Secondary: Public Goods (or Infrastructure)

If only one track allowed: Security / DeFi Infrastructure

---

## PROJECT WEBSITE (A4)

https://custos-nox.up.railway.app

---

## GITHUB REPO (A3)

https://github.com/cryptoyasenka/custos-nox

---

## PROJECT TWITTER / X (A9)

https://x.com/CustosNox

(@CustosNox created 2026-04-29 — handle is live, paste URL as-is)

---

## PITCH VIDEO (A10) — ✅ DONE 2026-05-07

https://youtu.be/eX_Ze5lDLrc
(saved in Arena PITCH VIDEO field)

---

## TECH DEMO VIDEO (A11) — record F3 first

[paste YouTube unlisted URL after recording planning/TECH-DEMO-SCRIPT-F3.md]

---

## FINAL CHECKLIST BEFORE CLICKING SUBMIT

- [x] @CustosNox X account created and linked (2026-04-29)
- [x] Pitch video (F2) uploaded and saved in Arena — https://youtu.be/eX_Ze5lDLrc (2026-05-07)
- [ ] Tech demo (F3) uploaded to YouTube (Unlisted) — URL works in incognito
- [ ] Fill PRODUCT DEMO VIDEO field in Arena (Step 2) with F3 URL
- [ ] "Superteam Ukraine" affiliation marked in form (mandatory for Ukrainian Sidetrack)
- [ ] Character count on A6 verified in actual form field
- [ ] If Arena doesn't support markdown in A7: remove all ** and # formatting
- [ ] Click "CONTINUE TO FINAL SURVEY" → submit
- [ ] Deadline: 2026-05-10 23:59 PDT (act as if May 10, not May 11)
