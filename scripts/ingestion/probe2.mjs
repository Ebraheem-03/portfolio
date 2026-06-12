// Probe the preloader lifecycle precisely: which nodes exist, classes, and the
// % text source, sampled every 10s, so we pick a bulletproof "loaded" signal.
import { chromium } from 'playwright-core';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'out');
const EXEC = '/home/tk-lpt-274/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const snap = (page) =>
  page.evaluate(() => {
    const pres = [...document.querySelectorAll('[class*="preload" i],[class*="loader" i]')].map((el) => ({
      cls: el.className?.toString?.() || '',
      disp: getComputedStyle(el).display,
      op: getComputedStyle(el).opacity,
      vis: getComputedStyle(el).visibility,
      txt: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
    }));
    return {
      bodyClass: document.body.className?.toString?.() || '',
      htmlClass: document.documentElement.className?.toString?.() || '',
      bodyText: (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      preloaderNodes: pres,
      hasJsPreloader: !!document.querySelector('.preloader, .js-preloader'),
      sections: document.querySelectorAll('section').length,
    };
  });

const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
await page.goto('https://cornrevolution.resn.global/#science', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
for (let t = 0; t <= 130; t += 10) {
  if (t) await sleep(10000);
  const s = await snap(page);
  console.log(`\n=== t=${t}s  hasPreloader=${s.hasJsPreloader} sections=${s.sections} ===`);
  console.log('body:', JSON.stringify(s.bodyText));
  console.log('nodes:', JSON.stringify(s.preloaderNodes));
}
await browser.close();
console.log('\nprobe2 done');
