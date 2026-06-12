# Build Plan

One file on purpose — this project is too small for a week-by-week folder. Load only the
CURRENT phase into context, never the whole file at once.

## Phase 0 — Reference ingestion  (helios, then human review)
- Use Playwright MCP to study the reference site directly (see `PHASE-0-INGESTION-PROMPT.md`).
- Produce `docs/design-analysis.md`: motion language, spatial language, type system, color
  system, interaction grammar, pacing. Extract real hex values — don't guess.
- `[REVIEW]` human signs off on the analysis before any code.

## Phase 1 — Design system  (iris)
- Lock `docs/DESIGN-SYSTEM.md`: color, type scale, spacing, motion durations/easings, z-depth.
- Generate 3 wordmark directions via stitch -> `[REVIEW]`.
- Stand up the Next.js shell, fonts, base layout, Lenis smooth-scroll, reduced-motion plumbing.

## Phase 2 — Static shell & content scaffold  (iris)
- Nav, hero placeholder, "selected work" grid, about, contact. Real copy from `docs/BRAND.md`.
- Each work item is a case-study container: problem -> architecture -> the deployed thing.

## Phase 3 — WebGL hero & signature moment  (helios)
- The 3-second hook. The signature 3D moment must MEAN something (agent loop, not decoration).
- Reduced-motion + no-WebGL fallbacks from day one.

## Phase 4 — Scroll choreography & section transitions  (helios + iris)
- GSAP + Lenis scroll-linked motion. Stagger, parallax, the "in-between frames" matter.

## Phase 5 — Case studies  (iris)
- Agentic e-commerce platform, Resume Analyzer (HF Spaces), MD ministry AI platform.
- Interactive where it earns it. Proof-first: show the architecture and the live link.

## Phase 6 — Backend  (main thread)
- Serverless contact endpoint. Optional headless CMS so case studies update without redeploy.
- Analytics.

## Phase 7 — Performance & QA pass  (vesper)
- Lighthouse to budget, bundle split, mobile LCP, visual-regression baseline, cross-browser.

## Phase 8 — Deploy
- Vercel/Netlify. Domain. Wordmark + handle consistent with LinkedIn + GitHub.
