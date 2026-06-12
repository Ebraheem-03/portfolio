import type { MetadataRoute } from "next";
import { WORK } from "@/lib/work";

// Production origin (matches metadataBase in app/layout.tsx). See docs/DEPLOY.md.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const home: MetadataRoute.Sitemap[number] = {
    url: siteUrl,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 1,
  };

  const caseStudies: MetadataRoute.Sitemap = WORK.map((w) => ({
    url: `${siteUrl}/work/${w.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [home, ...caseStudies];
}
