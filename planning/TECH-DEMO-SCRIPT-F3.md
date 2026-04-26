# F3 — Technical Demo Script (2–3 min, English)

**Recording:** Loom, screen only (no face needed, or picture-in-picture).
**Target:** 2:30–2:50. ~375–420 words.
**Style:** "narrate what you're doing while you do it." No IDE tour, no code
reading. Show the product running.

---

## PRE-RECORDING SETUP (5 min)

```bash
cd /c/Projects/custos
npm run smoke:create          # prints NEW_MULTISIG_PDA
npm run smoke:nonce-plan      # prints NEW_NONCE_PUBKEY, writes .smoke-nonce.json
```

Update `.env`:
```
CUSTOS_CLUSTER=devnet
CUSTOS_RPC_URL=https://api.devnet.solana.com
CUSTOS_WATCH=SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf:<NEW_PDA>,11111111111111111111111111111111:<NEW_NONCE>
```

> ⚠️ `CUSTOS_CLUSTER=devnet` is REQUIRED — otherwise the daemon defaults to
> `mainnet` and Solscan links in alerts point to the wrong network.

Layout: two terminals side-by-side, large dark font, nothing else visible.
- Terminal 1: attacker (empty prompt, ready)
- Terminal 2: `npm run dev` (daemon running, 2 subscriptions shown)

---

## SCRIPT

---

**[0:00–0:20] — Open on the running daemon**

"This is Custos Nox — an open-source Solana security monitor.

What you're looking at is the daemon running in Terminal 2. It's subscribed via
WebSocket to a Squads multisig and a durable-nonce account on devnet. Baseline
state is seeded — so the very first account change will be diffed correctly.

I'm going to replay the three setup steps live, then show the fourth detector that catches the drain itself."

---

**[0:20–0:45] — Alert 1: Timelock removal**

"Step one: remove the governance timelock."

*(Terminal 1, type: `npm run smoke:timelock -- <PDA>`, Enter)*

*(pause for tx confirmation — 2–5 sec)*

"There — CRITICAL. Timelock just dropped to zero. The alert includes a Solscan
link, the previous and current values, and a machine-readable reason code. This
alone gives the DAO hours of warning."

---

**[0:45–1:10] — Alert 2: Multisig weakening**

"Step two: drop the signer threshold."

*(Terminal 1, type: `npm run smoke:weaken -- <PDA>`, Enter)*

"HIGH severity. Threshold went from three-of-five to one-of-five — the multisig
is now single-signer controlled. The attacker can now sign anything alone.

Same pipeline: detector inspects the account diff, classifies severity, fans
out to every configured sink simultaneously."

---

**[1:10–1:40] — Alert 3: Nonce initialization**

"Step three: seed a durable nonce under an attacker-controlled key."

*(Terminal 1, type: `npm run smoke:nonce-init`, Enter)*

"CRITICAL. Nonce initialized with authority controlled by the attacker. This is
the mechanism that lets a pre-signed transaction land at any time in the future —
on the attacker's schedule, not the DAO's.

Three setup alerts, sub-second each. All the signals the DAO needed — and
one more detector waiting for the drain itself."

---

**[1:40–2:00] — Stale nonce**

*(Optional cut: switch to a pre-recorded `npm test src/detectors/stale-nonce-execution`
window showing 12 tests pass — proves the detector behavior without the 1-hour wait.)*

"The fourth detector — StaleNonceExecutionDetector — watches that same nonce
account. When the blockhash changes, meaning a pre-signed transaction just
executed, and the nonce was seeded more than an hour ago, it fires HIGH.

I can't trigger this live without waiting an hour, but the unit suite covers
the exact Drift pattern — twelve cases, all green. That's the final step: the
drain. The one Drift missed."

---

**[2:00–2:20] — Architecture**

*(Switch to architecture diagram or ASCII diagram in README)*

"The architecture is simple by design. Helius WebSocket delivers account changes.
Four detectors inspect each event in parallel and return zero or one alert. The
FanOut sink sends every alert to Discord, Slack, and stdout simultaneously —
one failing webhook doesn't block the others.

Per-detector 5-second timeout. If a detector hangs, it surfaces as a low-severity
operational alert instead of disappearing silently."

---

**[2:20–2:40] — Close**

"164 tests, all green. GitHub Actions CI on every push.
Self-host: clone the repo, set three env vars, `npm run dev`.

The code is at github.com/cryptoyasenka/custos-nox."

---

## TIMING CHECK

| Section | ~Sec |
| ------- | ---- |
| Open | 0:20 |
| Alert 1 | 0:25 |
| Alert 2 | 0:25 |
| Alert 3 | 0:30 |
| Stale nonce | 0:20 |
| Architecture | 0:20 |
| Close | 0:20 |
| **Total** | **~2:40** |

---

## WHAT TO SHOW ON SCREEN

1. Terminal 2 with daemon output (subscription lines visible, clean)
2. Terminal 1 typing commands → Terminal 2 receiving colored alerts
3. All 3 live alerts visible together in Terminal 2 scrollback (the 4th, stale-nonce-execution, is shown via test output rather than a live trigger — see script note at 1:40)
4. Architecture diagram (README section or ARCHITECTURE.md)
5. `npm test` output — 164 passing (optional, quick cut)
6. GitHub repo home page (final 5 seconds)

---

## RECORDING TIPS

- Keep font size large enough that alerts are readable in the recording
- Pause 2–3 sec after each alert so viewers can read the output
- Don't edit out the tx confirmation wait — it proves the chain is real
- One take with natural pace is fine; cut silence at head/tail
- Upload to Loom, paste URL in Arena submission field A11
