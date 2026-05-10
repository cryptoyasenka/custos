# ARENA SUBMISSION — PASTE-READY COPY
# arena.colosseum.org → your project → Edit submission
# Use this on May 9-10. All fields verified against ARENA-SUBMISSION-DRAFT.md.

---

## STEP 1 — PROJECT INFO

---

## TAGLINE (A5) — paste as-is

Open-source attack detection for Solana multisigs and DAOs

---

## SHORT DESCRIPTION (A6, ≤280 chars — currently 224 ✓)

Custos Nox monitors Solana multisigs and DAOs for attack-chain precursors in real time. 5 detectors covering every step of the April 2026 Drift exploit ($285M) plus adjacent vectors. Self-host in 5 min. MIT, no paid tiers.

---

## WHAT ARE YOU BUILDING, AND WHO IS IT FOR? (Step 1 field)

Open-source TypeScript daemon that monitors Solana multisigs and DAOs for attack-chain precursors in real time. For protocol teams, DAOs, grant committees, and treasury multisig owners who fall below STRIDE's $10M+ TVL threshold and have no existing alerting.

---

## WHY DID YOU DECIDE TO BUILD THIS, AND WHY NOW? (Step 1 field)

After the April 2026 Drift exploit I searched for a tool that would have caught the attack chain before the drain. Every step was visible on-chain for nine days and nothing flagged it. STRIDE covers roughly 50 protocols with $10M+ TVL. The other 10,000+ multisigs have nothing. I started building the next day.

---

## TECHNOLOGIES (Step 1 field)

TypeScript, Node.js, @solana/web3.js, WebSocket (Solana RPC), Squads v4 program, SPL Governance program, System Program (nonce accounts), Vitest (228 tests), GitHub Actions CI, Docker, Railway.

---

## MOBILE-FOCUSED dApp? (Step 1 field)

No

---

## LONG DESCRIPTION (A7) — strip ** and ### if Arena doesn't support markdown

Real-time attack-chain alerts for the 99% of Solana multisigs STRIDE doesn't cover.

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

Any single one of these alerts during the nine-day setup window would have bought hours of response time.

---

Architecture highlights:

• TypeScript daemon, zero Rust, pure npm — contributors don't need a Solana dev environment to build or test.
• WebSocket with exponential backoff (1s → 60s) and 30-second slot health checks.
• Alert fan-out to Discord, Slack, and Telegram webhooks, plus stdout — all sinks receive every alert; one failing sink doesn't block the others.
• Per-detector 5s timeout: a hanging detector surfaces a low-severity operational alert instead of silently blocking the pipeline.
• 228 unit + integration tests; GitHub Actions CI on every push.

---

A devnet smoke harness (scripts/) reproduces three core Drift attack-chain steps end-to-end on chain (timelock removal, multisig weakening, privileged-nonce init), plus the adjacent signer-set rotation that the fifth detector catches. Each script fires a real on-chain transaction; the daemon prints the corresponding alert within seconds. The fourth Drift step — stale-nonce execution — is covered by 12 unit tests that match the exact Drift pattern.

Live dashboard: https://custos-nox.up.railway.app
GitHub: https://github.com/cryptoyasenka/custos-nox

---

Roadmap:
• API mode and hosted alert feed — for teams that can't self-host.
• Mainnet watchlist — pre-configured coverage of the top 50 Squads multisigs by TVL.
• Detector marketplace — community-contributed detectors with versioned schemas, so any team can ship coverage for their own protocol.

---

Team:

Solo founder. Two years building in Solana ecosystem. Started Custos Nox the day after Drift drained — looked for a tool that would have caught the attack chain on-chain and found nothing outside STRIDE's $10M+ TVL coverage. Intend to maintain this as an open-source security primitive.

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
• v2: Hosted alert feed subscription ($10–30/month per watched address) for teams who want managed delivery without running infrastructure.
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

## STEP 2 — MEDIA AND CODE

---

## PROJECT LOGO (Step 2 field)

File: assets/logo.png (1024×1024 square)

---

## GITHUB REPO (A3)

https://github.com/cryptoyasenka/custos-nox

---

## REPO CONTEXT (Step 2 field — "important context about your repo")

TypeScript monorepo. src/detectors/ — 5 attack detectors, each with unit tests against real on-chain account state. src/alerts/ — Discord/Slack/Telegram/stdout sinks with parallel fan-out. scripts/ — devnet smoke harness that reproduces the Drift attack chain on-chain with real transactions. dashboard/ — Next.js public dashboard. 228 tests total, GitHub Actions CI on every push.

---

## LIVE PRODUCT LINK (Step 2 field)

https://custos-nox.up.railway.app

---

## ACCESS INSTRUCTIONS (Step 2 field)

No login required. Daemon is open-source and self-hosted; dashboard is public.

---

## PROJECT TWITTER / X (A9)

https://x.com/CustosNox

(@CustosNox created 2026-04-29 — handle is live, paste URL as-is)

---

## PITCH VIDEO (A10) — ⚠️ RE-RECORD with deck-v2.html

Old URL (pre-animations): https://youtu.be/eX_Ze5lDLrc
→ Record new F2 per planning/PITCH-SCRIPT-F2.md
→ Prepend Veo3 intro in CapCut
→ Upload YouTube Unlisted → update Arena A10 with new URL

---

## TECH DEMO VIDEO (A11) — record F3 first

[paste YouTube unlisted URL after recording planning/TECH-DEMO-SCRIPT-F3.md]

---

## STEP 3 — TEAM

---

## WHERE IS YOUR TEAM PRIMARILY BASED? (Step 3 field)

Ukraine

---

## TEAM TELEGRAM CONTACT (Step 3 field)

[Yana — paste your personal Telegram handle here before submitting]

---

## X PROFILE (Step 3 field)

https://x.com/CustosNox

---

## ANYTHING ELSE JUDGES SHOULD KNOW? (Step 3 field — optional)

The devnet smoke harness in scripts/ reproduces three steps of the Drift attack chain as real on-chain transactions. Each script fires a real tx; the daemon prints the alert within seconds. Judges can clone, set CUSTOS_CLUSTER=devnet, and reproduce the entire demo independently.

---

## APPLYING FOR COLOSSEUM ACCELERATOR? (Step 3 field)

No (solo founder, pre-revenue open-source tool — not the right fit for accelerator at this stage)

---

## FINAL CHECKLIST BEFORE CLICKING SUBMIT

**Step 1:**
- [x] Tagline, short description, long description ready
- [ ] Fill "What are you building, and who is it for?" — copy from this file
- [ ] Fill "Why did you decide to build this?" — copy from this file
- [ ] Fill "Technologies" — copy from this file
- [ ] Category: Security (or DeFi Infrastructure)
- [ ] Mobile-focused dApp: No

**Step 2:**
- [ ] Upload logo: assets/logo.png (1024×1024)
- [x] GitHub repo: https://github.com/cryptoyasenka/custos-nox
- [ ] Fill repo context — copy from this file
- [ ] Fill live product link: https://custos-nox.up.railway.app
- [ ] Access instructions: "No login required"
- [ ] Pitch video (F2): re-record with deck-v2.html + Veo3 intro → new YouTube URL → update Arena A10
- [ ] Tech demo (F3): record → upload to **Loom** (Superteam UA requirement) + **YouTube Unlisted**
- [ ] Fill PRODUCT DEMO VIDEO field with F3 URL

**Step 3:**
- [ ] "Where is your team primarily based?" → **Ukraine**
- [ ] Fill team Telegram contact (your personal handle)
- [ ] X profile: https://x.com/CustosNox
- [ ] "Anything else judges should know?" — copy from this file
- [ ] Colosseum accelerator: No

**Final survey:**
- [ ] "Which group supported you?" → **Superteam**
- [ ] Character count on A6 verified in actual form field
- [ ] If Arena doesn't support markdown in A7: remove all ** and # formatting
- [ ] Click "CONTINUE TO FINAL SURVEY" → submit
- [ ] **Immediately after Arena submit**: copy project link → submit to https://superteam.fun/earn/listing/frontier-hackathon-ukrainian-track
- [ ] Deadline: 2026-05-10 23:59 PDT (act as if May 10, not May 11)
