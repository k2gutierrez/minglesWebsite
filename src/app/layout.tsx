import type { Metadata } from "next";
import { ReactNode } from "react";
import { Providers } from "./providers";
import localFont from 'next/font/local';
import "./globals.css";

/*const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});*/

const pressura = localFont({ 
  src: '../../public/fonts/GT-Pressura-Mono.otf',
  variable: '--font-pressura',
})
const hogfish = localFont({ 
  src: '../../public/fonts/Hogfish DEMO.otf',
  variable: '--font-hogfish'
})

export const metadata: Metadata = {
  title: "Mingles",
  description: "Come mingle to the firs cripto tequila community!",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${pressura.variable} ${hogfish.variable} antialiased`}
      >
        <Providers>
          {props.children}
        </Providers>
      </body>
    </html>
  );
}
