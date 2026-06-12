---
name: verifying-ui-visually
description: How to capture screenshots of this site for visual QA — headless-Chrome gotchas and the working approach.
metadata:
  type: project
---

Visual verification of this portfolio. There is **no Playwright/puppeteer/ws** installed and no
project run-skill; the only browser is system `google-chrome` (`/usr/bin/google-chrome`).

**The gotcha:** the hero uses `min-height: 100svh`, and headless `--screenshot` treats the whole
`--window-size` height as the viewport. So a tall window (e.g. 1440x4000 to "see the whole page")
makes the hero 4000px tall and pushes all real content off the capture — you get a near-black
image and conclude (wrongly) the page is empty. `--headless` (old) and `--headless=new` both only
capture the viewport, not the full scroll height; there's no CLI full-page flag that scrolls.

**What works:**
- For the hero: a realistic viewport (`--window-size=1440,900` etc.) at the 4 breakpoints
  (390/768/1440/1920) captures it correctly.
- For sections below the hero: navigate to the anchor (`http://localhost:3000/#work`,
  `/#contact`) so Chrome scrolls there, AND temporarily cap the hero height
  (`sed -i 's/min-height: 100svh;/min-height: 640px;/' app/page.module.css`, capture, then
  `cp` a backup back). Without the cap the section math is thrown off by the giant hero.
- Crop big PNGs with Python PIL (it's available) to inspect a region closely.

**Why:** I burned several captures on all-black images before realizing the svh-as-viewport
trap. **How to apply:** when QA-ing any below-fold section visually, expect this and reach for the
anchor-nav + temporary-hero-cap approach instead of a single tall full-page shot. Revert the cap
before finishing. See [[anton-font-subset-bug]] (Anton actually renders in these captures, so the
Latin subset may have been fixed since that memory — re-check the woff2 before trusting it).
