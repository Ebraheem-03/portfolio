import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";
import { ArchitectureDiagram } from "@/components/work/ArchitectureDiagram";
import {
  WORK,
  getWorkBySlug,
  getWorkNeighbours,
  type WorkItem,
  type WorkLink,
  type WorkStatus,
  type Metric,
} from "@/lib/work";
import styles from "./page.module.css";

// All three case studies are static — prerender every slug.
export async function generateStaticParams() {
  return WORK.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getWorkBySlug(slug);
  if (!item) return {}; // unknown slug → the page calls notFound()

  const title = `${item.title} · Ebraheem Gillani`;
  const description = item.detail.thesis;

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
  };
}

// --- Hero proof line, driven by detail.status (never a fabricated link) ------
function StatusMark({ status }: { status: WorkStatus }) {
  if (status.kind === "live") {
    return (
      <p className={styles.status}>
        <span className={styles.liveMark} aria-hidden="true" />
        <span>{status.label}</span>
      </p>
    );
  }
  // private / pending render honestly — a dim tick, no fake live dot, no link.
  return (
    <p className={`${styles.status} ${styles.statusQuiet}`}>
      <span className={styles.quietMark} aria-hidden="true" />
      <span>{status.label}</span>
    </p>
  );
}

// --- A single proof link. A null href is a marked, non-interactive gap. ------
function ProofLink({ link }: { link: WorkLink }) {
  if (link.href) {
    const external = link.kind !== "case";
    return (
      <a
        href={link.href}
        className={styles.proofLink}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {link.kind === "live" ? (
          <span className={styles.liveMark} aria-hidden="true" />
        ) : null}
        <span>{link.label}</span>
        <span className={styles.proofArrow} aria-hidden="true">
          →
        </span>
      </a>
    );
  }
  // No real URL yet. An honest marked gap — never an invented link or dead <a>.
  return (
    <span className={styles.proofGap}>
      {link.kind === "live" ? (
        <span className={styles.liveMark} aria-hidden="true" />
      ) : null}
      <span>{link.label}</span>
      <span className={styles.gapTag}>TODO(human)</span>
    </span>
  );
}

// --- A metric. A null value is a marked gap, never a fabricated number. ------
function MetricRow({ metric }: { metric: Metric }) {
  return (
    <div className={styles.metric}>
      <dt className={styles.metricLabel}>{metric.label}</dt>
      <dd className={styles.metricValue}>
        {metric.value !== null ? (
          metric.value
        ) : (
          <span className={styles.gapTag}>TODO(human)</span>
        )}
      </dd>
    </div>
  );
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item: WorkItem | undefined = getWorkBySlug(slug);
  if (!item) notFound();

  const { detail } = item;
  const { prev, next } = getWorkNeighbours(slug);

  const headingId = `case-${item.id}-title`;
  const diagramTitleId = `case-${item.id}-diagram-title`;
  const diagramDescId = `case-${item.id}-diagram-desc`;

  return (
    <main id="main" className={styles.page}>
      {/* Lightweight local header — back-to-work + the monogram home link.
          The case study lives outside the one-page scroll, so it carries its
          own minimal chrome rather than the home SiteHeader. */}
      <div className={styles.topbar}>
        <Wordmark variant="header" />
        <a href="/#work" className={styles.backTop}>
          <span aria-hidden="true">←</span>
          <span>Selected work</span>
        </a>
      </div>

      <article className={styles.article} aria-labelledby={headingId}>
        {/* ============================================================= HERO */}
        <header className={styles.hero}>
          <p className={styles.index} aria-hidden="true">
            {item.index}
          </p>
          <h1 id={headingId} className={`display ${styles.title}`}>
            {item.title}
          </h1>
          <p className={styles.thesis}>{detail.thesis}</p>

          <StatusMark status={detail.status} />

          <div className={styles.proofLinks}>
            {item.links.map((link) => (
              <ProofLink key={link.label} link={link} />
            ))}
          </div>
        </header>

        {/* ========================================================== PROBLEM */}
        <section className={styles.section} aria-labelledby={`${item.id}-problem`}>
          <div className={styles.sectionGrid}>
            <h2 id={`${item.id}-problem`} className={styles.sectionLabel}>
              Problem
            </h2>
            <div className={styles.prose}>
              {detail.problemLong.map((p, i) => (
                <p key={i} className={styles.proseP}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================== ARCHITECTURE */}
        <section
          className={styles.section}
          aria-labelledby={`${item.id}-architecture`}
        >
          <div className={styles.sectionGrid}>
            <h2 id={`${item.id}-architecture`} className={styles.sectionLabel}>
              Architecture
            </h2>
            <div className={styles.prose}>
              <figure className={styles.figure}>
                <div className={styles.diagramFrame}>
                  <ArchitectureDiagram
                    architecture={detail.diagram}
                    titleId={diagramTitleId}
                    descId={diagramDescId}
                  />
                </div>
                {/* The summary ships as real visible prose — the diagram never
                    carries meaning this caption doesn't. */}
                <figcaption className={styles.figcaption}>
                  {detail.diagram.summary}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ======================================================== DECISIONS */}
        <section
          className={styles.section}
          aria-labelledby={`${item.id}-decisions`}
        >
          <div className={styles.sectionGrid}>
            <h2 id={`${item.id}-decisions`} className={styles.sectionLabel}>
              Decisions
            </h2>
            <ol className={styles.decisions}>
              {detail.decisions.map((d, i) => (
                <li key={i} className={styles.decision}>
                  <h3 className={styles.decisionTitle}>{d.title}</h3>
                  <p className={styles.decisionBody}>{d.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ========================================================== OUTCOME */}
        <section className={styles.section} aria-labelledby={`${item.id}-outcome`}>
          <div className={styles.sectionGrid}>
            <h2 id={`${item.id}-outcome`} className={styles.sectionLabel}>
              Outcome
            </h2>
            <div className={styles.prose}>
              {detail.outcome.map((p, i) => (
                <p key={i} className={styles.proseP}>
                  {p}
                </p>
              ))}

              {detail.metrics && detail.metrics.length > 0 ? (
                <dl className={styles.metrics}>
                  {detail.metrics.map((m) => (
                    <MetricRow key={m.label} metric={m} />
                  ))}
                </dl>
              ) : null}
            </div>
          </div>
        </section>
      </article>

      {/* ====================================================== FOOTER NAV */}
      <nav className={styles.footerNav} aria-label="More case studies">
        {prev ? (
          <a href={`/work/${prev.slug}`} className={styles.navItem}>
            <span className={styles.navDir}>
              <span aria-hidden="true">←</span> Previous
            </span>
            <span className={styles.navTitle}>{prev.title}</span>
          </a>
        ) : (
          <span className={`${styles.navItem} ${styles.navItemEmpty}`} aria-hidden="true" />
        )}

        <a href="/#work" className={styles.navBack}>
          All work
        </a>

        {next ? (
          <a href={`/work/${next.slug}`} className={`${styles.navItem} ${styles.navItemNext}`}>
            <span className={styles.navDir}>
              Next <span aria-hidden="true">→</span>
            </span>
            <span className={styles.navTitle}>{next.title}</span>
          </a>
        ) : (
          <span className={`${styles.navItem} ${styles.navItemEmpty}`} aria-hidden="true" />
        )}
      </nav>

      <footer className={styles.footer}>
        <Wordmark variant="footer" />
        <p className={styles.footerNote}>
          Built in the open. © {new Date().getFullYear()} Ebraheem Gillani.
        </p>
      </footer>
    </main>
  );
}
