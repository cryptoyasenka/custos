# CURRENT — custos (Custos Nox)

**Last touched:** 2026-05-08 evening
**Status:** F2 + F3 VOICE-OVER ГОТОВЫ. F2 = 8 mp3 (`video-build/f2/voice/slide-{1..8}.mp3`, total 1:56 без Veo3-intro). F3 = 17 mp3 (`video-build/f3/voice/01..12*.mp3` + `03b-architecture.mp3` для CapCut overlay 0:45–0:55, total 4:45 raw — Yana режет паузы в CapCut под 3:00). Скрипты `gen.sh` запушены в коммите 9aac593. Yana собирает в CapCut. Deadline May 10 23:59 PDT

## Open files (ALIVE pipeline — после чистки 2026-05-08)
- `.planning/SESSION-2026-05-08-VOICE.md` — **READ FIRST on resume** — VO stage log (3 commits 9aac593+d67e293+427faeb, 25 mp3 files, slide 2 simplified for non-crypto)
- `.planning/SESSION-2026-05-08-COMPLETE.md` — earlier deck-polish + archive cleanup session log
- `.planning/PITCH-DECK-REVIEW-2026-05-08.md` — judge-eye audit (now all 5 improvements APPLIED in commit c13c15a)
- `planning/VIDEO-2-PITCH.txt` — F2 pipeline (Playwright record + AI voice + CapCut)
- `planning/VIDEO-3-DEMO.txt` — F3 pipeline (live demo + architecture overlay)
- `planning/PITCH-SCRIPT-F2.md` — English narration source (8 slides)
- `planning/TECH-DEMO-SCRIPT-F3.md` — English F3 script (with 0:45–0:55 overlay block)
- `planning/ARENA-SUBMISSION-COPY.md` — main submission text (May 8)
- `assets/pitch-slides/deck-v2.html` — 8-slide deck, source of truth for F2
- `assets/pitch-slides/architecture.html` — single-slide diagram for F3 overlay
- `video-build/f2/record-slides.mjs` — Playwright headless recorder → slides.webm
- `video-build/f2/record-slides-individual.mjs` — per-slide recorder → slides-individual/slide-{1..8}.webm
- `video-build/f2/screenshot-slides.mjs` — final-frame screenshots для sanity check

## Archive (deprecated, до 2026-05-08)
- `video-build/f2/archive/` — старые рекордеры hook/outro/cover/howworks + build-f2.sh + gen-vo.sh + 22-chunk VO. См. README
- `assets/archive/` — старые final mp4 (f2-pitch*.mp4, f3-demo.mp4) + Generated Audio.wav + temp-dirs/
- `assets/archive/pitch-slides-old/` — v1 deck.html + 7 PNG слайдов (заменены HTML 8-слайдным deck-v2)
- `planning/archive/` — старые VIDEO-SCRIPT.md / IDEA.md / week-3 / RESEARCH-timelock и прочие планировки до May 7
- `scripts/archive/` — старые Python генераторы видео + slides PNG

## Next step
Yana runs (in this order):
1. **F2 в CapCut:** Veo3 intro (6-8s) → 8 webm slides (`slides-individual/slide-{1..8}.webm`) → align с 8 mp3 voice (`video-build/f2/voice/slide-{1..8}.mp3`) → music → export
2. **F3 — записать main demo:** настроить .env (добавить Slack webhook вариант B), 2 терминала + браузер + Discord, читать TECH-DEMO-SCRIPT-F3.md (или живая запись если Yana говорит сама)
3. **F3 architecture overlay:** Loom/OBS 10-сек silent screencast `assets/pitch-slides/architecture.html` (full-screen) → mp4
4. **F3 в CapCut:** main demo → накладка architecture overlay на 0:45–0:55 + mp3 `03b-architecture.mp3` поверх + fade in/out 0.3s. Если Yana использует AI voice вместо живой — все 16 main mp3 синхронизирует с экраном
5. Upload F2 → YouTube Unlisted → Arena A10 + Superteam Earn
6. Upload F3 → Loom (primary) + YouTube Unlisted → Arena A11 + Superteam Earn

## Constraints / decisions
- Active tracks: Ukrainian Sidetrack + online Demo Day (2026-04-23)
- **REJECTED 2026-05-05:** Agentic Engineering $200 grant (not an agentic project)
- @CustosNox X account already exists — НЕ создавать новый
- Brand name: "Custos Nox" (was "Custos", changed 2026-04-20 after uniqueness check)
- **Architecture diagram = вариант III** (separate `architecture.html`, CapCut overlay 0:45–0:55, fade in/out 0.3s)
- **F2 voice = AI** (Yana накладывает в CapCut), F3 voice = live recording
- **Test count alignment:** "200+" (real grep = 199), "14 passing" for stale-nonce (real = 14)
- **Sinks:** webhook.ts confirms Discord + Slack + Telegram + Console (4 total). Deck slide 7 + architecture.html updated 2026-05-08
- **Tagline rule:** no periods in headlines / subs / footer-lines / arch-footer (memory feedback_no_periods_in_taglines.md). Body text in cards keeps periods
- Veo3 intro clip already exists: `assets/Blockchain_transactions_flow_red…_202605081236.mp4` (2026-05-08)

## Open questions for Yana (verify before recording)
- Discord webhook actually configured in `.env`?
- Devnet smoke commands fire 4 alerts cleanly?
- Veo3 clip from 2026-05-08 visually matches script intent, or regenerate?

**Last commit:** 2026-05-08 — `feat(f2,f3): VIDEO-3-DEMO architecture overlay step + AI-voice F2 pipeline + Playwright record-slides for 8-slide deck` (131046c)
**Memory pointers:**
- `~/.claude/projects/C--Users-Yana/memory/project_custos_nox_parallel_tracks.md`
- `~/.claude/projects/C--Users-Yana/memory/project_custos_nox_x_account.md`
