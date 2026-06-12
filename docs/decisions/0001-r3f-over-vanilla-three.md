# ADR-0001: React Three Fiber over vanilla Three.js

- Status: accepted
- Date: <fill>

## Context
The site is React/Next-based and needs a maintainable 3D layer with declarative scene state.

## Decision
Use React Three Fiber + drei rather than imperative vanilla Three.js.

## Consequences
- (+) Scene state lives in React; easier to compose with UI and motion.
- (+) drei covers common helpers, saving boilerplate.
- (-) Slight abstraction cost; drop to raw Three/GLSL for the signature shader moment.
