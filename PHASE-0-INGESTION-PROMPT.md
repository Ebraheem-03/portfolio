# Phase 0 — paste this to helios (Playwright MCP enabled)

Before writing a single line of code, study the reference directly. Do not work from memory or
assumptions about what "3D websites" look like.

1. Use Playwright MCP to navigate to https://cornrevolution.resn.global/#science
2. Take full-page screenshots at multiple scroll positions: top, ~25%, ~50%, ~75%, bottom, and
   the `#science` anchor specifically.
3. Capture at multiple viewports: 1920x1080, 1440x900, 768x1024 (tablet), 390x844 (mobile).
4. Scroll slowly and programmatically; capture intermediate frames — the magic is in the
   in-between states.
5. Inspect DOM + computed styles for: canvas/WebGL layer structure, scroll-linked transform
   values, color tokens (extract actual hex/rgb), font stacks + type scale, cursor + hover states.
6. Record everything in `docs/design-analysis.md` under its existing headings.

Then STOP and tag `[REVIEW]`. Do not start building. The human signs off on the analysis first.

Translate, do not copy: the reference is about corn; this site is about an AI engineer. The
GRAMMAR of motion and immersion transfers; the content and metaphor must be entirely original.
