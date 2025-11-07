import type { Metadata } from "next";
import Script from 'next/script'; // 1. Import the Next.js Script component

export const metadata: Metadata = {
  title: "Mingles tequila Sticker at TON",
  description: "Mint your Mingles Tequila Stickers!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 2. Add the TGS Player script here */}
      <Script 
        src="https://telegram.org/js/tgs-player.js" 
        strategy="beforeInteractive" 
      />
      <body className="bg-white"> {/* 3. Set your white background here */}
            {children}
      </body>
    </html>
  );
}