import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bigode das Rifas",
  description: "Plataforma de rifas, sorteios e leilões premium",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          backgroundImage: "url('/bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        {/* Overlay escuro pra dar contraste */}
        <div
          style={{
            background: "rgba(3, 10, 40, 0.85)",
            minHeight: "100vh",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}