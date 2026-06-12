// Phase-0 reference ingestion.
// Drives the cached Playwright Chromium against the Resn reference and captures:
//   - viewport screenshots at scroll positions 0/25/50/75/100% across 4 viewports
//   - the #science anchor specifically
//   - extracted style tokens (fonts, colors, canvas/WebGL layer structure, cursor)
// We translate this grammar; we never copy the content.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'out');
const URL = 'https://cornrevolution.resn.global/#science';
const EXEC =
  process.env.CHROME_BIN ||
  '/home/tk-lpt-274/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';

const VIEWPORTS = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'laptop-1440', width: 1440, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function settle(page, ms = 1400) {
  // WebGL scroll sites need time to render the in-between frames.
  await sleep(ms);
}

async function waitForLoaderGone(page, timeout = 180000) {
  // The reference shows a DOM preloader (<div class="preloader js-preloader">).
  // The "NN% Loading your experience" counter IS real DOM text here, but it
  // counts 0->100 then the node is REMOVED. The node-removal is the only
  // reliable "loaded" signal. Under swiftshader the whole arc is ~55-60s.
  //
  // GOTCHA: at domcontentloaded the .js-preloader node does NOT exist yet
  // (JS injects it ~5-10s later). So a naive `!querySelector('.preloader')`
  // returns TRUE instantly on that race window. We must FIRST wait for the
  // preloader to APPEAR, THEN wait for it to be removed.
  try {
    await page.waitForFunction(
      () => !!document.querySelector('.preloader, .js-preloader'),
      { timeout: 30000, polling: 500 }
    );
  } catch {
    // Preloader never appeared — either it loaded faster than we polled, or
    // markup changed. Fall through to the removal check anyway.
  }
  try {
    await page.waitForFunction(
      () => !document.querySelector('.preloader, .js-preloader'),
      { timeout, polling: 1000 }
    );
    return true;
  } catch {
    return false;
  }
}

// This is a wheel-hijack (virtual scroll) site: window.scrollTo does nothing.
// Progression is driven by dispatching wheel deltas, which Lenis/scrolljack reads.
async function wheelStep(page, delta) {
  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, delta);
}

async function extractStyles(page) {
  return page.evaluate(() => {
    const sample = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        color: cs.color,
        background: cs.backgroundColor,
        fontFamily: cs.fontFamily,
        fontWeight: cs.fontWeight,
        fontSize: cs.fontSize,
        letterSpacing: cs.letterSpacing,
        lineHeight: cs.lineHeight,
        textTransform: cs.textTransform,
        cursor: cs.cursor,
      };
    };
    const canvases = [...document.querySelectorAll('canvas')].map((c) => ({
      w: c.width,
      h: c.height,
      cssW: c.clientWidth,
      cssH: c.clientHeight,
      style: c.getAttribute('style'),
      cls: c.className,
      parentCls: c.parentElement?.className || null,
      zIndex: getComputedStyle(c).zIndex,
      position: getComputedStyle(c).position,
    }));
    // gather a frequency map of colors + fonts across visible text nodes
    const els = [...document.querySelectorAll('body *')].slice(0, 4000);
    const colorFreq = {};
    const fontFreq = {};
    const bgFreq = {};
    for (const el of els) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      colorFreq[cs.color] = (colorFreq[cs.color] || 0) + 1;
      fontFreq[cs.fontFamily] = (fontFreq[cs.fontFamily] || 0) + 1;
      if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)')
        bgFreq[cs.backgroundColor] = (bgFreq[cs.backgroundColor] || 0) + 1;
    }
    const top = (o, n = 12) =>
      Object.entries(o)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n);
    const headings = [...document.querySelectorAll('h1,h2,h3,[class*="title"],[class*="head"]')]
      .slice(0, 8)
      .map((el) => ({ tag: el.tagName, text: (el.textContent || '').trim().slice(0, 60), ...sample(el) }));
    return {
      url: location.href,
      docBg: getComputedStyle(document.body).backgroundColor,
      htmlBg: getComputedStyle(document.documentElement).backgroundColor,
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      canvases,
      colorFreq: top(colorFreq),
      fontFreq: top(fontFreq),
      bgFreq: top(bgFreq),
      headings,
      bodyCursor: getComputedStyle(document.body).cursor,
      links: [...document.querySelectorAll('a,button')].slice(0, 10).map(sample),
    };
  });
}

async function run() {
  const browser = await chromium.launch({
    executablePath: EXEC,
    args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const report = { url: URL, capturedAt: new Date().toISOString(), viewports: {} };

  const only = process.env.ONLY_VP;
  for (const vp of VIEWPORTS) {
    if (only && vp.name !== only) continue;
    mkdirSync(join(OUT, vp.name), { recursive: true });
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      userAgent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148 Safari/537.36',
    });
    const page = await ctx.newPage();
    const consoleErrs = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrs.push(m.text().slice(0, 200)));
    try {
      await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
      const loaded = await waitForLoaderGone(page);
      console.log(`  ${vp.name} loader gone: ${loaded}`);
      await settle(page, 3000); // intro animation settle after .js-preloader removal

      // capture the intro/hero first
      await page.screenshot({ path: join(OUT, vp.name, 'step-00-intro.png') });
      console.log(`  ${vp.name} step-00-intro captured`);

      // drive the wheel-hijack experience in steps, capturing the in-between frames
      const STEPS = 9;
      const DELTA = vp.height; // roughly one "screen" of virtual scroll per step
      for (let i = 1; i <= STEPS; i++) {
        // several smaller ticks per step so easing/inertia engages like a real user
        for (let k = 0; k < 4; k++) {
          await wheelStep(page, Math.round(DELTA / 4));
          await sleep(120);
        }
        await settle(page, 1100);
        const label = String(i).padStart(2, '0');
        await page.screenshot({ path: join(OUT, vp.name, `step-${label}.png`) });
        console.log(`  ${vp.name} step-${label} captured`);
      }

      const styles = await extractStyles(page);
      report.viewports[vp.name] = { ...vp, styles, loaded, consoleErrs: consoleErrs.slice(0, 8) };
      console.log(`[ok] ${vp.name}: ${styles.canvases.length} canvas(es), scrollH=${styles.scrollHeight}, loaded=${loaded}`);
    } catch (e) {
      report.viewports[vp.name] = { ...vp, error: String(e) };
      console.log(`[err] ${vp.name}: ${e}`);
    } finally {
      await ctx.close();
    }
    // incremental write so a kill never loses progress
    writeFileSync(join(OUT, 'styles.json'), JSON.stringify(report, null, 2));
  }

  await browser.close();
  console.log(`\nWrote ${join(OUT, 'styles.json')} and screenshots under ${OUT}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
