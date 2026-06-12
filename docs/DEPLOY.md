# DEPLOY.md — Phase 8 (Vercel)

The deploy runbook. Everything the codebase can do is done; the items marked
**[human]** need your account/credentials and can't be scripted from here.

## What's already wired (committed)
- **`next.config.mjs`** — baseline security headers (X-Content-Type-Options,
  X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, HSTS). Host-portable;
  Vercel serves them as-is.
- **`app/layout.tsx`** — `metadataBase` + title template + OpenGraph/Twitter, all
  driven by `NEXT_PUBLIC_SITE_URL` so OG/canonical URLs are absolute in prod.
- **`app/robots.ts` + `app/sitemap.ts`** — generated from the real routes
  (home + the three `/work/[slug]` case studies). Served at `/robots.txt` and
  `/sitemap.xml`.
- **`vercel.json`** — framework pinned to `nextjs`.
- **`.nvmrc` = 20** + `engines.node >= 20.9.0` — pins the build runtime.
- **`.env.example`** — every env var, documented.

## Environment variables — set these in the Vercel project
Project → Settings → Environment Variables. Add to **Production** (and Preview if
you want previews to send mail):

| Variable | Required | Value |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | Your production origin, no trailing slash — e.g. `https://ebraheemgillani.com`. Drives metadata/robots/sitemap. **[human]** |
| `RESEND_API_KEY` | yes (for contact form) | From resend.com → API Keys. Without it the form returns a truthful 503, never a fake success. **[human]** |
| `CONTACT_TO_EMAIL` | optional | Where messages land. Defaults to `ebraheemgillani1@gmail.com` in code. |
| `CONTACT_FROM_EMAIL` | optional | Verified Resend sender. `onboarding@resend.dev` works for first-run testing; swap to a verified domain before launch. **[human]** |

## Deploy steps
1. **[human]** Push `main` to GitHub (already there) and import the repo at
   vercel.com → New Project. Vercel auto-detects Next.js; framework/build come
   from `vercel.json`. Build command `next build`, output `.next`.
2. **[human]** Add the env vars above (at minimum `NEXT_PUBLIC_SITE_URL` and
   `RESEND_API_KEY`) to Production.
3. Production branch = `main` (Vercel default). `dev` gets preview deploys.
4. **[human]** Deploy. First build should be clean — verified locally:
   `tsc --noEmit` clean, `next build` SSG-prerenders `/` and all three
   `/work/[slug]` routes; `/api/contact` is a Node serverless function.

## Domain — [human]
1. Buy/own the domain; in Vercel → Project → Settings → Domains, add it.
2. Point DNS per Vercel's instructions (A/ALIAS or nameservers).
3. Set `NEXT_PUBLIC_SITE_URL` to the final `https://` domain and redeploy so
   metadata/robots/sitemap emit the right absolute URLs.
4. **Identity consistency (plan req):** the domain + wordmark + handle should
   line up with GitHub `Ebraheem-03` and LinkedIn
   `https://www.linkedin.com/in/ebraheemgillani/`.

## Post-deploy smoke test
- [ ] `/` renders; WebGL hero loads on desktop, static poster on no-WebGL/mobile.
- [ ] All three `/work/<slug>` pages return 200; `/work/nonsense` → 404.
- [ ] `/robots.txt` and `/sitemap.xml` show the production origin (not localhost).
- [ ] View-source: OG/Twitter tags carry absolute `https://` URLs.
- [ ] Contact form: real send with `RESEND_API_KEY` set → 200 + email arrives;
      a malformed submit → 400; honeypot field filled → silent 200, no email.
- [ ] Response headers include the security headers from `next.config.mjs`.
- [ ] Lighthouse on the live URL (mobile): LCP < 2.5s. This is the real-device
      pass that couldn't run in the sandbox — owed here.

## Hardening follow-ups (not blockers)
- **Content-Security-Policy** — deliberately omitted; needs a per-request nonce
  to avoid breaking Next's inline bootstrap + the R3F worker/canvas. Add via
  middleware with a nonce when there's time.
- **OG image** — no `opengraph-image` yet; social shares fall back to text. A
  branded OG card (iris) is a recommended pre-launch polish item.

## Still owed by you (content TODO(human), tracked in `lib/work.ts`)
- Real Hugging Face Spaces URL for the Resume Analyzer (currently a marked gap).
- Any confirmable metrics / public links for the e-commerce + ministry work.
- Confirm the public-facing contact email.
