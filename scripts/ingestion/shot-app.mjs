// Quick verification shots of the local Next app + the wordmark contact sheet.
import { chromium } from 'playwright-core';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'app-shots');
const EXEC = '/home/tk-lpt-274/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';
import { mkdirSync } from 'node:fs';
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] });
async function shot(url, name, vp) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await sleep(1200);
  await page.screenshot({ path: join(OUT, name), fullPage: name.includes('contact') });
  await ctx.close();
  console.log('shot', name);
}
await shot('http://localhost:3000', 'hero-desktop.png', { width: 1440, height: 900 });
await shot('http://localhost:3000', 'hero-mobile.png', { width: 390, height: 844 });
await shot('file://' + join(__dirname, '..', '..', 'docs', 'brand', 'contact-sheet.html'), 'wordmarks.png', { width: 1200, height: 900 });
await browser.close();
console.log('done');
