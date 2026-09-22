import type { Metadata } from "next";
import { SiteProvider } from "@/components/provider";
import { PointerSignal } from "@/components/effects";
import { Header, Footer } from "@/components/shell";
import { loadContent } from "@/lib/load-content";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/barlow-condensed/900.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Mingles — A little weird. A lot of spirit.",
    template: "%s | Mingles",
  },
  description:
    "Collectible identity. Real-world tequila. Onchain experiments. Follow the next chapter of Mingles.",
  robots: { index: false, follow: false },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { content, mode } = await loadContent();
  return (
    <html lang="en">
      <body id="top">
        <SiteProvider initial={content} mode={mode}>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <PointerSignal />
          {children}
          <Footer />
        </SiteProvider>
      </body>
    </html>
  );
}
