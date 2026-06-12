import { NextResponse } from "next/server";

/**
 * Contact endpoint (Phase 6, main thread). Serverless POST handler that delivers
 * the contact form via Resend's HTTP API — no SDK dependency, just fetch, to keep
 * the bundle lean. Reads secrets from env (never committed):
 *   RESEND_API_KEY      — required; from the Resend dashboard.
 *   CONTACT_TO_EMAIL    — where messages land (defaults to the public brand email).
 *   CONTACT_FROM_EMAIL  — a Resend-verified sender (defaults to onboarding@resend.dev
 *                         for first-run testing; swap to your verified domain).
 * See .env.example.
 */

export const runtime = "nodejs";

type Intent = "hiring" | "project";

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "ebraheemgillani1@gmail.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clamp = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return badRequest("Malformed request.");
  }

  // Honeypot: real users never fill `company`. Bots do — pretend success, send nothing.
  if (clamp(data.company, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = clamp(data.name, 120);
  const email = clamp(data.email, 200);
  const message = clamp(data.message, 5000);
  const intent: Intent = data.intent === "project" ? "project" : "hiring";

  if (!name) return badRequest("Name is required.");
  if (!EMAIL_RE.test(email)) return badRequest("A valid email is required.");
  if (message.length < 10) return badRequest("Message is too short.");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Misconfiguration, not the user's fault — don't imply the message was sent.
    console.error("contact: RESEND_API_KEY is not set");
    return NextResponse.json(
      { ok: false, error: "The inbox isn't configured yet. Use the direct links below." },
      { status: 503 },
    );
  }

  const subject =
    intent === "hiring"
      ? `Hiring inquiry from ${name}`
      : `Project inquiry from ${name}`;

  const text = [
    `Intent: ${intent}`,
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    message,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject,
        text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("contact: resend error", res.status, detail.slice(0, 500));
      return NextResponse.json(
        { ok: false, error: "Couldn't send right now. Try the direct links below." },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("contact: fetch failed", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't send right now. Try the direct links below." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
