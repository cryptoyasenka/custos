# Видео Week 3 — инструкция на русском

> **⚠️ АРХИВ 2026-04-26 — это для Week 3 Arena update, НЕ для Frontier submission 9 мая.**
>
> Скрипт писался когда было только 3 детектора и 133/135 тестов. Четвёртый
> детектор (StaleNonceExecutionDetector) и +12 тестов добавлены позже.
>
> Для финального submission (9 мая) использовать:
> - **F2 pitch (≤2 мин):** `PITCH-SCRIPT-F2.md`
> - **F3 tech demo (2–3 мин):** `TECH-DEMO-SCRIPT-F3.md`

**Цель:** 60–75 секунд видео. Доказать что Custos Nox — живой рабочий продукт, а не презентация. Главное — живая детекция на devnet, всё остальное — рамка. Загрузить до **2026-04-26**.

Всё уже в репо. Исходные данные прошлого прогона — в
`planning/demo-run-2026-04-19.md`. Английский оригинал этой
инструкции — в `planning/video-week-3.md`.

Скрипт озвучки на английском (стандарт Colosseum Arena). Если
хочется русский — скажи Claude, перепишу §5.

---

## 1. Подготовка (10 минут, один раз перед записью)

Нужен **свежий** мультисиг и nonce. Те, что мы использовали
19 апреля, уже "атакованы" (timelock=0, threshold=1, nonce
существует) — повторный прогон против них либо ничего не выдаст,
либо будет выглядеть странно на камере.

В `C:\Projects\custos` (обычный cmd):

```
git pull
npm ci
npm run smoke:create         # новый MULTISIG_PDA
npm run smoke:nonce-plan     # новый NONCE_PUBKEY
```

Открой `.env`, замени строку `CUSTOS_WATCH` на новые pubkey — или
скинь Claude вывод двух команд и он обновит сам.

Быстрая проверка перед записью:

- Баланс ≥ 0.1 SOL: `npm run setup:devnet`
- `npm test --silent` → 133 прошло
- Старый демон не запущен

---

## 2. Раскладка окон

Два терминала рядом, **крупный тёмный шрифт**, одинаковая ширина.
Ничего лишнего на экране — ни браузер, ни Discord, ни трей.

```
┌─────────────────────┬─────────────────────┐
│ Терминал 1          │ Терминал 2          │
│ (атакующий)         │ (демон)             │
│ C:\Projects\custos> │ npm run dev         │
│                     │  [custos] rpc=...   │
│                     │  [custos] subscribe │
└─────────────────────┴─────────────────────┘
```

Перед записью:

1. Терминал 2: `npm run dev`, дождись двух `subscribe account=...`,
   дай постоять 5 сек чтоб ничего лишнего не печаталось.
2. Терминал 1: **пустое приглашение**, готов к первой команде.

---

## 3. Запись экрана

Любой рекордер (OBS, Windows Game Bar — что привычно). Важно:

- **1080p+**, 30 fps достаточно
- **Системный звук выкл, микрофон вкл** (или пиши голос отдельно — проще перезаписать если что)
- Подсветка курсора вкл — видно куда ты печатаешь

**Во время записи терминалов в микрофон не говори.** Запиши экран
молча, потом отдельным проходом озвучь под таймлайн.

---

## 4. Шот-лист (что делаешь на экране)

8 шотов подряд, без монтажных склеек — один непрерывный дубль.
Экран ~55 сек, остальное интро/аутро.

| # | Действие                                                              | ~Время |
|---|-----------------------------------------------------------------------|--------|
| 1 | Терминал 2 — демон простаивает, видны обе подписки                    | 0–3 с  |
| 2 | Терминал 1: печатаешь `npm run smoke:timelock -- <PDA>`, Enter        | 3–8 с  |
| 3 | Терминал 2: **CRITICAL [squads-timelock-removal]** + Solscan + ctx. Держи 2–3 сек чтоб прочиталось. | 8–18 с |
| 4 | Терминал 1: `npm run smoke:weaken -- <PDA>`, Enter                    | 18–23 с |
| 5 | Терминал 2: **HIGH [squads-multisig-weakening]**, `3 → 1`. Держи      | 23–32 с |
| 6 | Терминал 1: `npm run smoke:nonce-init`, Enter                         | 32–38 с |
| 7 | Терминал 2: **CRITICAL [privileged-nonce]** + authority. Держи        | 38–48 с |
| 8 | Прокрути Терминал 2 чтоб все 3 алерта были видны одновременно         | 48–55 с |

**Совет:** если `smoke:timelock` или `smoke:weaken` долго
возвращаются — не вырезай ожидание. 2–5 секунд "жду подтверждения
tx" читается как настоящее; резкая склейка читается как
постановка.

---

## 5. Скрипт озвучки (английский, ~70 сек)

Читать спокойно и ровно — содержание само по себе драматичное.
Под каждой строкой — перевод чтобы ты понимала смысл.

**[0:00–0:06]** *(на фоне простаивающего демона)*

> Drift lost over twenty million dollars because a multisig config was
> quietly weakened before the attack, and nobody was watching.

*Перевод:* Drift потерял больше 20 миллионов долларов потому что конфиг
мультисига тихо ослабили перед атакой, и никто не смотрел за цепочкой.

**[0:06–0:15]**

> Custos Nox is an open-source daemon that watches Solana multisigs and DAOs
> for the exact config changes that enable attacks like that. Three
> detectors, TypeScript, self-hostable, works with any RPC.

*Перевод:* Custos Nox — open-source демон, который следит за Solana-
мультисигами и DAO на те самые изменения конфигов, что делают такие
атаки возможными. Три детектора, TypeScript, self-hosted, работает с
любым RPC.

**[0:15–0:22]** *(загорается Терминал 1)*

> Here's a three-of-five Squads multisig I just created on devnet.
> Daemon is subscribed, baseline seeded.

*Перевод:* Вот 3-of-5 Squads-мультисиг, который я только что создала на
devnet. Демон подписан, baseline загружен.

**[0:22–0:32]** *(появился алерт №1)*

> Step one of the Drift chain — zero out the timelock. Critical alert in
> under a second, with a Solscan link and machine-readable context.

*Перевод:* Шаг 1 Drift-цепочки — обнулить timelock. Critical-алерт
меньше чем за секунду, со ссылкой на Solscan и машиночитаемым
контекстом.

**[0:32–0:42]** *(алерт №2)*

> Step two — drop the threshold from three to one. That's the attacker
> giving themselves a solo key. High-severity alert, same pipeline.

*Перевод:* Шаг 2 — уронить threshold с 3 до 1. Это атакующий выдаёт
себе единоличный ключ. High-алерт, тот же pipeline.

**[0:42–0:55]** *(алерт №3)*

> And the one Drift actually missed — an attacker initializing a durable
> nonce they control, so a pre-signed transaction lands later on their
> schedule. Critical. Three attacks, three alerts.

*Перевод:* И тот, который Drift в реальности проспал — атакующий
инициализирует durable nonce под своим контролем, чтобы заранее
подписанная транзакция прилетела позже по его расписанию. Critical. Три
атаки — три алерта.

**[0:55–1:10]**

> This is shipped code, on main, verified live on devnet, a hundred and
> thirty-three tests green. Discord and Slack sinks already wired up.
> Week four: the stale-nonce-execution detector and a hosted demo. Repo
> is github dot com slash cryptoyasenka slash custos dash nox.

*Перевод:* Это отгруженный код, в main, проверен на живом devnet, 133
теста зелёные. Discord и Slack sinks уже работают. 4-я неделя:
stale-nonce-execution детектор и hosted-демо. Репо:
github.com/cryptoyasenka/custos-nox.

Если захочется короче — выкинь второе предложение из [0:06–0:15] и
"works with any RPC".

---

## 6. Монтаж

Минимальный edit:

1. Отрезать тишину в начале и в конце.
2. Положить озвучку поверх записи экрана. Если демо длиннее озвучки —
   ускорь **ожидания** (между вводом команды и алертом) в 1.5–2×, а
   кадры с алертами оставь 1× чтоб читались.
3. **Титульная карточка** первые 2 секунды: `Custos Nox — live multisig
   monitor / Week 3 update`.
4. **Финальная карточка** последние 2 сек: URL репо текстом.

Экспорт: 1080p, MP4, H.264, ≤100 MB.

---

## 7. Публикация

**Главное — пост в X.** Черновик:

```
Week 3 update on Custos Nox — an open-source Solana multisig/DAO monitor
that would have caught the Drift config drift before the drain.

Three detectors, live on devnet. Critical / High / Critical,
sub-second, with Solscan links.

github.com/cryptoyasenka/custos-nox

#Solana #SolanaHackathon #Colosseum
```

MP4 прикладывай прямо к твиту (внутренние видео охватнее внешних
ссылок).

**Дополнительно — Colosseum Arena dashboard.** Вставить URL твита в
поле Week 3 update до 2026-04-26 23:59 PDT.

**Опционально:** залить на YouTube unlisted-видео и линкнуть из README
чтобы в репо было постоянное демо.

---

## 8. Если что-то сломается во время записи

- Демон молчит после команды атаки → смотри tx signature в Терминале 1,
  подставь в `solscan.io/tx/<sig>?cluster=devnet`. Если tx прошла но
  алерта нет — демон потерял WebSocket. Ctrl+C → `npm run dev` →
  повторить атаку.
- `smoke:timelock` ругается на `insufficient funds` → `npm run setup:devnet`.
- Совсем ничего не печатается → проверь что `.env` указывает на
  **новый** PDA/nonce, а не на вчерашние.

Снимай хорошие дубли, не пытайся чинить сломанный. Каждый ретрай ~0.005
SOL.
