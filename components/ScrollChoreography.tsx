/* ============================================================================
   ScrollChoreography.tsx — all GSAP ScrollTriggers for the section arc.

   Hub-and-spoke: SmoothScroll.tsx owns the Lenis↔ScrollTrigger sync and the
   single rAF; THIS component owns the choreography (what reveals, when, how).
   It renders no DOM — it's a behavioural layer over the existing server-rendered
   markup, hooked in via data-attributes (data-reveal, data-reveal-group,
   data-work-grid, data-hero, data-hero-content).

   The arc, translated from the reference's "one continuous camera journey":
     • Hero        — grouped-line entrance on load; on scroll-out the content
                     lifts + fades and the WebGL graph recedes/accelerates
                     (the scroll drives the signature moment, lib/scrollSignal).
     • Work        — section head reveals in reading order; cards stagger up with
                     a little extra depth (layered parallax feel).
     • About       — head + prose reveal as one grouped move.
     • Contact     — head reveals; the journey resolves.

   NON-NEGOTIABLES honoured here:
   • Reduced-motion / Lenis-off → this component no-ops entirely. Nothing is
     armed, [data-reveal] stays visible (CSS only hides under data-choreo=armed).
   • Transform + opacity only — no width/height/top/left, so no layout thrash and
     CLS stays ~0. translateY reveals don't change the element's box.
   • No pinning, no scroll-jacking of focus. Anchor links still land (Lenis owns
     anchor smoothing; ScrollTrigger only observes). Tab order is untouched.
   ========================================================================= */
"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { setHeroExit } from "@/lib/scrollSignal";

export function ScrollChoreography() {
  const reduced = useReducedMotion();

  useEffect(() => {
    // Reduced-motion (or SSR default): degrade to content simply being present.
    // Never arm the hidden states, never create a trigger.
    if (reduced) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    // Dynamically import GSAP so it stays out of the critical path; the reveal
    // CSS only activates once we set data-choreo, so there's no flash before it.
    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const root = document.documentElement;
      // Arm the hidden initial states (CSS reacts to this attribute). Setting it
      // from JS guarantees the no-JS / reduced-motion paths never hide content.
      root.setAttribute("data-choreo", "armed");

      const EASE = "expo.out"; // mirrors --ease-out-expo (heavy decel, long tail)
      const DUR_SECTION = 0.72; // --dur-section
      const DUR_HERO = 1.2; // --dur-hero
      const STAGGER_LINE = 0.09; // --stagger-line (90ms)
      const STAGGER_ITEM = 0.06; // --stagger-item (60ms)

      ctx = gsap.context(() => {
        /* -- HERO: grouped-line entrance on load --------------------------- */
        const heroLines = gsap.utils.toArray<HTMLElement>(
          "[data-hero-content] [data-reveal]"
        );
        if (heroLines.length) {
          gsap.to(heroLines, {
            opacity: 1,
            y: 0,
            duration: DUR_HERO,
            ease: EASE,
            stagger: STAGGER_LINE,
            delay: 0.15, // let the first paint settle (LCP already painted)
          });
        }

        /* -- HERO scroll-out: lift + fade content, drive the WebGL graph --- */
        // As the hero leaves, content parallaxes up/out AND we publish heroExit
        // (0→1) so HeroScene accelerates the agent loop + recedes the graph.
        const heroEl = document.querySelector<HTMLElement>("[data-hero]");
        const heroContent = document.querySelector<HTMLElement>(
          "[data-hero-content]"
        );
        if (heroEl) {
          ScrollTrigger.create({
            trigger: heroEl,
            start: "top top",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => {
              // The scroll story: feed leave-progress to the canvas every frame.
              setHeroExit(self.progress);
            },
          });

          if (heroContent) {
            // Foreground parallax: content drifts up and dims as the camera
            // "leaves the station". Transform/opacity only → no layout shift.
            gsap.to(heroContent, {
              y: -80,
              opacity: 0,
              ease: "none",
              scrollTrigger: {
                trigger: heroEl,
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            });
          }
        }

        /* -- SECTION HEADS: reveal in reading order on enter --------------- */
        const groups = gsap.utils.toArray<HTMLElement>("[data-reveal-group]");
        groups.forEach((group) => {
          const items = gsap.utils.toArray<HTMLElement>(
            "[data-reveal]",
            group
          );
          if (!items.length) return;
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: DUR_SECTION,
            ease: EASE,
            stagger: STAGGER_LINE,
            scrollTrigger: {
              trigger: group,
              start: "top 80%", // begin a bit before fully in view
              once: true, // reveal once; never re-hide (no flicker on scroll-up)
            },
          });
        });

        /* -- WORK CARDS: staggered entrance with extra depth --------------- */
        const grid = document.querySelector<HTMLElement>("[data-work-grid]");
        if (grid) {
          const cards = gsap.utils.toArray<HTMLElement>(":scope > *", grid);
          if (cards.length) {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              duration: DUR_SECTION,
              ease: EASE,
              stagger: STAGGER_ITEM,
              scrollTrigger: {
                trigger: grid,
                start: "top 85%",
                once: true,
              },
            });
          }
        }
      });

      // Fonts/layout may shift trigger positions; recompute after they settle.
      ScrollTrigger.refresh();
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          if (!cancelled) ScrollTrigger.refresh();
        });
      }
    })();

    return () => {
      cancelled = true;
      ctx?.revert(); // restores inline styles + removes this context's triggers
      document.documentElement.removeAttribute("data-choreo");
    };
  }, [reduced]);

  return null;
}
