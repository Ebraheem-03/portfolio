/**
 * Selected work — the spine of the site (BRAND.md › Proof assets).
 *
 * Each entry is a case-study CONTAINER, not the case study itself (those land in
 * Phase 5). The shape is deliberately proof-first: problem → architecture → the
 * deployed thing. Copy here is real and voice-correct; anything that would be a
 * fabricated fact (a live URL, a metric, a repo link) is left as a TODO(human)
 * marker rather than invented. See the report for the full TODO list.
 */

export type WorkLink = {
  /** Visible, standalone-meaningful label (screen readers announce out of context). */
  label: string;
  /** Real URL, or null when it's still a TODO(human) gap — renders as a disabled marker. */
  href: string | null;
  /** "live" gets the accent live-mark; "case" is the (Phase 5) case-study route. */
  kind: "live" | "case" | "repo";
};

export type WorkItem = {
  /** Stable id, also the anchor + aria wiring. */
  id: string;
  /** Two-digit index used as a real ordered sequence marker (these ARE ordered). */
  index: string;
  title: string;
  /** One line. The problem, concretely — no adjectives. */
  problem: string;
  /** Tight architecture note. What it's built from and why that shape. */
  architecture: string;
  /** The stack chips — short, factual. */
  stack: string[];
  /** Where the proof lives. */
  links: WorkLink[];
};

export const WORK: WorkItem[] = [
  {
    id: "agentic-commerce",
    index: "01",
    title: "Agentic e-commerce platform",
    problem:
      "Storefront operations that needed a human in the loop for every decision (pricing, sourcing, fulfilment) didn't scale past a point.",
    architecture:
      "A multi-agent system where specialised agents take real actions against live tools and APIs, not a single model answering questions. A planner decomposes intent; worker agents execute against the catalog, orders, and supplier endpoints; a supervisor gates side effects. State and tool results flow back so the loop reasons over what actually happened.",
    stack: ["Multi-agent", "Tool use", "Orchestration", "Live actions"],
    links: [
      // No public deploy / repo confirmed yet — proof-first means no invented link.
      { label: "Read the architecture", href: null, kind: "case" }, // TODO(human): Phase 5 case-study route, or a repo/demo URL if one is public.
    ],
  },
  {
    id: "resume-analyzer",
    index: "02",
    title: "Resume Analyzer",
    problem:
      "Generic resume feedback is either a keyword-matching trick or a vague LLM opinion. Neither tells you what a specific role would actually screen for.",
    architecture:
      "A deployed app that parses a resume, grounds its read against the target role, and returns structured, role-specific feedback rather than a score. Runs live: a working AI app you can open, not a screenshot.",
    stack: ["LLM", "Structured output", "Deployed", "Hugging Face Spaces"],
    links: [
      // It IS live on HF Spaces, but the exact Space URL is not confirmed here.
      { label: "Open the live app", href: null, kind: "live" }, // TODO(human): exact Hugging Face Spaces URL.
    ],
  },
  {
    id: "ministry-platform",
    index: "03",
    title: "MD ministry AI platform",
    problem:
      "A government ministry needed answers grounded in its own documents and schemas, where the schema itself changes, so a hard-coded pipeline goes stale the moment the data model moves.",
    architecture:
      "A FastAPI service with retrieval-augmented generation over the ministry's corpus, built schema-dynamic: the retrieval and response layer adapts to the data model instead of assuming a fixed one. Production work, not a prototype.",
    stack: ["FastAPI", "RAG", "Schema-dynamic", "Production"],
    links: [
      // Government/client work — likely no public link. Keep honest.
      { label: "Read the architecture", href: null, kind: "case" }, // TODO(human): Phase 5 case-study route. A public link may not be possible (client work) — confirm.
    ],
  },
];
