# F2 — Инструкция по записи (на русском)

**Видео:** ~2:18 финальное (включая 6-8 сек Veo3 интро, который вшивается ПОТОМ в CapCut).
**Что записываешь:** только слайды deck-v2.html со своим голосом. Лицо не нужно.
**Скрипт нарратива (на английском):** `planning/PITCH-SCRIPT-F2.md` — читаешь оттуда.

---

## ШАГ 1 — Подготовка экрана (5 мин)

1. Открой в Chrome или Edge: `C:\Projects\custos\assets\pitch-slides\deck-v2.html`
2. Нажми **F11** — fullscreen
3. Внизу по центру должно быть `1 / 9` — это слайд 1 из 9
4. Прокликай стрелкой → все 9 слайдов один раз, проверь что анимации работают:
   - Слайд 1: счётчик `$285M` сам докручивается
   - Слайд 2: 4-step таймлайн появляется лесенкой
   - Слайд 3: счётчик `10,000+` крутится
   - Слайд 4: detector cards появляются по очереди
   - Слайд 5: счётчик `200+` тестов
   - Слайд 6: setup steps лесенкой
   - Слайд 7: v1/v2/v3 строки лесенкой
   - Слайд 8: команда (две колонки, OpenGradient модели)
   - Слайд 9: финал
5. Нажми **Home** чтобы вернуться на слайд 1

---

## ШАГ 2 — Запись (OBS / Loom / Win+G)

Любой инструмент записи экрана со звуком. Win+G встроенный — самый простой.

**Перед стартом:**
- Закрой все остальные окна и уведомления (Discord/Telegram/Slack — выйди или mute)
- Проверь уровень микрофона
- Имей рядом скрипт `planning/PITCH-SCRIPT-F2.md` на втором мониторе или телефоне

**Темп:** спокойный, builder-to-builder. Не торопись. Дай анимациям доиграть ДО того как переходишь к следующему слайду.

**Ключевые паузы:**
- Слайд 1: пауза ~1.5 сек пока крутится `$285M`
- Слайд 2: ~1.2 сек на лесенку (4 шага атаки)
- Слайд 3: ~1.8 сек на `10,000+`
- Слайд 5: ~1.2 сек на `200+`
- Слайд 8: ~1.5 сек чтобы успели появиться 3 OpenGradient модели

---

## ШАГ 3 — Что говорить на каждом слайде

Полные английские реплики — в `planning/PITCH-SCRIPT-F2.md`. Краткая шпаргалка:

| Слайд | ~Сек | О чём |
|-------|------|-------|
| 1 | 21 | Что такое Custos Nox + multisig 101 + Drift hook ($285M) |
| 2 | 16 | Chainalysis traced — 9 дней атака готовилась on-chain, 0 алертов |
| 3 | 14 | STRIDE покрывает 50, остальные 10,000+ — никто |
| 4 | 13 | Open-source TypeScript daemon, 5 детекторов = вся Drift chain + adjacent |
| 5 | 14 | 200+ тестов, sub-second latency, MIT — "if Drift had this on March 23rd..." |
| 6 | 16 | 5-min setup, no paid tiers, Public Goods Award + Solana grant |
| 7 | 10 | v1 today / v2 hosted feed / v3 mainnet watchlist |
| 8 | 18 | Команда (соло, Kyiv, Web3 security) + 3 модели на OpenGradient |
| 9 | 10 | Финал: github URL + "STRIDE covers 50. 10,000 DAOs have nothing. Custos Nox is for them." |

**Ключевые фразы которые ОБЯЗАТЕЛЬНО должны прозвучать чётко** (не глотать):
1. *"Real-time security monitor for Solana DAO multisigs"* (слайд 1)
2. *"Nine days of on-chain preparation. Zero alerts fired."* (слайд 1, после паузы)
3. *"Chainalysis traced the attack."* (слайд 2 опенер)
4. *"The other ten thousand have nothing."* (слайд 3 финал)
5. *"If Drift had this on March 23rd, the first CRITICAL alert would have fired nine days before the drain."* (слайд 5)
6. *"No paid tiers ever — Public Goods Award sustainability."* (слайд 6)
7. *"Three open-source security models on the OpenGradient TEE hub."* (слайд 8)
8. *"STRIDE covers fifty. Ten thousand DAOs have nothing. Custos Nox is for them."* (слайд 9, три отрывистых предложения)

---

## ШАГ 4 — После записи

1. Сохрани файл локально (НЕ заливай в `assets/` корень, gitignore не пропустит больше — но всё равно в `video-build/f2/` лучше)
2. Открой CapCut, прицепи в начало Veo3 интро (`assets/Blockchain_transactions_flow_red…_202605081236.mp4`, ~6-8 сек)
3. Экспорт MP4
4. Залей на YouTube (Unlisted)
5. Title: `Custos Nox — F2 Pitch (Solana Frontier 2026)`
6. Проверь URL в incognito что работает
7. Вставь URL в Arena форму (поле A10 / Pitch Video)

---

## Если что-то идёт не так

- **Анимация не докручивается** — нажми **R** на клавиатуре чтобы перезапустить слайд (если deck-v2.html поддерживает) или клавишу ←→ чтобы перейти и вернуться
- **Ошибся в записи** — записывай ОДНИМ дублем без монтажа если можешь (~2:20). Если запорол — стоп, перезапись с нуля. Не пытайся склеивать середины.
- **Время вышло за 2:30** — на слайде 7 можно сократить до "v1 self-hosted, free forever. v2 hosted feed. v3 mainnet watchlist." (экономит ~3 сек)

---

## Когда закончишь F2

Скажи мне — я к тому моменту прогоню smoke chain для F3 alert replay в фоне.
