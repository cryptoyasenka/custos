# X Post Drafts — @yasenka244 (Custos Nox)

Post from @yasenka244 (personal). Tag @CustosNox project account once it exists.

---

## POST 1 — Announcement (post after @CustosNox created)

Built a real-time Solana security monitor for the @colosseum Frontier Hackathon.

Custos Nox watches multisigs and DAOs for the exact on-chain moves that set up the Drift $285M drain — before the exploit executes.

4 detectors. TypeScript. Self-host in 5 min. MIT.

github.com/cryptoyasenka/custos-nox

[attach: dashboard screenshot or demo video clip]

---

## POST 2 — Technical thread (after F3 demo recorded)

The Drift attack didn't start with a drain tx. It started 9 days earlier, on-chain:

Day 1: Realm timelock → 0
Day 3: Squads threshold 5-of-9 → 1-of-9
Day 6: Durable nonce seeded under attacker key
Day 9: Pre-signed drain tx executes

Custos Nox fires on all 4. Here's the live devnet demo 🧵

[attach: F3 demo video]

---

## POST 3 — After Week 4 video / close to submission

Week 4 on Custos Nox.

4 detectors live. 147 tests green. Full Drift attack chain covered.

Recording the pitch and tech demo this week, then submitting to @colosseum Frontier.

Built with @SuperteamUKR 🇺🇦

github.com/cryptoyasenka/custos-nox

---

## POST 4 — After submission

Submitted Custos Nox to @colosseum Frontier Hackathon.

Open-source Solana multisig attack monitor. 4 detectors. MIT licensed.

If you run a DAO or treasury on Squads, try it:
github.com/cryptoyasenka/custos-nox

Feedback welcome 🙏

#Solana #SolanaHackathon #Colosseum

---

## SUPERTEAM UA TG ANNOUNCEMENT (post in @KumekaGroup)

Привіт! Yana (@yasenka244) з Superteam Ukraine.

Будую **Custos Nox** — open-source демон для Solana, який моніторить мультисіги і DAO в реальному часі на предмет атак типу Drift.

4 детектори. TypeScript, нуль Rust. Самостійний хостинг за 5 хвилин. MIT ліцензія.

🔗 Dashboard: https://custos-nox-production.up.railway.app
📦 GitHub: https://github.com/cryptoyasenka/custos-nox

Буду вдячна за фідбек і зірочку на GitHub! 🙏

---

## SQUADS DISCORD OUTREACH (DM to Squads team or post in their server)

Hey — building Custos Nox, an open-source real-time monitor for Squads multisigs.

It detects threshold weakening, timelock removal, and privileged nonce seeding — the exact setup steps used in the April 2026 Drift exploit — and fires alerts to Discord/Slack within seconds of the on-chain event.

4 detectors live, TypeScript daemon, self-hostable in 5 min. MIT licensed.

Would love feedback from the Squads team, and happy to add a Squads-specific integration if there's interest.

Repo: https://github.com/cryptoyasenka/custos-nox
