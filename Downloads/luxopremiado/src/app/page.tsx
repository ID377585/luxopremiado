import type { Metadata } from "next";
import Link from "next/link";
import CountdownCard from "@/components/CountdownCard";
import TrustStrip from "@/components/TrustStrip";
import QuickAccessBar from "@/components/QuickAccessBar";

export const metadata: Metadata = {
  title: "Bigode das Rifas | Rifas, sorteios e leilões com PIX imediato",
  description:
    "Escolha seus números, participe de rifas, sorteios e leilões com experiência premium, campanhas fortes e pagamento rápido no PIX.",
};

const categorias = [
  {
    title: "Rifas em alta",
    description:
      "Campanhas com entrada rápida, tickets acessíveis e prêmios que chamam atenção logo no primeiro clique.",
    href: "/rifas",
    cta: "Explorar rifas",
  },
  {
    title: "Sorteios promocionais",
    description:
      "Ofertas diretas, prêmios desejados e regras claras para facilitar a decisão de participação.",
    href: "/sorteios",
    cta: "Ver sorteios",
  },
  {
    title: "Leilões premium",
    description:
      "Lotes que geram desejo, disputa e retenção para quem gosta de acompanhar e entrar na hora certa.",
    href: "/leiloes",
    cta: "Abrir leilões",
  },
];

const premios = [
  {
    title: "Moto 0km",
    badge: "Mais desejado",
    description:
      "Um dos prêmios com maior apelo popular e excelente capacidade de chamar clique na home.",
  },
  {
    title: "iPhone Pro Max",
    badge: "Alta conversão",
    description:
      "Prêmio de giro rápido, ótimo para campanhas que precisam performar bem no celular.",
  },
  {
    title: "PIX de R$ 10.000",
    badge: "Decisão rápida",
    description:
      "Oferta direta, simples de entender e muito forte para quem quer entrar sem enrolação.",
  },
  {
    title: 'PlayStation 5 + TV 55"',
    badge: "Combo premium",
    description:
      "Campanha com alto valor percebido e ótimo potencial para aumentar permanência na página.",
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
        chooseHref="/r/bigode-das-rifas#premio"
        userHref="/r/bigode-das-rifas#painel"
        vipHref="/vip"
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
            Escolha sua campanha agora e entre no fluxo certo sem perder tempo.
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
            A home precisa vender, mas também precisa levar o usuário para o que
            realmente importa: escolher números, entrar na área do usuário,
            acompanhar campanhas e comprar sem atrito.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 24,
            }}
          >
            <Link
              href="/r/bigode-das-rifas#premio"
              style={{
                background: "linear-gradient(135deg, #f7d978 0%, #d4a63a 100%)",
                color: "#111",
                textDecoration: "none",
                padding: "15px 22px",
                borderRadius: 16,
                fontWeight: 900,
                boxShadow: "0 14px 30px rgba(0,0,0,0.24)",
              }}
            >
              ESCOLHER NÚMEROS AGORA
            </Link>

            <Link
              href="/r/bigode-das-rifas#painel"
              style={{
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff",
                textDecoration: "none",
                padding: "15px 22px",
                borderRadius: 16,
                fontWeight: 800,
                background: "rgba(255,255,255,0.04)",
              }}
            >
              ABRIR ÁREA DO USUÁRIO
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
              Moto 0km + bônus em PIX
            </h2>
            <p
              style={{
                margin: "0 0 18px",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.7,
              }}
            >
              Oferta forte para puxar clique, mas agora com acesso direto ao
              fluxo real de compra.
            </p>

            <div style={{ display: "grid", gap: 12 }}>
              {[
                ["Valor por número", "R$ 1,99"],
                ["Prêmio bônus", "PIX de R$ 5.000"],
                ["Modalidade", "Rifa em alta"],
                ["Status", "Entrada acelerada"],
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
              href="/r/bigode-das-rifas#premio"
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
              ESCOLHER NÚMEROS
            </Link>
          </aside>

          <CountdownCard
            title="Oferta quente da semana"
            timeLeft="02h 14m 39s"
            subtitle="Não deixe a home virar um beco sem saída: leve o usuário para compra e painel com 1 clique."
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
          <article
            key={item.title}
            style={{
              background:
                "linear-gradient(180deg, rgba(10,20,64,0.94), rgba(5,16,52,0.94))",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 28 }}>{item.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
              {item.description}
            </p>
            <Link
              href={item.href}
              style={{
                display: "inline-block",
                marginTop: 10,
                color: "#f2d067",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
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
              PRÊMIOS QUE CHAMAM CLIQUE
            </p>
            <h2 style={{ margin: "8px 0 0", fontSize: 34 }}>
              Campanhas com valor percebido mais forte
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
            <article
              key={item.title}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 24,
                padding: 22,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "7px 11px",
                  borderRadius: 999,
                  background: "rgba(242,208,103,0.12)",
                  border: "1px solid rgba(242,208,103,0.24)",
                  color: "#f2d067",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {item.badge}
              </span>
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