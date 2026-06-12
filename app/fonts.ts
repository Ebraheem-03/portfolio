import localFont from "next/font/local";

/**
 * Self-hosted fonts (next/font/local). We vendor the WOFF2 files rather than
 * fetching from Google at build time: zero build-time network dependency, zero
 * third-party request at runtime (privacy + LCP), and a stable build. Files
 * pulled from Google Fonts (both OFL-licensed) and stored in app/fonts/.
 */

/**
 * Display face — Anton (OFL). Ultra-condensed grotesque, single weight (reads ~800).
 * Open analogue to Manifold CF Extra-Bold. Always used uppercase.
 * See docs/DESIGN-SYSTEM.md › Typography › Display.
 */
export const display = localFont({
  src: [{ path: "./fonts/anton-400.woff2", weight: "400", style: "normal" }],
  display: "swap",
  variable: "--font-display",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});

/**
 * Body / UI face — Space Grotesk (OFL). Geometric grotesque; 300 hairline UI,
 * 400 body, 500 emphasis. The counter-tension to Anton.
 * See docs/DESIGN-SYSTEM.md › Typography › Body / UI.
 */
export const body = localFont({
  src: [
    { path: "./fonts/space-grotesk-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/space-grotesk-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/space-grotesk-500.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
  variable: "--font-body",
  fallback: ["system-ui", "sans-serif"],
});
