/**
 * Selected work — the spine of the site (BRAND.md › Proof assets).
 *
 * This is the SINGLE data source. The home cards (components/WorkCard.tsx) read
 * the summary fields; the dedicated case-study pages (app/work/[slug]) read the
 * full `detail` block. Keep it that way — never fork the data.
 *
 * The shape is deliberately proof-first: problem → architecture → decisions →
 * outcome → the deployed thing. Copy here is real and voice-correct (BRAND.md);
 * anything that would be a FABRICATED fact (an exact live URL, a hard metric, a
 * client name, a date) is left as a `TODO(human)` marker — a marked gap beats an
 * invented fact. See the report / docs/STATUS.md for the full TODO list.
 */

export type WorkLink = {
  /** Visible, standalone-meaningful label (screen readers announce out of context). */
  label: string;
  /** Real URL, or null when it's still a TODO(human) gap — renders as a disabled marker. */
  href: string | null;
  /** "live" gets the accent live-mark; "case" is the case-study route; "repo" is source. */
  kind: "live" | "case" | "repo";
};

/** Deploy status for the case-study hero proof line — never a fabricated link. */
export type WorkStatus =
  | { kind: "live"; label: string } // shipped + openable (gets the accent live-mark)
  | { kind: "private"; label: string } // real production/client work, no public surface (honest)
  | { kind: "pending"; label: string }; // a public link is intended but not confirmed yet

/** One node in a case-study architecture diagram. */
export type ArchNode = {
  id: string;
  /** Short label rendered in the node. */
  label: string;
  /** Column (0-based) — the left→right flow stage. */
  col: number;
  /** Row within the column (0-based, top→bottom). */
  row: number;
  /** Accent the node (the "smart" / decision part of the system). Used sparingly. */
  accent?: boolean;
};

/** A directed edge between two nodes (by id). */
export type ArchEdge = {
  from: string;
  to: string;
  /** Optional short label on the edge (e.g. "tool result"). */
  label?: string;
};

/** The architecture diagram + its mandatory text equivalent (a11y). */
export type Architecture = {
  /** Number of columns the grid lays out (drives the SVG width math). */
  cols: number;
  nodes: ArchNode[];
  edges: ArchEdge[];
  /**
   * Plain-language description of the system shape. This is the diagram's text
   * alternative (read by the <desc>/figcaption) AND a real paragraph that ships
   * visibly — the diagram never carries meaning the prose doesn't.
   */
  summary: string;
};

/** A decision/trade-off — the "why this shape, not the obvious one" proof. */
export type Decision = {
  /** The choice, stated plainly. */
  title: string;
  /** Why — the trade-off reasoned, not asserted. */
  body: string;
};

/** A single quantified result. `value` is null until a real number is confirmed. */
export type Metric = {
  label: string;
  /** Real figure, or null → renders as a marked "TODO(human)" gap, never invented. */
  value: string | null;
};

export type WorkDetail = {
  /** The case-study hero thesis — one line, concrete, voice-correct. */
  thesis: string;
  /** Deploy status for the hero proof line. */
  status: WorkStatus;
  /** The long problem — the real situation, a paragraph or two. */
  problemLong: string[];
  /** The structured architecture diagram + its text equivalent. */
  diagram: Architecture;
  /** The decisions/trade-offs (the architecture argument). */
  decisions: Decision[];
  /** The outcome — what shipped / what it proves. Proof, not adjectives. */
  outcome: string[];
  /** Optional quantified results; values null until confirmed (never fabricated). */
  metrics?: Metric[];
};

export type WorkItem = {
  /** Stable id, also the anchor + aria wiring. */
  id: string;
  /** URL slug for the /work/[slug] case-study route. */
  slug: string;
  /** Two-digit index used as a real ordered sequence marker (these ARE ordered). */
  index: string;
  title: string;
  /** One line. The problem, concretely — no adjectives. (Home card.) */
  problem: string;
  /** Tight architecture note. What it's built from and why that shape. (Home card.) */
  architecture: string;
  /** The stack chips — short, factual. */
  stack: string[];
  /** External proof links (live app / repo). The case-study route is built from `slug`. */
  links: WorkLink[];
  /** The full case study (read by app/work/[slug]). */
  detail: WorkDetail;
};

export const WORK: WorkItem[] = [
  {
    id: "agentic-commerce",
    slug: "agentic-commerce",
    index: "01",
    title: "Agentic e-commerce platform",
    problem:
      "Storefront operations that needed a human in the loop for every decision (pricing, sourcing, fulfilment) didn't scale past a point.",
    architecture:
      "A multi-agent system where specialised agents take real actions against live tools and APIs, not a single model answering questions. A planner decomposes intent; worker agents execute against the catalog, orders, and supplier endpoints; a supervisor gates side effects. State and tool results flow back so the loop reasons over what actually happened.",
    stack: ["Multi-agent", "Tool use", "Orchestration", "Live actions"],
    links: [
      // No public deploy / repo confirmed yet — proof-first means no invented link.
      { label: "Read the case study", href: "/work/agentic-commerce", kind: "case" },
      // TODO(human): a public repo or demo URL, if one exists, to add alongside the case study.
    ],
    detail: {
      thesis:
        "Agents that take actions against a real storefront — plan, execute, gate side effects — not a chatbot that describes what someone should do.",
      status: {
        kind: "private",
        label: "Architecture deep-dive — no public deploy",
      },
      problemLong: [
        "A storefront's day runs on decisions: what to price, what to re-source, which orders to expedite, which supplier to chase. Each one is small. Together they need a human in the loop, and that human becomes the ceiling — throughput is capped at how fast one person can read context and act.",
        "The naive fix is a chatbot that answers questions about the store. That moves the bottleneck without removing it: a human still has to read the answer and go take the action. The system had to take the action itself — safely — and only escalate the calls that actually need judgement.",
      ],
      diagram: {
        cols: 4,
        summary:
          "Intent enters a planner that decomposes it into a task graph. Specialised worker agents execute each task against live tools — a catalog API, an orders service, and supplier endpoints — rather than answering in prose. Every side-effecting action passes through a supervisor that gates it (approve, deny, or escalate to a human) before it touches the world. Tool results and new state flow back into the planner, so the loop reasons over what actually happened, not over its own prediction of what would happen.",
        nodes: [
          { id: "intent", label: "Intent", col: 0, row: 1 },
          { id: "planner", label: "Planner", col: 1, row: 1, accent: true },
          { id: "catalog", label: "Catalog agent", col: 2, row: 0 },
          { id: "orders", label: "Orders agent", col: 2, row: 1 },
          { id: "supplier", label: "Supplier agent", col: 2, row: 2 },
          { id: "supervisor", label: "Supervisor (gate)", col: 3, row: 1, accent: true },
        ],
        edges: [
          { from: "intent", to: "planner" },
          { from: "planner", to: "catalog", label: "task" },
          { from: "planner", to: "orders", label: "task" },
          { from: "planner", to: "supplier", label: "task" },
          { from: "catalog", to: "supervisor" },
          { from: "orders", to: "supervisor" },
          { from: "supplier", to: "supervisor" },
          { from: "supervisor", to: "planner", label: "result / state" },
        ],
      },
      decisions: [
        {
          title: "Multi-agent, not one big prompt.",
          body: "A single model holding the whole store in context drifts and can't be reasoned about. Specialised agents — one that owns the catalog, one that owns orders, one that talks to suppliers — keep each tool surface small and each agent's job auditable. The planner is the only part that sees the whole picture.",
        },
        {
          title: "A supervisor gates every side effect.",
          body: "The dangerous part of an action-taking agent isn't reasoning, it's the write. Every state-changing call routes through one supervisor that can approve, deny, or escalate to a human. Side effects are a single choke point, not scattered across agents — so the blast radius of a bad decision is bounded by design.",
        },
        {
          title: "The loop closes on real results.",
          body: "Tool results and updated state flow back into the planner before the next step. The agent reasons over what the world actually returned — a failed payment, an out-of-stock SKU — instead of its own forecast. That feedback edge is what separates this from a one-shot pipeline.",
        },
      ],
      outcome: [
        "The human stops being the per-decision bottleneck and becomes the approver of the calls that genuinely need judgement — the supervisor escalates those and auto-executes the rest.",
        "Because every write goes through one gate and every step reasons over real tool output, a wrong step surfaces as a denied or escalated action rather than a silent bad write to the store.",
      ],
      metrics: [
        // No fabricated numbers. Fill with real figures if available.
        { label: "Decisions auto-handled vs. escalated", value: null }, // TODO(human)
        { label: "Throughput vs. human-in-the-loop baseline", value: null }, // TODO(human)
      ],
    },
  },
  {
    id: "resume-analyzer",
    slug: "resume-analyzer",
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
      { label: "Read the case study", href: "/work/resume-analyzer", kind: "case" },
    ],
    detail: {
      thesis:
        "Resume feedback grounded in what a specific role actually screens for — structured, not a keyword score and not a vague LLM opinion. Live on Hugging Face Spaces.",
      status: {
        kind: "live",
        label: "Live on Hugging Face Spaces",
      },
      problemLong: [
        "Resume tools split into two failing camps. The keyword matchers count terms and miss meaning — they reward stuffing and punish anyone who phrased the same experience differently. The LLM-wrapper tools generate a confident paragraph of generic advice that would apply to any resume for any job.",
        "Neither answers the only question that matters: for this specific role, what would a screener actually look for, and does this resume show it? That requires grounding the read against the target role instead of scoring the document in a vacuum.",
      ],
      diagram: {
        cols: 4,
        summary:
          "The app takes two inputs — the resume and the target role. A parser extracts structured sections from the resume (experience, skills, education) rather than treating it as a bag of words. The role is expanded into the concrete signals a screener for that role looks for. An analyzer grounds the parsed resume against those role signals and emits structured, role-specific feedback — gaps, matches, and concrete edits — instead of a single opaque score. The whole thing runs as a deployed app on Hugging Face Spaces.",
        nodes: [
          { id: "resume", label: "Resume", col: 0, row: 0 },
          { id: "role", label: "Target role", col: 0, row: 2 },
          { id: "parser", label: "Parser", col: 1, row: 0 },
          { id: "signals", label: "Role signals", col: 1, row: 2 },
          { id: "analyzer", label: "Analyzer (grounded)", col: 2, row: 1, accent: true },
          { id: "feedback", label: "Structured feedback", col: 3, row: 1 },
        ],
        edges: [
          { from: "resume", to: "parser", label: "sections" },
          { from: "role", to: "signals", label: "expand" },
          { from: "parser", to: "analyzer" },
          { from: "signals", to: "analyzer" },
          { from: "analyzer", to: "feedback" },
        ],
      },
      decisions: [
        {
          title: "Ground against the role, don't score the document.",
          body: "A score in a vacuum is the keyword trick in a nicer wrapper. The role is expanded into the concrete signals a screener for it looks for, and the resume is read against those signals — so the feedback is specific to the job, not generic resume hygiene.",
        },
        {
          title: "Structured output, not a paragraph of advice.",
          body: "Free-text feedback reads well and changes nothing. The analyzer emits structured results — matched signals, missing ones, concrete edits — so the output is actionable and inspectable, not a confident blob you have to re-interpret.",
        },
        {
          title: "Ship it live, not as a demo video.",
          body: "It runs on Hugging Face Spaces because a working deployed app you can open is worth more than any screenshot or certificate. The deploy is the proof.",
        },
      ],
      outcome: [
        "You get role-specific feedback you can act on — which signals the resume actually shows for the target role and which it's missing — instead of a number or a generic critique.",
        "It's openable right now: a real AI app on Hugging Face Spaces, not a recording of one.",
      ],
      metrics: [
        { label: "Live on Hugging Face Spaces", value: "Yes" },
        { label: "Sample resumes evaluated", value: null }, // TODO(human)
      ],
    },
  },
  {
    id: "ministry-platform",
    slug: "ministry-platform",
    index: "03",
    title: "MD ministry AI platform",
    problem:
      "A government ministry needed answers grounded in its own documents and schemas, where the schema itself changes, so a hard-coded pipeline goes stale the moment the data model moves.",
    architecture:
      "A FastAPI service with retrieval-augmented generation over the ministry's corpus, built schema-dynamic: the retrieval and response layer adapts to the data model instead of assuming a fixed one. Production work, not a prototype.",
    stack: ["FastAPI", "RAG", "Schema-dynamic", "Production"],
    links: [
      // Government/client work — likely no public link. Keep honest.
      { label: "Read the case study", href: "/work/ministry-platform", kind: "case" },
      // TODO(human): a public link is likely NOT possible (gov/client work) — confirm. If not, this stays the only proof surface, which is honest.
    ],
    detail: {
      thesis:
        "Retrieval-augmented answers grounded in a government ministry's own documents — built schema-dynamic, so it survives a data model that keeps moving. Production work.",
      status: {
        kind: "private",
        label: "Production · client work — no public deploy",
      },
      problemLong: [
        "A ministry needed answers grounded in its own documents and structured data, not a generic model guessing. The obvious build is a fixed RAG pipeline: define the schema, wire the retrieval to it, ship. But the ministry's schema isn't fixed — the data model moves as their systems and records evolve.",
        "A hard-coded pipeline goes stale the moment a field is renamed or a table is restructured. Re-shipping the retrieval layer on every schema change isn't a maintenance cost, it's a guarantee the system is wrong between releases. The retrieval and response layer had to adapt to the schema instead of assuming one.",
      ],
      diagram: {
        cols: 4,
        summary:
          "A FastAPI service answers questions over the ministry's corpus. A query first hits a schema introspection step that reads the current data model — so the pipeline binds to the schema as it is now, not as it was at build time. Retrieval then runs against the corpus using that live schema, pulling grounded context. A generation step composes the answer strictly from the retrieved context. Because the schema layer is dynamic, a change to the ministry's data model flows through without re-coding the retrieval and response layers.",
        nodes: [
          { id: "query", label: "Query", col: 0, row: 1 },
          { id: "api", label: "FastAPI service", col: 1, row: 1 },
          { id: "schema", label: "Schema introspection", col: 1, row: 0, accent: true },
          { id: "retrieval", label: "Retrieval (RAG)", col: 2, row: 1 },
          { id: "corpus", label: "Ministry corpus", col: 2, row: 2 },
          { id: "answer", label: "Grounded answer", col: 3, row: 1, accent: true },
        ],
        edges: [
          { from: "query", to: "api" },
          { from: "schema", to: "api", label: "current model" },
          { from: "api", to: "retrieval" },
          { from: "corpus", to: "retrieval", label: "context" },
          { from: "retrieval", to: "answer", label: "grounded" },
        ],
      },
      decisions: [
        {
          title: "Schema-dynamic, not schema-hardcoded.",
          body: "The system introspects the current data model at query time and binds retrieval to it, instead of assuming a fixed schema. When the ministry restructures a table or renames a field, the pipeline follows the data model rather than going silently wrong until someone re-ships it.",
        },
        {
          title: "Answers grounded in the corpus, full stop.",
          body: "Generation composes its answer from retrieved ministry documents, not from the model's parametric memory. For a government context, an ungrounded confident answer is the failure mode — retrieval-first keeps the response tied to what the ministry actually holds.",
        },
        {
          title: "FastAPI as a production surface, not a notebook.",
          body: "It's a service with real endpoints, built to run in production, not a prototype that works once on a clean machine. The boring parts — a typed API boundary, predictable failure on empty retrieval — are the parts that make it deployable inside a ministry.",
        },
      ],
      outcome: [
        "The ministry gets answers grounded in its own corpus that stay correct as the underlying schema moves — no re-ship of the retrieval layer every time the data model changes.",
        "Shipped as production work inside a government context, where grounding and predictable behaviour matter more than a flashy demo.",
      ],
      metrics: [
        // Government/client work — metrics may be confidential. Never invent.
        { label: "Corpus size", value: null }, // TODO(human)
        { label: "Retrieval grounding / accuracy", value: null }, // TODO(human)
      ],
    },
  },
];

/** Lookup by slug for the case-study route. Returns undefined for unknown slugs. */
export function getWorkBySlug(slug: string): WorkItem | undefined {
  return WORK.find((w) => w.slug === slug);
}

/** Ordered prev/next neighbours for case-study footer nav (wraps at the ends? no — clamps). */
export function getWorkNeighbours(slug: string): {
  prev: WorkItem | null;
  next: WorkItem | null;
} {
  const i = WORK.findIndex((w) => w.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? WORK[i - 1] : null,
    next: i < WORK.length - 1 ? WORK[i + 1] : null,
  };
}
