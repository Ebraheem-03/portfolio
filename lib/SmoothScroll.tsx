"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./useReducedMotion";
import { resetScrollSignal } from "./scrollSignal";

/**
 * Lenis smooth-scroll + GSAP ScrollTrigger, gated on reduced-motion.
 *
 * When the user prefers reduced motion we instantiate NEITHER Lenis NOR
 * ScrollTrigger — native scrolling stays and all choreography degrades to
 * content simply being present (per the reduced-motion contract in
 * DESIGN-SYSTEM.md). The ScrollChoreography component makes the same check and
 * no-ops, so there are no orphaned triggers.
 *
 * The sync (done ONCE, here, near the Lenis instance):
 *  • lenis.on("scroll", ScrollTrigger.update) — every smoothed scroll frame
 *    pushes the new position into ScrollTrigger so triggers fire in lockstep
 *    with the inertia, not the native (unsmoothed) scrollTop.
 *  • gsap.ticker drives lenis.raf — ONE rAF loop is the single source of truth
 *    for both libraries (don't run a second requestAnimationFrame for Lenis, or
 *    GSAP tweens and Lenis drift out of phase).
 *  • gsap.ticker.lagSmoothing(0) — GSAP's lag-catchup would teleport tweens
 *    after a stall; Lenis already smooths, so we disable it.
 *
 * lerp 0.09 + the expo-out easing gives the heavy-inertia / long-soft-tail feel
 * the reference shows. The in-canvas loop reads scroll via lib/scrollSignal.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.09,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    // Lenis → ScrollTrigger: every smoothed frame updates trigger progress.
    lenis.on("scroll", ScrollTrigger.update);

    // GSAP ticker → Lenis: one rAF for both. ticker time is seconds; lenis.raf
    // wants ms.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // After fonts/layout settle, recompute trigger start/end positions.
    const refresh = () => ScrollTrigger.refresh();
    const refreshId = window.setTimeout(refresh, 0);

    return () => {
      window.clearTimeout(refreshId);
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      resetScrollSignal();
    };
  }, [reduced]);

  return <>{children}</>;
}
