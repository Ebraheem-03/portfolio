import type { Metadata, Viewport } from "next";
import { display, body } from "./fonts";
import { ReducedMotionProvider } from "@/lib/useReducedMotion";
import { SmoothScroll } from "@/lib/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ebraheem Gillani · AI Engineer",
  description:
    "I build agents that take actions, not chatbots that answer questions. Selected work, shipped.",
  authors: [{ name: "Ebraheem Gillani" }],
  openGraph: {
    title: "Ebraheem Gillani · AI Engineer",
    description:
      "I build agents that take actions, not chatbots that answer questions.",
    type: "website",
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
