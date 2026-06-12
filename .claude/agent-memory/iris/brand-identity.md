---
name: brand-identity
description: Locked brand facts for the portfolio — accent color, primary wordmark, name/handles. Canonical source is docs/BRAND.md › Identity.
metadata:
  type: project
---

Locked Phase-1 brand decisions (human-reviewed 2026-06-11).

- **Accent:** cyan `#23E6C4`, LOCKED. Single literal `--accent` in `app/globals.css`; no
  candidate-switching scaffolding. Violet `#6E5BFF` and lime `#B6FF3C` were rejected.
- **Primary mark:** the EG monogram (brand direction 02). Shipped as inline vector PATHS in
  `components/Wordmark.tsx` and as the favicon `app/icon.svg`. Glyphs = `currentColor`, the
  node+connector = `--accent`. Full name "Ebraheem Gillani" stays spelled out in copy/footer.
- **Name/handles:** Display name "Ebraheem Gillani" (confirmed). GitHub `Ebraheem-03`
  (github.com/Ebraheem-03) for every GitHub link. **LinkedIn CONFIRMED 2026-06-12:**
  `https://www.linkedin.com/in/ebraheemgillani/` — use for every LinkedIn link (the old
  `TODO(linkedin)` marker is retired). The old `ebraheem.builds` handle was invented and is DROPPED.
- **Contact email:** `ebraheemgillani1@gmail.com` is the project owner's address; Phase 2 uses it
  as the exposed `mailto:` in `SocialLinks.tsx` but flagged `TODO(human)` to confirm before final.

**Why:** these are the load-bearing identity decisions every Phase-2+ surface (contact, footer,
social links, OG/meta) must stay consistent with.
**How to apply:** read `docs/BRAND.md` › Identity as the canonical source before adding any link,
handle, or social reference. GitHub + LinkedIn are both confirmed now; only the public contact
email is still a `TODO(human)` confirmation. See [[anton-font-subset-bug]] for a related asset gotcha.