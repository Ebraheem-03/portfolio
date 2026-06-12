---
name: anton-font-subset-bug
description: RESOLVED — the vendored Anton woff2 now has full Latin A–Z; headlines render in real Anton, not the Impact fallback.
metadata:
  type: project
---

**RESOLVED as of 2026-06-12 (Phase 2 verification).** `app/fonts/anton-400.woff2` now contains the
full basic Latin A–Z. Confirmed via fontTools: `getBestCmap()` has all 26 uppercase letters; the
file is ~18.6 KB. Anton-set headlines (`.display`, hero, section titles, work-card titles, the
mobile menu, the social-link labels) render in the intended ultra-condensed Anton voice — verified
visually in headless-Chrome captures (the condensed grotesque is unmistakably Anton, not Impact).

History: during Phase 1 the vendored woff2 was a Vietnamese subset missing Latin A–Z, so headlines
silently fell back to `Impact`. That subset has since been swapped for a Latin-bearing Anton woff2.
The `docs/STATUS.md` Phase-1 note flagging the subset bug is now stale — the swap happened.

The EG monogram never depended on the font either way: its geometry is baked to vector paths in
`components/Wordmark.tsx`.

**Why this matters going forward:** if Anton headlines ever look like plain Impact again, suspect a
woff2 regression first. **How to verify a font subset has the glyphs you need:** load it with
fontTools (`pip install brotli` for woff2) and check `TTFont(path).getBestCmap()` contains the
codepoints. Related: [[brand-identity]], [[verifying-ui-visually]].
