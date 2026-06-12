// One-shot probe: load reference, wait long, report DOM signals that mark "loaded",
// and screenshot the real hero. Tells us how to detect load completion reliably.
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'out');
const EXEC = '/home/tk-lpt-274/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const snapshot = (page) =>
  page.evaluate(() => {
    const cls = (el) => (el ? el.className?.toString?.() || '' : '');
    const preloaderLike = [...document.querySelectorAll('[class*="load" i],[class*="preload" i],[id*="load" i],[class*="intro" i]')]
      .slice(0, 10)
      .map((el) => ({ tag: el.tagName, cls: cls(el), id: el.id, display: getComputedStyle(el).display, opacity: getComputedStyle(el).opacity, vis: getComputedStyle(el).visibility }));
    return {
      htmlClass: cls(document.documentElement),
      bodyClass: cls(document.body),
      bodyText: (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160),
      canvasCount: document.querySelectorAll('canvas').length,
      sectionCount: document.querySelectorAll('section,[class*="section" i]').length,
      navText: ([...document.querySelectorAll('nav a, header a')].map((a) => a.textContent?.trim()).filter(Boolean)).slice(0, 12),
      preloaderLike,
    };
  });

const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('https://cornrevolution.resn.global/#science', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});

for (const t of [0, 30, 60, 90, 120, 150, 180]) {
  if (t) await sleep((t - (t - 30)) * 1000); // 30s increments
  const snap = await snapshot(page);
  console.log(`\n=== t≈${t}s ===`);
  console.log(JSON.stringify(snap, null, 1));
  await page.screenshot({ path: join(OUT, `probe-${String(t).padStart(3, '0')}.png`) });
}
await browser.close();
console.log('\nprobe done');
