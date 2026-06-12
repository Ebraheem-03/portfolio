// VESPER — a11y keyboard smoke + LCP element/timing + AA contrast spot-checks.
import { chromium } from 'playwright-core';
const EXEC = '/home/tk-lpt-274/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';
const BASE = 'http://localhost:3100';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

// ---------- LCP via observer (mobile-ish viewport, CPU throttle via CDP) ----------
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
// CDP CPU throttle (4x) + slow network to approximate mid-mobile
const cdp = await ctx.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.addInitScript(() => {
  window.__lcp = null; window.__lcpEl = '';
  new PerformanceObserver((l) => {
    const es = l.getEntries();
    const last = es[es.length - 1];
    window.__lcp = last.startTime;
    window.__lcpEl = last.element ? (last.element.tagName + '.' + (last.element.className || '')) : '';
  }).observe({ type: 'largest-contentful-paint', buffered: true });
});
await page.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
await sleep(2000);
// force LCP finalization by interacting
await page.evaluate(() => window.scrollTo(0, 1));
await sleep(500);
const lcp = await page.evaluate(() => ({ t: window.__lcp, el: window.__lcpEl }));
console.log('========== LCP (mobile 390, 4x CPU throttle, swiftshader) ==========');
console.log('LCP time              :', lcp.t != null ? lcp.t.toFixed(0) + ' ms' : 'n/a');
console.log('LCP element           :', lcp.el || '(none)');
await ctx.close();

// ---------- a11y keyboard smoke (desktop) ----------
const c2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p2 = await c2.newPage();
await p2.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
await sleep(800);

console.log('\n========== A11Y: keyboard tab order (first ~18 focusables) ==========');
const order = [];
for (let i = 0; i < 18; i++) {
  await p2.keyboard.press('Tab');
  const info = await p2.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const cs = getComputedStyle(el);
    // focus-visible heuristic: any outline / box-shadow / border change present
    const hasRing = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
      (cs.boxShadow && cs.boxShadow !== 'none');
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || el.getAttribute('aria-label') || el.getAttribute('href') || '').trim().slice(0, 34),
      type: el.getAttribute('type') || '',
      ring: hasRing,
    };
  });
  if (info) order.push(`${String(i+1).padStart(2)}. <${info.tag}${info.type?` type=${info.type}`:''}> ${info.ring?'[ring]':'[NO-RING]'}  "${info.text}"`);
}
console.log(order.join('\n'));

// ---------- anchor landing: tab to a nav link, Enter, check hash + scroll ----------
console.log('\n========== A11Y: anchor nav landing ==========');
// click the Contact nav link directly via keyboard accessible name
const contactLink = p2.locator('a[href="#contact"]').first();
const hasContactLink = await contactLink.count();
if (hasContactLink) {
  await contactLink.focus();
  await p2.keyboard.press('Enter');
  await sleep(1200);
  const res = await p2.evaluate(() => {
    const el = document.getElementById('contact');
    const r = el ? el.getBoundingClientRect() : null;
    return { hash: location.hash, contactTop: r ? Math.round(r.top) : 'n/a' };
  });
  console.log('after Enter on #contact link  → hash:', res.hash, ' contact top:', res.contactTop, 'px');
} else {
  console.log('no a[href="#contact"] found');
}

// ---------- mobile menu (disclosure) a11y ----------
console.log('\n========== A11Y: mobile disclosure menu (390) ==========');
const cm = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
const pm = await cm.newPage();
await pm.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
await sleep(600);
const menuBtn = pm.locator('button[aria-expanded]').first();
const menuExists = await menuBtn.count();
if (menuExists) {
  const before = await menuBtn.getAttribute('aria-expanded');
  const controls = await menuBtn.getAttribute('aria-controls');
  await menuBtn.click();
  await sleep(400);
  const after = await menuBtn.getAttribute('aria-expanded');
  const panelVisible = controls ? await pm.locator(`#${controls}`).isVisible().catch(() => false) : false;
  // Escape closes?
  await pm.keyboard.press('Escape');
  await sleep(300);
  const afterEsc = await menuBtn.getAttribute('aria-expanded');
  console.log(`aria-expanded: ${before} → click → ${after} → Esc → ${afterEsc}`);
  console.log(`aria-controls: ${controls}  panel visible on open: ${panelVisible}`);
} else {
  console.log('no button[aria-expanded] (disclosure) found at 390');
}
await cm.close();

// ---------- AA contrast spot-check on shipped palette ----------
console.log('\n========== A11Y: contrast spot-check (computed colors) ==========');
const contrast = await p2.evaluate(() => {
  function lum(rgb) {
    const [r,g,b] = rgb.map(v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); });
    return 0.2126*r + 0.7152*g + 0.0722*b;
  }
  function parse(c) { const m = c.match(/[\d.]+/g); return m ? m.slice(0,3).map(Number) : [0,0,0]; }
  function ratio(fg, bg) { const a=lum(parse(fg))+0.05, b=lum(parse(bg))+0.05; return (Math.max(a,b)/Math.min(a,b)); }
  const samples = [];
  const pick = (sel, label) => {
    const el = document.querySelector(sel);
    if (!el) { samples.push(`${label}: (not found)`); return; }
    const cs = getComputedStyle(el);
    let bg = cs.backgroundColor;
    // walk up for non-transparent bg
    let p = el;
    while (p && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) { p = p.parentElement; if(!p) break; bg = getComputedStyle(p).backgroundColor; }
    if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') bg = 'rgb(0,0,0)';
    const r = ratio(cs.color, bg);
    samples.push(`${label}: ${r.toFixed(2)}:1  (fg ${cs.color} on ${bg}) size ${cs.fontSize}/${cs.fontWeight}`);
  };
  pick('p', 'body paragraph');
  // muted-ish elements
  const muted = [...document.querySelectorAll('*')].find(e => {
    const c = getComputedStyle(e).color;
    return c.includes('138, 138, 138') || c.includes('rgb(138');
  });
  if (muted) { const cs=getComputedStyle(muted); samples.push(`--muted sample text: present (${cs.fontSize})`); }
  pick('a', 'link');
  pick('input', 'input value text');
  pick('label', 'form label');
  pick('button', 'button text');
  return samples;
});
console.log(contrast.join('\n'));

await c2.close();
await browser.close();
console.log('\n[qa-a11y-lcp] done');
