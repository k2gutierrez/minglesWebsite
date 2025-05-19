import type { Metadata } from "next";
import { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

/*const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});*/

export const metadata: Metadata = {
  title: "Mingles",
  description: "Come mingle to the firs cripto tequila community!",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body /*className={`${geistSans.variable} ${geistMono.variable} antialiased`}*/
      >
        <Providers>
          {props.children}
        </Providers>
      </body>
    </html>
  );
}
