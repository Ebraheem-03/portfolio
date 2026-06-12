/* ============================================================================
   Connectors.tsx — the reasoning chain, as additive GLSL line segments.

   Two visual jobs:
   • All edges hold a faint emissive cyan baseline so the graph is always
     "wired" (alive when idle).
   • SPINE edges (hub→hub) carry a travelling SIGNAL: a bright packet of light
     runs from the active stage to the next as the agent "acts." A second
     attribute (aEdgeStart..aEdgeEnd) maps each segment onto the global loop
     progress, so the pulse appears to flow continuously around the cycle.

   Implemented as a single LineSegments draw call (one geometry, additive,
   depthWrite off) — cheap, no postprocessing dependency of its own.
   ========================================================================= */
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AgentGraph } from "./agentGraph";

const vertex = /* glsl */ `
  attribute float aSpine;     // 1.0 on spine edges, 0.0 on intra-stage edges
  attribute float aEnd;       // 0.0 at edge start vertex, 1.0 at edge end vertex
  attribute float aLoopStart; // this edge's start position on the [0,1) loop
  attribute float aLoopEnd;   // this edge's end position on the [0,1) loop
  attribute float aSeed;      // per-edge random for idle shimmer

  varying float vSpine;
  varying float vEnd;
  varying float vLoopStart;
  varying float vLoopEnd;
  varying float vSeed;

  void main() {
    vSpine = aSpine;
    vEnd = aEnd;
    vLoopStart = aLoopStart;
    vLoopEnd = aLoopEnd;
    vSeed = aSeed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform vec3  uColor;
  uniform float uTime;
  uniform float uProgress;  // global loop head, [0,1)
  uniform float uIdle;      // baseline brightness of un-signalled wiring
  uniform float uPulseLen;  // how much of the loop the signal packet covers

  varying float vSpine;
  varying float vEnd;
  varying float vLoopStart;
  varying float vLoopEnd;
  varying float vSeed;

  // shortest forward distance from the loop head to position x (both in [0,1))
  float loopDist(float head, float x) {
    float d = x - head;
    if (d < 0.0) d += 1.0;
    return d;
  }

  void main() {
    // Where this fragment sits along the loop (interpolated across the spine edge).
    float loopPos = mix(vLoopStart, vLoopEnd, vEnd);

    // Idle shimmer so even quiet wiring breathes.
    float shimmer = 0.6 + 0.4 * sin(uTime * 1.2 + vSeed * 18.0);
    float base = uIdle * shimmer;

    // Signal packet: bright where the loop head has just passed (spine only).
    float pulse = 0.0;
    if (vSpine > 0.5) {
      float d = loopDist(uProgress, loopPos);
      // trailing comet: brightest right at the head, fades back over uPulseLen.
      pulse = smoothstep(uPulseLen, 0.0, d);
      pulse = pulse * pulse; // sharpen the head
    }

    float intensity = base + pulse * 2.4;
    // spine wiring reads a touch brighter than intra-stage fan-out
    intensity *= mix(0.7, 1.0, vSpine);

    vec3 col = uColor * intensity;
    // additive: alpha carries the glow, blending does the rest
    gl_FragColor = vec4(col, intensity);
  }
`;

export function Connectors({
  graph,
  color,
  progress,
}: {
  graph: AgentGraph;
  color: THREE.Color;
  progress: React.MutableRefObject<number>;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const { nodes, edges } = graph;
    const segCount = edges.length;
    const positions = new Float32Array(segCount * 2 * 3);
    const aSpine = new Float32Array(segCount * 2);
    const aEnd = new Float32Array(segCount * 2);
    const aLoopStart = new Float32Array(segCount * 2);
    const aLoopEnd = new Float32Array(segCount * 2);
    const aSeed = new Float32Array(segCount * 2);

    // Map spine edges onto the loop's [0,1): edge s spans [s/4, (s+1)/4).
    // We recover a spine edge's stage from its source hub's order.
    const hubOrder = new Map<number, number>();
    graph.hubs.forEach((h, i) => hubOrder.set(h, i));

    edges.forEach((e, i) => {
      const na = nodes[e.a].p;
      const nb = nodes[e.b].p;
      const o = i * 6;
      positions[o + 0] = na[0];
      positions[o + 1] = na[1];
      positions[o + 2] = na[2];
      positions[o + 3] = nb[0];
      positions[o + 4] = nb[1];
      positions[o + 5] = nb[2];

      const j = i * 2;
      const spine = e.spine ? 1 : 0;
      aSpine[j] = spine;
      aSpine[j + 1] = spine;
      aEnd[j] = 0;
      aEnd[j + 1] = 1;

      let ls = 0;
      let le = 0;
      if (e.spine) {
        const stage = hubOrder.get(e.a) ?? 0;
        ls = stage / graph.stages;
        le = (stage + 1) / graph.stages;
      }
      aLoopStart[j] = ls;
      aLoopStart[j + 1] = ls;
      aLoopEnd[j] = le;
      aLoopEnd[j + 1] = le;

      const seed = (e.a * 31 + e.b * 17) % 100 / 100;
      aSeed[j] = seed;
      aSeed[j + 1] = seed;
    });

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSpine", new THREE.BufferAttribute(aSpine, 1));
    g.setAttribute("aEnd", new THREE.BufferAttribute(aEnd, 1));
    g.setAttribute("aLoopStart", new THREE.BufferAttribute(aLoopStart, 1));
    g.setAttribute("aLoopEnd", new THREE.BufferAttribute(aLoopEnd, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
    return g;
  }, [graph]);

  const uniforms = useMemo(
    () => ({
      uColor: { value: color },
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uIdle: { value: 0.16 },
      uPulseLen: { value: 0.26 },
    }),
    [color]
  );

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uProgress.value = progress.current;
  });

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}
