# F3 — Technical Demo Script (~3:00 min, English)
# REVISED 2026-05-07 v3 — practical-first, detector-by-detector

**Recording:** OBS Studio / Loom / Win+G. Screen only. Upload YouTube Unlisted.
**Target:** 2:50–3:10. Mostly terminal. No slides.
**Rules note:** Colosseum requires a working product demo — not a slide deck. This script is 80% live terminal.

---

## PRE-RECORDING SETUP (10 min)

**Accounts (fresh, created 2026-05-07 for recording):**
- Multisig PDA: `Cn7XXry3SWbeqkBsH7uWXLViz4ffUqzyb3fi5Dkfr9Ao`
- Nonce pubkey: `BYCMzkaGMTsPLLxzoZE8qqLb56ov6V6hnoAacgnu2KBE`

**.env must have:**
```
CUSTOS_CLUSTER=devnet
CUSTOS_RPC_URL=https://api.devnet.solana.com
CUSTOS_WATCH=SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf:Cn7XXry3SWbeqkBsH7uWXLViz4ffUqzyb3fi5Dkfr9Ao,11111111111111111111111111111111:BYCMzkaGMTsPLLxzoZE8qqLb56ov6V6hnoAacgnu2KBE
CUSTOS_DISCORD_WEBHOOK=<your webhook>
```

**Screen layout:**
- **Terminal LEFT:** `npm run dev` — daemon running, 2 subscription lines visible
- **Terminal RIGHT:** empty prompt at `C:\Projects\custos`
- **Browser tab:** `https://custos-nox.up.railway.app` — ready to switch to
- **Discord tab:** `#custos-alerts` — scrolled to bottom

Large dark font. Two terminals side by side take the full screen. Switch to browser/Discord only at marked moments.

**Before recording:** run each smoke command once to verify all 4 fire. Then run `npm run smoke:create` for a fresh multisig and update `.env` + restart daemon.

---

## SCRIPT

---

### [0:00–0:22] — Opening: the problem in numbers

*(Browser full screen — dashboard hero)*

"On April 1, 2026, Drift Protocol lost $285 million in twelve minutes.

It wasn't a zero-day exploit. The attacker spent nine days preparing on-chain —
changing governance settings, weakening the multisig, arming a pre-signed transaction.
Every step was visible on-chain. None of it was flagged.

This is Custos Nox. It catches that attack chain — in real time."

*(Scroll down to Drift Timeline — 4 cards visible)*

"Here's what that nine-day window looked like. Four steps. Four detectors.
I'm going to trigger each one right now."

---

### [0:22–0:42] — Switch to terminals — architecture + frame the simulation

*(Switch to two-terminal layout)*

"Before I start — here's how it works under the hood.

Custos Nox is a TypeScript daemon. It opens a WebSocket to a Solana RPC node
and subscribes to account changes. Every time an account is updated on-chain,
the new state runs through five detectors — each one knows what a specific attack
step looks like. If any detector fires, an alert fans out in parallel
to Discord, Slack, Telegram, and stdout. One slow webhook never blocks the others.
215 tests. GitHub CI on every push. Zero Rust — any JavaScript developer can contribute.

Now let me simulate the Drift attack, step by step, on devnet.

Left terminal: Custos Nox watching a Squads multisig and a nonce account —
the defender's side.

Right terminal: me, playing the attacker —
running the same on-chain operations that drained Drift.

Watch the left terminal with each move."

---

### [0:35–0:58] — Detector 1: TimelockRemovalDetector

*(Narrate before typing — right terminal)*

"Step one of the Drift attack: remove the governance timelock.

The timelock is what gives a DAO time to react. On mainnet Drift,
it was dropped to zero six days before the drain —
closing the community's window to pause withdrawals or vote to cancel.

TimelockRemovalDetector fires the moment that happens."

*(Type and Enter:)*
```
npm run smoke:timelock -- Cn7XXry3SWbeqkBsH7uWXLViz4ffUqzyb3fi5Dkfr9Ao
```
*(wait 3–4 sec for confirmation)*

"CRITICAL. Timelock was 86,400 seconds — one day.
Now zero. The DAO has no buffer left.
The alert includes a direct Solscan transaction link and the exact values that changed."

---

### [0:58–1:18] — Detector 2: MultisigWeakeningDetector

"Step two: weaken the multisig threshold.

A 3-of-5 multisig means three signers must approve any transaction.
The attacker reduced it to 1-of-5 — they only need themselves to sign anything.
That's the moment the treasury became a single point of failure.

MultisigWeakeningDetector catches any threshold reduction."

*(Type and Enter:)*
```
npm run smoke:weaken -- Cn7XXry3SWbeqkBsH7uWXLViz4ffUqzyb3fi5Dkfr9Ao
```
*(wait)*

"HIGH. 3-of-5 → 1-of-5. One person now controls the entire treasury.
If you received this alert, you'd have hours to rotate signers
before the attacker moves to the next step."

---

### [1:18–1:38] — Detector 3: PrivilegedNonceDetector

"Step three — and this is the clever part of the Drift attack:
the attacker creates a durable nonce account under their own key.

A durable nonce lets you pre-sign a transaction that stays valid
indefinitely — it executes whenever the attacker decides, not when the DAO is ready.
This is the moment the drain was actually *armed*.

PrivilegedNonceDetector fires when a watched nonce account is initialized
under an attacker-controlled authority."

*(Type and Enter:)*
```
npm run smoke:nonce-init
```
*(wait)*

"CRITICAL. Nonce initialized. A pre-signed drain transaction is now live
and waiting — it can execute at any moment.
On mainnet Drift, this happened nine days before the actual drain."

---

### [1:38–1:55] — Detector 5: SignerSetChangeDetector

"The fifth detector covers an adjacent attack vector —
not the Drift chain specifically, but one that's hit other Solana protocols.

An attacker with config authority rewrites the members list:
evicts a legitimate co-signer, adds their own key.
The threshold stays the same on paper, but the quorum is now compromised.

SignerSetChangeDetector fires on any members vector mutation."

*(Type and Enter:)*
```
npm run smoke:rotate-signers -- Cn7XXry3SWbeqkBsH7uWXLViz4ffUqzyb3fi5Dkfr9Ao
```
*(wait)*

"HIGH. Legitimate signer removed, attacker key added.
Same baseline-diff machinery — one extra detector covering a second attack shape for free."

---

### [1:55–2:08] — Discord: all four alerts

*(Switch to Discord, full screen or maximized)*

"Every one of those four alerts landed in Discord simultaneously —
severity color-coded, Solscan link, exact values before and after.

The fan-out is parallel: Discord, Slack, Telegram, and stdout all fire at once.
One failing webhook never blocks the others.
A team watching this channel would have had actionable alerts
for every step of the Drift chain."

*(Scroll slowly through all 4 embeds — 6–8 sec)*

---

### [2:08–2:18] — Detector 4: StaleNonceExecutionDetector (tests)

*(Switch back to right terminal)*

"The fourth Drift-chain detector — StaleNonceExecutionDetector —
catches the drain itself: when a pre-signed transaction finally executes
from a nonce that was seeded more than an hour ago.

Can't trigger that live without waiting an hour.
But twelve unit tests cover the exact Drift pattern."

*(Type and Enter:)*
```
npm test src/detectors/stale-nonce-execution
```
*(wait for "12 passing")*

"All green. That's the final step — the moment $285M left the protocol."

---

### [2:18–2:40] — How to actually use this

*(Switch to browser — "Self-host in 5 minutes" section on dashboard)*

"How does a DAO actually use this?

You have a Squads multisig. The PDA is visible in app.squads.so —
it's just an address, like a wallet address.
You put that address in one environment variable: CUSTOS_WATCH.
Add a Discord, Slack, or Telegram webhook. Run npm run dev, or the Docker one-liner.

From that moment, any config change on your multisig —
threshold, signers, timelock, nonce — fires an immediate alert
in your team's Discord, Slack, or Telegram. You don't need to check anything manually.
If something changes, you hear about it within a second."

*(Show the code block: git clone → npm install → cp .env.example .env → npm run dev)*

"Five minutes. Free Helius RPC, no credit card. MIT licensed, no paid tiers."

---

### [2:40–2:55] — Close

*(Scroll to footer — GitHub URL visible)*

"Solana Foundation's STRIDE program monitors protocols with ten million
in TVL or above. That covers maybe fifty protocols.
The other ten thousand multisigs and DAOs on Solana have nothing.

Custos Nox is for them.

github.com/cryptoyasenka/custos-nox"

*(Hold on GitHub URL 3 sec. End.)*

---

## TIMING

| Section | ~Sec | On screen |
|---------|------|-----------|
| Opening + Drift timeline | 0:22 | Browser |
| Architecture + attack framing | 0:35 | Terminals |
| Detector 1: timelock | 0:23 | Terminal |
| Detector 2: weakening | 0:20 | Terminal |
| Detector 3: nonce | 0:20 | Terminal |
| Detector 5: signer rotation | 0:17 | Terminal |
| Discord — 4 embeds | 0:13 | Discord |
| Detector 4: stale nonce tests | 0:10 | Terminal |
| How to use this | 0:22 | Browser |
| Close | 0:15 | Browser |
| **Total** | **~3:17** | |

80% of screen time = live product (terminal + Discord). 20% = website.

---

## KEY SENTENCES TO MEMORIZE

These are the lines that make the pitch land — practice them until natural:

1. **"Every step was visible on-chain. None of it was flagged."** — opens the problem
2. **"The timelock is what gives a DAO time to react."** — explains why detector 1 matters
3. **"This is the moment the drain was actually armed."** — on nonce-init
4. **"A team watching this channel would have had actionable alerts for every step."** — on Discord section
5. **"You put that address in one environment variable."** — integration simplicity
6. **"The other ten thousand multisigs and DAOs on Solana have nothing."** — closes with impact

---

## WHAT JUDGES WILL REMEMBER

- You triggered a real on-chain attack chain, live, on devnet — not a mockup
- Every detector was explained before it fired — they understood what they were watching
- They saw Discord alerts landing in real time — distribution story is clear
- The integration story was concrete: one env var, five minutes, free
- The closing line quantified the gap: 10,000 unprotected DAOs

---

## RECORDING TIPS

- One smooth take, natural pace. Don't rush between detectors.
- Pause 3–4 sec after each alert so the terminal output is readable
- Don't edit out tx confirmation waits — they prove the chain is real
- Switch to Discord in one smooth motion — already maximized
- For the integration section: scroll the website slowly, read the code block out loud
- Upload YouTube Unlisted. Title: `Custos Nox — F3 Tech Demo (Solana Frontier 2026)`
- Verify URL works in incognito before pasting in Arena field A11
