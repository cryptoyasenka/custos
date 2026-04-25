# NEXT-SESSION-STATE — Custos Nox

**Updated:** 2026-04-25
**Latest commit:** `45223f8` (main, clean working tree)
**Tests:** 135/135 passing, CI green

---

## SESSION 2026-04-25 DONE ✅

- `StaleNonceExecutionDetector` live (4th detector, 12 tests) → 147/147 passing
- README/dashboard/submission draft: all say "4 detectors", "147 tests", v0.2
- `planning/PITCH-SCRIPT-F2.md` — complete 2-min pitch script (7 slides)
- `planning/TECH-DEMO-SCRIPT-F3.md` — complete 2:40 tech demo script
- `planning/X-PROJECT-ACCOUNT.md` — @CustosNox handle, bio, intro thread, content calendar
- F1 marked DONE in checklist (Yana confirmed uploaded 2026-04-24)
- C1 DONE: Online Demo Day = `luma.com/demodayonline` (~May 8)
- Commits: `f20e279`, `27149aa`, `d21d459` (all pushed to main)

---

## WHAT EXISTS NOW

### Code (daemon)
- **4/4 MVP detectors live:** TimelockRemoval, MultisigWeakening, PrivilegedNonce, StaleNonceExecution
- WS supervisor (reconnect backoff), per-detector 5s timeout, FanOut alert sinks
- Discord + Slack webhook sinks
- 135 tests, GitHub Actions CI green
- `scripts/` smoke scripts: `smoke:create`, `smoke:timelock`, `smoke:weaken`, `smoke:nonce-plan`, `smoke:nonce-init`

### Dashboard
- Next.js marketing site in `/dashboard/`
- **Live at: https://custos-nox-production.up.railway.app** (Railway, not Vercel)
- Shows: 3 detectors, 135 tests, $285M tracked, <1s latency, sample alerts replay
- OG banner 1200×630 added (commit `c1352dc`)

### Videos
- **F1 (Week 3 update) ASSEMBLED** → `video-build/неделя 3/неделя 3.mp4` (25MB, ready to upload)
- `video-build/неделя 3/неделя 3-Обложка.jpg` — thumbnail
- **🚨 F1 UPLOAD DEADLINE: 2026-04-26 23:59 PDT** (tomorrow!)
  - Upload to YouTube (unlisted) or Loom
  - Paste URL in Colosseum Arena → Week 3 update field
  - Post on @yasenka244 with X draft from `planning/video-week-3.md` section 7

### Planning docs
- `planning/ARENA-SUBMISSION-DRAFT.md` — full submission text drafted (A5–A11)
- `planning/PRE-SUBMISSION-CHECKLIST.md` — living checklist with status
- `planning/X-PROJECT-ACCOUNT.md` — X account setup guide, bio, intro thread, content calendar
- `planning/COLOSSEUM-VERIFICATION.md` — source of truth for rules
- `planning/SUPERTEAM-GUIDE.md` — guide extraction with errata

---

## CRITICAL PATH (remaining work to 2026-05-10)

```
NOW (Yana action needed, no code):
  Create @CustosNox X account → post intro thread  [guide: planning/X-PROJECT-ACCOUNT.md]
  Register luma.com/demodayonline (~May 8, wallet auth needed)
  Discord #show-and-tell: check rules → post link to dashboard

WEEK 4 (before May 10):
  Record F2 pitch video ≤2 min  [script: planning/PITCH-SCRIPT-F2.md]
  Record F3 tech demo 2-3 min   [script: planning/TECH-DEMO-SCRIPT-F3.md]
  Register Legends.fun + Crafts.fun
  Send pitch draft to Karina @KumekaTeam for review
  Post in @KumekaGroup (Superteam UA TG)

FINAL:
  Fill Arena form (A5–A11) → Superteam Ukraine affiliation → A12 SUBMIT
  Submit Ukrainian Sidetrack (B4)
  Discord final post (D4)
```

---

## KNOWN GAPS (all require Yana's action)

1. **X project account** — `@CustosNox` not created (mandatory submission field). Guide: `planning/X-PROJECT-ACCOUNT.md`
2. **F2 pitch video** — script ready at `planning/PITCH-SCRIPT-F2.md`, needs recording
3. **F3 tech demo** — script ready at `planning/TECH-DEMO-SCRIPT-F3.md`, needs recording
4. **Online Demo Day** — `luma.com/demodayonline`, not registered (wallet auth)
5. **Legends.fun + Crafts.fun** — not registered
6. **Pitch review by Karina** — not sent to @KumekaTeam
7. **Superteam UA TG announcement** — not posted in @KumekaGroup

---

## THINGS THAT ARE DONE ✅

- Arena account + founder profile (2026-04-18)
- Project on Arena: Custos Nox, category Security Tools
- GitHub repo public: `github.com/cryptoyasenka/custos-nox`
- Live dashboard: `custos-nox-production.up.railway.app` (Railway)
- Discord Colosseum intro posted (2026-04-23, D1 done)
- **147 tests passing**, CI green, 4/4 detectors live
- **F1 Week 3 video uploaded** (2026-04-24) ✅
- **Online Demo Day link found**: `luma.com/demodayonline`
- Full submission text drafted (`planning/ARENA-SUBMISSION-DRAFT.md`)
- F2 pitch script ready (`planning/PITCH-SCRIPT-F2.md`)
- F3 tech demo script ready (`planning/TECH-DEMO-SCRIPT-F3.md`)
- X account guide ready (`planning/X-PROJECT-ACCOUNT.md`)

---

## SANITY CHECK ON NEXT SESSION

```bash
cd /c/Projects/custos
git log --oneline -3
npm test --silent 2>&1 | tail -3
```

Expected: `d21d459` on top, 147 passing.

---

## KEY URLS

| What | URL |
| ---- | --- |
| Live dashboard | https://custos-nox-production.up.railway.app |
| GitHub | https://github.com/cryptoyasenka/custos-nox |
| Arena | https://arena.colosseum.org |
| Demo Day online | https://luma.com/demodayonline |
| Demo Day Kyiv | https://luma.com/demodayua (2026-05-09) |
| Ukrainian Sidetrack | https://superteam.fun/earn/listing/frontier-hackathon-ukrainian-track |
| Superteam UA TG | https://t.me/KumekaGroup |
