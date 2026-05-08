# CURRENT — custos (Custos Nox)

**Last touched:** 2026-05-08 evening (post-rework decision)
**Status:** REWORK IN PROGRESS — F2 + F3 + dashboard ALL being upgraded for "идеально презентабельно судьям". Old mp3 sets DEPRECATED. Deadline 2026-05-10 23:59 PDT.

## ⚠️ READ FIRST on resume — DO NOT roll back

**Source of truth:** `.planning/SUBMISSION-ANALYSIS-2026-05-08.md`

If a future session sees old text saying "F2 mp3 ready, Yana собирает в CapCut" or "F3 = 75% terminal demo" — **ignore it, that's the abandoned plan.** The decision (Yana 2026-05-08 evening) is to rework everything: F2 has structural gaps (no team slide, no one-sentence intro, no monetization line), F3 pivots from terminal-heavy to dashboard-first multi-DAO live mainnet monitor.

## Active task list (in TaskList #29-38)

1. ✅ Save SUBMISSION-ANALYSIS-2026-05-08.md
2. ✅ Update CURRENT.md
3. ✅ Commit analysis + CURRENT.md (commit `fd4f784`) + team-slide finalize (`f559033`)
4. ✅ Research mainnet PDAs → `.planning/MAINNET-WATCHLIST.md` (17 DAOs, 8 gov forks)
5. ✅ Build live mainnet monitor — daemon HTTP sink (`49ce11b`) + dashboard #live rewrite (`04a9d34`), 227 tests green, Next build clean
6. → **NEXT** Deploy mainnet daemon to Railway
7. → Patch F2 deck (team slide, one-sentence intro, monetization line)
8. → Regenerate F2 voice (9 chunks, was 8)
9. → Rewrite F3 v5 (dashboard-first multi-DAO, ≤10s terminal max)
10. → Regenerate F3 voice (new chunks)

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
