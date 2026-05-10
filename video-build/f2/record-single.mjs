// One-shot recorder: records ONE slide at given idx and saves under given name.
// Same recording-mode pattern as record-slides-individual.mjs, no loop.
//   node record-single.mjs <idx> <outname> [durationMs]
//   e.g. node record-single.mjs 1 slide-1-1 10000
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-chromium";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DECK_PATH = path.resolve(__dirname, "../../assets/pitch-slides/deck-v2.html");
const OUT_DIR = path.resolve(__dirname, "slides-individual-5");

const idx = parseInt(process.argv[2], 10);
const name = process.argv[3];
const duration = parseInt(process.argv[4] ?? "10000", 10);

if (Number.isNaN(idx) || !name) {
  console.error("Usage: node record-single.mjs <idx> <outname> [durationMs]");
  process.exit(1);
}

const tmpDir = path.join(OUT_DIR, `tmp-single-${Date.now()}`);
fs.mkdirSync(tmpDir, { recursive: true });

console.log(`▶ recording idx=${idx} for ${duration}ms → ${name}.mp4`);

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: tmpDir, size: { width: 1920, height: 1080 } },
});
const page = await ctx.newPage();

await page.goto(`file:///${DECK_PATH.replace(/\\/g, "/")}?recording=1`);
await page.waitForTimeout(300);

await page.evaluate((targetIdx) => {
  document.documentElement.classList.remove("recording-mode");
  const all = document.querySelectorAll(".slide");
  all.forEach((s) => {
    s.style.transition = "none";
    s.classList.remove("active");
    s.style.setProperty("display", "none", "important");
    s.style.setProperty("opacity", "0", "important");
  });
  const target = all[targetIdx];
  target.style.setProperty("display", "flex", "important");
  target.style.setProperty("opacity", "1", "important");
  target.classList.add("active");
  target.getBoundingClientRect();
  const hud = document.querySelector(".hud");
  if (hud) hud.style.setProperty("display", "none", "important");
  if (typeof onSlideEnter === "function") onSlideEnter(targetIdx);
}, idx);

await page.waitForTimeout(duration);
const videoPath = await page.video()?.path();
await ctx.close();
await browser.close();

const webmOut = path.join(OUT_DIR, `${name}.webm`);
const mp4Out = path.join(OUT_DIR, `${name}.mp4`);
if (fs.existsSync(webmOut)) fs.unlinkSync(webmOut);
if (fs.existsSync(mp4Out)) fs.unlinkSync(mp4Out);

if (videoPath && fs.existsSync(videoPath)) {
  fs.renameSync(videoPath, webmOut);
  console.log(`  ✓ saved ${webmOut}`);
  execSync(
    `ffmpeg -y -loglevel error -i "${webmOut}" -c:v libx264 -pix_fmt yuv420p -preset slow -crf 18 -movflags +faststart -an "${mp4Out}"`,
    { stdio: "inherit" },
  );
  console.log(`  ✓ transcoded ${mp4Out}`);
} else {
  console.error("✗ no video produced");
  process.exit(1);
}

try {
  fs.rmSync(tmpDir, { recursive: true, force: true });
} catch (e) { /* ignore */ }
