# F3 запись — два варианта (выбираешь утром 2026-05-09)

**Контекст:** Daemon живой на Railway → `https://custos-daemon.up.railway.app/health`. Мониторит 12 mainnet DAO (после redeploy с расширенным `CUSTOS_WATCH`). Live mainnet alerts стримятся через HTTP sink.

Скрипт записи (текст + слайды + переключения) уже готов в `planning/TECH-DEMO-SCRIPT-F3.md` v5 (dashboard-first). Голос готов в `video-build/f3/voice/` (9 chunks, ~3:08, AriaNeural). **Скрипт и голос для обоих вариантов одинаковые** — различается только запуск дашборда перед записью.

---

## ВАРИАНТ A — Railway daemon (рекомендую)

**Плюсы:**
- Не зависит от твоего ноута — daemon на Railway, не упадёт во время записи если винда чихнёт
- Живой 24/7 → можно перезаписывать сколько раз хочешь без перезапуска daemon
- "Hosted production" звучит сильнее для жюри если они откроют DevTools и увидят запросы на `custos-daemon.up.railway.app`
- Только 1 терминал нужен (для дашборда)

**Минусы:**
- Зависит от Railway не падать в момент записи (но он стабилен сейчас, проверено)
- Если Railway снова заблокирует — fallback в вариант B на лету

**Шаги перед записью:**

1. Проверь что daemon живой:
   ```
   curl https://custos-daemon.up.railway.app/health
   ```
   Должно вернуть `{"ok":true,"watching":12,...}`. Если 8 — redeploy ещё не докатился, подожди 1-2 минуты.

2. PowerShell (один терминал):
   ```powershell
   cd C:\Projects\custos\dashboard
   $env:NEXT_PUBLIC_CUSTOS_DAEMON_URL = "https://custos-daemon.up.railway.app"
   npm run dev
   ```

3. Открыть Chrome на `http://localhost:3000` → секция #live.

4. Проверить что вверху написано **"Live mainnet · N events"** (не "Devnet sample"). Если "Devnet sample" — daemon не достаётся, проверь env переменную или curl health.

5. Запускать запись по `planning/TECH-DEMO-SCRIPT-F3.md`.

---

## ВАРИАНТ B — fully local (fallback)

**Плюсы:**
- Полный контроль — daemon у тебя на ноуте, никаких внешних зависимостей
- Если хочешь форсировать тестовый alert (для драматического момента) — можно прямо в коде daemon'а сэмулировать событие

**Минусы:**
- Нужно 2 терминала (daemon + dashboard)
- Если ноут уйдёт в сон во время паузы — daemon упадёт, придётся перезапускать
- Helius rate limit (10 RPS на free tier) считается с твоего IP — если будешь долго репетировать, могут случайно прижать

**Шаги перед записью:**

1. Терминал 1 (PowerShell или Git Bash) — daemon:
   ```powershell
   cd C:\Projects\custos
   $env:CUSTOS_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=2e45da34-dfeb-4bc7-a85c-472e8c16e357"
   $env:CUSTOS_CLUSTER = "mainnet"
   $env:CUSTOS_HTTP_PORT = "8080"
   # CUSTOS_WATCH — взять полную строку 12 PDA из .planning/MAINNET-WATCHLIST.md (раздел "Tier 1 + Tier 2")
   $env:CUSTOS_WATCH = "GqTPL6qRf5...,GMnke6kx...:B1CxhV1k..."
   npm run dev
   ```
   В логе должно появиться `Watching 12 accounts across N programs`.

2. Терминал 2 — dashboard:
   ```powershell
   cd C:\Projects\custos\dashboard
   # NEXT_PUBLIC_CUSTOS_DAEMON_URL НЕ ставим → fallback на http://localhost:8080
   npm run dev
   ```

3. Открыть `http://localhost:3000` → проверить что вверху **"Live mainnet · N events"**.

4. Запускать запись.

---

## Быстрая проверка перед стартом записи (любой вариант)

| Что | Куда смотреть | Что должно быть |
|-----|---------------|-----------------|
| Daemon живой | curl health | `"ok":true, "watching":12` |
| Дашборд читает daemon | Полоса сверху #live | "Live mainnet · …" (не "Devnet sample") |
| 12 карточек DAO | Сетка карточек | Все имеют статус-точку |
| F2 deck готов | `assets/pitch-slides/deck-v2.html` | 9 слайдов открываются |
| F2 voice готов | `video-build/f2/voice/` | 9 mp3 на месте |
| F3 voice готов | `video-build/f3/voice/` | 9 mp3 на месте |
| F3 скрипт | `planning/TECH-DEMO-SCRIPT-F3.md` | v5 dashboard-first |

## Что было с Railway ночью (для справки, не для записи)

7 деплоев упали подряд из-за зависшего server-side кэша `rootDirectory`: UI говорил `.`, а build daemon упрямо брал `dashboard/` как build context. Параллельно Railway имел публичный SSL incident (status.railway.com/incident/1QD5978Z, May 8 20:09 UTC, "Elevated error rates for SSL Certificate Issuance"). Это формально про custom domains, но указывает что у них в эту ночь была более широкая проблема с infra config propagation. Когда ты утром нажала "Deploy" руками — кэш слетел, build взял свежий `rootDirectory=''` (пустой = repo root) и собрался корректно. Лог успешного деплоя показывает `[DBUG] root directory set as ''` против старого `'dashboard'`. Workaround в коде (`Dockerfile` с `COPY . .` вместо `COPY src ./src`, `railway.json` с pinned Dockerfile builder) остался — он не помешает, и страхует на случай если Railway снова съедет на auto-detect.

---

**После записи (любой вариант):**
1. F2 (pitch) → YouTube Unlisted upload
2. F3 (demo) → Loom (primary, требование Superteam UA) + YouTube Unlisted (backup)
3. URLs → Arena A10/A11 + Superteam Earn форма
4. Deadline 2026-05-10 23:59 PDT
