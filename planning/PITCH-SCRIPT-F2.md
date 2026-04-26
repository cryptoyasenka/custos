# F2 — Pitch Video Script (≤2 min, English)

**Recording:** Loom, face-cam + slides or just talking head.
**Target:** 270–290 words (~1:50 at 150 wpm). Stay under 2 min.
**Style:** calm, direct, no buzzwords. Evidence first, enthusiasm second.

Suggested slides: 5–7 slides, minimal text, one idea each.

---

## SCRIPT

---

**[SLIDE 1 — "April 1, 2026"]**

On April 1, 2026, $285 million was drained from Drift Protocol — more than half
of its total value locked.

The attack didn't happen in one transaction. It took weeks. A migrated Security
Council multisig with a 2-of-5 threshold and zero timelock. Durable nonces
seeded by privileged signers. A pre-signed admin transfer waiting in the queue.
Every one of those moves happened on chain. In public. Nobody noticed.

---

**[SLIDE 2 — Problem]**

Solana Foundation's STRIDE program monitors big protocols — the ones with
$10 million or more in TVL. That's maybe a hundred projects.

There are thousands of DAOs, grant committees, and treasury multisigs below that
line. They have nothing.

---

**[SLIDE 3 — Solution / product]**

Custos Nox is an open-source daemon that watches Solana accounts over WebSocket
and fires an alert the moment a config change matches a known attack pattern.

Four detectors, live today — one for each step of the Drift attack chain.
Timelock removed. Multisig weakened. Nonce seeded. Stale nonce executed. Any
single alert would have stopped the drain.

Discord and Slack alerts, self-hosted in five minutes, MIT licensed, zero paid
tiers.

---

**[SLIDE 4 — Traction / evidence]**

The repo is public. 147 tests, GitHub Actions CI green. A devnet smoke harness
lets any developer reproduce all four attack steps and watch the alerts fire in
real time.

Live dashboard at custos-nox-production.up.railway.app.

---

**[SLIDE 5 — GTM / who uses this]**

Our first users are Squads multisig operators — protocol treasuries, grant
committees, hackathon prize pools. They're already on Discord. The integration
is one webhook URL.

We're reaching out to Squads multisig operators directly — the integration is
one webhook URL and a five-minute self-host. Issue tracker is open for
detector requests.

---

**[SLIDE 6 — Vision]**

Long term: a hosted alert feed that any DAO can subscribe to with zero infra.
A pre-configured watchlist of the top 50 Solana multisigs by TVL. The
security layer that lives between on-chain governance and the first Discord
ping.

---

**[SLIDE 7 — Close]**

I'm Yasya from Superteam Ukraine. The code is live on GitHub, the demo runs on
devnet, and the four detectors are watching right now.

**github.com/cryptoyasenka/custos-nox**

---

## TIMING CHECK

| Section | ~Words | ~Time |
| ------- | ------ | ----- |
| Hook (Drift attack) | 65 | 0:26 |
| Problem (STRIDE gap) | 40 | 0:16 |
| Solution | 60 | 0:24 |
| Traction | 40 | 0:16 |
| GTM | 45 | 0:18 |
| Vision | 45 | 0:18 |
| Close | 30 | 0:12 |
| **Total** | **325** | **~2:10** |

**To hit 1:50:** Cut one of these:
- Option A: Drop the Vision slide (cut ~45 words → 280 words, 1:52) ← recommended
- Option B: Drop Vision + tighten GTM to 2 sentences (260 words, 1:44)

---

## SLIDE CONTENT GUIDE

**Slide 1:** Text: "April 1, 2026 / $285M / 4 days / 3 governance changes / no alert"

**Slide 2:** Text: "STRIDE protects ~100 protocols. / The other 99% have nothing."

**Slide 3:** Image: architecture diagram (Helius WS → 4 Detectors → FanOut → Discord/Slack). Or: screenshot of daemon output showing all four colored alerts (timelock-removal, multisig-weakening, privileged-nonce, stale-nonce-execution).

**Slide 4:** Screenshot: `npm test` showing 147 passing. Or: GitHub CI badge green.

**Slide 5:** Text: "First users: Squads operators / One webhook URL / 5-min self-host"

**Slide 6 (optional):** Text: "Hosted feed → zero-infra monitoring / Top-50 Squads watchlist"

**Slide 7:** GitHub URL, QR code, "Yasya / Superteam Ukraine / Frontier 2026"

---

## RECORDING TIPS

- Record face + screen side by side (Loom default layout)
- Keep slides up while speaking — don't flip too fast
- Say the URL out loud at the end; paste it in Loom description
- One take is fine; trim head/tail silence, no music needed
- Upload to Loom, paste URL in Arena submission field A10
