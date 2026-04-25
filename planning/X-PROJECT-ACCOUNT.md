# X / Twitter Project Account — Custos Nox

**Recommended handle:** `@CustosNox`
(No crypto collision found via WebSearch 2026-04-25. Backup: `@CustosNoxSec`)

**Status:** ⬜ Not created yet. Needed for submission form field "Project X account link".

---

## Profile setup

**Avatar:** Clean dark logo — shield or eye icon, no text, no AI generation (guide rule).
- Use `/assets/logo.svg` from the repo if suitable; otherwise create a simple dark bg + white shield.

**Banner (1500×500):**
```
Custos Nox — Real-time Solana multisig monitor
Frontier Hackathon 2026 participant  |  @SuperteamUKR
```

**Bio (160 chars max):**
```
Open-source daemon that catches Drift-class attacks on Solana multisigs before they drain.
@SuperteamUKR | Ukraine 🇺🇦
```

**Location:** Ukraine

**Website:** https://custos-nox-production.up.railway.app

---

## Pinned intro thread (post as a thread at account creation)

**Tweet 1 (main, standalone):**
```
Custos Nox — an open-source Solana multisig monitor that would have caught the Drift config drift before $285M was drained.

Building for the @colosseum Frontier Hackathon 🛡️

Here's what it does:
```

**Tweet 2:**
```
Three detectors live on devnet:

• TimelockRemovalDetector — fires when governance timelock drops to zero
• MultisigWeakeningDetector — fires when Squads signer threshold is reduced (5-of-7 → 1-of-7)
• PrivilegedNonceDetector — fires when a nonce account is initialized or authority rotated

Each = one step of the April 2026 Drift attack chain.
```

**Tweet 3:**
```
Why it matters:

The Drift exploit didn't happen in one tx. It was set up over days — timelock removed, threshold weakened, nonce prepped.

All on-chain. All public. Nobody was watching.

Custos Nox watches. Sub-second alerts to Discord or Slack.
```

**Tweet 4:**
```
Tech: TypeScript daemon, Helius WebSocket, @solana. Zero Rust. 135 tests. MIT licensed.

Self-host in 5 min:
npm install && npm run dev

github.com/cryptoyasenka/custos-nox

#Solana #SolanaHackathon #Colosseum #SecurityTools
```

---

## Week 3 update post (after F1 video upload)

```
Week 3 — live devnet demo 🧵

Three attack-chain steps. Three sub-second alerts. All on devnet.

[attach: неделя 3.mp4 or YouTube link]

→ github.com/cryptoyasenka/custos-nox
#Solana #Colosseum #SolanaHackathon
```

---

## Content calendar (15 posts pre-scheduled, per guide)

Days 1–5 (daily after account creation):
1. Intro thread (pinned)
2. "The Drift attack, explained in 3 on-chain steps" (thread with tx hashes)
3. Architecture overview: Helius WS → Detectors → FanOut → Discord
4. Week 3 video post
5. "Why open-source security tooling matters for Solana DAOs"

Days 6+ (every other day):
6. Detector deep-dive: TimelockRemoval
7. Detector deep-dive: MultisigWeakening
8. Detector deep-dive: PrivilegedNonce
9. "StaleNonceExecution — what we're building next"
10. Progress update: 135 tests, CI green, GitHub Actions
11. How to self-host in 5 minutes
12. Call to action: "What DAO/multisig should we add next?"
13. Demo Day announcement post
14. Submission week post
15. Final "thank you" + results post

**Judge engagement:** Follow @GarrettHarper (Squads), @wsolDrift, @aeyakovenko, @colosseum.
Tag sparingly (1-2 max, only contextually). Engage their existing posts.

---

## Platforms to register (after X account created)

- **Legends.fun** — create profile, announce project listing
- **Crafts.fun** — same; tag @legends_fun / @CraftsSolana in announcement post
