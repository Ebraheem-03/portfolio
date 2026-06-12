"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Single source of truth for the reduced-motion preference.
 * Consumers (Lenis provider, future motion components) read this instead of
 * each re-querying the media list. Defaults to `true` (motion suppressed) until
 * the client confirms otherwise, so SSR / headless renders never assume motion.
 * See docs/DESIGN-SYSTEM.md › Motion › Reduced-motion behavior.
 */
const ReducedMotionContext = createContext<boolean>(true);

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState<boolean>(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <ReducedMotionContext.Provider value={reduced}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotion(): boolean {
  return useContext(ReducedMotionContext);
}
