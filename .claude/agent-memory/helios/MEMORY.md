---
name: helios-memory
description: helios (creative-tech) working memory — R3F / GLSL / perf gotchas for this portfolio
metadata:
  type: project
---

# helios MEMORY

Cross-session memory for the creative-technologist role on this portfolio. Phase-0 ingestion
gotchas live separately in `scripts/ingestion/.claude/agent-memory/helios/ref_ingestion_gotchas.md`
(swiftshader/loader/wheel-hijack). This file = build-time R3F/shader/perf lessons.

## The signature moment (Phase 3) — what it is, so I don't re-derive it
A literal **agent reasoning/acting loop**: 4 stage-clusters INTENT→REASONING→ACTION→OUTCOME on a
tilted ellipse, each = a hub + 3–4 satellite sub-steps. A signal pulse runs the hub→hub spine; a
single `progress` ref (0..1 loop head) is the ONE source of truth, read by both shaders. Files:
`components/hero/{agentGraph,Connectors,Nodes,HeroScene,HeroCanvas}.tsx` + `components/HeroExperience.tsx`.
The graph topology is **seeded/deterministic** (mulberry32, no Math.random) so SSR, the
reduced-motion still, the swiftshader shot, and the GPU all agree on layout. If Phase 4 drives the
loop from scroll, just write `progress.current` from Lenis instead of the wall clock — don't touch
the shaders.

## R3F / version gotchas
- **React 19 needs R3F 9 / drei 10 / postprocessing 3.** Older majors (R3F 8, drei 9) peer-dep on
  React 18 and will fight the install. These are the correct majors; do not downgrade.
- `@react-three/postprocessing` and `postprocessing` block `require('<pkg>/package.json')` via their
  `exports` map — that's cosmetic, the packages resolve fine. Check `require('three').REVISION`
  instead to confirm three installed.
- `next lint` is GONE in Next 16 (`Invalid project directory ... /lint`). The `build` step runs the
  TypeScript pass, which is the real gate. Don't rely on `npm run lint`.

## Shader / scene gotchas
- **Inline GLSL as template strings** (`/* glsl */ \`...\``) — no shader-loader, no extra build
  config, no asset-pipeline risk. Phase-0 logged loader fragility; this sidesteps it entirely.
- **Billboard instanced points cheaply:** one `PlaneGeometry(1,1)` + `InstancedMesh`; in the vertex
  shader take `modelViewMatrix * instanceMatrix * vec4(0,0,0,1)` for the center, then add
  `position.xy * size` in VIEW space → camera-facing discs, one draw call, no per-frame JS billboard.
- **Instance matrices are static** here — set them once behind a `placed` ref guard inside useFrame
  (instanceMatrix isn't ready on first render); after that only uniforms update. Don't rewrite
  matrices every frame.
- **Additive glow recipe over black:** `blending: AdditiveBlending`, `depthWrite:false`,
  `transparent:true`; fragment returns `vec4(color*intensity, intensity)` (alpha carries the glow).
  Soft disc = `smoothstep` core + wider `smoothstep` halo from quad-uv radius; `discard` outside r=1.
- **A travelling pulse along a loop:** give each spine edge `aLoopStart/aLoopEnd` (its slice of
  [0,1)), interpolate across the edge with an `aEnd` 0→1 attribute, then `smoothstep(pulseLen,0,
  forwardDist(head,loopPos))` for a trailing comet. Square it to sharpen the head.
- **Group drift must add to a base, not overwrite it:** I parked the graph at `position=[BASE_X,
  BASE_Y,0]` then animated `position.y = BASE_Y + sin()`. Writing `position.y = sin()` directly
  silently throws away the offset (cost me one screenshot). Same trap for any animated transform
  layered on a static placement.

## Perf / bundle (what kept LCP safe)
- **Code-split the whole 3D stack:** `dynamic(() => import('./hero/HeroCanvas'), { ssr:false })`.
  Verified the three chunk (~1.0 MB raw / ~309 KB gz) has **0 refs in the initial page HTML** — it
  loads only after the client decides to mount. Check with:
  `grep -c <chunkhash> .next/server/app/index.html` (expect 0) and
  `find .next/static/chunks -name '*.js' -printf '%s %p\n' | sort -rn` to find the heavy chunk;
  `grep -rl ACESFilmicToneMapping .next/static/chunks` pinpoints the three chunk by hash. Next 16
  Turbopack no longer prints per-route byte sizes, so measure chunks by hand.
- **Defer the WebGL decision one rAF** inside HeroExperience's effect so the headline paints before
  anything touches `getContext`. The poster gradient is always already behind, so "render nothing
  until decided" never flashes blank.
- DPR cap `[1, 1.75]` desktop / `[1,1.25]` mobile; `antialias:false` (bloom + additive hides
  aliasing and saves fill-rate — bloom is fill-rate bound, not vertex bound, so this matters).

## The three guards (mandatory, from day one)
- **No-WebGL:** feature-detect (`WebGLRenderingContext` + `getContext('webgl2'||'webgl')`); on fail
  render NOTHING → the static radial-gradient poster in `.stage` shows. Never blank.
- **Reduced-motion:** read `useReducedMotion` (defaults true on SSR). Mount the canvas with
  `frameloop="demand"` and park the loop at a meaningful phase (STILL_PHASE=0.42, mid-ACTION) → one
  frozen, still-readable frame, zero animation.
- **Phone-class (narrow `<768` + `pointer:coarse`):** poster only, no canvas → protect mobile LCP.
  Tablet/low-mem (`navigator.deviceMemory<=4`) → animate but `quality:"low"`.
- Verify all three headless: `reducedMotion:'reduce'` context; an `addInitScript` that nulls
  `getContext('webgl*')` + deletes `window.WebGLRenderingContext`; and a 390/coarse mobile context.
  Script: `scripts/ingestion/shot-fallbacks.mjs` (+ `shot-app.mjs` for the live hero).

## GSAP + Lenis + ScrollTrigger sync (Phase 4) — do it ONCE, cleanly
- **One rAF for both libs.** Drive `lenis.raf` from `gsap.ticker.add` (ticker time is SECONDS →
  `lenis.raf(time*1000)`), and `lenis.on("scroll", ScrollTrigger.update)`. Do NOT keep a second
  standalone `requestAnimationFrame` loop for Lenis — two rAFs and GSAP tweens drift out of phase
  with the smoothed scroll. I removed the old SmoothScroll rAF when I added the ticker.
- **`gsap.ticker.lagSmoothing(0)`** — GSAP's lag-catchup teleports tweens after a stall; Lenis
  already smooths, so disable it or scrubbed triggers jump.
- **`ScrollTrigger.refresh()` after layout settles** (and again on `document.fonts.ready`) — Anton
  vs fallback metrics shift trigger start/end; without a refresh, reveals fire at the wrong scroll.
- **Bridge WebGL↔scroll via a module singleton, NOT React.** `lib/scrollSignal.ts` holds `heroExit`
  in a plain module ref; a scrubbed ScrollTrigger writes it, `HeroScene` reads it in `useFrame`. The
  canvas NEVER re-renders on scroll. With reduced-motion the publisher is never wired so it stays 0
  and the scene math collapses to idle — verify that path (it's why the still hero is untouched).
- **Drive the loop from scroll = ADD a term, don't replace the clock.** `progress.current =
  (t/LOOP + exit*GAIN) % 1` — keeps idle alive AND accelerates on exit. Same "add to base, never
  overwrite" trap as the group-drift one above: I set position.x/y/z explicitly each frame now
  (base + idle + exit-offset) so the exit recede layers on the drift instead of fighting it.
- **Reveal initial states must be JS-armed, never CSS-default.** Hidden state (`opacity:0;
  translateY`) lives behind `html[data-choreo="armed"]`, set ONLY by the choreography component on
  the motion path. No-JS / reduced-motion / pre-hydration → content is visible (never gated behind
  a transform that might not fire; also keeps SSR/headless shots correct). Transform+opacity only →
  CLS ~0. `gsap.context()` + `ctx.revert()` on unmount restores inline styles and kills triggers.
- **Anchor nav still works** with Lenis owning smoothing; ScrollTrigger only observes. Verified
  click→`#contact` lands at top=0. ScrollTrigger does NOT trap focus or reorder tabs.

## Software-WebGL screenshot caveat (still true in Phase 3)
Headless Chromium renders via swiftshader: dim, aliased, **no real bloom** — bright node cores show
but don't smear into glow. Good enough to confirm the canvas MOUNTS, COMPOSITES behind the UI, and
the graph READS as the agent loop. NOT good enough to judge final glow intensity/HDR — that needs a
real GPU eye. Tune `Bloom intensity/radius/luminanceThreshold` in `HeroScene.tsx` on hardware.
