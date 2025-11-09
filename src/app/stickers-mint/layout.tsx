import type { Metadata } from "next";
import Script from 'next/script'; // 1. Import the Next.js Script component
import Image from "next/image";

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
        <div className="relative">
          <Image
            src={"/MinglesJugandoFinal.png"}
            alt="Mingles Stickers"
            width={500}
            height={200}
            className="w-full md:h-48 object-cover object-center"
          />
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-9">
            <Image
              src={"/LogoNegro.png"}
              alt="Mingle Logo"
              width={70}
              height={70}
              className=""
            />
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}