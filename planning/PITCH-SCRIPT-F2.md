# F2 — Pitch Video Script (≤2 min, English)

**Recording:** Loom, face-cam + slides or just talking head.
**Target:** 272 words. Stay under 2 min — see TIMING CHECK below for pace caveat.
**Style:** calm, direct, no buzzwords. Evidence first, enthusiasm second.
**Deck:** 7 slides, see `assets/pitch-slides/deck.html` (arrow keys, F11 fullscreen).

---

## SCRIPT

---

**[SLIDE 1 — "April 1, 2026"]**

On April 1, 2026, $285 million drained from Drift Protocol — more than half of TVL.

The attack didn't happen in one transaction. It took weeks. A migrated Security
Council multisig with a 2-of-5 threshold and zero timelock. Durable nonces
seeded by privileged signers. A pre-signed admin transfer waiting in the queue.
Every step happened on chain. In public. Nobody noticed.

---

**[SLIDE 2 — Problem]**

Solana Foundation's STRIDE monitors protocols with $10 million or more in TVL.
Maybe a hundred projects.

There are thousands of DAOs, grant committees, and treasury multisigs below that
line. They have nothing.

---

**[SLIDE 3 — Solution / product]**

Custos Nox is an open-source daemon. It watches Solana accounts over Helius
WebSocket and fires an alert when a config change matches an attack pattern.

Five detectors live today. Four map to the Drift attack chain — timelock
removed, multisig weakened, nonce seeded, stale nonce executed. The fifth
catches signer rotation. Any single alert would have stopped the drain.

---

**[SLIDE 4 — Traction / evidence]**

The repo is public. 205 tests, GitHub Actions green. A devnet smoke harness
replays three Drift attack steps plus signer rotation — four live alerts under
a second each.

Live dashboard at custos-nox.up.railway.app.

---

**[SLIDE 5 — GTM / who uses this]**

First users: Squads multisig operators — protocol treasuries, grant committees,
hackathon prize pools. They're already on Discord.

Integration is one webhook URL and a five-minute self-host. MIT licensed, no
paid tiers. Issue tracker is open for detector requests.

---

**[SLIDE 6 — Vision]**

Long term: a hosted feed that any DAO subscribes to with zero infra. Top-50
Solana multisigs pre-watched. The security layer between on-chain governance
and the first Discord alert.

---

**[SLIDE 7 — Close]**

I'm Yasya from Superteam Ukraine. Code is live on GitHub, demo runs on devnet,
five detectors are watching right now.

**github.com/cryptoyasenka/custos-nox**

---

## TIMING CHECK

| Section | Words |
| ------- | ----- |
| Hook (Drift attack) | 61 |
| Problem (STRIDE gap) | 32 |
| Solution | 59 |
| Traction | 33 |
| GTM | 38 |
| Vision | 28 |
| Close | 21 |
| **Total** | **272** |

| Pace | Total time | Notes |
| ---- | ---------- | ----- |
| 150 wpm | **1:48** | Fast/conversational, hard to land emphasis |
| 140 wpm | **1:56** | Recommended — brisk but clear, lands inside 2 min |
| 130 wpm | **2:05** | Deliberate pauses — overshoots, drop Slide 6 |

**Plan A (default):** target ~140 wpm → ~1:56. First take, watch the clock.
**Plan B (if take runs ≥ 2:00):** drop Slide 6 Vision (saves 28 words / ~12s) →
244 words / ~1:44 at 140 wpm.

---

## SLIDE CONTENT (built — see `assets/pitch-slides/`)

All 7 slides rendered at 1920×1080 brand dark theme by `scripts/gen_pitch_slides.py`.

**Slide 1** (`pitch-slide-01.png`): DRIFT PROTOCOL · April 1, 2026 · $285M drained · 4 days / 3 governance changes / 0 alerts · "Every step happened on chain. In public." · "Nobody noticed"

**Slide 2** (`pitch-slide-02.png`): THE GAP · STRIDE protects ~100 protocols · $10M+ TVL monitored · "The other 99% have nothing"

**Slide 3** (`pitch-slide-03.png`): WHAT IT CATCHES · 5 detectors live today · 5 cards (TimelockRemoval/MultisigWeakening/SignerSetChange/PrivilegedNonce/StaleNonceExecution with CRITICAL/HIGH severity pills) · "Sub-second alerts via Helius WebSocket"

**Slide 4** (`pitch-slide-04.png`): EVIDENCE · Public repo · Green CI · 205 tests / 5 detectors / <1s latency · custos-nox.up.railway.app · "Devnet smoke harness replays Drift steps in real time"

**Slide 5** (`pitch-slide-05.png`): WHO USES THIS · First users: Squads multisig operators · protocol treasuries · grant committees · hackathon prize pools · 1 webhook URL · 5-minute self-host · Open issue tracker for detector requests

**Slide 6** (`pitch-slide-06.png`): VISION · Hosted feed · Zero-infra monitoring · Top-50 Solana multisigs by TVL — pre-watched · "Subscribe with one click. Discord ping. Slack ping. Done." · "Security layer between on-chain governance and the first Discord alert"

**Slide 7** (`pitch-slide-07.png`): CUSTOS NOX · Open-source attack monitor for Solana · github.com/cryptoyasenka/custos-nox · Yasya · Superteam Ukraine · Frontier 2026

**HTML deck:** `assets/pitch-slides/deck.html` — preview via `cd assets/pitch-slides && python -m http.server 8765` → open `http://127.0.0.1:8765/deck.html` → press `F` for fullscreen.

---

## RECORDING TIPS

- Record face + screen side by side (Loom default layout)
- Keep slides up while speaking — don't flip too fast
- Say the URL out loud at the end; paste it in Loom description
- One take is fine; trim head/tail silence, no music needed
- Upload to Loom, paste URL in Arena submission field A10
