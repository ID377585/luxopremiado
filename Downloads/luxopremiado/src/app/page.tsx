import type { Metadata } from "next";
import Link from "next/link";
import CountdownCard from "@/components/CountdownCard";
import TrustStrip from "@/components/TrustStrip";
import QuickAccessBar from "@/components/QuickAccessBar";

export const metadata: Metadata = {
  title: "Bigode das Rifas | Rifas com PIX imediato",
  description:
    "Escolha seus números, participe das campanhas e finalize sua compra com rapidez, clareza e transparência.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bigode das Rifas | Rifas com PIX imediato",
    description:
      "Escolha seus números, participe das campanhas e finalize sua compra com rapidez, clareza e transparência.",
    url: "/",
  },
};

const categorias = [
  {
    title: "Rifas em destaque",
    description:
      "Campanhas com entrada rápida, prêmios desejados e compra simples no PIX.",
    href: "/rifas",
    cta: "Ver rifas",
  },
  {
    title: "Área do participante",
    description:
      "Acompanhe seus pedidos, pagamentos e confirmações em um só lugar.",
    href: "/login",
    cta: "Entrar agora",
  },
  {
    title: "Campanha principal",
    description:
      "Acesse a página oficial da campanha com detalhes do prêmio, pacotes e transparência.",
    href: "/r/bigode-das-rifas",
    cta: "Abrir campanha",
  },
];

const premios = [
  {
    title: "SHINERAY FREE 150",
    badge: "Prêmio principal",
    description:
      "Campanha principal com apelo popular e forte potencial de conversão.",
  },
  {
    title: "iPhone 17 Pro Max 256 GB",
    badge: "Prêmio bônus",
    description:
      "Bônus premium para reforçar valor percebido e aumentar atratividade.",
  },
  {
    title: "R$ 500,00 em PIX",
    badge: "Bônus extra",
    description:
      "Recompensa direta para ampliar desejo e acelerar decisão de compra.",
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(28,42,120,0.28), transparent 30%), linear-gradient(180deg, #04112f 0%, #071632 100%)",
        color: "#fff",
        paddingBottom: 110,
      }}
    >
      <QuickAccessBar
        chooseHref="/r/bigode-das-rifas#pacotes"
        userHref="/login"
        vipHref="/r/bigode-das-rifas#transparencia"
      />

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "40px 24px 34px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#f2d067",
              fontWeight: 900,
              letterSpacing: 1.2,
            }}
          >
            BIGODE DAS RIFAS
          </p>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 4.8rem)",
              lineHeight: 1.03,
              margin: "12px 0 18px",
              maxWidth: 780,
            }}
          >
            Escolha seus números e participe da campanha oficial agora.
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 760,
              color: "rgba(255,255,255,0.82)",
              fontSize: 18,
              lineHeight: 1.75,
            }}
          >
            Compra rápida, confirmação transparente e acesso direto à campanha
            principal sem desvio desnecessário.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 24,
            }}
          >
            <Link href="/r/bigode-das-rifas#pacotes" style={primaryButtonStyle}>
              ESCOLHER NÚMEROS AGORA
            </Link>

            <Link href="/login" style={secondaryButtonStyle}>
              ENTRAR NA ÁREA DO USUÁRIO
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <aside
            style={{
              background:
                "linear-gradient(180deg, rgba(12,24,70,0.96), rgba(5,15,45,0.96))",
              border: "1px solid rgba(242,208,103,0.22)",
              borderRadius: 28,
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.24)",
            }}
          >
            <p style={{ marginTop: 0, color: "#f2d067", fontWeight: 800 }}>
              CAMPANHA EM DESTAQUE
            </p>

            <h2 style={{ fontSize: 32, margin: "0 0 14px" }}>
              SHINERAY FREE 150 + bônus
            </h2>

            <p
              style={{
                margin: "0 0 18px",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.7,
              }}
            >
              Página principal pronta para conversão com pacotes, transparência
              e CTA direto para compra.
            </p>

            <div style={{ display: "grid", gap: 12 }}>
              {[
                ["Valor por número", "R$ 1,60"],
                ["Prêmio bônus 1", "iPhone 17 Pro Max 256 GB"],
                ["Prêmio bônus 2", "R$ 500,00 em PIX"],
                ["Sorteio", "30/04/2026 às 19:00"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 18,
                    padding: 14,
                  }}
                >
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.62)" }}>
                    {label}
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {value}
                  </strong>
                </div>
              ))}
            </div>

            <Link
              href="/r/bigode-das-rifas"
              style={{
                display: "block",
                marginTop: 18,
                textAlign: "center",
                textDecoration: "none",
                background: "#fff",
                color: "#111",
                borderRadius: 16,
                padding: "14px 18px",
                fontWeight: 900,
              }}
            >
              ABRIR CAMPANHA
            </Link>
          </aside>

          <CountdownCard
            title="Encerramento da campanha"
            targetDateIso="2026-04-30T19:00:00-03:00"
            subtitle="Acompanhe o tempo restante até o fechamento oficial da campanha."
          />
        </div>
      </section>

      <TrustStrip />

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
        }}
      >
        {categorias.map((item) => (
          <article key={item.title} style={infoCardStyle}>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>{item.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
              {item.description}
            </p>
            <Link href={item.href} style={inlineLinkStyle}>
              {item.cta}
            </Link>
          </article>
        ))}
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px 72px",
        }}
      >
        <div
          style={{
            marginBottom: 18,
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "end",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ margin: 0, color: "#f2d067", fontWeight: 900 }}>
              DESTAQUES DA CAMPANHA
            </p>
            <h2 style={{ margin: "8px 0 0", fontSize: 34 }}>
              Prêmios com forte apelo de participação
            </h2>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          {premios.map((item) => (
            <article key={item.title} style={prizeCardStyle}>
              <span style={badgeStyle}>{item.badge}</span>
              <h3 style={{ margin: "14px 0 10px", fontSize: 26 }}>
                {item.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.7,
                }}
              >
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #f7d978 0%, #d4a63a 100%)",
  color: "#111",
  textDecoration: "none",
  padding: "15px 22px",
  borderRadius: 16,
  fontWeight: 900,
  boxShadow: "0 14px 30px rgba(0,0,0,0.24)",
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff",
  textDecoration: "none",
  padding: "15px 22px",
  borderRadius: 16,
  fontWeight: 800,
  background: "rgba(255,255,255,0.04)",
};

const infoCardStyle: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(10,20,64,0.94), rgba(5,16,52,0.94))",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 24,
};

const prizeCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 22,
};

const inlineLinkStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 10,
  color: "#f2d067",
  textDecoration: "none",
  fontWeight: 800,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "7px 11px",
  borderRadius: 999,
  background: "rgba(242,208,103,0.12)",
  border: "1px solid rgba(242,208,103,0.24)",
  color: "#f2d067",
  fontWeight: 800,
  fontSize: 13,
};