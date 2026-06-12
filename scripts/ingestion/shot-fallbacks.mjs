// Verify the three Phase-3 fallback paths render correctly.
import { chromium } from 'playwright-core';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'app-shots');
const EXEC = '/home/tk-lpt-274/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const URL = 'http://localhost:3000';

const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] });

// 1. reduced-motion: expect a STILL canvas frame (mid-ignition), no animation.
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' }).catch(() => {});
  await sleep(2000);
  await page.screenshot({ path: join(OUT, 'hero-reduced-motion.png') });
  await ctx.close();
  console.log('shot hero-reduced-motion.png');
}

// 2. no-WebGL: stub getContext to refuse webgl → expect POSTER gradient only.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (typeof type === 'string' && type.toLowerCase().includes('webgl')) return null;
      return orig.call(this, type, ...rest);
    };
    // also kill the constructor check
    // @ts-ignore
    delete window.WebGLRenderingContext;
  });
  await page.goto(URL, { waitUntil: 'networkidle' }).catch(() => {});
  await sleep(2000);
  await page.screenshot({ path: join(OUT, 'hero-no-webgl.png') });
  await ctx.close();
  console.log('shot hero-no-webgl.png');
}

await browser.close();
console.log('done');
