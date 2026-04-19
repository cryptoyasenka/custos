# Week 3 Arena update video — recording instructions

Target upload date: **2026-04-26**. Goal: 60–75 sec video proving
Custos is a working product, not a pitch deck. Live detection on
devnet is the centerpiece — everything else is framing.

Everything referenced below is already on `main` (commit `ed87daf` or
later). Source data for the demo is captured in
`planning/demo-run-2026-04-19.md`.

Language of the script below is English (Colosseum Arena convention).
If you want a Russian voiceover — say so, I'll rewrite the narration
and keep the shot list.

---

## 1. Pre-flight (10 minutes, once)

Before hitting record, spin up **a fresh** multisig + nonce pair.
The set from the 2026-04-19 run is already attacked (timelock=0,
threshold=1, nonce exists) — a re-run against the same accounts
would either no-op or look confusing on camera.

In `C:\Projects\custos` (Command Prompt is fine):

```
git pull
npm ci
npm run smoke:create            # prints a new MULTISIG_PDA
npm run smoke:nonce-plan        # prints a new NONCE_PUBKEY, writes .smoke-nonce.json
```

Open `.env` and replace the `CUSTOS_WATCH` line so it points at the
**new** PDA and the **new** nonce pubkey:

```
CUSTOS_RPC_URL=https://api.devnet.solana.com
CUSTOS_WS_URL=wss://api.devnet.solana.com
CUSTOS_CLUSTER=devnet
CUSTOS_WATCH=SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf:<NEW_MULTISIG_PDA>,11111111111111111111111111111111:<NEW_NONCE_PUBKEY>
```

Quick sanity check before recording:

- Balance ≥ 0.1 SOL: `npm run setup:devnet` (tops up via faucet if low).
- `npm test --silent` returns 133 passing.
- No stale daemon is running from the previous session.

---

## 2. Window layout for recording

Two terminals, side by side, **large dark font**, same width. Nothing
else visible — no browser tabs, no Discord, no system tray clutter.

```
┌──────────────────────────┬──────────────────────────┐
│ Terminal 1               │ Terminal 2               │
│ (attacker side)          │ (daemon side)            │
│                          │                          │
│ C:\Projects\custos>      │ npm run dev              │
│                          │  [custos] rpc=...        │
│                          │  [custos] subscribe ...  │
└──────────────────────────┴──────────────────────────┘
```

Before you hit record:

1. Terminal 2: start the daemon — `npm run dev`. Wait until you see
   `[custos] subscribe account=...` for both watched accounts. Let
   it sit idle for 5 seconds to confirm nothing else prints.
2. Terminal 1: **empty prompt**, ready for the first attack command.

---

## 3. Recording the screen

Use any screen recorder you already have (OBS, Windows Game Bar,
whatever). Settings that matter:

- **1080p or higher**, 30 fps is enough.
- **System audio off**, microphone on (or record narration separately
  and mux later — probably cleaner).
- **Cursor highlight on** if your recorder supports it — makes the
  "I'm typing in Terminal 1" beat obvious without narration.

Don't speak into the mic while recording the terminals. Record the
screen silent, then do a separate voiceover pass against the
timeline. Easier to re-do narration without re-doing the demo.

---

## 4. Shot list (what to do on screen)

Eight shots total. Record them in order, no cuts — one take of the
whole demo. Total screen time ~55 seconds; the rest is intro/outro.

| # | Screen action                                               | ~Time |
| - | ----------------------------------------------------------- | ----- |
| 1 | Terminal 2 visible, daemon idle, both subscriptions shown.  | 0–3s  |
| 2 | Terminal 1: type `npm run smoke:timelock -- <PDA>`, Enter.  | 3–8s  |
| 3 | Cut to Terminal 2: **CRITICAL [squads-timelock-removal]** appears with Solscan link + ctx. Hold 2–3s so it's readable. | 8–18s |
| 4 | Terminal 1: type `npm run smoke:weaken -- <PDA>`, Enter.    | 18–23s |
| 5 | Terminal 2: **HIGH [squads-multisig-weakening]**, `3 → 1`. Hold.  | 23–32s |
| 6 | Terminal 1: type `npm run smoke:nonce-init`, Enter.         | 32–38s |
| 7 | Terminal 2: **CRITICAL [privileged-nonce]**, nonce + authority. Hold. | 38–48s |
| 8 | Quick glance at Terminal 2 scrollback showing all 3 alerts stacked. | 48–55s |

Tip: if the `smoke:timelock` or `smoke:weaken` prints are slow to
return, don't edit out the wait — it's evidence the tx really hit
the chain. 2–5 seconds of "waiting for confirmation" reads as
real; a snap-cut reads as staged.

---

## 5. Narration script (English, ~70 sec)

Timings assume the screen recording from §4 runs underneath. Read
calm and flat — the content is dramatic enough.

> **[0:00 — 0:06]** *(over Terminal 2 idle)*
> Drift lost over twenty million dollars because a multisig config
> was quietly weakened before the attack, and nobody was watching.

> **[0:06 — 0:15]** *(still on Terminal 2)*
> Custos is an open-source daemon that watches Solana multisigs and
> DAOs for the exact config changes that enable attacks like that.
> Three detectors, TypeScript, self-hostable, works with any RPC.

> **[0:15 — 0:22]** *(Terminal 1 lights up for command 1)*
> Here's a three-of-five Squads multisig I just created on devnet.
> Daemon is subscribed, baseline seeded.

> **[0:22 — 0:32]** *(alert #1 appears)*
> Step one of the Drift chain — zero out the timelock. Critical
> alert in under a second, with a Solscan link and machine-readable
> context.

> **[0:32 — 0:42]** *(alert #2 appears)*
> Step two — drop the threshold from three to one. That's the
> attacker giving themselves a solo key. High-severity alert, same
> pipeline.

> **[0:42 — 0:55]** *(alert #3 appears)*
> And the one Drift actually missed — an attacker initializing a
> durable nonce they control, so a pre-signed transaction lands
> later on their schedule. Critical. Three attacks, three alerts.

> **[0:55 — 1:10]** *(scrollback with all three alerts visible)*
> This is shipped code, on main, verified live on devnet, a hundred
> and thirty-three tests green. Discord and Slack sinks already
> wired up. Week four: the stale-nonce-execution detector and a
> hosted demo. Repo is github dot com slash cryptoyasenka slash
> custos.

If you want it tighter, drop the second sentence of §[0:06–0:15]
and the "works with any RPC" clause.

---

## 6. Editing

Minimum viable edit:

1. Trim the head and tail silence.
2. Lay the voiceover over the screen recording. If the demo is
   longer than the narration, speed up the *waiting* sections
   (between typing and alert) to 1.5–2×; leave the alert frames at
   1× so viewers can read them.
3. Add a **title card** for the first 2 seconds: `Custos — live
   multisig monitor / Week 3 update`.
4. Add an **end card** for the last 2 seconds: the repo URL as text.

Export: 1080p, MP4, H.264, ≤100 MB for easy upload.

---

## 7. Upload

**X post** (primary). Colosseum Arena updates are typically
posted on X and linked from the submission. Draft:

```
Week 3 update on Custos — an open-source Solana multisig/DAO monitor
that would have caught the Drift config drift before the drain.

Three detectors, live on devnet. Critical / High / Critical,
sub-second, with Solscan links.

github.com/cryptoyasenka/custos

#Solana #SolanaHackathon #Colosseum
```

Attach the MP4 directly to the tweet (better reach than an external
link).

**Colosseum Arena dashboard** (secondary). Paste the same X URL
into the Week 3 update field before 2026-04-26 23:59 PDT.

**Optional**: also upload to YouTube as an unlisted video and link
from README so the repo has a permanent demo.

---

## 8. If anything breaks mid-record

- Daemon silent after an attack command → check Terminal 1's
  output for a tx signature; paste it into `https://solscan.io/tx/<sig>?cluster=devnet`
  to confirm it landed. If it did but no alert fired, the daemon
  lost its WebSocket. Ctrl+C and `npm run dev` again, then re-run
  the attack that was lost.
- `smoke:timelock` fails with "insufficient funds" → `npm run setup:devnet`.
- Nothing prints at all → check `.env` is pointing at the **new**
  PDA / nonce pubkey from today's pre-flight, not last session's.

Capture good takes, don't try to salvage broken ones. Each retry
costs ~0.005 SOL.
