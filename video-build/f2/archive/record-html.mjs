/**
 * record-html.mjs — записывает hook.html и outro.html через Playwright
 * Запуск: node record-html.mjs
 * Результат: hook.webm (33s) + outro.webm (10s) в папке video-build/f2/
 */
import { chromium } from 'playwright-chromium';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function recordHtml(htmlFile, outputFile, durationMs, doneTitle) {
  console.log(`\n▶ Recording ${htmlFile} → ${outputFile} (${durationMs/1000}s)...`);

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: __dirname,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();
  const filePath = path.resolve(__dirname, htmlFile);
  await page.goto(`file:///${filePath.replace(/\\/g, '/')}`);

  // Wait for animation to signal completion OR for durationMs — whichever comes first
  const deadline = Date.now() + durationMs + 2000;
  let done = false;
  while (Date.now() < deadline && !done) {
    await page.waitForTimeout(500);
    const title = await page.title();
    if (title === doneTitle) done = true;
  }

  // Extra buffer after done signal
  await page.waitForTimeout(1000);

  const videoPath = await page.video()?.path();
  await context.close();
  await browser.close();

  if (videoPath && fs.existsSync(videoPath)) {
    const dest = path.resolve(__dirname, outputFile);
    fs.renameSync(videoPath, dest);
    console.log(`✓ Saved: ${dest}`);
  } else {
    console.error(`✗ No video found for ${htmlFile}`);
  }
}

(async () => {
  await recordHtml('hook.html',     'hook.webm',     34000, 'ANIMATION_DONE');
  await recordHtml('outro.html',    'outro.webm',    20000, 'OUTRO_DONE');
  await recordHtml('howworks.html', 'howworks.webm',  8000, 'HOWWORKS_DONE');
  console.log('\n✓ All recordings done.');
})();
