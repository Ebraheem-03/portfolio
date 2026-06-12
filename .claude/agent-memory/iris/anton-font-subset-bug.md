---
name: anton-font-subset-bug
description: The vendored Anton woff2 is a Vietnamese subset missing basic Latin A–Z, so Anton-set headlines silently fall back to Impact.
metadata:
  type: project
---

`app/fonts/anton-400.woff2` (the display face, `--font-display`) is a **Vietnamese subset** whose
cmap does NOT contain basic Latin A–Z (only space + Vietnamese-accented glyphs). Confirmed via
fontTools: `getBestCmap()` has 115 entries, `E`/`G` (and all plain caps) absent.

**Consequence:** every Anton-set headline (`.display`, hero, section titles) silently falls back to
the `Impact` fallback for Latin text. The intended ultra-condensed Anton voice is NOT actually
rendering for normal copy. This is latent — the build is green and it looks "a font" so it's easy
to miss.

The EG monogram does NOT depend on this: its glyph geometry was baked to vector paths (extracted
from the full Latin Anton-Regular.ttf, not the vendored subset), so the mark renders correctly
regardless.

**Why:** flagged during the Phase-1 review work (2026-06-12) while converting the monogram to paths.
Out of scope for that task, so it's a tracked finding in `docs/STATUS.md`, not yet fixed.
**How to apply:** before relying on Anton for any visible Latin copy, swap in a Latin (or full)
Anton woff2. To verify a font subset has the glyphs you need: load it with fontTools
(`pip install brotli` first for woff2) and check `TTFont(path).getBestCmap()` contains the codepoints.
Related: [[brand-identity]].