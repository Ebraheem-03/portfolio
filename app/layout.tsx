import type { Metadata, Viewport } from "next";
import { display, body } from "./fonts";
import { ReducedMotionProvider } from "@/lib/useReducedMotion";
import { SmoothScroll } from "@/lib/SmoothScroll";
import "./globals.css";

// Production origin for absolute OG/canonical URLs. Set NEXT_PUBLIC_SITE_URL in
// the Vercel project (e.g. https://ebraheemgillani.com); falls back to localhost
// for dev so metadataBase is always a valid absolute URL. See docs/DEPLOY.md.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ebraheem Gillani · AI Engineer",
    template: "%s · Ebraheem Gillani",
  },
  description:
    "I build agents that take actions, not chatbots that answer questions. Selected work, shipped.",
  authors: [{ name: "Ebraheem Gillani" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ebraheem Gillani · AI Engineer",
    description:
      "I build agents that take actions, not chatbots that answer questions.",
    type: "website",
    url: "/",
    siteName: "Ebraheem Gillani",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ebraheem Gillani · AI Engineer",
    description:
      "I build agents that take actions, not chatbots that answer questions.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <ReducedMotionProvider>
          <SmoothScroll>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            {children}
          </SmoothScroll>
        </ReducedMotionProvider>
      </body>
    </html>
  );
}
