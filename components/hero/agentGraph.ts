/* ============================================================================
   agentGraph.ts — the procedural topology of the signature moment.

   This is NOT decorative geometry. It encodes a literal agent reasoning/acting
   loop as a directed graph:

       INTENT  →  REASONING  →  ACTION  →  OUTCOME  →  (back to INTENT)

   Each STAGE is a small cluster of nodes (a "thought" — sub-steps / tool-calls).
   CONNECTORS are the reasoning chain; a signal pulse travels them stage→stage,
   igniting each cluster as the agent "thinks" then "acts," completing the loop
   and resuming. Deterministic (seeded) so SSR / the still reduced-motion frame /
   the headless screenshot and the live GPU render all agree on layout.
   ========================================================================= */

export type Vec3 = [number, number, number];

export interface GraphNode {
  /** world position */
  p: Vec3;
  /** which lifecycle stage this node belongs to (0..STAGES-1) */
  stage: number;
  /** 0 = the stage's anchor/hub node, 1 = a satellite sub-step */
  kind: 0 | 1;
  /** base size multiplier */
  size: number;
}

export interface GraphEdge {
  a: number; // node index
  b: number; // node index
  /** true when this edge crosses from one stage to the next (carries the signal) */
  spine: boolean;
}

export interface AgentGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** node index of each stage's hub, in loop order */
  hubs: number[];
  stages: number;
}

/** Stable labels — used by the still-frame poster + any future a11y text. */
export const STAGE_LABELS = ["INTENT", "REASONING", "ACTION", "OUTCOME"] as const;

// Tiny deterministic PRNG (mulberry32) — no Math.random, so layout is identical
// everywhere (server, reduced-motion still, swiftshader shot, real GPU).
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildAgentGraph(seed = 7): AgentGraph {
  const rand = rng(seed);
  const stages = STAGE_LABELS.length;

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const hubs: number[] = [];

  // The four stages sit around a wide ellipse (the loop reads as a cycle, not a
  // line). Slightly tilted + non-circular so it never looks like a clock face.
  const radiusX = 4.3;
  const radiusY = 2.55;
  // start upper-left so the loop's "head" sits away from the hero headline block.
  const startAngle = Math.PI * 0.82;

  for (let s = 0; s < stages; s++) {
    const a = startAngle - (s / stages) * Math.PI * 2;
    const hubPos: Vec3 = [
      Math.cos(a) * radiusX,
      Math.sin(a) * radiusY,
      (rand() - 0.5) * 1.2, // gentle z so the cluster has real depth
    ];
    const hubIndex = nodes.length;
    nodes.push({ p: hubPos, stage: s, kind: 0, size: 1.6 });
    hubs.push(hubIndex);

    // Satellite sub-steps clustered around the hub — the "thoughts" inside a stage.
    const satellites = 3 + Math.floor(rand() * 2); // 3–4
    for (let k = 0; k < satellites; k++) {
      const sa = rand() * Math.PI * 2;
      const sr = 0.7 + rand() * 0.9;
      const sat: Vec3 = [
        hubPos[0] + Math.cos(sa) * sr,
        hubPos[1] + Math.sin(sa) * sr * 0.8,
        hubPos[2] + (rand() - 0.5) * 1.0,
      ];
      const satIndex = nodes.length;
      nodes.push({ p: sat, stage: s, kind: 1, size: 0.7 + rand() * 0.5 });
      // intra-stage edges (hub → sub-step): the local reasoning fan-out.
      edges.push({ a: hubIndex, b: satIndex, spine: false });
      // occasional sub-step → sub-step cross-link for graph texture.
      if (k > 0 && rand() > 0.5) {
        edges.push({ a: satIndex, b: satIndex - 1, spine: false });
      }
    }
  }

  // The SPINE: hub → next hub, closing the loop. These carry the signal pulse.
  for (let s = 0; s < stages; s++) {
    const from = hubs[s];
    const to = hubs[(s + 1) % stages];
    edges.push({ a: from, b: to, spine: true });
  }

  return { nodes, edges, hubs, stages };
}
