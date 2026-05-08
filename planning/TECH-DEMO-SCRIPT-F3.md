# F3 — Technical Demo Script (~3:00 min, English)
# REVISED 2026-05-08 v5 — DASHBOARD-FIRST. Replaces v4 (terminal-heavy, deprecated).

**Recording:** OBS Studio / Loom Desktop / Win+G. Screen only. Upload Loom (primary for Superteam UA) + YouTube Unlisted (backup, Arena A11).
**Target:** 2:55–3:05. **Browser-first**: 100% dashboard except a 10-sec architecture overlay and a 15-sec Discord cut. Zero terminal time.
**Why v5:** v4 was 70% terminal — judges who don't live in a CLI lose the thread, and Superteam UA's tech-demo guide explicitly calls "повний user flow" of the actual product. The DAO operator's real flow is the dashboard, not `npm run smoke:*`. v5 keeps every Drift-chain technical beat, but stages it inside the live mainnet monitor + alert feed. Devnet attack replay still happens — but rendered as alert cards in the dashboard, not terminal text.

---

## PRE-RECORDING SETUP (10 min)

**Daemon state — pick ONE:**

**(A) Mainnet (preferred — strongest narrative):**
- Railway daemon live at `https://custos-daemon.up.railway.app`, Helius RPC plugged in, `/health` returns `{"ok":true,"watching":8,...}`
- Vercel `NEXT_PUBLIC_CUSTOS_DAEMON_URL=https://custos-daemon.up.railway.app`
- Dashboard `#live` shows green dot + label "Live mainnet · N events"

**(B) Local devnet fallback (if Railway not finished):**
- `npm run dev` locally with devnet `.env`, dashboard env points to `http://localhost:8080`
- Label will read "Devnet sample · N events" — narration adapts to "this is the same UI on devnet"

**Devnet attack replay (for 1:40–2:30 section):**
- Need 4 alerts already sitting in the dashboard feed *before* recording, in this order: Timelock → Weakening → Privileged Nonce → Stale Nonce Execution
- Run smoke chain off-camera against a fresh devnet multisig:
  ```
  npm run smoke:create
  npm run smoke:timelock -- <PDA>
  npm run smoke:weaken -- <PDA>
  npm run smoke:nonce-init
  npm test src/detectors/stale-nonce-execution
  ```
- Confirm alert feed shows 4 rows. **If using mainnet daemon, run the smoke chain against a separate local daemon and screen-record THAT dashboard for the replay segment.** Do not contaminate the mainnet daemon's event log with devnet test alerts.

**Browser tabs (in this order, ready to switch):**
- **Tab 1:** dashboard hero — `https://custos-nox.up.railway.app` or local — scrolled to top
- **Tab 2:** Discord `#custos-alerts` — scrolled to bottom, 4 recent embeds visible

**Architecture overlay:**
- Pre-record `assets/pitch-slides/architecture.html` (10-sec capture). Drop into CapCut as overlay during 1:30–1:40.

---

## SCRIPT

---

### [0:00–0:25] — Hero: what's a DAO multisig, why Drift mattered (~25s)

*(Browser, dashboard hero — full screen)*

"DAOs on Solana hold their treasuries through multisig wallets — three-of-five signatures, like a corporate bank account.

Squads is the most popular multisig tool on Solana. Major protocol treasuries, grant committees, and security councils run on it. And until now, almost none of them had any monitoring.

Last April, that cost one protocol two hundred eighty-five million dollars. Nine days of on-chain preparation. Zero alerts."

---

### [0:25–0:50] — #live: multi-DAO mainnet monitor (~25s)

*(Scroll down to the `#live` section. The "Watching 12 Solana DAOs in real time" header + DAO grid are now full-screen.)*

*(Pause 1.5s — let the green status dots and DAO cards register.)*

"Custos Nox is watching twelve Solana DAOs on mainnet right now — Mango, Marinade, Pyth, Solend, Jupiter, Raydium, Orca, BonkDAO, plus Helius, Squads, Superteam, and MonkeDAO.

Each card links straight to its Realms page. The status dot on each card stays green while no anomalies fire — turns yellow on a single high-severity event, red on critical.

If any of these twelve changes a threshold, swaps a signer, or removes a timelock, Custos Nox catches it on the next slot."

---

### [0:50–1:30] — Detector cards: 5 detectors, Drift-chain mapping (~40s)

*(Scroll up to the "What it catches" section — 5 detector cards visible with severity tags + Drift-step labels.)*

"Five detectors run on every event. Four map directly onto steps from the Drift attack chain — and the fifth covers an adjacent attack vector that has hit other Solana protocols.

**Timelock removal** — Drift step one. The reaction window for the DAO is gone.

**Multisig weakening** — Drift step two. Three-of-five drops to one-of-five. Single-signer control.

**Privileged nonce** — Drift step three. The drain transaction is pre-signed and armed.

**Stale nonce execution** — Drift step four. The drain itself.

**Signer rotation** — adjacent vector. A legitimate signer is silently swapped for an attacker key. The threshold looks the same. The quorum is not.

Any one of these firing on Drift would have given hours of response time. Nine days, in the real attack."

---

### [1:30–1:40] — Architecture overlay (10s)

*(In CapCut: overlay `architecture.html` — fade in over the dashboard for 10 sec, fade out. No screen-cut.)*

"WebSocket subscription per DAO. Five detectors run in parallel on every event. When one fires, fan-out to Discord, Slack, and the dashboard alert feed — none of them block the others. Sub-second end-to-end."

---

### [1:40–2:25] — Alert replay: devnet attack chain in the dashboard (~45s)

*(Scroll to `#live` alert feed. Four alert rows visible from the prepared devnet replay.)*

"Here's what those four detectors look like firing back-to-back. This is a devnet replay of the Drift chain — same dashboard the operator would see on mainnet.

**First row** — Timelock removal. Severity CRITICAL. Subject: the multisig PDA. Solscan link to the exact transaction.

**Second row** — Multisig weakening. Severity HIGH. The context shows old threshold three, new threshold one.

**Third row** — Privileged nonce. CRITICAL. The drain transaction is now pre-signed and waiting.

**Fourth row** — Stale nonce execution. CRITICAL. The drain executes."

*(Click the second row — alert detail panel expands. Hold 3s.)*

"Each alert has the severity, the exact field that changed, the signer who did it, and a Solscan link. No log files. No grep. The team sees the chain unfolding in real time."

---

### [2:25–2:40] — Discord: same alerts, multi-channel fan-out (~15s)

*(Cut to Discord tab — four embeds visible in `#custos-alerts`. Slowly scroll through them, ~3 sec.)*

"Same four alerts, simultaneously, in Discord. Slack and the dashboard fired at the same instant.

If Drift had this running on March twenty-third, the first CRITICAL alert would have landed nine days before the drain."

---

### [2:40–3:00] — Setup + close (~20s)

*(Cut back to browser, scroll to the "Self-host in 5 minutes" footer section — three steps visible + GitHub URL.)*

"Three lines to set up. Open app dot squads dot so, copy your multisig PDA. Paste it into `CUSTOS_WATCH`. Add a Discord webhook. `npm run dev`.

MIT licensed. No paid tiers. Free Helius RPC tier is enough for a single DAO.

Solana Foundation's STRIDE program covers fifty protocols. The other ten thousand DAOs have nothing.

Custos Nox is for them.

github dot com slash cryptoyasenka slash custos hyphen nox."

*(Hold on the GitHub URL 2 sec. End.)*

---

## TIMING

| Section | ~Sec | On screen |
|---------|------|-----------|
| 0:00–0:25 Hero + Drift | 25 | Browser hero |
| 0:25–0:50 #live multi-DAO | 25 | Browser #live grid |
| 0:50–1:30 Detector cards | 40 | Browser detector cards |
| 1:30–1:40 Architecture overlay | 10 | architecture.html (CapCut overlay) |
| 1:40–2:25 Devnet replay in feed | 45 | Browser alert feed + detail |
| 2:25–2:40 Discord fan-out | 15 | Discord |
| 2:40–3:00 Setup + close | 20 | Browser footer |
| **Total** | **~3:00** | |

**Terminal time:** zero. Dashboard time: ~165s. Discord: ~15s. Architecture overlay: ~10s. Hero/footer browser: ~45s.

---

## KEY SENTENCES TO LAND

1. **"DAOs on Solana hold their treasuries through multisig wallets — three-of-five signatures, like a corporate bank account."** — opens with an analogy any judge understands
2. **"Last April, that cost one protocol two hundred eighty-five million dollars."** — the hook
3. **"Custos Nox is watching twelve Solana DAOs on mainnet right now."** — the multi-DAO traction signal, said flatly while the green dots are visible
4. **"Each card links straight to its Realms page."** — UI is real, not mocked
5. **"Four map directly onto steps from the Drift attack chain."** — the technical anchor
6. **"Same dashboard the operator would see on mainnet."** — bridges devnet replay to mainnet relevance
7. **"If Drift had this running on March twenty-third, the first CRITICAL alert would have landed nine days before the drain."** — emotional payoff on the Discord cut
8. **"The other ten thousand DAOs have nothing. Custos Nox is for them."** — close, three flat sentences

---

## WHAT JUDGES WILL REMEMBER

- They watched twelve real Solana DAOs being monitored on mainnet — clickable, verifiable on Realms — not a mockup
- They saw five detectors mapped step-by-step onto the actual Drift attack chain
- They watched four alerts fire in sequence in the dashboard feed during the devnet replay, with severity, context, and Solscan links
- They saw the same alerts mirrored in Discord — fan-out is real, not promised
- The setup story was three lines. Friction is zero
- The closing landed the gap quantitatively: STRIDE covers fifty, ten thousand have nothing

---

## RECORDING TIPS

- One smooth take, ~3 min total. Calm pace on the hero (0:00–0:25), don't rush
- On the `#live` grid: pause 1.5s before talking — let the green dots and DAO names register visually
- On detector cards: read each detector name slowly, with a beat between (`Timelock removal. … Multisig weakening. …`) — gives the technical density time to land
- Architecture overlay is post-production in CapCut — record the 10-sec sequence separately from `architecture.html` open in browser
- Alert replay: hover-click the second row deliberately so the detail panel reveals on camera (don't pre-expand)
- Discord switch: smooth tab change, no dragging — already maximized
- Setup section: scroll slowly across the three steps, read the env line clearly
- Upload to **Loom** (Superteam UA tech-demo guide requires Loom). YouTube Unlisted as backup
- Title: `Custos Nox — F3 Tech Demo (Solana Frontier 2026)`
- In **Arena A11**: paste YouTube URL. **Superteam Earn** Ukrainian track: paste Loom URL
- Verify both URLs work in incognito before pasting

---

## WHAT WAS DROPPED FROM v4 (intentionally, do not restore)

- ❌ Two-terminal layout — anti-pattern per Superteam UA guide ("не наочно — діаграма"); replaced with dashboard-first browser flow
- ❌ Live `npm run smoke:*` execution on camera — replaced with pre-recorded alert replay rendered inside the dashboard alert feed
- ❌ "Watch the left terminal" beats — terminal time in v5 is zero
- ❌ `npm test src/detectors/stale-nonce-execution` on camera — the 14-passing line is now a footer claim, not a screen moment

The technical content is identical: same 5 detectors, same Drift mapping, same fan-out story. The shell is dashboard, not terminal.
