import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Bigode das Rifas",
  description: "Plataforma premium de rifas, sorteios e leilões",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        {/* HEADER GLOBAL */}
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
            }}
          >
            {/* LOGO */}
            <Link
              href="/"
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

            {/* MENU */}
            <nav
              style={{
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              <Link href="/rifas" style={linkStyle}>
                Rifas
              </Link>
              <Link href="/sorteios" style={linkStyle}>
                Sorteios
              </Link>
              <Link href="/leiloes" style={linkStyle}>
                Leilões
              </Link>
              <Link href="/vip" style={linkStyle}>
                VIP
              </Link>
            </nav>
          </div>
        </header>

        {/* CONTEÚDO DAS PÁGINAS */}
        {children}
      </body>
    </html>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: 600,
  padding: "6px 10px",
  borderRadius: 8,
  transition: "0.2s",
};