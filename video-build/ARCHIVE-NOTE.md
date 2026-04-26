# video-build — Week 3 archive (DO NOT use for F2/F3 submission)

This folder contains the working files for the **Week 3 / late-April demo video**
that was recorded before the 4th detector (`StaleNonceExecutionDetector`) shipped.

The text/audio here is **stale** for hackathon submission purposes:
- Says "Drift lost over twenty million dollars" — actual figure is **$285M / >50% TVL** (Chainalysis-confirmed).
- Says "Three detectors, TypeScript, self-hostable" — there are now **four detectors** live.
- Says "a hundred and thirty-three tests green" — the count is now **147 tests passing**.

## For Frontier hackathon submission (May 9), use the new scripts:

- **F2 pitch video (≤2 min):** `planning/PITCH-SCRIPT-F2.md`
- **F3 tech demo (2–3 min):** `planning/TECH-DEMO-SCRIPT-F3.md`

Both updated 2026-04-26 with all four detectors, $285M figure, 147 tests, and
Chainalysis-source-backed wording (no unverifiable claims about "single-signer
control" or "5-of-9 → 2-of-5").

## What is safe to reuse from this folder

- `outro.mp4`, `title.mp4` — branded title/outro cards (visual only, no stale text).
- `sample-*.mp3` — TTS voice samples for picking a voice.
- `demo-raw.mp4` / `demo-raw.mkv` — raw screen-capture footage. **Caveat:** the dashboard
  state in those frames may show v0.1 / 3 detectors / 135 tests. Re-record screen
  capture against the live dashboard (`custos-nox-production.up.railway.app`)
  before using in F2/F3.

## What is NOT safe to reuse

- `vo-script.txt`, `vo-script-45s.txt`, `vo-script-tight.txt` — text content stale.
- All `vo-*.mp3` / `Generated Audio*.wav` — generated from stale text.

If you want a new VO, regenerate from the F2/F3 scripts in `planning/`.
