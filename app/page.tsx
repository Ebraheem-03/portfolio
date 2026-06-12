import { Wordmark } from "@/components/Wordmark";
import { SiteHeader } from "@/components/SiteHeader";
import { WorkCard } from "@/components/WorkCard";
import { ContactForm } from "@/components/ContactForm";
import { SocialLinks } from "@/components/SocialLinks";
import { HeroExperience } from "@/components/HeroExperience";
import { WORK } from "@/lib/work";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* ====================================================================
            HERO — static content frame. NO WebGL yet (Phase 3, helios).
            The single full-bleed <canvas> mounts into `.stage` at --z-canvas,
            BEHIND this white HTML overlay (--z-ui). The static state must
            already read like the bar; the canvas only deepens it.
            =================================================================== */}
        <section className={styles.hero} aria-labelledby="hero-headline">
          {/*
            >>> PHASE 3 CANVAS MOUNT SLOT <<<
            helios: mount the full-bleed R3F <canvas> as a child of this div.
            It is positioned: absolute; inset: 0; z-index: var(--z-canvas).
            The radial accent below is the STATIC FALLBACK (also the
            reduced-motion / no-WebGL poster) — replace or layer over it.
          */}
          <div className={styles.stage} data-canvas-mount aria-hidden="true">
            <HeroExperience />
          </div>

          <div className={styles.heroInner}>
            <p className={styles.heroMark}>Ebraheem Gillani · AI Engineer</p>
            <h1 id="hero-headline" className={`display ${styles.heroHeadline}`}>
              I build agents that take actions, not chatbots that answer
              questions.
            </h1>
            <p className={styles.heroSub}>
              Multi-agent architecture, real tool use, shipped. The work is
              below; each one a problem, an architecture, and the deployed thing
              you can open.
            </p>
          </div>

          <a
            href="#work"
            className={styles.scrollCue}
            aria-label="Scroll to selected work"
          >
            <span className={styles.scrollCueLabel}>Selected work</span>
            <span className={styles.scrollCueLine} aria-hidden="true" />
          </a>
        </section>

        {/* ====================================================================
            SELECTED WORK — three case-study containers, proof-first.
            =================================================================== */}
        <section
          id="work"
          className={styles.section}
          aria-labelledby="work-title"
        >
          <div className={styles.sectionInner}>
            <header className={styles.sectionHead}>
              <p className={styles.chapterMark}>Selected work</p>
              <h2 id="work-title" className={`display ${styles.sectionTitle}`}>
                Things I shipped that do something.
              </h2>
              <p className={styles.sectionLede}>
                Three systems. Each one starts with a real problem, shows the
                architecture, and ends at the deployed thing. No demos that only
                work on the happy path.
              </p>
            </header>

            <div className={styles.workGrid}>
              {WORK.map((item) => (
                <WorkCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            ABOUT — concise, proof-first, dry. Never asserts seniority.
            =================================================================== */}
        <section
          id="about"
          className={styles.section}
          aria-labelledby="about-title"
        >
          <div className={styles.sectionInner}>
            <div className={styles.aboutLayout}>
              <header className={styles.sectionHead}>
                <p className={styles.chapterMark}>About</p>
                <h2
                  id="about-title"
                  className={`display ${styles.sectionTitle}`}
                >
                  The work argues for itself.
                </h2>
              </header>

              <div className={styles.aboutBody}>
                <p className={styles.aboutLead}>
                  I&apos;m an AI engineer. I build systems where a model
                  doesn&apos;t just answer: it plans, calls tools, and changes
                  something in the world, then reasons over what came back.
                </p>
                <p className={styles.aboutText}>
                  Early career, and I won&apos;t pretend otherwise. Instead of a
                  title, here&apos;s the record: a multi-agent commerce platform
                  that takes real actions, an AI app running live on Hugging
                  Face Spaces, and a production RAG platform for a government
                  ministry built to survive a schema that keeps moving.
                </p>
                <p className={styles.aboutText}>
                  I care about the parts that don&apos;t demo well: what happens
                  when a tool call fails, when retrieval returns nothing, when
                  the agent picks the wrong step. That&apos;s where shipped and
                  almost-shipped diverge.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            CONTACT — one form, two framings (hiring / project). UI only;
            the endpoint is Phase 6.
            =================================================================== */}
        <section
          id="contact"
          className={styles.section}
          aria-labelledby="contact-title"
        >
          <div className={styles.sectionInner}>
            <div className={styles.contactLayout}>
              <header className={styles.sectionHead}>
                <p className={styles.chapterMark}>Contact</p>
                <h2
                  id="contact-title"
                  className={`display ${styles.sectionTitle}`}
                >
                  Hiring, or got a project?
                </h2>
                <p className={styles.sectionLede}>
                  Same inbox, different framing. Pick one, and I&apos;ll know how
                  to read your message.
                </p>
              </header>

              <ContactForm />

              <div className={styles.contactSocial}>
                <p className={styles.chapterMark}>Or find me here</p>
                <SocialLinks />
              </div>
            </div>
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
