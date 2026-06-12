import type { WorkItem } from "@/lib/work";
import styles from "./WorkCard.module.css";

/**
 * One selected-work entry, structured proof-first: problem → architecture →
 * the deployed thing. NOT a generic icon-heading-text card — the structure
 * carries the argument. The live link (or its marked-TODO absence) is the payoff.
 *
 * These are containers; the full interactive case studies land in Phase 5.
 */
export function WorkCard({ item }: { item: WorkItem }) {
  const titleId = `work-${item.id}-title`;

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <header className={styles.head}>
        <span className={styles.index} aria-hidden="true">
          {item.index}
        </span>
        <h3 id={titleId} className={`display ${styles.title}`}>
          {item.title}
        </h3>
      </header>

      <div className={styles.body}>
        <div className={styles.field}>
          <p className={styles.fieldLabel}>Problem</p>
          <p className={styles.problem}>{item.problem}</p>
        </div>

        <div className={styles.field}>
          <p className={styles.fieldLabel}>Architecture</p>
          <p className={styles.architecture}>{item.architecture}</p>
        </div>

        <ul className={styles.stack} aria-label="Stack">
          {item.stack.map((s) => (
            <li key={s} className={styles.chip}>
              {s}
            </li>
          ))}
        </ul>
      </div>

      <footer className={styles.links}>
        {item.links.map((link) =>
          link.href ? (
            <a
              key={link.label}
              href={link.href}
              className={styles.link}
              target={link.kind === "case" ? undefined : "_blank"}
              rel={link.kind === "case" ? undefined : "noopener noreferrer"}
            >
              {link.kind === "live" && (
                <span className={styles.liveMark} aria-hidden="true" />
              )}
              <span>{link.label}</span>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </a>
          ) : (
            // Honest placeholder: the proof slot exists but the real link is a
            // TODO(human). Not a dead <a>; a clearly-marked "soon" state so we
            // never ship a link to nowhere or a fabricated URL.
            <span
              key={link.label}
              className={styles.linkPending}
              aria-disabled="true"
            >
              {link.kind === "live" && (
                <span className={styles.liveMark} aria-hidden="true" />
              )}
              <span>{link.label}</span>
              <span className={styles.pendingTag}>soon</span>
            </span>
          )
        )}
      </footer>
    </article>
  );
}
