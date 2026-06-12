/* ============================================================================
   scrollSignal.ts — the one bridge between the DOM scroll layer (GSAP/Lenis)
   and the WebGL hero (R3F useFrame).

   The hero canvas must NOT re-render on scroll — it reads from a ref every
   frame. The GSAP ScrollTrigger that tracks the hero leaving the viewport
   writes `heroExit` here (0 at top, 1 when the hero is fully scrolled past).
   HeroScene reads it each frame to (a) accelerate the agent loop and (b) add a
   small parallax/recede as the user leaves, so the WebGL is part of the scroll
   story rather than inert decoration.

   Module-level singleton: no React context, no re-renders, framework-agnostic.
   When reduced-motion is active the publisher is never wired, so heroExit stays
   0 and the scene runs its idle loop untouched.
   ========================================================================= */

type Listener = (heroExit: number) => void;

const state = { heroExit: 0 };
const listeners = new Set<Listener>();

/** GSAP writes here (0 → 1) as the hero scrolls out of view. */
export function setHeroExit(v: number): void {
  const clamped = v < 0 ? 0 : v > 1 ? 1 : v;
  if (clamped === state.heroExit) return;
  state.heroExit = clamped;
  listeners.forEach((fn) => fn(clamped));
}

/** Read the current value (R3F useFrame polls this). */
export function getHeroExit(): number {
  return state.heroExit;
}

/** Optional subscribe (unused by the polling hero, handy for DOM consumers). */
export function onHeroExit(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Reset on teardown so a remount (e.g. reduced-motion toggle) starts clean. */
export function resetScrollSignal(): void {
  state.heroExit = 0;
}
