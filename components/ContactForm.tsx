"use client";

import { useId, useState } from "react";
import styles from "./ContactForm.module.css";

/**
 * Contact form — UI/structure only. The serverless endpoint is Phase 6; submit
 * is a clearly-marked no-op for now.
 *
 * One form, two framings (BRAND.md › Audience): a "hiring" vs "got a project"
 * fork that only changes the copy/intent, never the fields or the destination.
 * Same inbox, different framing — explicitly NOT two pages.
 *
 * Accessibility: every field has a real <label>, required state is announced,
 * the intent fork is a radiogroup, and the post-submit state is an aria-live
 * region so it's announced without a focus jump.
 */

type Intent = "hiring" | "project";

const FRAMING: Record<Intent, { lead: string; messageHint: string }> = {
  hiring: {
    lead: "You're hiring. Tell me what you're building and where I'd fit.",
    messageHint: "The role, the team, and what the first hard problem looks like.",
  },
  project: {
    lead: "You've got a project. Tell me what needs to exist that doesn't yet.",
    messageHint: "What you're trying to build, the constraints, and a rough timeline.",
  },
};

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [intent, setIntent] = useState<Intent>("hiring");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const messageHintId = useId();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
      intent: fd.get("intent"),
      company: fd.get("company"), // honeypot
    };

    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && json?.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
        setError(json?.error || "Something went wrong. Try the direct links below.");
      }
    } catch {
      setStatus("error");
      setError("Network error. Try the direct links below.");
    }
  }

  return (
    <div className={styles.wrap}>
      {/* Framing fork — same form, different intent. */}
      <fieldset className={styles.fork}>
        <legend className={styles.forkLegend}>I'm reaching out because…</legend>
        <div className={styles.forkOptions} role="radiogroup" aria-label="Reason for contact">
          {(["hiring", "project"] as Intent[]).map((value) => (
            <label
              key={value}
              className={`${styles.forkOption} ${intent === value ? styles.forkOptionActive : ""}`}
            >
              <input
                type="radio"
                name="intent"
                value={value}
                checked={intent === value}
                onChange={() => setIntent(value)}
                className={styles.forkInput}
              />
              <span>{value === "hiring" ? "I'm hiring" : "I've got a project"}</span>
            </label>
          ))}
        </div>
        <p className={styles.forkLead} aria-live="polite">
          {FRAMING[intent].lead}
        </p>
      </fieldset>

      {status === "sent" ? (
        <div className={styles.done} role="status" aria-live="polite">
          <p className={`display ${styles.doneTitle}`}>Sent.</p>
          <p className={styles.doneBody}>
            {intent === "hiring"
              ? "Got it. I'll reply from my inbox — usually within a day."
              : "Got the brief. I'll come back with questions, not a sales pitch."}
          </p>
          <button
            type="button"
            className={styles.reset}
            onClick={() => setStatus("idle")}
          >
            Send another
          </button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Honeypot — visually hidden, off the tab order; bots fill it, humans don't. */}
          <div aria-hidden="true" className={styles.honeypot}>
            <label htmlFor="company-website">Company (leave blank)</label>
            <input
              id="company-website"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor={nameId} className={styles.label}>
                Name
              </label>
              <input
                id={nameId}
                name="name"
                type="text"
                autoComplete="name"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor={emailId} className={styles.label}>
                Email
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor={messageId} className={styles.label}>
              Message
            </label>
            <textarea
              id={messageId}
              name="message"
              rows={5}
              required
              aria-describedby={messageHintId}
              placeholder={FRAMING[intent].messageHint}
              className={styles.textarea}
            />
            <p id={messageHintId} className={styles.hint}>
              {FRAMING[intent].messageHint}
            </p>
          </div>

          <button type="submit" className={styles.submit} disabled={status === "sending"}>
            {status === "sending"
              ? "Sending…"
              : intent === "hiring"
                ? "Send the role"
                : "Send the brief"}
            <span className={styles.submitArrow} aria-hidden="true">
              →
            </span>
          </button>

          <p className={styles.error} role="alert" aria-live="assertive">
            {status === "error" ? error : ""}
          </p>
        </form>
      )}
    </div>
  );
}
