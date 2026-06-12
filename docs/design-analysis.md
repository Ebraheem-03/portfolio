# Design Analysis — reference ingestion (Phase 0 output)

> STATUS: FILLED by helios from direct Playwright ingestion. `[REVIEW]` — human signs
> off before any code. Extracted 2026-06-11 from `cornrevolution.resn.global/#science`.

Reference: https://cornrevolution.resn.global/#science  (grammar to translate, content to ignore)

### Capture method & its limits (read this first)
Captured via cached Chromium under `--use-gl=swiftshader` (SOFTWARE WebGL) across 4 viewports
(1920, 1440, 768, 390). Screenshots + computed styles in `scripts/ingestion/out/`.
**Software-WebGL caveat, applied throughout:** the canvas renders ~3–4× dimmer, with no real
bloom/HDR, banded gradients, and missing/aliased particle glow. So I judged **grammar**
(motion arc, composition, layering, type, pacing) and pulled resolution-independent facts from
the DOM/CSS. Canvas pixel colors below are reported as observed AND as the brightened values I
infer the GPU build actually shows — every inferred value is flagged `[inferred]`. Treat exact
scene hex as directional, not final.

---

## Motion language
A **continuous camera journey**, not a sequence of slides. One full-bleed canvas; scroll drives
a virtual camera through a single contiguous 3D world. The whole site is one shot.

- **Scroll = camera dolly.** Each wheel step advances the camera through the scene; copy blocks
  fade/track in as the camera arrives at each "station." There is no page jump — content is
  pinned to depth, revealed by traversal.
- **The arc (observed frame-to-frame, desktop):**
  `intro/logo → SCIENCE (abstract node-field) → "OUR BREEDERS DIAL IT IN FURTHER" (seedling +
  roots in soil, seeds drifting) → "WE TAKE IT TO THE FIELD" (full corn plant, photographic DoF)
  → "REAL WORLD TESTING" (aerial drone view of test plots) → RESULT (single golden kernel,
  data points + connector lines, warm bokeh).`
  Macro structure: **micro → macro → micro**, the last micro *transformed* (a raw idea becomes a
  proven result). This is the spine of the whole experience.
- **Easing:** heavy inertia / smoothed virtual scroll (Lenis-class). Motion decelerates long and
  soft — nothing snaps. Camera moves read as `power2/expo`-out with a slow tail; UI text uses
  shorter fades layered on top.
- **Stagger:** type enters as grouped lines (headline lines stack/reveal in sequence), label
  chips ("SCIENCE", "REAL WORLD TESTING") cross-fade with a circular cursor/progress glyph.
- **Persistent motion:** particles drift and connector lines pulse even when the camera is still,
  so no frame is ever dead. The node-graph motif (dots + thin lines) recurs across stations.

## Spatial language
- **Single full-bleed `<canvas>`**, `position: absolute; top:0; left:0`, sized exactly to the
  viewport at every breakpoint (1920×1080, 1440×900, 768×1024, 390×844), parent `.root`,
  `z-index: auto`. DOM/HTML/body background is pure black behind it.
- **Layer stack (back→front):** (1) black page bg, (2) WebGL canvas — particles, geometry,
  photographic plates, depth-of-field, (3) HTML text/UI overlay (logo, nav, headline, label
  chips, cursor glyph) in white, sitting above the canvas.
- **Depth is real, not parallax-faked.** True z-traversal through a 3D scene with photographic
  depth-of-field (sharp subject, blurred fore/background — clear on the corn-plant + field
  frames). Foreground particles, mid-ground subject, deep blurred backdrop.
- **Camera feel:** slow cinematic dolly/push with slight drift; subject roughly center-framed,
  headline parked left or upper-left so it never fights the 3D focal point.
- **`scrollHeight === innerHeight` at every viewport** — there is no native scroll. The page is
  one fixed viewport; all "length" is virtual (wheel-hijack feeding the camera).

## Type system
Two-family system, all uppercase, all white, no fill colors on text:
- **Display:** `Manifold-CF-Extra-Bold` (fallback Helvetica/Arial). Big, condensed-ish,
  tight-to-negative tracking. Observed: chapter headlines `90px / lineHeight 90px /
  letterSpacing -1.8px`; the largest CTA line `100px / -2px`. `text-transform: uppercase`.
  This is the "voice" face — confident, blocky, cinematic.
- **UI / body / labels:** `Gilroy` (fallback Helvetica/Arial). Light-to-bold range.
  - Eyebrows / overlines: `weight 700, 12px, letterSpacing 1.2px, uppercase`.
  - Chapter markers ("Chapter 1"): `weight 200, 20px, letterSpacing 2px, uppercase` — thin +
    wide-tracked, a deliberate contrast against the heavy display.
  - Nav/links: `Gilroy 200, 12px, letterSpacing 0.6px, uppercase`.
  - Body paragraphs: `Gilroy 200, 20px / lineHeight 30px, letterSpacing 0.4px, none` (sentence
    case) — small, light, low-contrast against the scene.
- **Type contrast strategy:** heavy condensed display vs. hairline wide-tracked Gilroy. The
  tension between the two weights is the whole typographic identity.
- **Scale jumps are large** (12 → 20 → 90 → 100px): few sizes, big gaps, no mushy middle.

## Color system
**UI layer (from computed styles — reliable, resolution-independent):**
- Page background: `#000000` / `rgb(0,0,0)` (html, body, doc all black).
- All text & UI: `#FFFFFF` / `rgb(255,255,255)`. No colored text anywhere; the only frequent
  text color is pure white (49 / 12 / 9 occurrences across viewports).
- No CSS background fills on content (`bgFreq` empty) — all color lives in the canvas.
- One stray UI accent: a teal "Cookie Preferences" pill bottom-left (third-party widget, ignore).

**Scene layer (sampled from canvas pixels — swiftshader-dimmed; brightened values `[inferred]`):**
- SCIENCE / node-field: **deep teal-green** dominant. Observed buckets `#001010`, `#002010`,
  `#103020`, `#204030`. Glows are saturated teal/cyan. `[inferred]` true accent ≈ `#23E6C4`–
  `#1FB89E` (cyan-teal) over near-black.
- BREEDERS / FIELD: warms toward **olive / khaki green** (`#202010`, `#303020`, `#404030`) —
  organic, soil-and-leaf, photographic.
- RESULT: teal-green base with an emergent **warm gold** highlight on the kernel (`#604020`
  observed). `[inferred]` gold accent ≈ `#E8A23C`–`#F0B254`.
- MOBILE intro strands: **warm amber/orange** (`#302010`, `#402010`, `#604020`).
- **Read:** a black stage with ONE temperature journey — cool teal/cyan (science/data) →
  organic green (growth) → warm gold (payoff). Accent is a glow, never a flat fill. Bloom +
  additive particles do the heavy lifting (lost under swiftshader, inferred from structure).

## Interaction grammar
- **Wheel-hijack / virtual scroll.** `window.scrollTo` is inert (`scrollHeight === innerHeight`).
  Progression is driven entirely by wheel deltas fed to a smoothed scroll controller, which maps
  to camera position. Confirmed: native scroll does nothing; `mouse.wheel` advances the world.
- **Custom cursor.** A circular glyph / progress ring rides near the active label chip ("SCIENCE"
  + ring, "REAL WORLD TESTING" + ring) — cursor doubles as a "click to enter chapter" affordance.
  Chapter headlines report `cursor: pointer` (they're interactive entry points); body cursor is
  `auto` over empty stage.
- **Hover/entry states:** label chips + headlines are clickable to dive into a chapter; the ring
  cursor signals interactivity. (Exact hover transitions not capturable as static frames; the
  ring + pointer cursor are the reliable tells.)
- **Mobile degrades to a poster/intro.** On 390px the experience holds on an intro/"EXPLORE A
  STORY" state (warm strand visual) — frames barely change across wheel steps, i.e. the full
  scroll-camera is gated behind an explicit tap-to-start rather than auto-driven by wheel. Good
  precedent: heavy scroll-camera → simplified entry on touch.

## Texture & material feel
- **Cinematic, photographic, organic.** Not clean/flat 3D — real depth-of-field, film-grain-ish
  softness, volumetric haze, bokeh on the result frame. The corn plant and field read as
  photographic plates composited into the 3D space, not plastic geometry.
- **Additive glow + particle systems.** Glowing nodes, drifting seed/dust particles, thin
  luminous connector lines (the node-graph motif). Material is **emissive/luminous over matte
  black**, not glossy/reflective.
- **Subsurface-ish warmth** on the gold result (light through a kernel). Surfaces feel alive and
  lit-from-within, not surface-lit.
- Overall: matte black void + emissive accents + photographic subject = "lab meets nature,"
  premium and restrained.

## Pacing
- **~6 acts over the whole journey**, each ~1 full viewport of virtual traversal, separated by
  camera moves rather than hard cuts. (DOM exposed 4 `<section>`s + a `#science` anchor at load;
  the visual journey reads as ~6 stations — sections are scaffolding, the camera does the pacing.)
  *(Earlier project note said "18 sections" — not reproduced here; treat 4–6 as the real count.)*
- **Rhythm:** Logo/preload → cool abstract opener (hook, low info) → escalating organic stations
  with one headline each (short, declarative, ALL CAPS) → aerial "proof at scale" wide shot →
  intimate warm payoff. Tension builds micro→macro then resolves intimate.
- **Generous negative space / slow cadence.** One idea per act, lots of black, long eased moves.
  Information density is LOW per frame — confidence through restraint. Nothing is rushed; the
  preload itself ("NN% Loading your experience") sets a "this is an experience, wait for it" tone.
- **Load cost is real:** ~55–60s to fully load under software WebGL (a few s on GPU). The
  preloader is part of the choreography, not an apology.

## Translation notes (corn → AI engineer)
The **grammar transfers wholesale; the metaphor must be original.** Corn-genetics-to-harvest
becomes **idea → agent architecture → autonomous action → proven result.** Three top moves:

1. **Reframe the camera journey as the agent's lifecycle (the signature moment that MEANS
   something).** Reference arc `science → breeding → field → result` becomes:
   **PROMPT/INTENT → REASONING (the node-graph!) → ACTION (tools firing in the world) →
   OUTCOME (the deployed, working result).** The reference's recurring **node-and-connector
   motif is *literally* an agent reasoning graph** — dots = steps/tool calls, lines = the
   reasoning chain. We don't invent new geometry; we inherit theirs and load it with real
   meaning. This satisfies the brief's "agent reasoning/acting loop made visible, not decorative
   geometry" directly. The micro→macro→micro arc maps perfectly: small intent → expansive
   multi-agent execution → one concrete shipped artifact (Resume Analyzer / agentic e-commerce /
   ministry platform).

2. **Keep the visual contract, swap the temperature meaning.** Black stage, white type, single
   full-bleed canvas, one accent that glows (never flat fill). BRAND says "one accent color" —
   this is the locked precedent. Reference's teal→green→gold becomes our **one signature accent**
   (per BRAND, dark cinematic + one accent; helios proposes a cool **electric cyan/teal** glow as
   the "intelligence/data" color — `[inferred]` ≈ `#23E6C4` — for `DESIGN-SYSTEM.md` review, NOT
   locking it here). Avoid the organic green/gold warmth — that's corn; ours stays cool, precise,
   computational. Reasoning nodes light up as they "fire."

3. **Inherit the type tension + the pacing discipline.** Heavy condensed display (Manifold-class)
   vs. hairline wide-tracked light UI (Gilroy 200) → our display/UI pairing carries the same
   confidence-through-contrast. One declarative ALL-CAPS line per act, low density, long eased
   moves, lots of black. This is the proof-first / "let the work carry it" voice from BRAND
   rendered in motion: restraint reads as taste, taste reads as senior. Translate copy
   (corn headlines → e.g. "I SHIP AGENTS THAT TAKE ACTIONS"), never the words.

**Carries over:** wheel-hijack camera dolly + heavy inertia; full-bleed canvas over black with
white HTML overlay; custom ring cursor as chapter affordance; node-graph particle motif;
micro→macro→micro narrative; preload-as-choreography; mobile graceful degrade to poster/intro.
**Must change:** color temperature (cool not organic), metaphor (agent lifecycle not crop cycle),
copy. **Hard requirements (from CLAUDE.md/BRAND):** reduced-motion fallback + no-WebGL graceful
degrade from day one; the 3D must mean something; budget perf (one canvas, lazy-load, guard
mobile — the ~60s software load here is a warning to keep our asset/draw-call budget tight).

### What software-WebGL prevented me from observing (hand to human / GPU re-check later)
- True scene colors, bloom intensity, HDR glow, and particle density (all dimmed/aliased here).
- Exact easing curves and per-element durations (inferred from inertia + frame deltas, not
  measured — GSAP/Lenis numbers would need devtools timeline on a GPU run).
- Real hover-state transitions and the precise cursor-ring behavior on interaction (static
  frames only).
- Whether the true section count is 4 or ~6+ (DOM said 4 `<section>`; visual arc reads ~6).
