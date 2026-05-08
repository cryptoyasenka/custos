# CURRENT — custos (Custos Nox)

**Last touched:** 2026-05-08 ~23:55 — Railway blocked, pivot to local-daemon for recording
**Status:** F2/F3 both content-ready. Railway deploy hit a stuck-config bug (rootDirectory `dashboard` cached server-side, UI shows `.` but build daemon ignores). Pivoting: Yana runs daemon locally during F3 recording. Deadline 2026-05-10 23:59 PDT.

## Railway blocker (2026-05-08 23:50)

UI saved rootDirectory=`.`, builder=Dockerfile. Build daemon every deploy logs `[DBUG] root directory set as 'dashboard'` and uses dashboard/ as build context — src/ not present, COPY fails. 7 deploys all failed same way. Helius key works (curl getHealth → ok). railway.json + commits 394a173 and 864c180 are correct, won't fix unless Railway propagates UI save server-side.

**Workaround for F3 demo:** Yana runs `npm run dev` (daemon) + `cd dashboard && npm run dev` (Next dev) on her laptop during recording. Both localhost:8080 + localhost:3000. Dashboard auto-reads `NEXT_PUBLIC_CUSTOS_DAEMON_URL=http://localhost:8080` (or unset → default http://localhost:8080 already). Live mainnet feed renders during recording. No Railway needed.

**To retry Railway later:** disconnect + reconnect GitHub source repo in Railway settings. That usually flushes the cached rootDirectory. OR create a fresh service from scratch.

## ⚠️ READ FIRST on resume — DO NOT roll back

**Source of truth:** `.planning/SUBMISSION-ANALYSIS-2026-05-08.md`

If a future session sees old text saying "F2 mp3 ready, Yana собирает в CapCut" or "F3 = 75% terminal demo" — **ignore it, that's the abandoned plan.** The decision (Yana 2026-05-08 evening) is to rework everything: F2 has structural gaps (no team slide, no one-sentence intro, no monetization line), F3 pivots from terminal-heavy to dashboard-first multi-DAO live mainnet monitor.

## Active task list (in TaskList #29-38)

1. ✅ Save SUBMISSION-ANALYSIS-2026-05-08.md
2. ✅ Update CURRENT.md
3. ✅ Commit analysis + CURRENT.md (commit `fd4f784`) + team-slide finalize (`f559033`)
4. ✅ Research mainnet PDAs → `.planning/MAINNET-WATCHLIST.md` (17 DAOs, 8 gov forks)
5. ✅ Build live mainnet monitor — daemon HTTP sink (`49ce11b`) + dashboard #live rewrite (`04a9d34`), 227 tests green, Next build clean
6. ⏳ Deploy mainnet daemon to Railway — project linked, non-secret env set, blocked on Helius RPC URL from Yana. See `RAILWAY-DEPLOY.md` for the 3-step finish (paste key → verify logs → set Vercel `NEXT_PUBLIC_CUSTOS_DAEMON_URL`).
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

- Active tracks: Ukrainian Sidetrack + online Demo Day (2026-04-23) + Public Goods Award $10K
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

**Last commit:** `e5a66bb` (2026-05-08) — `docs(f2): sync VIDEO-2-PITCH.txt slide 2 with simplified narration`. Next commit pins this rework decision.
