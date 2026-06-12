/* ============================================================================
   HeroExperience.tsx — the GUARD LAYER for the Phase-3 signature moment.

   Renders INTO the hero `.stage` slot, layered OVER the static radial-gradient
   poster (which stays as the always-safe fallback). Decides, client-side, which
   of three paths to take — the poster is never removed, only covered:

     1. No WebGL            → render nothing here; the poster shows. (degrade)
     2. prefers-reduced-motion / small+touch (mobile guard)
                            → mount the canvas in STILL mode (one frozen,
                              meaningful frame) — or, on tiny screens, fall back
                              to the poster entirely to protect mobile LCP.
     3. Full path           → lazy, client-only animated canvas.

   The heavy three/R3F bundle is dynamically imported (ssr:false) so it is
   code-split out of the initial load and never blocks the hero headline / LCP.
   ========================================================================= */
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Heavy chunk: loaded only on the client, only when we decide to render it.
const HeroCanvas = dynamic(() => import("./hero/HeroCanvas"), {
  ssr: false,
  loading: () => null, // poster gradient is already behind us; show nothing extra
});

type Decision =
  | { kind: "none" } // poster only (no WebGL, or tiny mobile)
  | { kind: "still"; quality: "high" | "low" } // single frozen frame
  | { kind: "live"; quality: "high" | "low" }; // animated

function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export function HeroExperience() {
  const reduced = useReducedMotion();
  // null = undecided (first paint / SSR): render nothing, poster carries it.
  const [decision, setDecision] = useState<Decision | null>(null);

  useEffect(() => {
    // Defer one frame so the hero headline paints before we ever touch WebGL.
    let raf = 0;
    raf = requestAnimationFrame(() => {
      if (!detectWebGL()) {
        setDecision({ kind: "none" });
        return;
      }

      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const narrow = window.innerWidth < 768;
      const lowMem =
        typeof navigator !== "undefined" &&
        // deviceMemory is non-standard but a good cheap signal when present
        (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined &&
        (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 4;

      // Phone-class (narrow + touch): protect LCP — keep the poster, no canvas.
      if (narrow && coarse) {
        setDecision({ kind: "none" });
        return;
      }

      // Reduced motion: a single, still, meaningful frame — no animation.
      if (reduced) {
        setDecision({ kind: "still", quality: lowMem ? "low" : "high" });
        return;
      }

      // Tablet / low-mem: animate, but lighter (lower DPR, softer bloom).
      const quality: "high" | "low" =
        narrow || coarse || lowMem ? "low" : "high";
      setDecision({ kind: "live", quality });
    });

    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  if (!decision || decision.kind === "none") return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        // sits in the same stacking context as the poster, above its gradient.
        // (the .stage parent already owns --z-canvas, BEHIND the --z-ui overlay)
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <HeroCanvas
        still={decision.kind === "still"}
        quality={decision.quality}
      />
    </div>
  );
}
