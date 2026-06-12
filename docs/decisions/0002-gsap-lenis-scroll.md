# ADR-0002: GSAP + Lenis for scroll choreography

- Status: accepted
- Date: <fill>

## Context
The Resn-tier feel depends on precise scroll-linked motion and smooth scrolling.

## Decision
GSAP (ScrollTrigger) for choreography + Lenis for smooth scroll. Framer Motion for
component-level motion only.

## Consequences
- (+) Frame-accurate control over the "in-between" frames that sell the effect.
- (-) Two motion systems; keep their roles separate (GSAP=scroll, Framer=component) to avoid conflict.
- Must implement a reduced-motion path.
