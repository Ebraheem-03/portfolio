// VESPER perf/QA pass — bundle/network/CLS/timing against prod build on :3100.
// Software-WebGL (swiftshader) headless: paint/FPS unreliable; focus net/DOM/CLS/JS.
import { chromium } from 'playwright-core';
import { statSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const EXEC = '/home/tk-lpt-274/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';
const BASE = 'http://localhost:3100';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const kb = (b) => (b / 1024).toFixed(1);

const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

// ---------------------------------------------------------------------------
// 1) BUNDLE / NETWORK: what does the INITIAL document pull, and is three split out?
// ---------------------------------------------------------------------------
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const reqs = []; // {url, type, status, size}
page.on('response', async (res) => {
  const req = res.request();
  let size = 0;
  try { const buf = await res.body(); size = buf.length; } catch {}
  reqs.push({ url: res.url(), type: req.resourceType(), status: res.status(), size });
});

// Grab raw initial HTML (pre-JS) separately to see static script refs.
const htmlResp = await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
const html = await htmlResp.text();
const htmlBytes = Buffer.byteLength(html);

// scripts referenced directly in the server HTML (the "initial" set)
const scriptRefs = [...html.matchAll(/\/_next\/static\/[^"']+?\.js/g)].map((m) => m[0]);
const uniqInitialScripts = [...new Set(scriptRefs)];

// Is the heavy three chunk referenced in the raw HTML?
const threeChunkName = '2v3kn85onf7u0.js'; // the 1.0MB chunk
const threeInHtml = html.includes(threeChunkName);

console.log('\n========== INITIAL DOCUMENT (raw server HTML) ==========');
console.log('HTML doc bytes        :', kb(htmlBytes), 'KB');
console.log('script refs in HTML   :', uniqInitialScripts.length);
console.log('three(1MB) in raw HTML:', threeInHtml ? 'YES (FAIL)' : 'no');

// map initial-script names to on-disk raw sizes
const chunkDir = join(__dirname, '..', '..', '.next', 'static');
let initialRaw = 0;
console.log('\n--- scripts in initial HTML (raw on-disk bytes) ---');
for (const ref of uniqInitialScripts) {
  const rel = ref.replace('/_next/', '');
  const fp = join(chunkDir, rel);
  let sz = 0;
  try { sz = statSync(fp).size; } catch {}
  initialRaw += sz;
  console.log(`  ${kb(sz).padStart(9)} KB  ${ref}`);
}
console.log('INITIAL raw JS total  :', kb(initialRaw), 'KB (uncompressed)');

// Now let the page fully settle so WebGL decides + lazy-loads.
await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
await sleep(2500); // give the deferred rAF + dynamic import time

// ---------------------------------------------------------------------------
// Network totals after full settle (motion path, desktop -> canvas mounts)
// ---------------------------------------------------------------------------
const jsReqs = reqs.filter((r) => r.url.endsWith('.js') || r.type === 'script');
const cssReqs = reqs.filter((r) => r.url.endsWith('.css') || r.type === 'stylesheet');
const fontReqs = reqs.filter((r) => r.type === 'font' || /\.woff2?($|\?)/.test(r.url));
const total = reqs.reduce((s, r) => s + r.size, 0);
const jsTotal = jsReqs.reduce((s, r) => s + r.size, 0);

const lazyThree = reqs.find((r) => r.url.includes(threeChunkName));
const threeFetched = !!lazyThree;

console.log('\n========== AFTER FULL SETTLE (desktop motion path) ==========');
console.log('total transfer (all)  :', kb(total), 'KB');
console.log('  JS total            :', kb(jsTotal), 'KB  (', jsReqs.length, 'files)');
console.log('  CSS total           :', kb(cssReqs.reduce((s,r)=>s+r.size,0)), 'KB');
console.log('  Fonts               :', kb(fontReqs.reduce((s,r)=>s+r.size,0)), 'KB  (', fontReqs.length, 'files)');
console.log('three chunk fetched   :', threeFetched ? `YES, ${kb(lazyThree.size)} KB (raw transfer)` : 'NO (canvas did not mount)');

// biggest single resources
const big = [...reqs].sort((a,b)=>b.size-a.size).slice(0,8);
console.log('\n--- biggest resources fetched ---');
for (const r of big) console.log(`  ${kb(r.size).padStart(9)} KB  [${r.type}] ${r.url.split('/').slice(-1)[0]}`);

// ---------------------------------------------------------------------------
// 2) TIMING + CLS (caveat: software WebGL skews paint)
// ---------------------------------------------------------------------------
const perf = await page.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0] || {};
  const paints = {};
  for (const p of performance.getEntriesByType('paint')) paints[p.name] = p.startTime;
  const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
  const lcp = lcpEntries.length ? lcpEntries[lcpEntries.length - 1].startTime : null;
  return {
    ttfb: nav.responseStart,
    domContentLoaded: nav.domContentLoadedEventEnd,
    loadEvent: nav.loadEventEnd,
    fcp: paints['first-contentful-paint'] ?? null,
    lcp,
  };
});
console.log('\n========== TIMING (headless+swiftshader — caveat) ==========');
console.log('TTFB                  :', perf.ttfb?.toFixed(0), 'ms');
console.log('FCP                   :', perf.fcp?.toFixed(0), 'ms');
console.log('LCP (PerfObserver)    :', perf.lcp != null ? perf.lcp.toFixed(0)+' ms' : 'n/a');
console.log('DOMContentLoaded      :', perf.domContentLoaded?.toFixed(0), 'ms');
console.log('load event            :', perf.loadEvent?.toFixed(0), 'ms');

await ctx.close();

// ---------------------------------------------------------------------------
// 3) CLS measurement on the MOTION path (reload with a CLS observer installed early)
//    + reduced-motion + phone-class fallback layout checks.
// ---------------------------------------------------------------------------
async function measureCLS(label, opts) {
  const c = await browser.newContext({
    viewport: opts.viewport,
    reducedMotion: opts.reduced ? 'reduce' : 'no-preference',
    hasTouch: !!opts.touch,
    isMobile: !!opts.touch,
  });
  const pg = await c.newPage();
  // install CLS observer as the doc starts
  await pg.addInitScript(() => {
    window.__cls = 0;
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (!e.hadRecentInput) window.__cls += e.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
  });
  await pg.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await sleep(1500);
  // scroll through to trigger reveals (the choreography path)
  const depths = [0, 0.25, 0.5, 0.75, 1];
  for (const d of depths) {
    await pg.evaluate((dd) => window.scrollTo(0, document.body.scrollHeight * dd), d);
    await sleep(500);
  }
  await sleep(500);
  const cls = await pg.evaluate(() => window.__cls || 0);
  // is canvas present?
  const hasCanvas = await pg.locator('canvas').count();
  const choreo = await pg.evaluate(() => document.documentElement.getAttribute('data-choreo'));
  // sections present?
  const sectionsVisible = await pg.evaluate(() => {
    const ids = ['work', 'about', 'contact'];
    return ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return `${id}:MISSING`;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return `${id}:${r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' ? 'present' : 'HIDDEN'}`;
    }).join(' ');
  });
  console.log(`\n========== ${label} ==========`);
  console.log('CLS                   :', cls.toFixed(4));
  console.log('canvas present        :', hasCanvas, '   data-choreo:', choreo);
  console.log('sections              :', sectionsVisible);
  await c.close();
  return { cls, hasCanvas, choreo };
}

await measureCLS('MOTION PATH (desktop 1440, no reduced)', { viewport: { width: 1440, height: 900 } });
await measureCLS('REDUCED-MOTION (desktop 1440)', { viewport: { width: 1440, height: 900 }, reduced: true });
await measureCLS('PHONE-CLASS (390 + touch)', { viewport: { width: 390, height: 844 }, touch: true });

await browser.close();
console.log('\n[qa-perf] done');
