# STATUS — living state of the build

Heartbeat doc. Every agent updates this after a unit of work.
Tags: `[AFK]` safe unattended · `[REVIEW]` needs the human.

## Now (current phase: 2 — static shell & content scaffold)

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
- [ ] Phase 3 (helios): WebGL hero & signature moment. The static hero frame is built and ships a
      clearly-labelled canvas mount slot — `app/page.tsx` › `.stage` div, marked
      `data-canvas-mount`, positioned `inset:0; z-index:var(--z-canvas)`, BEHIND the white overlay
      (`--z-ui`). The current radial-accent gradient in `.stage` IS the static / reduced-motion /
      no-WebGL poster — layer the R3F canvas over it or replace it. Z-depth tokens already wired.

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
