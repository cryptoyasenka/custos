# Helius API Key Reroll — утренний runbook 2026-05-09

> **STATUS: ✅ DONE 2026-05-09 morning.** Старый ключ `2e45da34-...` revoked в Helius dashboard, новый ключ установлен в Railway env (`custos-nox` service → `CUSTOS_RPC_URL`), daemon redeployed и подтверждён `watching:12`. Новый ключ нигде в репо не лежит, только в Railway. Файл оставлен как post-mortem reference.

**Зачем (была):** Helius API key утёк в public git (`planning/F3-RECORDING-OPTIONS.md` line 60 в коммитах `deb510d`, `005cd9f`). Любой может grab и сжечь 1M req/mo лимит. Чем дольше ключ живой — тем выше шанс что judges откроют красную галочку или daemon откажет посреди записи F3.

**Время:** ~5 минут от начала до verify.

**Старый ключ (для revoke):** `2e45da34-dfeb-4bc7-a85c-472e8c16e357` (НЕ копировать в новые места). После revoke — безвреден даже в git history.

---

## Шаг 1 — Revoke + create new key (~2 мин)

1. Открыть https://dashboard.helius.dev → Login (your account).
2. Sidebar → API Keys (или Endpoints в зависимости от UI версии).
3. Найти ключ `2e45da34-dfeb-4bc7-a85c-472e8c16e357` (если показывает первые/последние символы — `2e45da34...e16e357`).
4. **Revoke / Delete** этот ключ.
5. **Create new key** → дефолтные настройки (mainnet free tier 1M req/mo, 10 RPS).
6. Скопировать новый ключ в clipboard. Никуда больше не вставлять.

---

## Шаг 2 — Update Railway env (~1 мин)

В PowerShell (или Git Bash, разница только в обрамлении):

```powershell
cd C:\Projects\custos
railway variables -s custos-nox --set "CUSTOS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=<NEW_KEY>"
```

Заменить `<NEW_KEY>` на новый ключ из Шага 1.

Сервис в Railway называется `custos-nox` (это daemon, исторически — был оригинальным сервисом до URL swap; см. CURRENT.md "Railway state").

Команда автоматически триггерит redeploy.

---

## Шаг 3 — Wait redeploy + verify (~2 мин)

```bash
# опционально — посмотреть логи деплоя
railway logs -s custos-nox

# через ~60-90 сек проверить health
curl https://custos-daemon.up.railway.app/health
```

Должно вернуть `{"ok":true,"watching":12,...}`.

Если `watching` = 0 или curl падает после 2 минут — ключ скопирован неправильно или Helius ещё не активировал new key. Подождать ещё минуту, повторить.

---

## Шаг 4 — Verify file is sanitized (~30 сек)

`planning/F3-RECORDING-OPTIONS.md` line 60 уже заменён на `<YOUR_HELIUS_KEY>` placeholder ночью (commit будет в логах перед reroll). Просто убедись:

```bash
cd /c/Projects/custos
grep -n "2e45da34" planning/ .planning/ -r
# должно быть только в .planning/AUDIT-NIGHT-2026-05-09.md как историческая запись
# (там ключ упомянут как "старый ключ для revoke" в этом самом runbook)
```

Если grep находит 2e45da34 в `planning/F3-RECORDING-OPTIONS.md` — заменить на placeholder вручную.

---

## Шаг 5 — Если будешь делать F3 recording через Variant B (local mainnet daemon)

Положи новый ключ в локальную переменную, НЕ коммить:

```powershell
$env:CUSTOS_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=<NEW_KEY>"
```

Или экспортируй в `.env` (он в `.gitignore`).

---

## Не делать

- ❌ НЕ коммитить новый ключ в git, даже в `.planning/`. Используй placeholder + локальный env.
- ❌ НЕ переписывать git history через `git filter-branch` / `git filter-repo` — старые коммиты с утёкшим ключом останутся в `cryptoyasenka/custos-nox` форках если кто-то клонировал. Revoke — единственный реальный фикс.
- ❌ НЕ удалять `.planning/AUDIT-NIGHT-2026-05-09.md` секцию с упоминанием старого ключа — она нужна для post-mortem; ключ там как историческая запись после revoke безвреден.

## Если что-то пошло не так

| Симптом | Причина | Фикс |
|---------|---------|------|
| Railway redeploy висит >5 мин | Запутался serverside cache (был случай ночью) | Зайти в Railway dashboard → custos-nox → Deployments → "Redeploy" вручную |
| /health возвращает `watching:8` вместо 12 | CUSTOS_WATCH сбился | `railway variables -s custos-nox` — проверить что CUSTOS_WATCH = full 12 PDA string из `.planning/MAINNET-WATCHLIST.md` Tier 1+2 |
| Helius dashboard не пускает | Cookies / 2FA | Использовать другой браузер или incognito |
| New key всё ещё показывает rate limit ошибки | Helius caching | Подождать 5-10 мин, повторить curl |

## Final state after runbook

- ✅ Старый ключ revoked в Helius dashboard
- ✅ Новый ключ только в Railway env + локальный `.env`
- ✅ `https://custos-daemon.up.railway.app/health` отдаёт `watching:12`
- ✅ `planning/F3-RECORDING-OPTIONS.md` без inline ключа
- ✅ Submit-blocker снят — можно записывать F3
