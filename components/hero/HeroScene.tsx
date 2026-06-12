/* ============================================================================
   HeroScene.tsx — orchestrates the agent loop + bloom.

   Owns the single source of truth for the loop head (`progress`, a ref so the
   shaders read it without React re-renders). One slow cycle ≈ 9s: the agent
   reads INTENT, REASONING lights, ACTION fires, OUTCOME resolves, repeat.

   Ambient life: the whole graph drifts on a lazy lissajous + parallax-tilts a
   few degrees toward the pointer, so idle never reads as a frozen still.

   `still` (reduced-motion): we DON'T animate. We park the loop head at a phase
   where one stage is clearly mid-ignition (so the frame still reads as "an
   agent graph caught firing"), render once, and stop the frameloop upstream.
   ========================================================================= */
"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { buildAgentGraph } from "./agentGraph";
import { Connectors } from "./Connectors";
import { Nodes } from "./Nodes";

const LOOP_SECONDS = 9;
// reduced-motion still: park mid-ACTION so a stage is visibly ignited.
const STILL_PHASE = 0.42;
// base vertical offset of the graph group (drift adds to this).
const BASE_X = 2.1;
const BASE_Y = 0.6;

export function HeroScene({
  still = false,
  quality = "high",
}: {
  still?: boolean;
  quality?: "high" | "low";
}) {
  const graph = useMemo(() => buildAgentGraph(7), []);
  const color = useMemo(() => new THREE.Color("#23E6C4"), []);
  const progress = useRef(still ? STILL_PHASE : 0);
  const group = useRef<THREE.Group>(null);
  const pointer = useThree((s) => s.pointer);

  useFrame((state) => {
    if (!still) {
      const t = state.clock.elapsedTime;
      progress.current = (t / LOOP_SECONDS) % 1;

      if (group.current) {
        // lazy ambient drift — never busy, just alive.
        group.current.rotation.z = Math.sin(t * 0.12) * 0.05;
        group.current.position.y = BASE_Y + Math.sin(t * 0.18) * 0.12;
        // soft pointer parallax (a few degrees), eased toward target.
        const tx = pointer.y * 0.12;
        const ty = pointer.x * 0.18;
        group.current.rotation.x += (tx - group.current.rotation.x) * 0.04;
        group.current.rotation.y += (ty - group.current.rotation.y) * 0.04;
      }
    }
  });

  return (
    <>
      {/* Park the loop in the open right/upper field so it breathes beside the
          headline block (which lives left) rather than fighting it. */}
      <group ref={group} position={[BASE_X, BASE_Y, 0]}>
        <Connectors graph={graph} color={color} progress={progress} />
        <Nodes graph={graph} color={color} progress={progress} />
      </group>

      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={quality === "high" ? 1.35 : 0.9}
          luminanceThreshold={0.12}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={quality === "high" ? 0.85 : 0.6}
        />
      </EffectComposer>
    </>
  );
}
