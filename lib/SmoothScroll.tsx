"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Lenis smooth-scroll, gated on reduced-motion.
 * When the user prefers reduced motion we do NOT instantiate Lenis at all —
 * native scrolling stays, per the reduced-motion contract in DESIGN-SYSTEM.md.
 *
 * lerp 0.09 + a long duration gives the heavy-inertia / long-soft-tail feel the
 * reference shows (power2/expo-out). This is the DOM smooth-scroll; the in-canvas
 * camera dolly is helios's concern (Phase 3) and will sync to this in Phase 4.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.09,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
