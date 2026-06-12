# ADR-0003: Hosting

- Status: proposed
- Date: <fill>

## Context
Mostly-static site + one serverless contact endpoint; want zero-config previews and a fast CDN.

## Decision
Deploy on Vercel (or Netlify). Serverless function for the contact form.

## Consequences
- (+) Preview deploys per PR pair well with the feature -> dev -> main flow.
- (+) Edge CDN helps LCP, which matters on a WebGL-heavy site.
