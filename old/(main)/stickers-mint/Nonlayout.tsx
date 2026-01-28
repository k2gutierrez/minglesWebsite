'use client'
import { ReactNode } from "react";

// export const metadata: Metadata = {
//   title: "Mingles tequila Sticker at TON",
//   description: "Mint your Mingles Tequila Stickers!",
// };

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* 2. Add the TGS Player script here */}
      <body className=""> {/* 3. Set your white background here */}
        {props.children}
      </body>
    </html>
  );
}