/* ============================================================================
   Nodes.tsx — the steps / tool-calls of the agent, as emissive billboard discs.

   One InstancedMesh (a single quad, camera-facing in the shader) → one draw
   call for every node. Each instance carries:
   • aStagePhase — where on the [0,1) loop this node's stage ignites
   • aIsHub      — hubs flare hard + hold; satellites bloom softer, staggered
   • aSeed       — idle pulse phase so the field breathes when nothing is firing

   The disc itself is a soft radial falloff (procedural, no texture) so it reads
   as a lit-from-within point that bloom can smear into a real glow.
   ========================================================================= */
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AgentGraph } from "./agentGraph";

const vertex = /* glsl */ `
  attribute float aStagePhase;
  attribute float aIsHub;
  attribute float aSeed;
  attribute float aSize;

  uniform float uTime;
  uniform float uProgress;
  uniform float uPulseLen;

  varying vec2  vUv;
  varying float vGlow;
  varying float vHub;

  float loopDist(float head, float x) {
    float d = head - x;
    if (d < 0.0) d += 1.0;
    return d;
  }

  void main() {
    vUv = uv;
    vHub = aIsHub;

    // ignition: how recently the loop head passed this node's stage phase.
    float d = loopDist(uProgress, aStagePhase);
    float fire = smoothstep(uPulseLen, 0.0, d);
    // satellites lag the hub slightly and bloom softer.
    float satLag = smoothstep(uPulseLen * 0.5, 0.0, d) * 0.65;
    float ignite = mix(satLag, fire, aIsHub);

    // always-alive idle breathing.
    float idle = 0.18 + 0.10 * sin(uTime * 1.4 + aSeed * 26.0);

    vGlow = idle + ignite * (aIsHub > 0.5 ? 1.0 : 0.7);

    // camera-facing billboard: expand the quad in view space.
    // nodes swell a little as they ignite.
    float swell = 1.0 + ignite * (aIsHub > 0.5 ? 0.6 : 0.35);
    float s = aSize * swell;

    vec4 mvCenter = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mvCenter.xy += position.xy * s;
    gl_Position = projectionMatrix * mvCenter;
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  varying vec2  vUv;
  varying float vGlow;
  varying float vHub;

  void main() {
    // radial soft disc from quad uv (0..1) centred at 0.5.
    float r = length(vUv - 0.5) * 2.0;
    if (r > 1.0) discard;

    // tight bright core + wide soft halo.
    float core = smoothstep(0.55, 0.0, r);
    float halo = smoothstep(1.0, 0.0, r);
    float a = core * 1.0 + halo * 0.35;

    // hubs keep a hotter, whiter core when firing; satellites stay chromatic.
    vec3 hot = mix(uColor, vec3(1.0), core * vHub * 0.5);
    vec3 col = hot * vGlow * (0.6 + core);

    gl_FragColor = vec4(col, a * clamp(vGlow, 0.0, 1.4));
  }
`;

export function Nodes({
  graph,
  color,
  progress,
}: {
  graph: AgentGraph;
  color: THREE.Color;
  progress: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { geometry, count } = useMemo(() => {
    const n = graph.nodes.length;
    // unit quad centred at origin
    const quad = new THREE.PlaneGeometry(1, 1);

    const aStagePhase = new Float32Array(n);
    const aIsHub = new Float32Array(n);
    const aSeed = new Float32Array(n);
    const aSize = new Float32Array(n);

    graph.nodes.forEach((node, i) => {
      aStagePhase[i] = node.stage / graph.stages;
      aIsHub[i] = node.kind === 0 ? 1 : 0;
      aSeed[i] = ((i * 47) % 100) / 100;
      aSize[i] = node.size * 0.42;
    });

    quad.setAttribute(
      "aStagePhase",
      new THREE.InstancedBufferAttribute(aStagePhase, 1)
    );
    quad.setAttribute("aIsHub", new THREE.InstancedBufferAttribute(aIsHub, 1));
    quad.setAttribute("aSeed", new THREE.InstancedBufferAttribute(aSeed, 1));
    quad.setAttribute("aSize", new THREE.InstancedBufferAttribute(aSize, 1));

    return { geometry: quad, count: n };
  }, [graph]);

  // place each instance at its node position (matrices are static).
  const placed = useRef(false);
  useFrame((state) => {
    const mesh = meshRef.current;
    if (mesh && !placed.current) {
      const m = new THREE.Matrix4();
      graph.nodes.forEach((node, i) => {
        m.makeTranslation(node.p[0], node.p[1], node.p[2]);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
      placed.current = true;
    }
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uProgress.value = progress.current;
    }
  });

  const uniforms = useMemo(
    () => ({
      uColor: { value: color },
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPulseLen: { value: 0.26 },
    }),
    [color]
  );

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, count]}
      frustumCulled={false}
    >
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
