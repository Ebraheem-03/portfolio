/* ============================================================================
   HeroCanvas.tsx — the single full-bleed R3F <Canvas> for the hero.

   This module is the heavy one (three + R3F + drei + postprocessing). It is
   lazy-loaded, client-only (ssr:false) by HeroExperience, so it never blocks
   first paint / LCP — the hero headline and the static poster paint first.

   `frameloop`:
   • "always" — live animated loop.
   • "demand" — still mode (reduced-motion): render exactly one frame, then idle.
   ========================================================================= */
"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { HeroScene } from "./HeroScene";

export default function HeroCanvas({
  still = false,
  quality = "high",
}: {
  still?: boolean;
  quality?: "high" | "low";
}) {
  return (
    <Canvas
      // pull the camera back so the whole loop reads; orthographic-ish framing.
      camera={{ position: [0, 0, 9.5], fov: 42, near: 0.1, far: 100 }}
      // still mode: render one frame on demand, no rAF churn.
      frameloop={still ? "demand" : "always"}
      // cap DPR — bloom is fill-rate bound; 1.5 is plenty and protects mobile.
      dpr={[1, quality === "high" ? 1.75 : 1.25]}
      gl={{
        antialias: false, // bloom + additive hides aliasing; saves fill-rate
        alpha: true, // composite over the black stage / poster gradient
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0); // transparent: poster gradient shows through
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <HeroScene still={still} quality={quality} />
    </Canvas>
  );
}
