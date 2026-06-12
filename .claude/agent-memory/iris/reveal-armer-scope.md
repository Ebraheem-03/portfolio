---
name: reveal-armer-scope
description: data-reveal hide state only fires under html[data-choreo="armed"], which only the home ScrollChoreography sets — sub-routes must not gate content on it
metadata:
  type: project
---

The `[data-reveal]` hidden state (opacity 0 + translateY) in `app/globals.css` is scoped under
`html[data-choreo="armed"]`. That `armed` attribute is set only by the home page's
`ScrollChoreography` (Phase 4, helios). It does NOT run on other routes.

**Why:** content must never be gated behind a transform that won't fire (DESIGN-SYSTEM.md
reduced-motion rule #4; also protects SSR/headless). On a route with no armer, adding
`data-reveal` is harmless (it stays visible) but adding your own `opacity:0` initial state would
ship the page blank.

**How to apply:** On sub-routes like `app/work/[slug]`, render content visible by default. Don't
copy an `opacity:0`-then-animate pattern from a home section without also shipping (or inheriting)
the armer that reveals it. If a case-study route later wants entrance motion, wire a local
in-view trigger that defaults to visible, same contract as [[verifying-ui-visually]].
