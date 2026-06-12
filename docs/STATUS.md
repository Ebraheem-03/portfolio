# STATUS — living state of the build

Heartbeat doc. Every agent updates this after a unit of work.
Tags: `[AFK]` safe unattended · `[REVIEW]` needs the human.

## Now (current phase: 1 — design system & shell)

### Blocked / needs human  [REVIEW]
- [ ] **LinkedIn URL.** Still `TODO(linkedin)` — not yet provided. Display name (Ebraheem Gillani)
      and GitHub (`Ebraheem-03`, github.com/Ebraheem-03) are confirmed and recorded as canonical in
      `docs/BRAND.md` › Identity. The invented `ebraheem.builds` handle has been dropped. Phase 2
      contact/footer must keep the `TODO(linkedin)` marker — do not invent a URL.
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
- (none — Phase 1 deliverables complete pending the reviews above)

### Up next  [AFK]
- [ ] Phase 2 (iris): static shell & content scaffold — real copy, selected-work grid, about,
      contact. Frame already stubbed in `app/page.tsx`. Accent + wordmark are now LOCKED, so this
      is unblocked. Any GitHub link uses `Ebraheem-03`; keep `TODO(linkedin)` until the URL lands.

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
