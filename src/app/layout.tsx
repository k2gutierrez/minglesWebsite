import type { Metadata } from "next";
import { ReactNode } from "react";
import localFont from 'next/font/local';
import "./globals.css";
import { Providers } from "./providers";

const pressura = localFont({ 
  src: '../../public/fonts/GT-Pressura-Mono.otf',
  variable: '--font-pressura',
})
const hogfish = localFont({ 
  src: '../../public/fonts/Hogfish DEMO.otf',
  variable: '--font-hogfish'
})

export const metadata: Metadata = {
  title: "Mingles | Make new friends. Keep life fun.",
  description: "A social club built around tequila culture, games, and shared experiences.",
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
