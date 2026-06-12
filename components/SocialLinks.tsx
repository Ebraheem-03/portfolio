import styles from "./SocialLinks.module.css";

/**
 * Social / direct links for the contact section. URLs are the CONFIRMED handles
 * from BRAND.md › Identity (2026-06-12). Email is the project owner's address.
 * Nothing here is a guess; the only gap is the contact email, flagged below.
 */

const LINKS: { label: string; href: string; hint: string }[] = [
  {
    label: "GitHub",
    href: "https://github.com/Ebraheem-03",
    hint: "Code, in the open",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ebraheemgillani/",
    hint: "The professional record",
  },
  {
    // TODO(human): confirm the public contact email to expose here. Using the
    // project owner's known address as a sensible default — swap if it should
    // differ from the form destination.
    label: "Email",
    href: "mailto:ebraheemgillani1@gmail.com",
    hint: "Straight to the inbox",
  },
];

export function SocialLinks() {
  return (
    <ul className={styles.list} aria-label="Find me elsewhere">
      {LINKS.map((link) => {
        const external = link.href.startsWith("http");
        return (
          <li key={link.label}>
            <a
              href={link.href}
              className={styles.link}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
            >
              <span className={styles.label}>{link.label}</span>
              <span className={styles.hint}>{link.hint}</span>
              <span className={styles.arrow} aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
