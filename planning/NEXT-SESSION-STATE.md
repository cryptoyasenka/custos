# NEXT-SESSION-STATE — Custos Nox

**Updated:** 2026-04-25
**Latest commit:** `45223f8` (main, clean working tree)
**Tests:** 135/135 passing, CI green

---

## WHAT EXISTS NOW

### Code (daemon)
- 3/4 MVP detectors live: TimelockRemoval, MultisigWeakening, PrivilegedNonce
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
TODAY/TOMORROW (Yana action needed):
  F1 upload → Arena Week 3 field  [DEADLINE 2026-04-26!]

THIS WEEK:
  Create @CustosNox X account → post intro thread
  Register luma.com/demodayonline (online Demo Day ~May 8, wallet auth)
  Check Discord #show-and-tell rules → post there

WEEKS 3-4:
  F2: Pitch video ≤2 min EN (script in ARENA-SUBMISSION-DRAFT.md A7)
  F3: Tech demo 2-3 min EN (daemon + 3 alerts + architecture diagram)
  Register Legends.fun + Crafts.fun
  Send pitch draft to Karina @KumekaTeam for review
  TG announcement in @KumekaGroup

FINAL WEEK:
  Fill Arena form (A5–A11) → mark Superteam Ukraine affiliation → A12 SUBMIT
  Submit Ukrainian Sidetrack on Superteam Earn (B4)
  Discord final post (D4)
```

---

## KNOWN GAPS (from Superteam UA guide comparison 2026-04-25)

1. **X project account** — `@CustosNox` not created (mandatory submission field)
2. **Legends.fun + Crafts.fun** — not registered (guide requirement for ecosystem visibility)
3. **Pitch review by Karina** — not sent (guide recommends Week 3 → Week 4)
4. **Superteam UA TG announcement** — not posted in @KumekaGroup
5. **Online Demo Day registration** — link found (`luma.com/demodayonline`), not registered

---

## THINGS THAT ARE DONE ✅

- Arena account + founder profile (2026-04-18)
- Project on Arena: Custos Nox, category Security Tools
- GitHub repo public: `github.com/cryptoyasenka/custos-nox`
- Live demo URL: `custos-nox-production.up.railway.app`
- Discord Colosseum intro posted (2026-04-23, D1 done)
- 135 tests passing, CI green
- Week 3 video assembled (needs upload only)
- Full submission text drafted

---

## SANITY CHECK ON NEXT SESSION

```bash
cd /c/Projects/custos
git log --oneline -3
npm test --silent 2>&1 | tail -3
ls video-build/неделя\ 3/
```

Expected: `45223f8` or newer, 135 passing, `неделя 3.mp4` present (25MB).

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
