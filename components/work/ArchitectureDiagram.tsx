import type { Architecture, ArchNode } from "@/lib/work";
import styles from "./ArchitectureDiagram.module.css";

/**
 * Renders a case-study Architecture as an SVG node-graph — the agent
 * reasoning/acting loop motif from docs/design-analysis.md, at section scale.
 *
 * Server component, pure SVG, no JS: nodes are laid out on the `cols` grid by
 * each node's col/row; edges are directed connectors (arrowheads) with optional
 * labels. `accent: true` nodes get the one cyan treatment, sparingly — that's
 * the "smart" / decision part of the system.
 *
 * Accessibility: the <svg role="img"> carries <title>+<desc> built from
 * diagram.summary, AND the same summary ships as visible prose in the page
 * (the diagram never carries meaning the prose doesn't). The graph itself is
 * decorative-with-a-label — every fact in it is also in the figcaption.
 */

// --- Geometry (SVG user units; the SVG scales fluidly to its container) ------
const NODE_W = 150;
const NODE_H = 56;
const COL_GAP = 72; // horizontal space between node columns
const ROW_GAP = 36; // vertical space between node rows
const PAD = 20; // viewBox padding so strokes/arrows never clip

// A return/feedback edge (source column > target column) bows below the node
// band by this depth, so it reads as a loop and never runs through node text.
// The bow's apex carries the label, clear of every node center.
const RETURN_BOW = 30;
// Half-height of a label's contrast backing, in SVG user units.
const LABEL_PAD_Y = 7;
// Estimated rendered width of an edge label. Server-rendered SVG can't measure
// text, so we approximate from glyph count: ~7.8 user units/char at 10px with
// 0.1em tracking (measured against the widest real labels), plus chip padding.
const LABEL_CHAR_W = 7.8;
const LABEL_PAD_X = 12;
function labelChipWidth(text: string) {
  return text.length * LABEL_CHAR_W + LABEL_PAD_X;
}

function colX(col: number) {
  return PAD + col * (NODE_W + COL_GAP);
}
function rowY(row: number) {
  return PAD + row * (NODE_H + ROW_GAP);
}

type Point = { x: number; y: number };

/**
 * Pick the connector endpoints. Flow is left→right, so edges leave the right
 * side of the source and enter the left side of the target by default. When two
 * nodes share a column (vertical feed-in, e.g. corpus → retrieval) we route off
 * the nearer horizontal edge instead so the line reads as a real connection.
 */
function endpoints(from: Point, to: Point): { start: Point; end: Point } {
  const fromCenter = { x: from.x + NODE_W / 2, y: from.y + NODE_H / 2 };
  const toCenter = { x: to.x + NODE_W / 2, y: to.y + NODE_H / 2 };

  if (to.x > from.x) {
    // target is to the right: exit right edge, enter left edge
    return {
      start: { x: from.x + NODE_W, y: fromCenter.y },
      end: { x: to.x, y: toCenter.y },
    };
  }
  if (to.x < from.x) {
    // target is to the left (feedback edge): exit left, enter right
    return {
      start: { x: from.x, y: fromCenter.y },
      end: { x: to.x + NODE_W, y: toCenter.y },
    };
  }
  // same column: vertical connector, exit/enter the nearer horizontal edge
  if (to.y > from.y) {
    return {
      start: { x: fromCenter.x, y: from.y + NODE_H },
      end: { x: toCenter.x, y: to.y },
    };
  }
  return {
    start: { x: fromCenter.x, y: from.y },
    end: { x: toCenter.x, y: to.y + NODE_H },
  };
}

/**
 * A return/feedback edge (source column right of target) routed as a quadratic
 * Bézier that bows *below the entire node band*, so it reads as a loop and never
 * crosses the text of any node in the rows it spans — including a node that sits
 * directly under the span. It exits the bottom of the source and enters the
 * bottom of the target; the control point pulls the curve down past `bandBottom`
 * into the clear gutter. We return the apex (the curve's lowest point at t=0.5)
 * so the label can ride there, beneath every node.
 */
function returnPath(
  from: Point,
  to: Point,
  bandBottom: number,
): {
  d: string;
  apex: Point;
  bottom: number;
} {
  const fromCx = from.x + NODE_W / 2;
  const toCx = to.x + NODE_W / 2;
  const start = { x: fromCx, y: from.y + NODE_H };
  const end = { x: toCx, y: to.y + NODE_H };
  // Aim the apex a fixed depth below the lowest node row so the loop always
  // clears the whole band, whatever rows the two endpoints sit on.
  const apexY = bandBottom + RETURN_BOW;
  // For a quadratic with endpoints at the node bottoms, the apex sits at
  // 0.25*startY + 0.5*ctrlY + 0.25*endY; solve ctrlY for the target apexY.
  const ctrlY = (apexY - 0.25 * start.y - 0.25 * end.y) / 0.5;
  const ctrl = { x: (start.x + end.x) / 2, y: ctrlY };
  const apex = {
    x: 0.25 * start.x + 0.5 * ctrl.x + 0.25 * end.x,
    y: apexY,
  };
  const d = `M ${start.x} ${start.y} Q ${ctrl.x} ${ctrl.y} ${end.x} ${end.y}`;
  return { d, apex, bottom: apex.y + LABEL_PAD_Y };
}

/**
 * An edge label with a contrast backing, centred on (x, y). Server-rendered SVG
 * can't measure text, so the backing width is estimated from the glyph count of
 * the uppercase tracked 10px label (~6.6 user units/char + tracking). The
 * backing fills with the stage background so the label never reads on top of a
 * node label or a stroke it happens to cross.
 */
function EdgeLabel({ x, y, text }: { x: number; y: number; text: string }) {
  const w = labelChipWidth(text);
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - LABEL_PAD_Y}
        width={w}
        height={LABEL_PAD_Y * 2}
        rx={2}
        className={styles.edgeLabelBacking}
      />
      <text
        x={x}
        y={y}
        className={styles.edgeLabel}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {text}
      </text>
    </g>
  );
}

export function ArchitectureDiagram({
  architecture,
  titleId,
  descId,
}: {
  architecture: Architecture;
  /** id for the SVG <title> (wired via aria-labelledby). */
  titleId: string;
  /** id for the SVG <desc> (wired via aria-describedby). */
  descId: string;
}) {
  const { cols, nodes, edges, summary } = architecture;

  const rows = Math.max(...nodes.map((n) => n.row)) + 1;
  const width = PAD * 2 + cols * NODE_W + (cols - 1) * COL_GAP;
  const nodeBandBottom = PAD + rows * NODE_H + (rows - 1) * ROW_GAP;

  const byId = new Map(nodes.map((n) => [n.id, n]));

  // Pre-compute geometry per edge so the viewBox can grow to fit any return-edge
  // bow (it dips below the node band) before we know the final height.
  type Resolved =
    | {
        kind: "straight";
        from: ArchNode;
        to: ArchNode;
        start: Point;
        end: Point;
        /** Where the label (if any) is anchored — its visual centre. */
        labelPos: Point;
        accent: boolean;
        label?: string;
        key: string;
      }
    | {
        kind: "return";
        d: string;
        apex: Point;
        accent: boolean;
        label?: string;
        key: string;
      };

  const resolved: Resolved[] = [];
  let maxBottom = nodeBandBottom;

  for (const edge of edges) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) continue;

    const fromPt = { x: colX(from.col), y: rowY(from.row) };
    const toPt = { x: colX(to.col), y: rowY(to.row) };
    const accent = Boolean(from.accent || to.accent);
    const key = `${edge.from}-${edge.to}`;

    // A return/feedback edge: route it under the band as a bowed loop.
    if (to.col < from.col) {
      const { d, apex, bottom } = returnPath(fromPt, toPt, nodeBandBottom);
      maxBottom = Math.max(maxBottom, bottom);
      resolved.push({ kind: "return", d, apex, accent, label: edge.label, key });
      continue;
    }

    const { start, end } = endpoints(fromPt, toPt);
    const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

    // Default label anchor: just above the connector midpoint.
    let labelPos = { x: mid.x, y: mid.y - 7 };

    // Horizontal forward edge (same row, target to the right): the label belongs
    // in the column gap, not on a node. Centre it in the gap between the two
    // boxes; if the chip is wider than the gap, shift it left so it stops at the
    // target's left edge (clear of the node text and the arrowhead).
    if (edge.label && to.col > from.col && Math.abs(start.y - end.y) < 1) {
      const gapL = fromPt.x + NODE_W; // source right edge
      const gapR = toPt.x; // target left edge
      const chipW = labelChipWidth(edge.label);
      const half = chipW / 2;
      // Keep the chip inside [gapL, gapR] when it fits; otherwise pin its right
      // edge just shy of the target (3px) so it never sits over the (more
      // important) target node or its arrowhead.
      const inset = 3;
      const cx =
        chipW <= gapR - gapL
          ? (gapL + gapR) / 2
          : Math.max(gapL + half, gapR - inset - half);
      labelPos = { x: cx, y: start.y - 7 };
    }

    resolved.push({
      kind: "straight",
      from,
      to,
      start,
      end,
      labelPos,
      accent,
      label: edge.label,
      key,
    });
  }

  const height = maxBottom + PAD;

  // Unique marker ids per-instance so multiple diagrams on a page don't collide.
  const markerId = `arrow-${titleId}`;
  const markerAccentId = `arrow-accent-${titleId}`;

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descId}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={titleId}>System architecture diagram</title>
      <desc id={descId}>{summary}</desc>

      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" className={styles.arrowHead} />
        </marker>
        <marker
          id={markerAccentId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" className={styles.arrowHeadAccent} />
        </marker>
      </defs>

      {/* --- Edges (drawn first, under the nodes) --- */}
      <g>
        {resolved.map((e) => {
          const marker = `url(#${e.accent ? markerAccentId : markerId})`;

          if (e.kind === "return") {
            // Bowed feedback loop under the band; label rides the apex, with a
            // contrast backing so it never sits unreadable on a stroke.
            return (
              <g key={e.key}>
                <path
                  d={e.d}
                  className={e.accent ? styles.edgeAccent : styles.edge}
                  markerEnd={marker}
                />
                {e.label ? (
                  <EdgeLabel x={e.apex.x} y={e.apex.y} text={e.label} />
                ) : null}
              </g>
            );
          }

          // Straight connector. Its label sits just above the line's midpoint;
          // for these (vertical feeds / forward edges) the midpoint is in a
          // gutter, but the backing keeps it readable wherever it lands.
          return (
            <g key={e.key}>
              <line
                x1={e.start.x}
                y1={e.start.y}
                x2={e.end.x}
                y2={e.end.y}
                className={e.accent ? styles.edgeAccent : styles.edge}
                markerEnd={marker}
              />
              {e.label ? (
                <EdgeLabel x={e.labelPos.x} y={e.labelPos.y} text={e.label} />
              ) : null}
            </g>
          );
        })}
      </g>

      {/* --- Nodes --- */}
      <g>
        {nodes.map((node) => {
          const x = colX(node.col);
          const y = rowY(node.row);
          return (
            <g key={node.id}>
              <rect
                x={x}
                y={y}
                width={NODE_W}
                height={NODE_H}
                rx={4}
                className={node.accent ? styles.nodeAccent : styles.node}
              />
              {node.accent ? (
                // The accent node's connector dot — the agent-graph "smart node"
                // motif echoed from the monogram. Sits on the left edge.
                <circle
                  cx={x}
                  cy={y + NODE_H / 2}
                  r={3}
                  className={styles.nodeDot}
                />
              ) : null}
              <text
                x={x + NODE_W / 2}
                y={y + NODE_H / 2}
                className={node.accent ? styles.nodeLabelAccent : styles.nodeLabel}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
