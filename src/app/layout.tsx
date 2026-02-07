import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Molt Alpha Tracker"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={cinzel.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
