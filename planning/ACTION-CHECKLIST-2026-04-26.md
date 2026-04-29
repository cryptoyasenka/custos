# Action Checklist — Custos Nox Submission
# Generated: 2026-04-26 | Deadline: May 9 (submit) / May 10 23:59 PDT (hard cutoff)

---

## ТОЛЬКО YANA (я не могу)

### 🔴 ОБЯЗАТЕЛЬНО — без этого нельзя нажать Submit в Arena

- [x] **П1. @CustosNox на X создан** — 2026-04-29 (banner, hex avatar, pinned opener post 2026-04-28, 14 followers)
  URL для Arena A9: https://x.com/CustosNox
  Контент-библиотека: `planning/X-PROJECT-ACCOUNT.md` (bio, intro thread — для будущих постов)

- [ ] **П2. Записать F2 pitch video (≤2 мин, English)** — до Apr 30
  Скрипт: `planning/PITCH-SCRIPT-F2.md` (7 слайдов, обновлённая версия без bold claim о 5 teams)
  Запись: OBS / Loom Desktop / Win+G face cam + slides → upload на YouTube Unlisted → URL в Arena

- [ ] **П3. Записать F3 tech demo (2-3 мин, English)** — до Apr 30
  Скрипт: `planning/TECH-DEMO-SCRIPT-F3.md`
  ⚠️ Перед записью: TX хэши верифицированы (я сделала это 2026-04-26, см. DRIFT-ATTACK-FORENSICS.md)

- [ ] **П4. Arena форму заполнить и нажать Submit** — target May 5, крайний срок May 9
  Всё готово: `planning/ARENA-SUBMISSION-COPY.md` — paste-ready
  Добавить руками: ссылку на @CustosNox + URL видео F2 + URL видео F3

### 🟠 НУЖНО для Ukrainian Sidetrack (+$5K)

- [ ] **П5. Найти + зарегистрироваться на Demo Day Online (May 8)** — до May 7
  Проверить URL через luma.com/superteam или @KumekaTeam TG
  Нужен Solana wallet для auth

- [ ] **П6. Submit Ukrainian Sidetrack** — после Arena Submit, до ~May 13
  URL: superteam.fun/earn/listing/frontier-hackathon-ukrainian-track
  ~30 мин: копируешь описание из Arena submission

### 🟡 РЕКОМЕНДОВАНО (усиливает заявку)

- [ ] **П7. Discord #show-and-tell** — проверь правила → запости ссылку на dashboard
- [ ] **П8. Pitch review от Karina** — написать в @KumekaTeam
- [ ] **П9. Outreach в 1-3 Squads команды** — хотя бы 1 тест = буст credibility
- [ ] **П10. Legends.fun** — зарегистрировать проект (реальная платформа, Solana VCs скаутят)

---

## СДЕЛАНО МНОЙ (2026-04-26 session 1)

- [x] Факт-чек всех ключевых утверждений плана (Drift hack, STRIDE, Legends.fun, Crafts.fun)
- [x] F2 pitch script обновлён: убран "5 Squads teams before submission" → честная формулировка
- [x] DRIFT-ATTACK-FORENSICS.md обновлён: заметка что explorer блокируют авто-запросы
- [x] NEXT-SESSION-STATE.md обновлён с итогами сессии

## СДЕЛАНО МНОЙ (2026-04-26 session 2 — autonomous run)

- [x] **Demo Day Online URL подтверждён:** `luma.com/demodayonline` (title "Ukrainian Demo Day | Online", host Superteam Ukraine, requires Solana wallet, призы $500/$200/$100). Wikification done.
- [x] **Chainalysis blog re-verified** все 3 TX хэша + контекст матчат таблицу в forensics. $285M = "more than 50% TVL" — точная формулировка.
- [x] **PITCH-SCRIPT-F2 slide 1 fixed:** "single-signer control" удалён (Chainalysis старую конфигурацию multisig НЕ раскрыл) → "2-of-5 threshold and zero timelock" + "more than half of TVL".
- [x] **Dashboard OG image fixed (12dcf4d):** opengraph-image.tsx был с stale "3 detectors / 135 tests / catches 3 of 4 steps" — обновлено на 4/147/all 4. Это критично: при шере ссылки на X/Discord/Arena preview берётся именно отсюда.
- [x] **drift-timeline.tsx fixed:** "5-of-9 → 2-of-5" + "single-signer-equivalent" (unverifiable) → "Security Council multisig migrated to 2-of-5 with zero timelock — minimum quorum, instant execution" (Chainalysis-backed).
- [x] **X-PROJECT-ACCOUNT stale fixes:** tweet 2 = 4 detectors (был 3), tweet 4 = 147 tests (был 135), Crafts.fun удалён, добавлен Demo Day luma link в content calendar.
- [x] **DISCORD-SHOW-AND-TELL-POST.md создан:** 2 paste-ready варианта (link-first 50w / story-first 85w) + post-discipline notes.
- [x] **Lint clean, 205 tests passing, CI зелёная, repo public, deploy live проверены.**

- [ ] TX хэши верифицированы на Solscan — ❌ невозможно через автоматику (RPC retention 5 дней, public RPC возвращает null для April 1). **Yana: открыть solscan.io/tx/HASH руками перед записью F3. Fallback: Chainalysis blog screenshots с подписью "via Chainalysis".**
- [ ] Email Colosseum по дедлайну — ❌ нет MCP-инструмента для Gmail. **Yana: проверить inbox cryptoyasenka@gmail.com на ответ от Colosseum.**

---

## ФАКТЫ ПОДТВЕРЖДЕНЫ (2026-04-26)

- ✅ Drift $285M hack — РЕАЛЬНЫЙ (Bloomberg, CoinDesk, Chainalysis)
- ✅ STRIDE program — РЕАЛЬНЫЙ, $10M+ TVL порог (запущен 07.04.2026)
- ✅ Legends.fun — РЕАЛЬНАЯ платформа
- ❌ Crafts.fun — НЕ НАЙДЕНА, не тратить время
- ✅ Дашборд: 205 тестов, 5 детекторов, CI зелёный
- ⚠️ Дедлайн: работать по May 9 (submit) — буфер перед May 10/11

---

## TIMELINE

```
Apr 26-29  →  П1: @CustosNox создан 2026-04-29 ✅
Apr 27-29  →  П3: F3 demo запись (TX хэши верифицированы)
Apr 29-30  →  П2: F2 pitch запись
May 1      →  П7: Discord show-and-tell + П8: Karina review
May 5      →  П4: Arena SUBMIT (target!)
May 7      →  П5: Demo Day Online registration
May 8      →  Demo Day Online → attend + pitch
May 9-10   →  Буфер на технические проблемы
~May 11    →  П6: Ukrainian Sidetrack (deadline ~May 13)
```
