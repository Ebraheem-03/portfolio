import { Wordmark } from "@/components/Wordmark";
import { SiteHeader } from "@/components/SiteHeader";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* HERO — placeholder stage. NO WebGL yet (Phase 3). Black void, the
            wordmark, one declarative ALL-CAPS line in the BRAND voice. The
            canvas will mount behind this at --z-canvas; this block is --z-ui. */}
        <section className={styles.hero} aria-labelledby="hero-headline">
          {/* Where the single full-bleed <canvas> mounts in Phase 3. */}
          <div className={styles.stage} aria-hidden="true" />

          <div className={styles.heroInner}>
            <p className={styles.heroMark}>Ebraheem Gillani</p>
            <h1 id="hero-headline" className={`display ${styles.heroHeadline}`}>
              I build agents that take actions, not chatbots that answer
              questions.
            </h1>
            <p className={styles.heroSub}>
              AI engineer. I ship agentic systems: multi-agent architecture,
              real tool use, deployed and working.
            </p>
          </div>

          <a href="#work" className={styles.scrollCue} aria-label="Scroll to selected work">
            <span className={styles.scrollCueLabel}>Selected work</span>
            <span className={styles.scrollCueLine} aria-hidden="true" />
          </a>
        </section>

        {/* SECTION STUBS — frames for Phase 2 content. Intentionally sparse. */}
        <section id="work" className={styles.section} aria-labelledby="work-title">
          <div className={styles.sectionInner}>
            <p className={styles.chapterMark}>Selected work</p>
            <h2 id="work-title" className={`display ${styles.sectionTitle}`}>
              Things I shipped that do something.
            </h2>
            <p className={styles.sectionLede}>
              Three systems, each one a problem, an architecture, and the
              deployed thing you can use. Phase 2 fills this in.
            </p>
          </div>
        </section>

        <section id="about" className={styles.section} aria-labelledby="about-title">
          <div className={styles.sectionInner}>
            <p className={styles.chapterMark}>About</p>
            <h2 id="about-title" className={`display ${styles.sectionTitle}`}>
              Early career. The work argues for itself.
            </h2>
            <p className={styles.sectionLede}>
              I don&apos;t claim seniority. I put the architecture next to the
              live link and let you decide.
            </p>
          </div>
        </section>

        <section id="contact" className={styles.section} aria-labelledby="contact-title">
          <div className={styles.sectionInner}>
            <p className={styles.chapterMark}>Contact</p>
            <h2 id="contact-title" className={`display ${styles.sectionTitle}`}>
              Hiring, or got a project?
            </h2>
            <p className={styles.sectionLede}>
              Same inbox, different framing. The form lands in Phase 2.
            </p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Wordmark variant="footer" />
        <p className={styles.footerNote}>
          Built in the open. © {new Date().getFullYear()} Ebraheem Gillani.
        </p>
      </footer>
    </>
  );
}
