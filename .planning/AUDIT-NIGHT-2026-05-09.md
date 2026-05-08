# NIGHT AUDIT — 2026-05-09 ~02:30 (Custos Nox · Solana Frontier Hackathon)

**Yana ушла спать. Я провёл аудит. Утром можно прочитать только этот файл — всё ключевое здесь.**

Дедлайн: **2026-05-10 23:59 PDT** = ~22 часа от пробуждения.

---

## TL;DR — что осталось до submit

| # | Действие | Кто | Время | Блокирующее? |
|---|---|---|---|---|
| 1 | Собрать F2 видео в CapCut (Veo3 intro + slides + voice) | Yana | 1-1.5h | ✅ да |
| 2 | Записать F3 экран по скрипту v5 | Yana | 1h (с дублями) | ✅ да |
| 3 | Загрузить F2 на YouTube Unlisted | Yana | 10 min | ✅ да |
| 4 | Загрузить F3 на Loom (primary) + YouTube Unlisted (backup) | Yana | 15 min | ✅ да |
| 5 | Заполнить Arena форму (есть paste-ready copy) | Yana | 30 min | ✅ да |
| 6 | Сабмитнуть в Superteam Earn Ukrainian track | Yana | 5 min | ✅ да |
| 7 | (опционально) X пост-анонс | Yana | 15 min | ❌ |
| 8 | (опционально) Discord show-and-tell post | Yana | 15 min | ❌ |

**Итого:** ~3.5h работы Yana + 30 min на проверки. Запас 18+ часов до дедлайна.

---

## ЧТО ГОТОВО (можно не трогать)

### Код и инфра
- ✅ Daemon deployed: `https://custos-daemon.up.railway.app/health` → `{"ok":true,"watching":12,...}`
- ✅ Dashboard deployed: `https://custos-nox.up.railway.app` (clean URL для submit)
- ✅ URL swap done: дашборд занял короткий URL, daemon ушёл на `custos-daemon`
- ✅ 228/228 unit tests green (`npm test`)
- ✅ Build clean (`npm run build` в dashboard/)
- ✅ Live monitor 3-я секция (после Detectors), hero CTA "● See live mainnet monitor"
- ✅ DEMO clarity: жёлтые DEMO badges + banner объясняют что devnet sample, а не реальный инцидент
- ✅ Все коммиты запушены (origin/main = 13ed898)

### Контент-артефакты
- ✅ F2 deck: `assets/pitch-slides/deck-v2.html` (9 slides — intro/team/monetization patches done)
- ✅ F2 voice: `video-build/f2/voice/slide-1.mp3` … `slide-9.mp3` (~132s)
- ✅ F2 slides screencap: `video-build/f2/slides.webm` (без озвучки, raw)
- ✅ F3 v5 script: `planning/TECH-DEMO-SCRIPT-F3.md` (dashboard-first, terminal-zero)
- ✅ F3 voice: `video-build/f3/voice/01-hero.mp3` … `07b-close.mp3` (9 chunks, ~3:08)
- ✅ Veo3 intro: `assets/Blockchain_transactions_flow_red…_202605081236.mp4` (16MB, untracked в git — by design)
- ✅ Architecture overlay: `assets/pitch-slides/architecture.html`

### Submission материалы
- ✅ Paste-ready Arena copy: `planning/ARENA-SUBMISSION-COPY.md` (все поля кроме Telegram handle)
- ✅ X account `@CustosNox` создан 2026-04-29
- ✅ GitHub repo `cryptoyasenka/custos-nox` public, MIT license
- ✅ README актуален (test count = 228)

---

## ЧТО НЕ ГОТОВО (детальный план)

### 🔴 1. F2 video не СОБРАНО (CRITICAL)

**Что есть:**
- 9 mp3 голоса в `video-build/f2/voice/` (~132s narration)
- 9 слайдов в deck-v2.html
- `slides.webm` — screencast слайдов БЕЗ озвучки (старый, может потребоваться перезапись с новым slide-7.5)
- Veo3 intro mp4

**Что нужно:**
1. Перезаписать слайды с актуальной версией deck-v2.html (включая team slide 7.5 + monetization patch). Скрипт уже есть: `video-build/f2/record-slides.mjs` или `record-slides-individual.mjs`.
2. В CapCut/любом редакторе:
   - Вставить Veo3 intro
   - Слайды + соответствующая mp3 на каждый
   - Финал screen с CTA + GitHub URL
   - Hold на 1-2 секунды между слайдами
3. Экспорт mp4 1080p

**Альтернатива (если CapCut утомил):** ffmpeg pipeline — могу написать утром после её просьбы. Совместит mp3 + screenshot слайда → mp4 chunk → concat все chunks + Veo3.

### 🔴 2. F3 video не ЗАПИСАНО (CRITICAL)

**Что есть:**
- Скрипт `planning/TECH-DEMO-SCRIPT-F3.md` v5 (dashboard-first, ~3:00)
- Голос готов в `video-build/f3/voice/`
- Daemon живой, дашборд живой — можно записывать прямо сейчас

**Шаги (по `planning/F3-RECORDING-OPTIONS.md`):**
1. Выбрать вариант: **A (Railway daemon, рекомендую)** или **B (fully local)**
2. Открыть OBS Studio / Loom Desktop / Win+G
3. Настроить браузер по табам (см. PRE-RECORDING SETUP в скрипте):
   - Tab 1: `https://custos-nox.up.railway.app` (главная) — scroll top
   - Tab 2: Discord `#custos-alerts` (4 embedded алертов)
4. Записать 1 take ~3:00 по timing'у (HERO 25s → LIVE 25s → DETECTORS 40s → ARCH overlay 10s → ALERT REPLAY 45s → DISCORD 15s → SETUP+CLOSE 20s)
5. Если плохо — переснять (запись бесплатно, voice уже есть)

**Один из вариантов оптимизации**: записать только видео (без voiceover), голос уже готов в mp3 — вшить в CapCut поверх. Так можно полностью сосредоточиться на ритме клика без болтовни в микрофон.

### 🔴 3. YouTube re-upload F2

Старый URL `https://youtu.be/eX_Ze5lDLrc` — pre-rework версия без team/monetization patches. **Не использовать.**

После сборки нового F2 → YouTube Studio → Unlisted upload → новый URL → пометить в Arena.

### 🔴 4. Loom upload F3

**Loom = primary requirement** Superteam UA tech-demo guide. YouTube Unlisted = backup.

После записи F3:
- Loom (https://loom.com) — drag-and-drop mp4 → получить share URL
- YouTube Studio → Unlisted upload → второй URL

В Arena поле A11 (Tech Demo) — **YouTube** URL. В Superteam Earn форму — **Loom** URL.

### 🔴 5. Arena форма

**Файл:** `planning/ARENA-SUBMISSION-COPY.md` — paste-ready, 256 строк.

Все поля Step 1-3 готовы кроме:
- ⚠️ **Step 3 → Team Telegram contact:** placeholder `[Yana — paste your personal Telegram handle here]`
- ⚠️ **Step 2 → Pitch video (A10):** ждёт новый YouTube URL
- ⚠️ **Step 2 → Tech demo (A11):** ждёт YouTube URL для F3

**Ссылка на Arena:** `arena.colosseum.org` → существующий проект → Edit submission.

### 🔴 6. Superteam Earn Ukrainian track

**Ссылка:** `https://superteam.fun/earn/listing/frontier-hackathon-ukrainian-track` (из ARENA-COPY checklist)

Submit СРАЗУ после Arena, тот же материал. F3 для этого track = **Loom URL** (не YouTube).

### 🟡 7-8. X / Discord posts (optional)

Drafts уже есть:
- `planning/X-POST-DRAFT-CUSTOS-NOX.md`
- `planning/DISCORD-SHOW-AND-TELL-POST.md`

Не блокируют submit но усиливают Public Goods Award narrative.

---

## ВНУТРЕННИЕ НЕЯСНОСТИ (на утро уточнить с Yana)

1. **`.planning/SUBMISSION-ANALYSIS-2026-05-08.md` line 121-127** упоминает "Drift Security Council, Jito DAO, MarginFi" в watchlist. Реальный watchlist (по daemon `watching:12` + dashboard cards): Mango, Marinade, Pyth, Solend, Jupiter, Raydium, Orca, Bonk, Helius, Squads, Superteam, MonkeDAO. **Drift Security Council, Jito, MarginFi там НЕТ.** Не критично если Arena copy не упоминает (проверил — там общие формулировки), но если Yana расскажет в pitch'е "we're watching Drift Security Council" — это будет ложь.

2. **Demo Day 2026-04-23** — уже прошёл (16 days назад). В CURRENT.md написано как "Active track". В memory `project_custos_nox_parallel_tracks.md` — "АКТИВНЫ 2026-04-23". Не понятно прошёл ли он, или просто активирован с этой даты, или по факту не состоялся. **Утром спросить Yana** или проверить календарь Solana Frontier.

3. **ARENA-SUBMISSION-COPY.md** упоминает "215 tests" в нескольких местах — реально 228. Cosmetic, но если будет finally edit — поправить. (Не делал — Yana сказала ничего не менять.)

4. **F3 mainnet narrative** — daemon `lastEventAt: null` после 11 минут uptime. Скрипт говорит "watching 12 mainnet DAOs right now... if any of them changes a threshold". Это ОК — главное чтобы во время записи дашборд показывал зелёные точки и DAO имена. Devnet replay для алертов уже учтён в скрипте.

---

## ЧТО Я БЫ ПЕРЕПРОВЕРИЛ ПЕРЕД SUBMIT (0 риск, 5 мин)

- [ ] `curl https://custos-daemon.up.railway.app/health` → `watching:12`
- [ ] Открыть `https://custos-nox.up.railway.app` в incognito → дашборд грузится, hero CTA видна, Live monitor 3-я секция, DEMO badges видны
- [ ] Открыть `https://github.com/cryptoyasenka/custos-nox` в incognito → README актуален, repo public
- [ ] Открыть `https://x.com/CustosNox` в incognito → аккаунт жив
- [ ] Открыть deck-v2.html в браузере → 9 слайдов листаются, slide 7.5 (team) есть
- [ ] Прочитать F3 скрипт целиком ещё раз перед записью
- [ ] Финальный F2 mp4 — посмотреть от начала до конца, проверить sync голоса со слайдами

---

## БЕЗОПАСНОСТЬ / РИСКИ

### 🔴🔴🔴 CRITICAL: HELIUS API KEY УТЁК В ПУБЛИЧНЫЙ GIT 🔴🔴🔴

**Что:** `planning/F3-RECORDING-OPTIONS.md` строка 60 содержит полный Helius RPC URL c API key.
Ключ см. в личной памяти (`~/.claude/projects/C--Users-Yana/memory/project_custos_nox_submit_2026-05-10.md`) — здесь не дублирую чтобы не плодить повторное вхождение секрета в публичный репо.

**Проверка показала:**
- Файл в git tracked (commit `deb510d` — `feat(planning): extend Railway watch to 12 DAOs + F3 recording options doc`)
- Также упоминается в `005cd9f`
- Repo `cryptoyasenka/custos-nox` **PUBLIC** на GitHub — любой человек видит ключ через `git log -p planning/F3-RECORDING-OPTIONS.md`
- Этот ключ используется production daemon на Railway

**Последствия если не reролить:**
- Helius free tier 1M req/мес — кто-то может скрапить ключ и сжечь твой лимит за час
- Бот атаки на rate limit убьют production daemon → Live monitor покажет "daemon offline" судьям
- При платных tiers — финансовый ущерб на твой аккаунт

**ДЕЙСТВИЕ Yana утром (10 минут):**
1. Зайти на https://dashboard.helius.dev → API Keys
2. **Revoke** ключ (значение в личной памяти `project_custos_nox_submit_2026-05-10.md`, локально, не в git)
3. Создать новый ключ
4. Railway → custos-daemon service → Variables → обновить `CUSTOS_RPC_URL` на новый ключ
5. Подождать redeploy (~2 мин), проверить `curl https://custos-daemon.up.railway.app/health` → `watching:12`
6. В `planning/F3-RECORDING-OPTIONS.md` line 60 заменить ключ на `<YOUR_HELIUS_KEY>` placeholder
7. Commit + push

**Опционально (destructive, по желанию):**
- `git filter-repo --replace-text` чтобы стереть ключ из истории. Но если ключ уже revoked — это косметика. Большинство репо просто оставляют старый ключ в истории после reroll.

**Я НЕ ИСПРАВИЛ САМ** потому что:
1. Reroll Helius ключа требует логина в dashboard.helius.dev — не могу без Yana
2. Изменение Railway env var — могу через GraphQL, но это влияет на live production без её ведома
3. Yana явно сказала "ничего не меняй"

### Прочие чеки

- 🟢 .env.example без секретов (placeholder)
- 🟢 Railway tokens в `~/.railway/config.json` локально, не в git
- 🟢 Tests 228/228, no flaky
- 🟢 README не содержит ключей
- 🟢 Dashboard CSP настроен (connect-src custos-daemon)
- 🟡 Daemon uptime ~11 мин на момент аудита. Restart policy `ON_FAILURE` со max-retries 5. Если упадёт навсегда — Railway шлёт email Yana
- 🟡 Helius free tier — 1M req/мес. На 12 WS subscriptions хватает с запасом, НО при leak'е чужие могут сжечь. После reroll — мониторинг lim'а через dashboard.helius.dev

---

## РЕКОМЕНДУЕМЫЙ ПЛАН УТРА (для Yana)

**08:00-09:00** — кофе, прочитать этот файл  
**09:00-10:30** — собрать F2 в CapCut (или попросить меня через ffmpeg pipeline)  
**10:30-11:30** — записать F3 экран (1-2 такта, выбрать вариант A из F3-RECORDING-OPTIONS.md)  
**11:30-12:00** — upload Loom + 2× YouTube Unlisted  
**12:00-12:30** — заполнить Arena форму по `ARENA-SUBMISSION-COPY.md`  
**12:30-12:45** — submit Superteam Earn Ukrainian  
**12:45-13:00** — финальные проверки + коротенький X post  

Финиш 13:00 = ~10 часов до дедлайна, ровно нужный запас.

---

## ССЫЛКИ ДЛЯ СУДЕЙ (правильные финальные)

- 🌐 **Дашборд (главное):** https://custos-nox.up.railway.app
- 💻 **GitHub:** https://github.com/cryptoyasenka/custos-nox
- 🐦 **X:** https://x.com/CustosNox
- ⚡ **Daemon health (для DevTools):** https://custos-daemon.up.railway.app/health

---

## SAVED IN MEMORY (что я записал глобально для будущих сессий)

См. `~/.claude/projects/C--Users-Yana/memory/MEMORY.md` — обновлены пометки про current submit состояние Custos Nox. (Запись делается отдельным шагом после этого файла.)

---

**Сгенерировано:** 2026-05-09 ~02:30 (после ночной аудит-сессии). Last commit перед аудитом: `13ed898`. Working tree clean.
