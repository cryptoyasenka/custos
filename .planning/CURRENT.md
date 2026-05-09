# CURRENT — custos (Custos Nox)

**Last touched:** 2026-05-09 morning — ✅ Helius rotated. Старый `2e45da34-...` revoked в Helius dashboard; новый ключ в Railway env (`custos-nox` service → `CUSTOS_RPC_URL`); daemon redeployed, `watching:12` подтверждён. Новый ключ только в Railway, нигде в репо/файлах. CI зелёный (commit `639c8bc`, run `25601457714`). Submit-blocker по безопасности снят — можно записывать F3 и сабмитить.

**CI fix breakdown (commit `639c8bc`):**
- `npm audit fix` — axios 1.15.0 (12 CVEs) + uuid 11.0.0 (1 CVE) → upgraded; не breaking. CI шаг `Audit prod deps (high+)` теперь pass.
- `npx biome check --write --unsafe` — auto-fixed 9 файлов: `node:` protocol на 6 mjs файлах в `video-build/f2/`, JSX line-wrap в 3 dashboard компонентах (live-feed/detector-card/live-status-bar), import-order. Logic не тронута.
- Manual: `video-build/f2/screenshot-slides.mjs:27` — forEach → for-of (biome `noForEach`).
- Tests 228/228 после фиксов, build clean. Коммит = 10 files, 111+/110-.
- Annotation от GitHub: actions/checkout@v4 + setup-node@v4 deprecated к 16.09.2026 (Node.js 20 EOL). Не блокер, можно потом upgrade на v5.

**Autonomous verification done this night** (analysis only, без правок кода):
- ✅ Все артефакты submit на диске (deck-v2.html, 9 F2 mp3, F3 v5 script, 9 F3 mp3, Veo3 intro, ARENA-COPY)
- ✅ Live URLs работают: daemon /health watching:12, dashboard HTTP 200 с DEMO badges
- ✅ Tests 228/228 green (vitest 4.99s)
- ✅ Daemon URL правильно зашит в dashboard JS bundle, CSP корректный
- ✅ Secret sweep чистый кроме известного Helius leak'а
- ✅ Audit file санитайзнут от inline ключа (commit 0cc1b82)
- 🔴 **Daemon SIGTERM cycle** — 3+ рестарта за 30 мин (Railway-side termination, не crash). Yana **обязательно** Option B (local daemon) для F3 recording. Live URL для judges работает, но возможны 30-60s dips. Детали в AUDIT-NIGHT секция БЕЗОПАСНОСТЬ.
**Status:** F2/F3 content-ready + URL swap complete. Two Railway services live in same project:
- **Dashboard (visit card for judges):** `https://custos-nox.up.railway.app` → Next.js 16 standalone, polls daemon, shows hero + install + 5 detectors + #live monitor
- **Daemon (API):** `https://custos-daemon.up.railway.app/health` → `{ok:true, watching:12, ...}`, Helius mainnet RPC, HTTP sink serving `/health` + `/events`

Submit URL for Yana = `custos-nox.up.railway.app` (dashboard, clean short URL). Deadline 2026-05-10 23:59 PDT.

## Railway state (2026-05-09 01:15)

**Two-service deploy:**
1. **`custos-nox` service** = dashboard (Next.js standalone), at `custos-nox.up.railway.app`. Renamed FROM daemon via Railway GraphQL `serviceDomainUpdate` mutation. Dockerfile in `dashboard/Dockerfile` (multi-stage Node 20 alpine, ARG bakes `NEXT_PUBLIC_CUSTOS_DAEMON_URL`).
2. **`custos-daemon` service** = the daemon (TypeScript, Helius RPC), at `custos-daemon.up.railway.app`. Was originally the only service at `custos-nox.up.railway.app` until the URL swap.

**URL swap done via Railway GraphQL** (because CLI lacks rename + delete-domain):
- Mutation 1: change daemon's serviceDomain from `custos-nox.up.railway.app` → `custos-daemon.up.railway.app`
- Mutation 2: change dashboard's serviceDomain from `custos-site-production.up.railway.app` → `custos-nox.up.railway.app`
- Token + project/service/env IDs are in `~/.railway/config.json`.

**Daemon root cause history:** First 7 daemon deploys failed overnight due to stale `rootDirectory='dashboard'` server-side cache (likely correlated with Railway's SSL incident status.railway.com/incident/1QD5978Z, May 8 20:09 UTC). Cleared when Yana hit manual Deploy. Daemon monitors 12 PDAs (Tier 1 + Tier 2 from MAINNET-WATCHLIST.md) via `CUSTOS_WATCH` env.

**Dashboard deploy fix:** Initial `railway up` from `dashboard/` actually uploaded from project root (Railway uses linked-project path, not cwd). Fixed by using `railway up . --path-as-root --service custos-site` — that makes the path arg the archive root. Healthcheck path also explicitly set to `/` in `dashboard/railway.json` (was inheriting daemon's `/health` from service config).

**For F3 recording:** см. `planning/F3-RECORDING-OPTIONS.md` — два варианта (Railway daemon vs fully local), Yana выберет утром.

## ⚠️ READ FIRST on resume — DO NOT roll back

**Source of truth:** `.planning/SUBMISSION-ANALYSIS-2026-05-08.md`

If a future session sees old text saying "F2 mp3 ready, Yana собирает в CapCut" or "F3 = 75% terminal demo" — **ignore it, that's the abandoned plan.** The decision (Yana 2026-05-08 evening) is to rework everything: F2 has structural gaps (no team slide, no one-sentence intro, no monetization line), F3 pivots from terminal-heavy to dashboard-first multi-DAO live mainnet monitor.

## Active task list (in TaskList #29-38)

1. ✅ Save SUBMISSION-ANALYSIS-2026-05-08.md
2. ✅ Update CURRENT.md
3. ✅ Commit analysis + CURRENT.md (commit `fd4f784`) + team-slide finalize (`f559033`)
4. ✅ Research mainnet PDAs → `.planning/MAINNET-WATCHLIST.md` (17 DAOs, 8 gov forks)
5. ✅ Build live mainnet monitor — daemon HTTP sink (`49ce11b`) + dashboard #live rewrite (`04a9d34`), 227 tests green, Next build clean
6. ✅ Deploy mainnet daemon to Railway — DONE 2026-05-09 00:22. After URL swap (01:15) live at `https://custos-daemon.up.railway.app`. Helius mainnet, 12 PDAs watched, HTTP sink serving `/health` + `/events`.
11. ✅ Deploy dashboard to Railway as second service — DONE 2026-05-09 01:09 at `https://custos-nox.up.railway.app` (Next.js 16 standalone, multi-stage Dockerfile, CSP allows daemon URL).
12. ✅ URL swap — dashboard takes the clean `custos-nox.up.railway.app`, daemon moved to `custos-daemon.up.railway.app`. Submit URL for judges = dashboard URL.
7. ✅ F2 deck patched — slide 1 intro + slide 6 Public-Goods monetization + NEW slide 08 team (`18f1853`). 9 slides total now.
8. ✅ F2 voice regenerated — script v3 + 9 mp3s + Playwright timing extended to 132s (`e7102ba`).
9. ✅ F3 v5 dashboard-first script written (`a6f572f`) — 7 sections, terminal-zero, replays Drift chain inside dashboard alert feed instead of CLI.
10. ✅ F3 voice regenerated — 9 chunks ~3:08 total, edge-tts AriaNeural. Old v4 17-chunk set wiped.

## Key files (current state)

- `.planning/SUBMISSION-ANALYSIS-2026-05-08.md` — **READ FIRST**, full rework rationale + gap analysis vs official Superteam UA guides
- `.planning/SESSION-2026-05-08-VOICE.md` — historical (voice gen stage, now superseded)
- `dashboard/app/page.tsx` — `#live` section lines ~265-299 still uses SAMPLE_ALERTS, will be rewired to mainnet stream
- `assets/pitch-slides/deck-v2.html` — F2 deck, gets new slide 7.5 (team) + slide 1 + slide 6 patches
- `assets/pitch-slides/architecture.html` — overlay (unchanged)
- `planning/PITCH-SCRIPT-F2.md` — narration source, will be patched
- `planning/TECH-DEMO-SCRIPT-F3.md` — v4 deprecated, v5 to be written (dashboard-first)
- `planning/VIDEO-2-PITCH.txt` + `planning/VIDEO-3-DEMO.txt` — operational guides for Yana, will be re-synced
- `video-build/f2/voice/gen.sh` — to be expanded to 9 chunks
- `video-build/f3/voice/gen.sh` — to be fully rewritten

## Constraints / decisions (still active)

- Active tracks: Ukrainian Sidetrack + Online Demo Day (luma.com/demodayonline, был ~2026-05-08; pre-recorded видео уйдёт в Arena независимо от того прошёл ли live event) + Public Goods Award $10K. Note: "2026-04-23" в старых заметках — это была дата Discord-intro post в Colosseum, а не Demo Day.
- Deadline: 2026-05-10 23:59 PDT
- Yana has Railway credits — mainnet daemon goes there, not local-only
- Loom = primary upload for F3 (Superteam UA requirement); YouTube Unlisted backup
- Veo3 intro stays
- 5 detectors + 200+ tests stay (no code changes in detectors)
- No "Co-Authored-By: Claude" in commits (memory: feedback_no_claude_coauthor_in_commits)
- Brand: "Custos Nox", X account `@CustosNox` exists

## Open questions for Yana

1. Team slide content: 1-line credibility fact about Yana's Solana background — what's the strongest fact to put? (TEE/OpenGradient OSS work? Prior Solana hackathon? Just "Solana developer, Kyiv, building in public"?)
2. After mainnet PDA research returns 5-7 candidates — Yana confirms the final watchlist before code goes live.

**Last commit:** `10391bf` (2026-05-09 ~02:00) — `fix(dashboard): mark demo data clearly so judges don't read it as a live incident`. Yana заметила что fallback alert feed выглядит как реальный инцидент в моменте (CRITICAL · 1M AGO легко перепутать с активной атакой). Фикс: жёлтые DEMO badges на severity chart + alert feed header, banner с explainer внутри feed-карточки ("No mainnet events yet — these 5 rows are devnet samples"), subtitle над DAO grid теперь говорит "0 mainnet events, alert feed below shows demo data". Tests 228/228, build clean. Verified via browse @ 1600x1000 viewport. Когда mainnet daemon начнёт отдавать реальные events — banner и DEMO-badges автоматически уберутся, header станет "Alert feed · mainnet" (см. `useReal` ветку в `live-feed.tsx`).

**Previous commit:** `7a3bec8` (2026-05-09 ~01:21) — `feat(dashboard): hoist Live monitor up + green CTA in hero`. Live monitor moved from 6th to 3rd section (после Detectors). Hero gets зелёную CTA "● See live mainnet monitor" с pulse dot, ведёт на `#live`.
