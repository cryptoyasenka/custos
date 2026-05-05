# Terminal Recording — F2 Pitch Video

**Длина записи:** 80–85 секунд  
**Что показываем:** daemon запускается → ONE detector (smoke:timelock) → Discord алерт  
**Что НЕ показываем (сберегаем для F3):** smoke:weaken, smoke:nonce-init, smoke:stale, npm test, CI badge

---

## Настройки перед записью

**Терминал:**
- Windows Terminal → тёмная тема (уже должна стоять)
- Шрифт: 17pt минимум (чтобы читалось на мобильном у судьи)
- Путь: `C:\Projects\custos\`
- Layout: **два pane** — левый (daemon), правый (команды)
  - Открыть: `Alt+Shift+Plus` в Windows Terminal = вертикальный split

**Параллельно открытое (заранее):**
- OBS/Loom готов к записи

**Увеличить курсор:** Settings → Accessibility → Cursor thickness → 3

---

## Шаги записи (≈80 сек)

### ► Начало записи

---

**[0–3 сек] — ЛЕВЫЙ PANE, пустой терминал**  
Ничего не делай — просто покажи что терминал чистый.

---

**[3–6 сек] — ЛЕВЫЙ PANE, запуск daemon**

Напечатай (медленно, чтобы было видно):
```
npm run dev
```
Нажми Enter.

---

**[6–18 сек] — ЛЕВЫЙ PANE, daemon стартует**

Ждёшь пока появятся строки:
```
[custos-nox] Daemon starting...
[custos-nox] Seeding baseline for 2 accounts...
[custos-nox] Watching: J99VK4... (Squads multisig)
[custos-nox] Watching: D4nxJX... (durable nonce)
[custos-nox] Baseline seeded. Watching 2 accounts.
```
*Если что-то не так с devnet — скажи Claude "daemon не стартует", сгенерируем pre-flight заново*

Оставь daemon работающим. **Переключись в ПРАВЫЙ pane** (`Alt+→` или клик).

---

**[18–30 сек] — ПРАВЫЙ PANE, показываем что смотрим**

Напечатай (или просто подожди 5 сек — daemon уже показывает что он в режиме ожидания):
```
# Watching for governance attacks...
```
*(это просто комментарий — не обязательно, можно просто пауза)*

Держи экран на этом виде ≈8 секунд. Визуально: daemon ждёт, ничего не происходит — это напряжение перед алертом.

---

**[30–45 сек] — ПРАВЫЙ PANE, запуск smoke:timelock**

Напечатай:
```
npm run smoke:timelock
```
Нажми Enter.

Команда выполняется ~5 секунд.

---

**[45–55 сек] — ЛЕВЫЙ PANE, смотрим алерт**

Сразу переключись в ЛЕВЫЙ PANE (клик мышью или `Alt+←`).

Должно появиться:
```
[CRITICAL] TimelockRemovalDetector
  Account: J99VK4xkxkaDXwnPazfgs2nr2Ysi6b4vszUTDX97Tvii
  Change:  timelock 0d → removed
  Link:    https://solscan.io/tx/...
```
*(фон строки CRITICAL должен быть красным — если нет, скажи Claude)*

Держи этот экран ≈7 секунд. Пусть судья прочитает.

---

**[55–80 сек] — держи терминал, дай алерту "отдышаться"**

Не нажимай ничего. Пусть CRITICAL алерт остаётся на экране.  
Курсор мигает, daemon ждёт — это хорошо, выглядит как живая система.

Можно медленно прокрутить вверх чтобы был виден и daemon output и алерт одновременно.

Держи ≈20 секунд.  
**Остановить запись.**

---

## После записи

Сохранить как: `video-build/f2/terminal-f2.mp4`

Если получилось короче 75 сек — нормально, просто скажи мне длину и обновлю build-f2.sh.  
Если дольше 90 сек — обрежем через ffmpeg.

---

## Что СОХРАНЯЕМ для F3 (не показывать сегодня)

| Команда | Детектор | Для чего |
|---|---|---|
| `npm run smoke:weaken` | MultisigWeakeningDetector | F3 детектор #2 |
| `npm run smoke:nonce-init` | PrivilegedNonceDetector | F3 детектор #3 |
| `npm run smoke:stale` | StaleNonceExecutionDetector | F3 детектор #4 |
| `npm test` | 147 tests passing | F3 финальный слайд |
| GitHub CI badge screenshot | | F3 outro |
