# Design System (single source of truth)

Locked in Phase 1 from `design-analysis.md` + `BRAND.md`. Iris and Helios read this before
building. **New token? Add it HERE first, then use it.** Propose, don't sprinkle.

The CSS variable names in `app/globals.css` mirror this file 1:1. If a value changes here, it
changes there in the same commit. Do not introduce a color, size, or easing in a component that
isn't defined below.

---

## Color

The contract from the analysis: **pure-black stage, all-white type, ONE full-bleed WebGL canvas
does all the color, ONE glowing accent (never a flat fill).** The HTML/UI layer is therefore
near-monochrome by design — almost all "color" lives in the canvas (helios's domain). The greys
below exist only for structural UI (borders, muted labels, disabled states), never as decoration.

| Token            | Value       | Role |
|------------------|-------------|------|
| `--bg`           | `#000000`   | Page stage. Pure black, locked. html/body/canvas-parent. |
| `--fg`           | `#FFFFFF`   | All primary text + UI. Pure white, locked. |
| `--muted`        | `#8A8A8A`   | Secondary UI text (chapter markers, nav, captions). ~4.6:1 on black — passes AA for normal text. |
| `--muted-dim`    | `#5A5A5A`   | Tertiary / disabled / decorative ticks. Below AA — **never** for reading text, only non-essential marks. |
| `--border`       | `rgba(255,255,255,0.12)` | Hairline rules, section dividers, input borders at rest. |
| `--border-strong`| `rgba(255,255,255,0.24)` | Hover/focus border, active dividers. |
| `--surface`      | `rgba(255,255,255,0.03)` | The ONLY fill allowed on the UI layer — barely-there panel lift for cards/inputs. Use sparingly. |
| `--danger`       | `#FF8A7A`   | Form/error states ONLY (added Phase 6). Desaturated coral, ~5.4:1 on black (AA). Never decorative — the accent stays cyan. |

**Contrast notes (impeccable / WCAG AA):**
- `--fg` on `--bg`: 21:1. `--muted` on `--bg`: ~4.6:1 (AA normal text). `--muted-dim`: decorative only.
- Body text is always `--fg` or `--muted` — never lighter. Light-gray-for-elegance is banned.

### Accent — `LOCKED`

| Token      | Value       | Role |
|------------|-------------|------|
| `--accent` | `#23E6C4`   | The one accent. Electric cyan/teal. Glow on the UI layer (focus ring, link underline, the single live mark, the monogram's connector node) and the emissive base helios bloods into the canvas. **Never a flat filled block.** |

**Locked 2026-06-11** by the human after reviewing all three candidates on the real black stage.
Cyan `#23E6C4` is helios's inferred scene accent — "intelligence / data" temperature, highest
chroma on black, reads as lit-from-within and sits closest to the reference's science-station glow.
Rejected: **violet `#6E5BFF`** (too "frontier-AI-model" generic) and **signal-lime `#B6FF3C`**
(boldest, but the AA-on-small-text risk and the brief favoured the cyan that matches the canvas
work). This is now the single source of truth — there is no candidate-switching scaffolding; the
canvas bloom (Phase 3) is seeded from this hex.

### Glow / bloom — WebGL concern (helios, later)
Not a CSS token. Recorded here so it's owned: the accent's emissive intensity, bloom radius, and
additive-particle falloff are tuned in the R3F/postprocessing pass (Phase 3), seeded from whichever
accent hex wins above. The UI layer only ever uses the flat accent hex (for focus rings / the live
mark); it must never try to fake bloom with CSS box-shadows stacked as decoration.

---

## Typography

Two-family system inherited from the reference's tension: **heavy condensed display vs. hairline
wide-tracked geometric UI.** The reference's faces (Manifold CF, Gilroy) are commercial — replaced
with OFL/open faces that carry the same tension. Wired via `next/font/google` (self-hosted at build,
zero layout shift, no external request).

### Display — **Anton** (OFL, Google Fonts)
Ultra-condensed single-weight grotesque. The open-source analogue to Manifold CF Extra-Bold: tall,
narrow, blocky, engineered for uppercase. Carries the "voice" — confident, cinematic, parked large.
- Weight: 400 (the family's only weight; visually reads ~800). var: `--font-display`.
- Always `text-transform: uppercase`.
- Tracking: tight to slightly negative. Display tracking token `-0.02em` (impeccable floor is
  `-0.04em`; we stay above it). At the very largest sizes nudge to `-0.015em` so glyphs never touch.
- Line-height: `0.92` (display lines stack tight, like the reference's 90px/90px).
- `text-wrap: balance` on multi-line headings.
- **Why not Oswald/Archivo:** Oswald reads templated; Archivo Black is less dramatic at 90px+.
  Anton at hero scale is unmistakably not-a-Tailwind-default.

### Body / UI — **Space Grotesk** (OFL, Google Fonts)
Geometric-leaning grotesque, variable 300–700, with engineered detailing (the distinctive `a`,
`g`, ranging figures) that reads "computational / engineer" rather than default-Inter. Runs as the
hairline wide-tracked UI face. var: `--font-body`.
- Weights used: **300** (hairline UI: chapter markers, nav, captions, eyebrows), **400** (body
  paragraphs), **500** (the rare emphasised label / active nav).
- Hairline UI is `weight 300` + wide tracking (`0.12em`–`0.2em`) + uppercase for labels — this is
  the deliberate counter-tension to Anton's mass.
- Body paragraphs: `weight 400`, sentence case, tracking `0`, line-height `1.6`, max width `68ch`.
- **Why:** real contrast axis vs. Anton (condensed display × wider geometric body), and more
  identity than Inter/Manrope. Floor weight is 300, not 200 — but 300 wide-tracked on pure black
  gives the hairline read convincingly.

### Type scale (rem, root = 16px)
Few sizes, **large jumps** (the reference uses 12 → 20 → 90 → 100px; we mirror that gap discipline).
No mushy middle. Display sizes use `clamp()` so the hero scales 390 → 1920 without overflow.

| Token            | clamp / rem                          | px (min→max) | Use |
|------------------|--------------------------------------|--------------|-----|
| `--text-eyebrow` | `0.75rem`                            | 12           | Eyebrows, nav, chapter markers, captions (Space Grotesk 300, tracked). |
| `--text-label`   | `0.875rem`                           | 14           | Inline UI labels, button text. |
| `--text-body`    | `1.25rem`                            | 20           | Body paragraphs (Space Grotesk 400). Matches reference's 20px body. |
| `--text-lede`    | `clamp(1.5rem, 1.1rem + 1.8vw, 2.25rem)` | 24 → 36  | Sub-headline / lede under a display line. |
| `--text-h2`      | `clamp(2.5rem, 1.5rem + 5vw, 4.5rem)`    | 40 → 72  | Section headlines (Anton). |
| `--text-display` | `clamp(3.25rem, 1rem + 11vw, 6rem)`      | 52 → 96  | Hero / chapter headlines (Anton). Capped at 96px per impeccable display ceiling. |

Note: the reference ran 100px+; impeccable caps display at ~6rem/96px so the page designs rather
than shouts. We honour the cap — the cinematic scale comes from WebGL depth + negative space, not
from oversized type.

### Line-height & tracking summary
- Display (Anton): `line-height 0.92`, `letter-spacing -0.02em` (−0.015em at the largest step).
- Lede: `line-height 1.2`, `letter-spacing -0.01em`.
- Body (Space Grotesk 400): `line-height 1.6`, `letter-spacing 0`.
- Hairline UI labels (Space Grotesk 300, uppercase): `letter-spacing 0.16em` (0.2em for the
  smallest eyebrows), `line-height 1.4`.

---

## Motion

The reference reads as **heavy inertia, expo/power-out, long soft tails — nothing snaps.** Easings
below match that. All durations respect the reduced-motion contract at the bottom.

### Easing curves (cubic-bezier)
| Token            | cubic-bezier                          | Feel |
|------------------|---------------------------------------|------|
| `--ease-out-expo`| `cubic-bezier(0.16, 1, 0.3, 1)`       | Primary. Heavy-inertia decel, long tail. Section reveals, the camera-feel UI moves. |
| `--ease-out-quart`| `cubic-bezier(0.25, 1, 0.5, 1)`      | Slightly snappier. Micro-interactions (hover, focus, small fades). |
| `--ease-in-out`  | `cubic-bezier(0.65, 0, 0.35, 1)`      | Symmetric, for looping/persistent ambient motion (the always-alive particle/pulse feel). |
No bounce, no elastic (impeccable: ease-out exponential only).

### Durations
| Token              | ms    | Use |
|--------------------|-------|-----|
| `--dur-micro`      | 240   | Hover, focus ring, link underline, small state changes. |
| `--dur-section`    | 720   | Section reveal, label cross-fades, in-view content. |
| `--dur-hero`       | 1200  | Hero entrance, chapter transitions, the big choreographed moves. |
(Lenis virtual-scroll inertia is tuned separately in the Lenis config — see `lib/lenis`. Target a
long, soft `lerp` ~0.08–0.1 to match the reference's heavy tail, not a CSS duration.)

### Stagger defaults
- Grouped headline lines: **90ms** between lines (stack-reveal, like the reference).
- List/grid children (selected-work items, nav links): **60ms**.
- Direction: always reveal in reading order (top→bottom, leading edge first).

### Reduced-motion behavior (`prefers-reduced-motion: reduce`) — NOT optional
The `ReducedMotionProvider` reads the media query and:
1. **Disables Lenis** (no smooth/virtual scroll — native scroll only).
2. **Kills all heavy transforms** (no translate/scale/parallax/camera moves; WebGL hero falls back
   to a static poster per the no-WebGL/degrade contract).
3. **Keeps opacity-only crossfades** at `--dur-micro` so the page still feels intentional, not dead.
4. Reveal animations must enhance an already-visible default — content is never gated behind a
   transform that won't fire. (impeccable rule; also protects headless/SSR renders.)

---

## Space & layout

### Spacing scale (rem; 4px base, non-linear for rhythm)
`--space-1: 0.25rem` (4) · `--space-2: 0.5rem` (8) · `--space-3: 0.75rem` (12) ·
`--space-4: 1rem` (16) · `--space-6: 1.5rem` (24) · `--space-8: 2rem` (32) ·
`--space-12: 3rem` (48) · `--space-16: 4rem` (64) · `--space-24: 6rem` (96) ·
`--space-32: 8rem` (128) · `--space-48: 12rem` (192).
Section vertical rhythm is generous (the reference is mostly negative space): sections use
`--space-32`/`--space-48` block padding at desktop, scaling down on mobile.

### Max content width / grid
- `--max-content: 1440px` — the primary text/UI column cap. UI never sprawls past this even on 1920;
  the canvas is full-bleed behind it, the readable layer is contained.
- `--gutter: clamp(1.25rem, 5vw, 6rem)` — page inset (20px mobile → 96px desktop).
- Grid: 12-column where needed (`--max-content`, gutter `--space-6`). Most layout is flexbox 1D
  (impeccable: Grid only for true 2D). Selected-work is the one genuine grid.

### Radius (added Phase 2 — iris)
Near-square, mechanical. The stage is hard-edged; corners are a hairline softening, never pill-soft.
| Token        | Value     | Use |
|--------------|-----------|-----|
| `--radius-sm`| `2px`     | Inputs, chips, the live-mark dot's hit area, focus-clip. |
| `--radius-md`| `4px`     | Work-card / panel containers — the largest radius on the UI layer. |
Nothing larger ships on the UI layer. Rounded-pill shapes are banned (reads SaaS-template).

### Breakpoints (match the 4 captured viewports)
| Token      | px    | Captured viewport |
|------------|-------|-------------------|
| `--bp-sm`  | 390   | mobile (iPhone-class) |
| `--bp-md`  | 768   | tablet |
| `--bp-lg`  | 1440  | desktop |
| `--bp-xl`  | 1920  | large desktop |
Mobile-first. The heavy scroll-camera **degrades to a poster/intro on `< --bp-md` + touch** (per the
analysis: full wheel-camera is desktop; mobile gets a tap-to-start static entry).

---

## Depth (WebGL z-order)

Define now so helios inherits a fixed stack. Semantic z-index scale (no arbitrary 9999s):

| Layer            | `--z` token        | value | Contents |
|------------------|--------------------|-------|----------|
| Background canvas| `--z-canvas`       | 0     | The single full-bleed `<canvas>` — particles, geometry, DoF plates, the agent-graph. All scene color lives here. |
| Mid parallax     | `--z-parallax`     | 10    | Optional mid-ground DOM elements that drift slower than foreground (decorative ticks, depth markers). |
| Foreground UI    | `--z-ui`           | 20    | White HTML overlay: wordmark, nav, headlines, labels, body, the ring cursor's anchor. |
| Overlay UI       | `--z-overlay`      | 30    | Skip-link, modals/menu, contact form when raised, toast. |
| Cursor           | `--z-cursor`       | 40    | Custom ring cursor glyph, always on top. |

Background page bg (`--bg`, pure black) sits behind `--z-canvas` as the html/body fill.

### Parallax ratios (foreground = 1.0 reference)
- Foreground UI: `1.0` (moves with scroll/native).
- Mid parallax: `0.6` (drifts slower → depth).
- Background canvas: `0` to `0.2` (near-locked; depth comes from the in-canvas camera dolly, not
  DOM parallax — the analysis was explicit that depth is *real z-traversal*, not parallax-faked).
Exact in-canvas camera curve is helios's (Phase 3); these DOM ratios are only for the HTML layers
that sit over the canvas.
