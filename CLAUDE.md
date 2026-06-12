# CLAUDE.md — Portfolio Site

This is a behavioral contract, not documentation. Every line here should change how you act.

## What this is
A personal portfolio for an AI engineer who *ships agentic systems*. The site is itself the
flex: it must prove frontend craft + taste in the first 3 seconds, then prove AI/architecture
depth through interactive case studies. Audience: CTOs, founders, design-literate clients,
potential cofounders. They have seen everything and are hard to impress.

## The bar (non-negotiable)
- If a screen reads like a Tailwind template, a Vercel landing clone, or a "modern SaaS
  portfolio," it has FAILED. The floor is the cinematic, scroll-choreographed, GPU-driven feel
  of the Resn reference (see `docs/design-analysis.md`).
- Translate the reference grammar; never copy its content. Corn -> AI engineer.
- Proof-first, never adjective-first. No "passionate about AI," no "cutting-edge solutions."

## Stack
Next.js (App Router) · React Three Fiber + drei · GLSL shaders for signature moments ·
GSAP + Lenis for scroll · Framer Motion for component motion. Runtime is mostly static +
a serverless contact endpoint. All intelligence is build-time.

## Agents (hub-and-spoke through this main thread)
- **helios** — creative-coding & motion: R3F scene, shaders, scroll choreography.
- **iris**   — frontend build & design system: components, layout, responsive, a11y, wordmark.
- **vesper** — performance & QA: Lighthouse/bundle budgets, cross-device, Playwright visual regression.
Backend (contact form / optional CMS) stays in THIS thread unless it grows.

Subagents do NOT share memory and cannot talk to each other. All cross-agent state lives in
`docs/STATUS.md`, `docs/DESIGN-SYSTEM.md`, and `docs/BRAND.md`. Read those before delegating.

## Skills & tools (don't confuse them)
- **Skills** (named in an agent's `skills:` frontmatter): **stitch** (branding/wordmark) and
  **impeccable** (production-UI standard). iris carries both.
- **MCP** (configured in `.mcp.json`, reached via the `tools` field): **21st.dev Magic** —
  generates React components (`/ui`, `/21`, refiner, `logo_search`). iris omits its `tools` list
  so it inherits the Magic MCP tools; an explicit allow-list would exclude them.
- helios and vesper carry no skills and need no MCP.

## Golden rules (token discipline)
1. Load only the CURRENT phase from `docs/plan.md`. Never load the whole plan or whole repo.
2. Read `docs/DESIGN-SYSTEM.md` before building any UI so the site stays coherent.
3. Update `docs/STATUS.md` after every unit of work: what changed, what's blocked, what needs review.
4. Don't add features beyond the current phase. Resist scope creep and agent sprawl.

## Git discipline
- Branches: feature/* -> dev -> main. Daily commits. Module-wise feature branches, PR into dev.
- Tag items in STATUS.md as `[AFK]` (safe to do unattended) or `[REVIEW]` (needs the human).
- Never delete a file unless the plan explicitly says to.

## When you hit a conflict
Don't guess. Describe the conflict and propose two options before acting.
