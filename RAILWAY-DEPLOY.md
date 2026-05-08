# Railway deploy — custos-nox daemon

**Status (2026-05-08):** project linked, non-secret env vars set, deploy NOT triggered yet — waiting on Helius mainnet RPC URL from Yana.

Public domains (after URL swap 2026-05-09):
- Daemon (API): `https://custos-daemon.up.railway.app`
- Dashboard (website, what judges visit): `https://custos-nox.up.railway.app`

---

## What's already done

- Railway project `custos-nox` linked to `C:/Projects/custos/` (production env, service `custos-nox`)
- Env vars set via `railway variable set --skip-deploys`:
  - `CUSTOS_CLUSTER=mainnet`
  - `CUSTOS_HTTP_PORT=8080` (Railway routes the public domain to this port by default)
  - `CUSTOS_WATCH=` Tier 1 string (8 DAOs: Mango, Marinade, Pyth, Solend, Jupiter, Raydium, Orca, BonkDAO) — verbatim from `.planning/MAINNET-WATCHLIST.md` line 71
- `Dockerfile` already in repo (Node 20 alpine, multi-stage, runs `node dist/daemon.js` as unprivileged user). Railway will build via Dockerfile, no nixpacks needed.
- HTTP server in `src/alerts/http.ts` binds to `0.0.0.0` implicitly (Node `listen(port, cb)` default) — required for Railway container networking.

## What Yana needs to do (3 steps)

### Step 1 — paste Helius mainnet RPC URL

```bash
cd C:/Projects/custos
railway variable set "CUSTOS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=<YOUR_KEY>"
```

Replace `<YOUR_KEY>` with your Helius API key. The same one you'd use for any mainnet integration. Setting this triggers an auto-deploy (we omit `--skip-deploys`).

**Optional second var** — only if you want WebSocket subscriptions instead of polling (lower latency, matches Helius pricing tier):

```bash
railway variable set "CUSTOS_WS_URL=wss://mainnet.helius-rpc.com/?api-key=<YOUR_KEY>"
```

If unset, daemon falls back to polling — totally fine for the demo.

**Optional third var** — Discord webhook for production alerts (separate from devnet `.env`):

```bash
railway variable set "CUSTOS_DISCORD_WEBHOOK=<your-webhook-url>"
```

Skip this if you'd rather not mix mainnet alerts into the devnet test channel. The dashboard live feed works without Discord.

### Step 2 — verify deploy succeeded

```bash
railway logs 2>&1 | head -50
```

Look for these lines:
- `daemon starting (cluster=mainnet, watching N accounts)`
- `http endpoint listening on :8080`

If you see `RPC error` or `connection refused`, the Helius URL is wrong — re-set it.

Then hit the live endpoint:

```bash
curl https://custos-daemon.up.railway.app/health
```

Should return `{"ok":true,"watching":8,"uptime":..,"lastEventAt":null,"alertsServed":0}` until first real on-chain event.

### Step 3 — wire dashboard on Vercel

In the Vercel project for `custos-nox` dashboard:

1. Settings → Environment Variables
2. Add: `NEXT_PUBLIC_CUSTOS_DAEMON_URL=https://custos-daemon.up.railway.app`
3. Apply to: Production (and Preview if you want PR previews to see live feed)
4. Redeploy from Vercel dashboard (or push any commit to trigger)

After redeploy, dashboard `#live` section flips from devnet sample to live mainnet (status dot turns green, "Live mainnet · N events" replaces "Devnet sample · 6 events").

---

## Troubleshooting

**Deploy fails on build:** check `railway logs` — most likely `npm ci` exit code. The Dockerfile runs `npm ci` (lockfile must match `package.json`). If you've added deps locally, `npm install && git add package-lock.json && git commit && git push` first.

**Daemon crashes immediately:** missing or malformed `CUSTOS_RPC_URL`. Run `railway variables --json | grep CUSTOS_RPC_URL` to confirm the value.

**Dashboard says "daemon offline":** `NEXT_PUBLIC_CUSTOS_DAEMON_URL` not set on Vercel, or Railway service is down. The fallback to devnet sample alerts is by design — judges still see something.

**Need to roll back:** `railway redeploy <previous-deployment-id>` from `railway deploy list`.

---

## Linked references

- `.planning/MAINNET-WATCHLIST.md` line 71 — Tier 1 CUSTOS_WATCH source
- `.env.example` — full env var docs (devnet + mainnet shapes)
- `src/alerts/http.ts` — HTTP endpoint code (CORS, /events, /health)
- `dashboard/lib/daemon-feed.ts` — dashboard polling (5s interval, 4s timeout)
