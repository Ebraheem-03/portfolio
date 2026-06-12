"use client";

import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./Wordmark";
import styles from "./SiteHeader.module.css";

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

/**
 * Primary site header. Floats on the black stage / canvas (no background fill).
 *
 * Desktop: inline nav, accent underline on hover/focus.
 * Mobile (< --bp-md): a disclosure menu. The toggle is a real <button> with
 * aria-expanded / aria-controls; the panel is a labelled region. Escape and
 * outside-click close it; focus returns to the toggle. The nav links exist in
 * the DOM at every breakpoint (CSS handles layout), so there's no JS-gated
 * content — the menu still works with the panel open if JS is slow.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape (return focus to the toggle) and on outside click.
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    function onPointer(e: PointerEvent) {
      const t = e.target as Node;
      if (
        !panelRef.current?.contains(t) &&
        !toggleRef.current?.contains(t)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header className={styles.header}>
      <Wordmark variant="header" />

      {/* Desktop nav — always in the DOM, hidden on mobile via CSS. */}
      <nav className={styles.navDesktop} aria-label="Primary">
        <ul className={styles.navList}>
          {NAV.map((item) => (
            <li key={item.href}>
              <a href={item.href} className={styles.navLink}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile disclosure — toggle + panel, shown only < --bp-md via CSS. */}
      <div className={styles.mobile}>
        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`${styles.toggleGlyph} ${open ? styles.toggleGlyphOpen : ""}`}
            aria-hidden="true"
          >
            <span />
            <span />
          </span>
          <span className={styles.toggleLabel}>{open ? "Close" : "Menu"}</span>
        </button>

        <div
          ref={panelRef}
          id="mobile-nav"
          className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
          hidden={!open}
        >
          <nav aria-label="Primary">
            <ul className={styles.panelList}>
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={styles.panelLink}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
