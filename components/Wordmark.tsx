import styles from "./Wordmark.module.css";

type WordmarkVariant = "header" | "footer";

/**
 * Primary brand mark — the EG monogram (brand direction 02, locked 2026-06-11).
 *
 * The geometry is the real Anton "EG" converted to vector PATHS (not live text),
 * so it renders identically with no font load and is immune to the font subset.
 * The two glyphs use `currentColor` (white in nav/footer); the connector node +
 * line use `--accent` — the agent-graph node-and-connector motif at glyph scale.
 *
 * - `header`  : interactive link to home, monogram only (compact nav mark).
 * - `footer`  : non-interactive mark + the full name spelled out in copy.
 *
 * The same paths drive the favicon (see app/icon.svg) so the tab carries the brand.
 */

/** The monogram artwork. `decorative` hides it from AT when a sibling text label
 *  already names the brand (footer); otherwise it carries the accessible name. */
function MonogramMark({ decorative = false }: { decorative?: boolean }) {
  return (
    <svg
      className={styles.mark}
      viewBox="0 0 240 240"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Ebraheem Gillani"}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
    >
      {/* EG — vector outlines from Anton, inherit text color */}
      <path
        className={styles.glyphPath}
        d="M59.28 156.00V24.00H112.08V49.50H86.13V75.23H111.03V100.05H86.13V130.28H113.81V156.00Z"
      />
      <path
        className={styles.glyphPath}
        d="M143.59 157.20Q115.32 157.20 115.32 116.70V59.78Q115.32 22.80 147.72 22.80Q161.07 22.80 168.19 28.16Q175.32 33.53 178.02 43.80Q180.72 54.08 180.72 68.85H154.92V57.15Q154.92 52.88 153.75 49.99Q152.59 47.10 148.92 47.10Q144.34 47.10 142.88 50.18Q141.42 53.25 141.42 56.92V120.90Q141.42 126.22 142.80 129.56Q144.19 132.90 148.24 132.90Q152.44 132.90 153.83 129.56Q155.22 126.22 155.22 120.75V101.93H148.17V79.12H180.42V156.00H169.84L165.34 144.90Q158.44 157.20 143.59 157.20Z"
      />
      {/* node + connector — the one accent. Agent-graph motif at glyph scale. */}
      <line
        className={styles.connector}
        x1="150"
        y1="183"
        x2="184"
        y2="183"
      />
      <circle className={styles.node} cx="184" cy="183" r="7" />
    </svg>
  );
}

export function Wordmark({ variant = "header" }: { variant?: WordmarkVariant }) {
  if (variant === "footer") {
    // Non-interactive mark + the full name spelled out (the mark is decorative
    // here because the visible text already names the brand).
    return (
      <div className={`${styles.wordmark} ${styles.footer}`}>
        <MonogramMark decorative />
        <span className={styles.full}>Ebraheem Gillani</span>
      </div>
    );
  }

  return (
    <a href="/" className={styles.wordmark} aria-label="Ebraheem Gillani — home">
      <MonogramMark />
    </a>
  );
}
