import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-chromium";

// Windows: Explorer thumbnails / Defender / CapCut can hold a transient lock
// on previously rendered slide-N.webm/.mp4 files. Retry unlink with backoff.
async function safeUnlink(p) {
  if (!fs.existsSync(p)) return;
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      fs.unlinkSync(p);
      return;
    } catch (e) {
      if (e.code !== "EBUSY" && e.code !== "EPERM") throw e;
      await sleep(250 * (attempt + 1));
    }
  }
  throw new Error(`Could not unlink ${p} — close any preview windows or CapCut and retry.`);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DECK_PATH = path.resolve(__dirname, "../../assets/pitch-slides/deck-v2.html");
// Allow override so we can re-render to a fresh folder when the previous one
// is locked by Explorer thumbnail cache / Defender / CapCut.
//   node record-slides-individual.mjs            -> slides-individual/
//   node record-slides-individual.mjs --fresh    -> slides-individual-N/ (next free)
const useFresh = process.argv.includes("--fresh");
let OUT_DIR = path.resolve(__dirname, "slides-individual");
if (useFresh) {
  let n = 2;
  while (fs.existsSync(path.resolve(__dirname, `slides-individual-${n}`))) n++;
  OUT_DIR = path.resolve(__dirname, `slides-individual-${n}`);
}

const SLIDE_DURATIONS_MS = [
   8000, // s0  — title cold-open (logo + tagline + bullets)
  10000, // s0b — multisig primer (3-of-5 signers → treasury) [DAO setup explainer]
  11000, // s1  — Drift hook ($285M + 9-days punch) [tightened from 16s now that s0 carries the tagline]
  16000, // s2 — Drift attack chain timeline
  14000, // s3 — STRIDE vs 10,000+ gap
  14000, // s4 — 5 detector cards
  14000, // s5 — 4 proof cards (200+/<1s/MIT/Discord mockup)
  14000, // s6 — setup in 5 min
  13000, // s7 — vision (Public Good badge)
  12000, // s8 — Team (Yasya + OpenGradient models)
  10000, // s9 — CTA + final
];
// Per-slide lead-in: ~500ms (browser settle + slide reveal). Trim in CapCut if needed.

if (!fs.existsSync(DECK_PATH)) {
  console.error("✗ deck not found at", DECK_PATH);
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });

for (let idx = 0; idx < SLIDE_DURATIONS_MS.length; idx++) {
  const slideNum = idx + 1;
  const tmpDir = path.join(OUT_DIR, `tmp-${slideNum}`);
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  console.log(
    `▶ recording slide ${slideNum}/${SLIDE_DURATIONS_MS.length} — ${SLIDE_DURATIONS_MS[idx]}ms`,
  );

  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: tmpDir, size: { width: 1920, height: 1080 } },
  });
  const page = await ctx.newPage();

  // Load deck in recording mode — a synchronous <script> at the top of
  // deck-v2.html sets html.recording-mode, which a CSS rule uses to hide
  // every .slide and .hud BEFORE first paint. No bleed possible.
  await page.goto(`file:///${DECK_PATH.replace(/\\/g, "/")}?recording=1`);

  // Settle: deck script runs onSlideEnter(0) — counter ticks in DOM but
  // recording-mode CSS keeps everything hidden.
  await page.waitForTimeout(300);

  // Drop recording-mode (which would also hide our target) and reveal the
  // target slide explicitly via inline !important so we win over .slide.active.
  await page.evaluate((targetIdx) => {
    document.documentElement.classList.remove("recording-mode");
    const all = document.querySelectorAll(".slide");
    for (const s of all) {
      s.style.transition = "none";
      s.classList.remove("active");
      s.style.setProperty("display", "none", "important");
      s.style.setProperty("opacity", "0", "important");
    }
    const target = all[targetIdx];
    target.style.setProperty("display", "flex", "important");
    target.style.setProperty("opacity", "1", "important");
    target.classList.add("active");
    target.getBoundingClientRect();
    // Keep HUD hidden during the recording.
    const hud = document.querySelector(".hud");
    if (hud) hud.style.setProperty("display", "none", "important");
    if (typeof onSlideEnter === "function") onSlideEnter(targetIdx);
  }, idx);

  // Hold for slide duration
  await page.waitForTimeout(SLIDE_DURATIONS_MS[idx]);

  const videoPath = await page.video()?.path();
  await ctx.close();

  if (videoPath && fs.existsSync(videoPath)) {
    const webmOut = path.join(OUT_DIR, `slide-${slideNum}.webm`);
    await safeUnlink(webmOut);
    fs.renameSync(videoPath, webmOut);
    console.log(`  ✓ saved ${webmOut}`);

    // CapCut on Windows rejects .webm — transcode to H.264 .mp4 (yuv420p, faststart).
    const mp4Out = path.join(OUT_DIR, `slide-${slideNum}.mp4`);
    await safeUnlink(mp4Out);
    try {
      execSync(
        `ffmpeg -y -loglevel error -i "${webmOut}" -c:v libx264 -pix_fmt yuv420p -preset slow -crf 18 -movflags +faststart -an "${mp4Out}"`,
        { stdio: "inherit" },
      );
      console.log(`  ✓ transcoded ${mp4Out}`);
    } catch (e) {
      console.error(`  ✗ ffmpeg failed for slide ${slideNum}:`, e.message);
    }

    // Clean tmp dir
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      /* ignore */
    }
  } else {
    console.error(`  ✗ no video for slide ${slideNum}`);
  }
}

await browser.close();

const lastIdx = SLIDE_DURATIONS_MS.length;
console.log(`\n✓ all ${lastIdx} slides saved to ${OUT_DIR}`);
console.log(`  WebM (lossless source): slide-1.webm ... slide-${lastIdx}.webm`);
console.log(`  MP4 (CapCut-ready):     slide-1.mp4  ... slide-${lastIdx}.mp4`);
console.log("  Sequence in CapCut by filename order. Import the .mp4 set.");
