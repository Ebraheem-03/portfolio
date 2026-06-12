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
};

export default nextConfig;
