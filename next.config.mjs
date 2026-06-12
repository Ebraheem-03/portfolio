import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root: a stray lockfile in $HOME makes Next 16 (Turbopack)
  // mis-infer the root. This anchors it to the project dir and silences the warning.
  turbopack: {
    root: __dirname,
  },
  // The ingestion tool under scripts/ is a separate isolated package; keep it
  // out of the Next.js build trace. (Graduated from `experimental` to top-level
  // in Next 15+.)
  outputFileTracingExcludes: {
    "*": ["./scripts/**/*"],
  },

  // Baseline security headers — safe, host-portable (Vercel honors these). A
  // strict Content-Security-Policy is intentionally NOT set here: it needs a
  // per-request nonce to avoid breaking Next's inline bootstrap + the R3F
  // worker/canvas pipeline. Tracked as a hardening follow-up in docs/DEPLOY.md.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
