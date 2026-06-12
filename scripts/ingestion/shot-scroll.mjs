// Phase 4 scroll-choreography verification shots.
// Captures the live app at several scroll depths (to SEE reveals + the hero
// graph receding on scroll), plus the reduced-motion path, plus an anchor-nav
// landing check. Headless WebGL is swiftshader (dim, no real bloom) — we're
// checking STRUCTURE + that nothing breaks, not final glow.
import { chromium } from 'playwright-core';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'scroll-shots');
mkdirSync(OUT, { recursive: true });
const EXEC = '/home/tk-lpt-274/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--use-gl=swiftshader'] });

const VP = { width: 1440, height: 900 };

// Drive scroll by document height fraction; Lenis intercepts wheel but
// window.scrollTo still moves the document (Lenis reads scrollTop), so we step
// and let inertia settle.
async function scrollTo(page, frac) {
  await page.evaluate((f) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * f, behavior: 'instant' });
  }, frac);
  await sleep(1400); // let Lenis + GSAP scrub settle
}

async function run(label, opts) {
  const ctx = await browser.newContext({ viewport: VP, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await sleep(2000); // hero entrance

  const fracs = [0, 0.18, 0.38, 0.6, 0.85, 1];
  for (const f of fracs) {
    await scrollTo(page, f);
    await page.screenshot({ path: join(OUT, `${label}-${Math.round(f * 100)}.png`) });
  }

  // choreo armed?
  const armed = await page.evaluate(() => document.documentElement.getAttribute('data-choreo'));
  console.log(`[${label}] data-choreo=${armed} errors=${errors.length}`);
  if (errors.length) console.log(errors.slice(0, 3).join('\n'));
  await ctx.close();
}

// Anchor-nav landing check: click "Work", confirm #work is near top after settle.
async function anchorCheck() {
  const ctx = await browser.newContext({ viewport: VP });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await sleep(1500);
  await page.evaluate(() => {
    const a = document.querySelector('a[href="#contact"]');
    a && a.click();
  });
  await sleep(2200); // Lenis anchor glide
  const info = await page.evaluate(() => {
    const el = document.getElementById('contact');
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), hash: location.hash };
  });
  console.log(`[anchor] #contact top=${info.top}px hash=${info.hash}`);
  await page.screenshot({ path: join(OUT, 'anchor-contact.png') });
  await ctx.close();
}

await run('motion', {});
await run('reduced', { reducedMotion: 'reduce' });
await anchorCheck();
await browser.close();
console.log('done');
