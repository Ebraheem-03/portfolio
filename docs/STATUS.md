# STATUS — living state of the build

Heartbeat doc. Every agent updates this after a unit of work.
Tags: `[AFK]` safe unattended · `[REVIEW]` needs the human.

## Now (current phase: 5 — case-study pages — DONE; awaiting review)

### Phase 5 — case-study pages (iris, 2026-06-12)  [REVIEW]
Dedicated `app/work/[slug]` case studies built against the locked tokens. Files:
- `app/work/[slug]/page.tsx` — server component. `generateStaticParams` (all 3 slugs),
  `generateMetadata` (real per-case title + thesis description), `notFound()` for unknown slugs.
  Spine: hero (index + title + thesis + status-driven proof line + links) → problem → architecture
  (diagram + visible summary figcaption) → decisions → outcome (+ metrics) → clamped prev/next nav.
- `app/work/[slug]/page.module.css` — label-left / prose-right grid echoing the home About section;
  reuses the WorkCard `.liveMark`; private/pending statuses render an honest hollow ring, never a
  fake live dot. Tokens only.
- `components/work/ArchitectureDiagram.tsx` + `.module.css` — server SVG node-graph (the agent-loop
  motif). Lays nodes on the col/row grid, draws directed edges with labels, accent nodes get the one
  cyan treatment + a connector dot (monogram echo). `role="img"` + `<title>`/`<desc>` from
  `diagram.summary`, and the same summary ships as a visible figcaption.

Verify: `tsc --noEmit` clean; `next build` succeeds, all 3 slugs prerender SSG. Routes:
`/work/{agentic-commerce,resume-analyzer,ministry-platform}` → 200, `/work/nonsense` → 404.
Verified visually desktop (1440) + mobile (390). No `lib/work.ts` / token edits.

**Honest gaps left (never fabricated):** resume-analyzer's "Open the live app" (null href) and all
null `metrics` values render as marked `TODO(human)` chips; private/pending statuses render honestly.
The em dashes visible in case-study prose come from `lib/work.ts` (locked data), not iris copy.



## Perf/QA — early pass (vesper, 2026-06-12)  [REVIEW]
Production build (`next build`, Turbopack) + `next start -p 3100`, measured with playwright-core
driving the cached Chromium. **Environment caveat:** Lighthouse and `curl` could not run (the
sandbox blocks outbound localhost network for those tools); fell back to Playwright PerformanceObserver
+ on-disk gzip sizing. WebGL renders via **swiftshader (software)** headless, so all paint/GPU timing
is unreliable — numbers below lean on network/DOM/CLS/JS, which ARE reliable.

### Headline numbers (hard, gzip from `.next/static`)
| Metric | Measured | Budget | Verdict |
|---|---|---|---|
| Initial first-load JS (the 10 scripts referenced in raw `/` HTML, three EXCLUDED) | **233.5 KB gz / 751.7 KB raw** | "lean initial JS" | ⚠️ over the Phase-3 claim |
| Lazy WebGL chunk (`2v3kn85onf7u0.js`, three+R3F+drei+postprocessing) | **308.8 KB gz / 1021 KB raw** | code-split out of initial | ✅ deferred, 0 refs in raw HTML |
| three / canvas in raw server HTML | **absent** (h1 present, `<canvas>` count 0) | 0 refs | ✅ PASS |
| CLS — motion path (desktop), reduced-motion, phone-class (5 scroll depths each) | **0.0000 / 0.0000 / 0.0000** | ~0 | ✅ PASS |
| LCP element | **`<h1>` heroHeadline, server-rendered** (in raw HTML, paints pre-hydration) | not canvas-blocked | ✅ correct |
| LCP time (mobile 390, 4× CPU throttle, swiftshader) | **~384 ms** (UNRELIABLE — no real net throttle, SW-WebGL) | <2.5s mid-mobile | ✅ but caveat hard |
| FCP / TTFB / load (desktop) | 432 / 121 / 546 ms | — | informational only |
| Total transfer, full settle (desktop motion path, canvas mounts) | ~1762 KB (1663 JS + 23 CSS + 31 fonts) | — | dominated by the lazy three chunk |

### Fallbacks (all 3 verified — no layout regression)
- **Motion path** (desktop): `data-choreo=armed`, canvas present, all sections present, **CLS 0**.
- **Reduced-motion** (desktop): `data-choreo=null`, all sections present, **CLS 0**, no transforms.
- **Phone-class** (390 + touch): **no canvas** (poster only, LCP protected), all sections present, **CLS 0**.

### A11y smoke (keyboard, desktop + mobile)
- Tab order is correct & logical: skip-link → wordmark → Work/About/Contact nav → Selected-work →
  fork radio → name/email/message → submit → GitHub/LinkedIn/Email. Focus-visible ring present on
  links, radios, submit, social links.
- Anchor nav: Enter on the `#contact` link lands `#contact` at **top = 0px**, hash updates. ✅
- Mobile disclosure menu (390): `aria-expanded false→true` on click, panel `#mobile-nav` visible,
  **Escape closes** (back to false), `aria-controls` wired. ✅
- Contrast (computed, shipped palette): `--muted` body text **6.08:1** on black (exceeds the
  documented 4.6:1), `--fg` links **21:1**, submit resting **21:1** (black-on-white) / focus
  **13.19:1** (black-on-accent). **No AA failures found.**

### Prioritized findings
- **[P1 → helios + main-thread] GSAP+ScrollTrigger ship in the INITIAL first-load JS, not lazy.**
  `gsap` + `ScrollTrigger` are referenced eagerly in the raw `/` HTML (chunks `32_-f3kvirmsg.js`
  26.9 KB gz + `1is0gg5e6lopl.js` 17.1 KB gz ≈ **~44 KB gz of the 233 KB initial**). This is the
  bulk of the gap vs the Phase-3 "~156 KB gz initial" claim (Phase 4's +46 KB landed in *first-load*,
  not behind a dynamic import). It is NOT LCP-blocking (h1 is server-rendered, LCP element confirmed),
  so this is correctness-of-claim + budget hygiene, not a user-visible regression today. **Action:**
  either (a) update the STATUS claim to the true ~233 KB gz initial, or (b) defer GSAP behind the same
  motion-gate as the canvas (it's only needed once the user can scroll / on the motion path) so the
  initial payload drops back toward ~190 KB gz. Recommend (b) if cheap; (a) at minimum — don't leave a
  stale 156 KB number on record.
- **[P2 → iris] Text-field focus indicator is color-only (accent border swap), no shape/contrast
  delta.** `.input/.textarea:focus-visible` sets `border-color: var(--accent)` + a faint bg lift but
  `outline: none` and no width/box-shadow change. It is *visible*, but a 1px hue change leans on color
  alone and is borderline for WCAG 2.4.13 (Focus Appearance, AAA) / fragile for low-vision users.
  Links, radios, and the submit use stronger rings — inputs are the outlier. **Action:** give inputs a
  matching offset ring or a 2px border + bg so the focus state isn't color-only. Low effort, low risk.
- **[P2 → helios] Lazy WebGL chunk is 308.8 KB gz in ONE monolithic file.** Correctly deferred (great),
  but it's a single 1 MB-raw chunk — on a real mid-mobile GPU/network the desktop/tablet motion path
  pays it in one shot once the canvas decides to mount. Phone-class already skips it (good). **Action
  (optional, post-Phase-5):** confirm drei imports are tree-shaken to only what `Nodes/Connectors/Bloom`
  use (drei is import-surface-greedy); a quick check that no unused drei helpers are pulling weight
  could shave the chunk. Not urgent — it never touches LCP.

### Could NOT measure here (be honest)
- **Real LCP/TBT/Speed-Index on mid-mobile**: no Lighthouse (sandbox blocked the npx/CDP network path)
  and no real network throttling — the ~384 ms LCP is software-rendered + un-throttled-network, so
  treat it as "LCP is the server-rendered h1 and is not WebGL-gated" (structurally correct) rather than
  a trustworthy millisecond budget. **A real-device or unsandboxed Lighthouse run is still owed** before
  signing off the <2.5s mobile-LCP budget.
- **Canvas FPS / TBT from the WebGL loop**: swiftshader makes paint/raster timing meaningless; the
  agent-loop's main-thread cost on a real GPU is unmeasured here. helios's [REVIEW] real-GPU pass covers
  the *feel*; a real-device TBT trace would cover the *cost*.
- Repro scripts: `scripts/ingestion/qa-perf.mjs` (bundle/network/CLS/fallbacks) and
  `scripts/ingestion/qa-a11y-lcp.mjs` (LCP element + keyboard + menu + contrast). Re-run against a prod
  build on :3100.

### Phase 2 TODO(human) — fill the real artifacts  [REVIEW]
These are the marked gaps left in the content scaffold. The copy around them is real and
voice-correct; only the artifacts are placeholders (a fabricated link/metric is worse than a
marked gap). Each is a `TODO(human)` in code:
- [ ] **Resume Analyzer — live URL.** `lib/work.ts` › `resume-analyzer` link `href` is `null`,
      rendering as an "OPEN THE LIVE APP · soon" pending mark. Drop in the exact Hugging Face
      Spaces URL to make it a real live link (it gets the accent live-mark).
- [ ] **Agentic e-commerce — proof link.** `lib/work.ts` › `agentic-commerce`: no public
      deploy/repo confirmed. Add a repo/demo URL, or leave as the Phase-5 case-study route.
- [ ] **MD ministry platform — proof link.** `lib/work.ts` › `ministry-platform`: likely no
      public link (client/gov work). Confirm whether anything is shareable; otherwise it stays a
      Phase-5 case-study container with no external link (that's honest, not a gap).
- [ ] **Contact email.** `components/SocialLinks.tsx` uses `ebraheemgillani1@gmail.com` (the
      project owner's known address) as the exposed contact `mailto:`. Confirm this is the public
      address to ship, or swap it.
- [ ] **No metrics fabricated.** Case-study copy deliberately carries zero invented numbers. If you
      have real metrics (latency, accuracy, scale), they can be added to the architecture notes.

### Resolved since Phase 1
- [x] **LinkedIn URL confirmed** (2026-06-12): `https://www.linkedin.com/in/ebraheemgillani/`,
      recorded canonical in `docs/BRAND.md` › Identity. Wired into the Phase 2 contact social links.
      The old `TODO(linkedin)` marker is retired — no invented URL ever shipped.

### Still open from Phase 1  [REVIEW]
- [ ] **Confirm the font pairing.** Display = **Anton** (OFL), Body/UI = **Space Grotesk** (OFL),
      both self-hosted via `next/font/local` (files in `app/fonts/`). Open-license replacements
      for the reference's commercial Manifold/Gilroy, same heavy-condensed-vs-hairline tension.
      NOTE: the vendored `app/fonts/anton-400.woff2` is a **Vietnamese subset missing basic Latin
      A–Z** — Anton-set headlines currently fall back to Impact. Needs a Latin Anton woff2 swap
      (separate from this task; flagged for a font-asset pass). The monogram is unaffected — its
      EG geometry is baked to vector paths.
- [ ] Initialize git `dev` + `main` branches (needs your git host).
- [ ] Set up 21st.dev Magic MCP key (Magic tools ARE reachable; no key blocker hit this phase).

### Done — Phase 1 review decisions applied (iris, 2026-06-12)  [AFK]
- [x] **Accent LOCKED = cyan `#23E6C4`** (2026-06-11). Candidate scaffolding removed from
      `DESIGN-SYSTEM.md` and `globals.css` (`--accent` is now a single literal). Violet + lime
      rejected, recorded with rationale. Single source of truth.
- [x] **Primary wordmark = EG monogram (direction 02).** `components/Wordmark.tsx` rewritten:
      the text placeholder is replaced by the real Anton "EG" converted to **vector paths**
      (no font load, immune to the font subset). Glyphs use `currentColor`; the connector node +
      line use `--accent` (agent-graph motif at glyph scale). `role="img"`
      `aria-label="Ebraheem Gillani"`; footer variant is a non-interactive mark + spelled-out name.
      Already wired into `SiteHeader`. Emitted as the favicon at `app/icon.svg` (Next auto-injects
      `<link rel="icon" type="image/svg+xml">`). Verified in nav + footer + tab.
- [x] **Security: migrated next 14.2.33 → next 16.2.9** (React 19.2.7, react-dom 19.2.7,
      @types/react/-dom → v19). `next.config`: `experimental.outputFileTracingExcludes` →
      top-level; added `turbopack.root` to silence the workspace-root warning from a stray
      `$HOME` lockfile. No async-request-API (cookies/headers/params/searchParams) or legacy
      router usage in our code, so the breaking surface was light. **`npm run build` passes clean
      (Turbopack; all routes static: `/`, `/_not-found`, `/icon.svg`). `npm run dev` boots, `/` →
      200.** **`npm audit` → 0 vulnerabilities** — the residual postcss stringify-XSS (Next 16
      still carries postcss 8.4.31 transitively) is cleared via `overrides: { postcss: "^8.5.15" }`
      in package.json. Note: Next 16 Turbopack build output no longer prints per-route byte sizes.

### In progress
- (none — Phase 2 deliverables complete pending the TODO(human) artifacts above)

### Up next  [AFK]
- [ ] Phase 5 (iris): case studies. Interactive where it earns it; proof-first.

## Done — Phase 4 scroll choreography (helios, 2026-06-12)  [AFK]
GSAP ScrollTrigger layered onto the existing Lenis instance. Motion only — no content/DS/backend
changes. `npm run build` passes clean.

**GSAP+Lenis sync (once, in `lib/SmoothScroll.tsx`):** `lenis.on("scroll", ScrollTrigger.update)`
+ `gsap.ticker` drives `lenis.raf` (ONE rAF for both libs; removed the old standalone rAF loop) +
`gsap.ticker.lagSmoothing(0)`. A `ScrollTrigger.refresh()` after layout settles. Whole block is
gated on reduced-motion (never instantiated when reduced).

**Choreography (`components/ScrollChoreography.tsx`, renders no DOM, hooks via data-attrs):**
- HERO: grouped-line entrance on load (eyebrow→headline→sub, 90ms stagger, expo.out, 1.2s). On
  scroll-out the content parallaxes up + fades (scrub, transform/opacity only).
- WORK: section head reveals in reading order (90ms); cards stagger up from a deeper offset (60ms),
  `once:true` so they never re-hide.
- ABOUT / CONTACT: head+prose reveal as grouped moves on enter.
- All reveals are opacity + translateY ONLY → CLS ~0, no layout thrash.

**Signature moment tied to scroll (`lib/scrollSignal.ts` + `HeroScene.tsx`):** a module-singleton
ref (no React re-render) carries `heroExit` 0→1, written by a scrubbed ScrollTrigger on the hero,
read every frame by `HeroScene`. As the hero leaves: the agent loop ACCELERATES (extra cycles,
`EXIT_LOOP_GAIN`) — the graph reads as "firing harder" as you depart its station — and the graph
RECEDES in z + lifts. Layered as an OFFSET on the existing idle drift (didn't touch the shaders or
the `progress` loop math beyond adding the exit term).

**Reduced-motion:** ScrollChoreography no-ops entirely; the hidden initial states live behind
`html[data-choreo="armed"]` which is set ONLY from JS on the motion path → no-JS/reduced-motion
content is fully present, no transforms. `heroExit` stays 0 (publisher never wired) so the canvas
runs its still/idle path untouched. Verified headless (`reducedMotion:'reduce'` → `data-choreo=null`,
0 errors, all section content visible at every scroll depth).

**Keyboard/anchor nav:** ScrollTrigger only observes; Lenis owns anchor smoothing. Verified: clicking
Contact lands `#contact` at top=0px, hash updates, no focus trap / tab-order change.

**Bundle delta (gsap):** gsap core ~28KB gz + ScrollTrigger ~18KB gz ≈ **~46KB gz** of new client
JS. NOT LCP-blocking (hero headline is server-rendered, paints pre-hydration). The three.js chunk
(~309KB gz) stays code-split — confirmed 0 refs in initial page HTML (Phase 3 LCP work intact).

**Verify script:** `scripts/ingestion/shot-scroll.mjs` (6 scroll depths × motion+reduced + anchor
check). PNGs in `scripts/ingestion/scroll-shots/`.

[REVIEW] (GPU-only / real-scroll): exit-loop acceleration + graph recede read as STRUCTURE in
swiftshader shots but the *feel* (how aggressive the speed-up + how far the recede should go before
it gets distracting) wants a real-GPU + real-inertia eye. `EXIT_LOOP_GAIN=1.6`, `EXIT_Z=-3.4`,
`EXIT_Y=1.1` in `HeroScene.tsx` are tunable; current values are conservative.

## Done — Phase 3 WebGL hero & signature moment (helios, 2026-06-12)  [AFK]
**The signature moment = a literal agent reasoning/acting loop.** Four stage-clusters
(INTENT → REASONING → ACTION → OUTCOME) on a tilted ellipse; each cluster = a hub node + 3–4
satellite sub-steps (tool-calls/thoughts). A signal pulse travels the hub→hub spine connectors;
nodes ignite in sequence as the agent "thinks" then "acts," the loop closes and resumes (~9s).
Idle is alive (shimmer on the wiring, breathing nodes, lazy drift + soft pointer parallax).
Emissive cyan `#23E6C4` + additive blending + a Bloom pass over matte black. Parked in the open
right/upper field so it never fights the left-parked headline. NOT decorative geometry — it reads
as the brand thesis ("agents that take actions") made visible.

- [x] **Stack (per ADRs 0001/0002).** Added `three@0.171`, `@react-three/fiber@9`,
      `@react-three/drei@10`, `@react-three/postprocessing@3` (+ `@types/three`). R3F 9 / drei 10
      are the React-19-compatible majors — do not downgrade. Raw GLSL for the connector flow +
      node glow (inline template strings, no shader-loader — per Phase-0 gotcha).
- [x] **Files added** (all under `components/`):
      `hero/agentGraph.ts` (seeded/deterministic topology — same layout on SSR, still-frame,
      swiftshader shot, and GPU), `hero/Connectors.tsx` (one additive `LineSegments` draw call;
      GLSL maps spine edges onto the loop so the signal flows), `hero/Nodes.tsx` (one InstancedMesh,
      billboard radial-glow discs, per-stage ignition), `hero/HeroScene.tsx` (loop clock + drift +
      Bloom), `hero/HeroCanvas.tsx` (the `<Canvas>`, ACES tone-map, transparent clear so the poster
      shows through), `HeroExperience.tsx` (the guard layer + dynamic import). Mounted in
      `app/page.tsx` inside the `.stage` div. No design-system tokens invented; accent + z-order
      reused as locked.
- [x] **Three fallbacks verified** (screenshots in `scripts/ingestion/app-shots/`):
      (1) **No-WebGL** → `detectWebGL()` fails, `HeroExperience` renders nothing, the existing
      radial-gradient poster shows — layout intact (`hero-no-webgl.png`).
      (2) **Reduced-motion** → canvas mounts in STILL mode (`frameloop="demand"`, loop parked
      mid-ACTION at phase 0.42), renders ONE frame, no animation (`hero-reduced-motion.png`).
      (3) **Phone-class (narrow + coarse pointer)** → poster only, no canvas, to protect mobile LCP
      (`hero-mobile.png`). Tablet/low-mem → animated but `quality:"low"` (lower DPR, softer bloom).
- [x] **Perf / bundle.** The heavy three/R3F/postprocessing chunk is code-split: ~1.0 MB raw /
      **~309 KB gzipped**, and **0 references in the initial page HTML** — it is fetched only after
      the client decides to mount the canvas (`dynamic(ssr:false)` + a deferred rAF so the headline
      paints first). Initial framework+app payload (three EXCLUDED) ≈ **156 KB gzipped**. One scene,
      two draw calls (lines + instanced nodes) + the bloom pass; DPR capped (1.75 desktop / 1.25
      mobile); `antialias:false` (bloom hides it). LCP is never blocked by WebGL.
- [x] **Verified.** `npm run build` passes clean (Turbopack, TypeScript pass green, all routes
      static). Live hero confirmed via `node scripts/ingestion/shot-app.mjs`: canvas composites
      BEHIND the legible white overlay; the graph clearly reads as the agent loop.
- **GPU vs. software-screenshot caveat:** the swiftshader shots are dim, aliased, and show NO real
  bloom — the bright node cores are visible but not yet smeared into volumetric glow. On a real GPU
  the Bloom pass turns those cores into the cinematic lit-from-within cyan halo the design calls
  for. Structure/composition/legibility are confirmed; **final glow intensity wants one human eye
  on real hardware** (tune `Bloom intensity/radius` in `HeroScene.tsx` if it blooms too hot/soft).

## Done — Phase 2 static shell & content scaffold (iris, 2026-06-12)  [AFK]
- [x] **Nav refined + mobile treatment.** `SiteHeader` is now a client component: desktop inline
      nav unchanged (accent underline on hover/focus); < 768px gets an accessible disclosure menu
      (real `<button>` with `aria-expanded`/`aria-controls`, labelled panel, Escape + outside-click
      close with focus return, links close the panel). Desktop nav stays in the DOM at all sizes
      (no JS-gated content). Mobile panel links render large in Anton.
- [x] **Hero — static content frame, Phase-3-ready.** Black stage + accent vignette fallback,
      hairline name/role mark, ALL-CAPS Anton BRAND-voice headline ("I build agents that take
      actions…"), one-line subhead, accent scroll cue. The canvas mount slot is the `.stage` div
      (`data-canvas-mount`) at `--z-canvas` behind the `--z-ui` overlay. Static state already reads
      like the bar — verified at 390/768/1440/1920.
- [x] **Selected work grid — 3 proof-first case-study containers.** New `components/WorkCard.tsx`
      + `lib/work.ts` (data). Each card: ordered index, Anton title, Problem (one line), tight
      Architecture note, stack chips, and a proof slot. NOT a generic icon-card — structure carries
      the argument. Live links use an accent live-mark (pulsing dot, killed under reduced-motion);
      unconfirmed links render as an honest "soon" pending mark, never a dead/fabricated link.
      Responsive `auto-fit` grid (3-up desktop → 1-up mobile).
- [x] **About — concise, proof-first, dry.** Two-column at desktop (Anton "THE WORK ARGUES FOR
      ITSELF." parked left, prose right). Names the three artifacts; never asserts seniority; no
      "passionate about AI" filler. Stacks on mobile.
- [x] **Contact — accessible form + framing fork + socials.** New `components/ContactForm.tsx`:
      one form, two framings (hiring vs. project radiogroup) that change copy/intent only, same
      fields, same destination — NOT two pages. Real labels, required states, aria-describedhint,
      aria-live framing lead + completion state. Submit is a clearly-marked **no-op stub for Phase
      6** (no fake "sent" toast; the completed state says the inbox lands next phase).
      `components/SocialLinks.tsx`: GitHub `Ebraheem-03` + LinkedIn (confirmed) + email, all real.
- [x] **Token discipline.** One new token group added to `DESIGN-SYSTEM.md` FIRST then `globals.css`:
      `--radius-sm: 2px` / `--radius-md: 4px` (near-square, no pills). No ad-hoc colors/sizes/easings
      in components — all reference the locked tokens.
- [x] **Verified.** `npm run build` passes clean (Turbopack, all routes static). `npm run dev` →
      `/` 200. WCAG AA: focus-visible everywhere, keyboard paths (menu, form, fork), reduced-motion
      kills the live-mark pulse + heavy transforms, placeholder text at `--muted` (~4.6:1 AA). No
      em dashes in shipped copy. Visual pass at all 4 breakpoints via headless Chrome.
      **Note:** no Framer Motion added — Phase 2 stays structural/restrained per the plan; component
      motion is CSS-only (hover/focus, reduced-motion-safe). Heavy scroll choreography is Phase 4.

## Done
- [x] **Phase 0 reference ingestion (helios)** — signed off, grammar in `docs/design-analysis.md`.
- [x] **Phase 1 design system locked (iris)** — `docs/DESIGN-SYSTEM.md` filled: color (black/white
      locked, greys defined, accent as 3 candidates), typography (Anton + Space Grotesk, rem scale
      with large jumps, tracking/line-height), motion (expo-out easings, durations, stagger,
      reduced-motion contract), space/layout (spacing scale, max-width, 4 breakpoints matching the
      captured viewports), and the WebGL z-layer stack for helios. `[REVIEW]` on accent + fonts.
- [x] **Phase 1 Next.js shell stood up (iris)  [AFK]** — App Router + TS at repo root (scripts/
      ingestion left untouched). Tokens as CSS variables mirroring DESIGN-SYSTEM.md 1:1
      (`app/globals.css`); self-hosted fonts (`app/fonts.ts` + woff2); semantic layout with skip
      link + landmarks (`app/layout.tsx`); Lenis smooth-scroll gated on reduced motion
      (`lib/SmoothScroll.tsx` + `lib/useReducedMotion.tsx`); hero placeholder (black stage,
      provisional wordmark, ALL-CAPS BRAND-voice headline, NO WebGL) + section stubs
      (`app/page.tsx`). CSS Modules + variables (not Tailwind) to keep tokens authoritative.
      **`next build` passes clean (static, 87.8 kB first-load JS); dev server boots.** Verified
      visually at desktop + mobile and confirmed reduced-motion disables Lenis.
- [x] **Phase 1 wordmark — 3 directions (iris)  [REVIEW]** — authored as production SVGs (the
      Stitch MCP server is not configured in this env; SVG is the asset the wordmark needs anyway).
      `docs/brand/01-fullname-wordmark.svg`, `02-eg-monogram.svg`, `03-handle-logotype.svg`, with
      `docs/brand/contact-sheet.html` to preview them on the black stage. See [REVIEW] above.

## Notes
- **Run the shell:** `npm install` then `npm run dev` (http://localhost:3000) or `npm run build`.
- Styling = CSS Modules + CSS variables. **DESIGN-SYSTEM.md is the single source of truth**; new
  token goes there first, then `globals.css`. No Tailwind.
- Fonts are self-hosted (no Google runtime request, no build-time fetch dependency).
- Backend stays in the main thread until/unless a CMS is added.
- Decisions get an ADR in `docs/decisions/` only if they're load-bearing.
