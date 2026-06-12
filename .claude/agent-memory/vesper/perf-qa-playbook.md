# vesper — perf/QA playbook (this env)

## Sandbox gotchas (learned 2026-06-12)
- **`curl` and `npx lighthouse` are BLOCKED** — the Bash sandbox denies outbound network for these
  (even to localhost). Do NOT keep retrying; fall back to **playwright-core** (it talks to Chromium
  over a pipe, not the blocked net path) for ALL fetch/timing/CLS/a11y work.
- `find ... -printf | awk` and some piped one-liners trip the sandbox denial. Use Node (`fs.statSync`,
  `zlib.gzipSync`) for sizing instead — it's also how you get true gzip numbers.
- Do NOT `cd` inside a Bash compound command (triggers a perm prompt). Use absolute paths.
- Chromium exec: `/home/tk-lpt-274/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome`.
  Launch with `--no-sandbox --use-gl=swiftshader --enable-unsafe-swiftshader`.
- WebGL = **swiftshader (software)** headless → paint/GPU/FPS/TBT timing is UNRELIABLE. Trust
  network / DOM / CLS / JS-bytes / which-chunks-load. Caveat any LCP ms hard.

## The recipe (prod, not dev)
1. `rm -rf .next && npm run build` (Next 16 Turbopack prints NO per-route byte sizes — measure `.next`).
2. `npx next start -p 3100` in the BACKGROUND (run_in_background; leave the :3000 dev server alone).
   Kill by explicit PID only — never `pkill -f "next start"` (matches your own task).
3. Scripts (reusable): `scripts/ingestion/qa-perf.mjs`, `scripts/ingestion/qa-a11y-lcp.mjs`.

## How to size first-load vs lazy (the real number)
- Fetch raw `/` HTML via playwright `goto(..., waitUntil:'domcontentloaded')` then `.text()`.
  Regex `/_next/static/[^"']+\.js` → that set IS the initial first-load JS. gzip each file from
  `.next/static/chunks/` with `zlib.gzipSync`. Sum = real initial first-load JS.
- The heavy three chunk is the ~1 MB raw / ~309 KB gz file (`2v3kn85onf7u0.js` this build — name
  is content-hashed, will change). Confirm it is **absent** from raw HTML = correctly code-split.
- Probe chunk contents for libs by `readFileSync(...,'utf8').includes('gsap'|'ScrollTrigger'|'three')`.

## Snapshot (Phase 4 build, 2026-06-12)
- Initial first-load JS: **233.5 KB gz** (NOT the 156 KB on record — GSAP+ScrollTrigger ~44 KB gz
  ship EAGERLY in first-load, filed P1 for helios/main-thread to defer or correct the claim).
- Lazy WebGL chunk: **308.8 KB gz** ✅ deferred, 0 refs in raw HTML.
- CLS **0.0000** on all 3 paths. LCP element = server-rendered `<h1>` (not canvas-gated) ✅.
- A11y: tab order/anchor/mobile-menu/Escape all pass; contrast passes AA (muted 6.08:1).
  One P2: input focus is color-only (accent border, no ring) — iris.
- Still owed: a REAL Lighthouse / real-device run for a trustworthy mobile-LCP/TBT number.
