import type { Metadata } from "next";
import { ReactNode } from "react";
import "../globals.css";

export const metadata: Metadata = {
  title: "Mingles",
  description: "Come mingle to the firs cripto tequila community!",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
      >

          {props.children}

      </body>
    </html>
  );
}
