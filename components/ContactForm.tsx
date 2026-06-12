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

export function ContactForm() {
  const [intent, setIntent] = useState<Intent>("hiring");
  const [submitted, setSubmitted] = useState(false);

  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const messageHintId = useId();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO(human / Phase 6): POST to the serverless contact endpoint.
    // Intentionally a no-op stub — no network, no fake success toast that
    // implies a message was sent. We only reflect that the form was completed.
    setSubmitted(true);
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

      {submitted ? (
        <div className={styles.done} role="status" aria-live="polite">
          <p className={`display ${styles.doneTitle}`}>Almost.</p>
          <p className={styles.doneBody}>
            The form works; the inbox behind it lands in the next build phase.
            Until then, reach me directly on the links below.
          </p>
          <button
            type="button"
            className={styles.reset}
            onClick={() => setSubmitted(false)}
          >
            Edit your message
          </button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
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

          <button type="submit" className={styles.submit}>
            {intent === "hiring" ? "Send the role" : "Send the brief"}
            <span className={styles.submitArrow} aria-hidden="true">
              →
            </span>
          </button>
        </form>
      )}
    </div>
  );
}
