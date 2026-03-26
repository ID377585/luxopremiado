import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

import { getSiteUrl } from "@/lib/env";

const SITE_URL = getSiteUrl();

const DEFAULT_LANDING = "/r/bigode-das-rifas";
const DEFAULT_OG_IMAGE = "/images/og/bigode-das-rifas-og.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bigode das Rifas",
    template: "%s | Bigode das Rifas",
  },
  description:
    "Escolha seus números, pague no PIX e acompanhe tudo com transparência. Compra rápida, confirmação automática e sorteio auditável.",
  openGraph: {
    title: "Bigode das Rifas",
    description:
      "Escolha seus números, pague no PIX e acompanhe tudo com transparência. Compra rápida, confirmação automática e sorteio auditável.",
    url: SITE_URL,
    siteName: "Bigode das Rifas",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Bigode das Rifas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bigode das Rifas",
    description:
      "Escolha seus números, pague no PIX e acompanhe tudo com transparência. Compra rápida, confirmação automática e sorteio auditável.",
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          background: "#071632",
          color: "#ffffff",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 999,
            background: "rgba(4,13,44,0.85)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(242,208,103,0.15)",
          }}
        >
          <div
            style={{
              maxWidth: 1240,
              margin: "0 auto",
              padding: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <Link
              href={DEFAULT_LANDING}
              style={{
                color: "#f2d067",
                fontWeight: 900,
                fontSize: 18,
                textDecoration: "none",
                letterSpacing: 1,
              }}
            >
              BIGODE DAS RIFAS
            </Link>

            <nav
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <Link href={`${DEFAULT_LANDING}#premio`} style={linkStyle}>
                Prêmio
              </Link>
              <Link href={`${DEFAULT_LANDING}#pacotes`} style={linkStyle}>
                Pacotes
              </Link>
              <Link href={`${DEFAULT_LANDING}#vencedores`} style={linkStyle}>
                Vencedores
              </Link>
              <Link href={`${DEFAULT_LANDING}#transparencia`} style={linkStyle}>
                Transparência
              </Link>
              <Link href="/login" style={linkStyle}>
                Área do usuário
              </Link>
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: 700,
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
};