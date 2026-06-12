---
name: ref-ingestion-gotchas
description: Hard-won gotchas capturing the Resn corn reference via Playwright + swiftshader (Phase 0 ingestion)
metadata:
  type: project
---

Capturing `cornrevolution.resn.global/#science` headless via `scripts/ingestion/capture.mjs`
(cached Chromium, `--use-gl=swiftshader`). Gotchas, in priority order:

- **Loader detection.** The "NN% Loading your experience" counter IS real DOM text inside
  `<div class="preloader js-preloader">`, but the reliable "loaded" signal is that node being
  REMOVED from the DOM (not any innerText/regex — those false-positive). **Two-stage wait
  required:** at `domcontentloaded` the preloader doesn't exist yet (JS injects it ~5-10s
  later), so a naive `!querySelector('.preloader')` returns TRUE instantly on the t=0 race.
  Must FIRST wait for it to APPEAR, THEN wait for removal. Full arc ~55-60s under swiftshader.
  After removal, settle ~3s before first capture (else you catch the 99% tail).
- **Swiftshader dims everything ~3-4×.** No real bloom/HDR, banded gradients, aliased particles.
  Canvas pixel colors are directional only — brightened/inferred values must be flagged. Judge
  GRAMMAR (motion arc, composition, type, pacing) + pull resolution-independent facts from
  DOM/CSS (fonts, white text, black bg, canvas layer structure). **Why:** no GPU available here.
- **Wheel-hijack / virtual scroll.** `window.scrollTo` is inert; `scrollHeight === innerHeight`
  at every viewport. Progression = `page.mouse.wheel(0, delta)` fed to a smoothed scroll
  controller (Lenis-class). `wheelStep()` works ONLY after the preloader is truly gone. Several
  small ticks per step (delta/4 ×4) reads more like real inertia than one big delta.
- **All content is canvas.** After load `body.innerText === ""` and there are ~4 `<section>`s
  (DOM scaffolding; the visual journey reads ~6 stations — the camera does the pacing). Text
  overlay (logo/nav/headline/labels) is white HTML above one full-bleed `position:absolute`
  canvas (parent `.root`, `z auto`) on a pure-black page.
- **Mobile (390px) degrades to a poster/intro** — wheel doesn't auto-advance the camera; frames
  barely change (full scroll-experience gated behind tap-to-start). Good precedent for our own
  mobile graceful-degrade.
- **`loaded:false` in styles.json is cosmetic** — capture still produces real frames if the
  wheel ran past the preloader. Verify by frame file SIZE: preloader frames ~35KB (near-black),
  real WebGL frames 1-4.5MB and VARYING. Don't trust the flag; look at the PNGs.
- Validate fast with `ONLY_VP=desktop-1920 node capture.mjs` before running all four.
  `probe.mjs` / `probe2.mjs` exist for DOM-state sampling over time if loader behavior shifts.
