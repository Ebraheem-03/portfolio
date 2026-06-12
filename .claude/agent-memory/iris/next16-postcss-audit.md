---
name: next16-postcss-audit
description: Next 16.2.9 ships a vulnerable postcss 8.4.31 transitively; clear the npm-audit advisory with a postcss override rather than a downgrade.
metadata:
  type: project
---

The portfolio is on **next 16.2.9 / React 19.2.7** (migrated from 14.2.33 on 2026-06-12).

`next@latest` (16.2.9) still bundles **postcss 8.4.31**, which trips the postcss stringify-XSS
advisory (GHSA-qx2v-qp2m-jg93, needs `>=8.5.10`). `npm audit fix --force` "resolves" it by
proposing a downgrade to next@9 — wrong, ignore that.

**Fix in place:** `package.json` has `"overrides": { "postcss": "^8.5.15" }`, which forces the
patched postcss under Next. After `npm install`, `npm audit` → **0 vulnerabilities**. postcss
8.4.31 → 8.5.x is a same-major minor bump, safe for Next's usage; build stays green.

Other migration notes:
- `next.config.mjs`: `experimental.outputFileTracingExcludes` graduated to a **top-level**
  `outputFileTracingExcludes` in Next 15+.
- Added `turbopack.root` (set to the config dir) to silence the workspace-root warning caused by a
  stray `package-lock.json` in `$HOME`.
- Next 16 Turbopack `build` output no longer prints per-route byte sizes (just the static markers).

**Why:** so a future `npm audit` showing this advisory isn't mistaken for a regression, and so the
override isn't removed as "unnecessary."
**How to apply:** when a Next minor bump lands a postcss `>=8.5.10` itself, the override can be
dropped; re-check with `npm ls postcss` + `npm audit`. Until then, keep it.