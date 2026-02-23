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
  title: "Luxo Premiado",
  description:
    "Plataforma de sorteios premium com compra de números, pagamento online e transparência auditável.",
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
