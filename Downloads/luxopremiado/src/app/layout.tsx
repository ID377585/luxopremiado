import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";

import "./globals.css";

const headingFont = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Bigode das Rifas",
  description: "Bigode das Rifas — experiência premium, rápida e auditável.",
  icons: {
    icon: [
      {
        url: "/vercel.svg?v=20260312",
        type: "image/svg+xml",
      },
    ],
    shortcut: ["/vercel.svg?v=20260312"],
    apple: ["/vercel.svg?v=20260312"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>{children}</body>
    </html>
  );
}
