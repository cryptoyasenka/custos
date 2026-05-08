# SESSION 2026-05-08 — F2/F3 Voiceover stage

**Continuation of** `SESSION-2026-05-08-COMPLETE.md` (deck-v2 polish + archive cleanup).
**Stage outcome:** all voiceover MP3s generated and ready for CapCut. Pitch + tech-demo scripts finalized for non-crypto judges.

---

## What shipped this stage (commits)

1. **`9aac593`** — F2 (8 slides) + F3 (17 chunks) voiceover gen scripts
   - `video-build/f2/voice/gen.sh` (8 chunks, en-US-AriaNeural)
   - `video-build/f3/voice/gen.sh` (16 main + 1 architecture overlay)
   - `.gitignore`: deep-glob `video-build/**/*.{mp3,wav,mp4}`
2. **`d67e293`** — CURRENT.md updated to point to CapCut next-step
3. **`427faeb`** — slide 2 simplified for non-crypto judges (removed 4 jargon terms in 16s)

All pushed to origin/main.

---

## Files generated locally (gitignored — for CapCut)

### F2 pitch — 8 mp3 in `video-build/f2/voice/`
| File | Duration | Slide topic |
|------|----------|-------------|
| slide-1.mp3 | 18.5s | incident + multisig 101 + $285M |
| slide-2.mp3 | 16.8s | Chainalysis chain (simplified) |
| slide-3.mp3 | 9.3s  | gap (50 vs 10,000) |
| slide-4.mp3 | 13.8s | solution |
| slide-5.mp3 | 13.8s | proof + 9-day stakes |
| slide-6.mp3 | 18.5s | setup + Public Goods |
| slide-7.mp3 | 12.0s | vision v1/v2/v3 |
| slide-8.mp3 | 12.4s | close |
| **Total**   | **~1:55** | + Veo3 intro 6-8s = ~2:02 final |

### F3 tech demo — 17 mp3 in `video-build/f3/voice/`
| File | Duration | Block |
|------|----------|-------|
| 01-intro.mp3 | 33.5s | $285M + DAO/multisig 101 |
| 02-drift-timeline.mp3 | 14.1s | "Custos Nox is that tool" |
| 03-detectors.mp3 | 24.8s | 4+1 detectors |
| 03b-architecture.mp3 | 17.1s | **CapCut overlay 0:45–0:55** |
| 04-terminals-intro.mp3 | 17.1s | switch to 2 terminals |
| 05a-timelock-setup.mp3 | 11.3s | timelock setup |
| 05b-timelock-result.mp3 | 6.1s  | CRITICAL alert |
| 06a-weaken-setup.mp3 | 11.1s | weaken setup |
| 06b-weaken-result.mp3 | 8.3s  | HIGH alert |
| 07a-nonce-setup.mp3 | 13.9s | nonce setup |
| 07b-nonce-result.mp3 | 5.4s  | CRITICAL alert |
| 08a-rotate-setup.mp3 | 14.3s | signer rotation setup |
| 08b-rotate-result.mp3 | 5.2s  | HIGH alert |
| 09-discord.mp3 | 26.9s | Discord screen + 9-day stakes |
| 10-stale-test.mp3 | 12.2s | 14 unit tests |
| 11-install.mp3 | 42.4s | 3-step setup |
| 12-close.mp3 | 21.7s | STRIDE 50 vs 10,000 |
| **Total** | **~4:45 raw** | Yana cuts pauses in CapCut to ~3:00 |

---

## Decisions locked this stage

1. **Voice = en-US-AriaNeural** (edge-tts), rate +0%. Calm, clear female voice.
2. **TTS-friendly произношение прописано в narration**: `P D A`, `M I T`, `N P M`, `app dot squads dot so`, `github dot com slash cryptoyasenka slash custos hyphen nox`, `two hundred eighty-five million dollars`, `March twenty-third`, `three out of five`. Без этого TTS читал бы "PDA" как "пэ-дэ-а" одним словом.
3. **F3 = 17 chunks (не 16)** — добавлен `03b-architecture.mp3` для CapCut overlay 0:45–0:55. Гайд требует overlay поверх architecture.html в этот промежуток.
4. **Slide 2 переписан для non-crypto judges** (Yana's вариант B):
   - Удалены: "Security Council multisig", "two-of-five quorum", "zero timelock", "durable nonce" (4 термина за 16 сек без контекста)
   - Добавлены plain-English эквиваленты: "approval threshold lowered, safety delays removed, drain transaction pre-armed"
   - Chainalysis остаётся anchor'ом фактов
5. **Slack webhook = вариант B** — Yana добавит сама перед записью F3 (5-step guide ниже).

---

## Slack webhook setup (Yana, 5 шагов перед записью F3)

1. https://api.slack.com/apps → **Create New App** → **From scratch** → name `Custos Nox Alerts` → выбрать workspace
2. Слева **Incoming Webhooks** → Activate → **Add New Webhook to Workspace** → выбрать канал (`#custos-alerts` или `#general`)
3. Скопировать **Webhook URL** (`https://hooks.slack.com/services/T../B../...`)
4. В `C:/Projects/custos/.env` добавить: `CUSTOS_SLACK_WEBHOOK=<URL>`
5. Рестартни daemon (Ctrl+C → `npm run dev`) — теперь алерты идут и в Slack

После этого фраза в F3 09-discord.mp3 "Discord, Slack, and terminal all fire simultaneously" станет правдой.

---

## What Yana does next (CapCut assembly)

### F2 pitch (~2:02 final)
1. Новый CapCut проект 16:9, 1080p
2. Track 1: Veo3 intro `assets/Blockchain_transactions_flow_red…_202605081236.mp4` (6-8s)
3. Track 1 (после intro): 8 webm slides из `video-build/f2/slides-individual/slide-{1..8}.webm`
4. Track 2 audio: 8 mp3 voice из `video-build/f2/voice/slide-{1..8}.mp3` — синхронизировать с слайдами
5. Optional Track 3: ambient music (low volume)
6. Export → MP4 1080p H.264
7. Upload YouTube Unlisted → Arena A10 + Superteam Earn

### F3 tech demo (~3:00 final)
**Опция A — живая запись (Yana говорит):**
1. Настроить .env (Slack webhook), 2 терминала + браузер + Discord
2. Loom/OBS запись по `planning/VIDEO-3-DEMO.txt` Шаг 4 — читать TECH-DEMO-SCRIPT-F3.md natural voice
3. Отдельно записать 10-сек architecture overlay (Шаг 3.5)
4. CapCut: main demo + overlay 0:45–0:55 (fade 0.3s in/out)
5. Upload Loom (primary) + YouTube Unlisted

**Опция B — AI voice (если Yana не хочет говорить):**
1. Записать silent screencast по тем же таймингам
2. Track 2 audio: 16 main mp3 синхронизировать с экраном
3. Track 3 на 0:45–0:55: architecture overlay video + `03b-architecture.mp3`
4. Export, upload как опция A

Гайды — `planning/VIDEO-3-DEMO.txt` Шаги 3.5+4+5.

---

## Open / not done

- ❌ F2/F3 финальные mp4 — Yana собирает сама в CapCut
- ❌ YouTube/Loom uploads — Yana делает
- ❌ Arena A10 + A11 URLs + Superteam Earn — после upload
- ❌ Slack webhook в .env — Yana настраивает перед записью F3

---

## Stage timing (for memory)

- Voice generation took ~5 min total (F3) + ~2 min (F2) — edge-tts быстрый
- Total raw audio = 7:01 across 25 mp3 files
- 0 secrets committed, 0 binaries committed (mp3 gitignored, Veo3 mp4 untracked)
- All 3 commits passed working-tree-clean check

---

**Last commit:** `427faeb` (2026-05-08 evening)
**Repo state:** working tree clean except untracked Veo3 mp4 (intentional)
**Next session:** Yana CapCut assembly + uploads (or я помогаю с другой проблемой)

Deadline May 10 23:59 PDT (~46h осталось).
