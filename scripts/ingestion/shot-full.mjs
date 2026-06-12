// Full-page verification shots of the local Next app (Phase 2 content scaffold).
import { chromium } from 'playwright-core';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'app-shots');
mkdirSync(OUT, { recursive: true });
const EXEC = '/home/tk-lpt-274/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] });
async function shot(name, vp) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await sleep(1500);
  await page.screenshot({ path: join(OUT, name), fullPage: true });
  await ctx.close();
  console.log('shot', name);
}
await shot('full-desktop.png', { width: 1440, height: 900 });
await shot('full-mobile.png', { width: 390, height: 844 });
await browser.close();
console.log('done');
