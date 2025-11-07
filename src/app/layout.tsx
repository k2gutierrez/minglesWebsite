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

const vietnamItalic = localFont({
  src: '../../public/fonts/BeVietnamPro-Italic.ttf',
  variable: '--font-vietnamItalic'
})

const vietnamLight = localFont({
  src: '../../public/fonts/BeVietnamPro-Light.ttf',
  variable: '--font-vietnamLight'
})

const vietnamMedium = localFont({
  src: '../../public/fonts/BeVietnamPro-Medium.ttf',
  variable: '--font-vietnamMedium'
})

export const metadata: Metadata = {
  title: "Mingles",
  description: "Come mingle to the firs cripto tequila community!",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${pressura.variable} ${hogfish.variable} ${vietnamItalic.variable} ${vietnamLight.variable} ${vietnamMedium.variable} antialiased`}
      >
        <Providers>
          {props.children}
        </Providers>
      </body>
    </html>
  );
}
