import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rifas | Bigode das Rifas",
  description:
    "Campanhas com números, compra rápida, progresso em tempo real e total transparência.",
};

const raffles = [
  {
    slug: "rifa-iphone-15-pro-max",
    title: "iPhone 15 Pro Max 256GB",
    subtitle: "Tecnologia premium com resultado auditável e compra em segundos.",
    pricePerNumber: "R$ 0,79",
    drawDate: "Sorteio em 29/03 às 20h",
    soldPercent: 76,
    availableNumbers: 2400,
    totalNumbers: 10000,
    participants: 1837,
    badge: "Mais procurada",
  },
  {
    slug: "rifa-honda-cg-160",
    title: "Honda CG 160 Start 0km",
    subtitle: "Campanha de alto giro com muita demanda e números acessíveis.",
    pricePerNumber: "R$ 1,49",
    drawDate: "Sorteio em 02/04 às 19h",
    soldPercent: 58,
    availableNumbers: 4200,
    totalNumbers: 10000,
    participants: 1106,
    badge: "Em destaque",
  },
  {
    slug: "rifa-ps5-slim",
    title: "PlayStation 5 Slim + 2 jogos",
    subtitle: "Entrada rápida, excelente conversão e alto apelo de público.",
    pricePerNumber: "R$ 0,59",
    drawDate: "Sorteio em 05/04 às 21h",
    soldPercent: 89,
    availableNumbers: 980,
    totalNumbers: 9000,
    participants: 2641,
    badge: "Últimas cotas",
  },
];

const steps = [
  {
    title: "Escolha sua campanha",
    description:
      "Navegue pelas rifas ativas, compare prêmios, valor por número e percentual vendido.",
  },
  {
    title: "Selecione seus números",
    description:
      "Compre de forma rápida, com fluxo simples, objetivo e pronto para conversão.",
  },
  {
    title: "Acompanhe em tempo real",
    description:
      "Veja progresso, disponibilidade, participantes e informações da campanha com transparência.",
  },
];

const trustItems = [
  "Progresso em tempo real",
  "Números disponíveis atualizados",
  "Campanhas separadas por modalidade",
  "Fluxo focado em compra rápida",
];

export default function RifasPage() {
  return (
    <main style={{ background: "#0b0b0f", color: "#fff", minHeight: "100vh" }}>
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "56px 24px 28px",
        }}
      >
        <p
          style={{
            color: "#d4af37",
            fontWeight: 700,
            letterSpacing: 1.2,
            margin: 0,
          }}
        >
          MODALIDADE
        </p>

        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            lineHeight: 1.05,
            margin: "12px 0 16px",
          }}
        >
          Rifas com compra rápida, progresso visível e confiança em cada etapa.
        </h1>

        <p
          style={{
            maxWidth: 760,
            color: "rgba(255,255,255,0.78)",
            fontSize: 18,
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Esta página foi pensada para concentrar campanhas com números, destacar
          o prêmio, acelerar a conversão e mostrar com clareza tudo o que importa:
          disponibilidade, andamento da campanha e transparência operacional.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 24,
          }}
        >
          <Link
            href={`/rifas/${raffles[0].slug}`}
            style={{
              background: "#d4af37",
              color: "#111",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Entrar na rifa em destaque
          </Link>

          <a
            href="#lista-rifas"
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Ver campanhas
          </a>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 28px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>
              Rifas ativas
            </p>
            <strong style={{ display: "block", fontSize: 28, marginTop: 8 }}>
              {raffles.length}
            </strong>
          </article>

          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>
              Participantes nas campanhas
            </p>
            <strong style={{ display: "block", fontSize: 28, marginTop: 8 }}>
              5.584+
            </strong>
          </article>

          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>
              Compra rápida
            </p>
            <strong style={{ display: "block", fontSize: 28, marginTop: 8 }}>
              Fluxo direto
            </strong>
          </article>

          <article
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(255,255,255,0.04))",
              border: "1px solid rgba(212,175,55,0.24)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.78)" }}>
              Transparência
            </p>
            <strong style={{ display: "block", fontSize: 28, marginTop: 8 }}>
              Em tempo real
            </strong>
          </article>
        </div>
      </section>

      <section
        id="lista-rifas"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "8px 24px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "end",
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div>
            <p style={{ color: "#d4af37", fontWeight: 700, marginBottom: 8 }}>
              CAMPANHAS DISPONÍVEIS
            </p>
            <h2 style={{ fontSize: 32, margin: 0 }}>Escolha sua próxima rifa</h2>
          </div>

          <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>
            Visual organizado para maximizar entendimento e conversão.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {raffles.map((raffle) => (
            <article
              key={raffle.slug}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 24,
                padding: 24,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(212,175,55,0.16)",
                  border: "1px solid rgba(212,175,55,0.22)",
                  color: "#f2d67a",
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 14,
                }}
              >
                {raffle.badge}
              </div>

              <h3 style={{ margin: "0 0 8px", fontSize: 28 }}>{raffle.title}</h3>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.6,
                }}
              >
                {raffle.subtitle}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.68)" }}>
                    Valor por número
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {raffle.pricePerNumber}
                  </strong>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.68)" }}>
                    Participantes
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {raffle.participants.toLocaleString("pt-BR")}
                  </strong>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    color: "rgba(255,255,255,0.82)",
                    fontSize: 14,
                  }}
                >
                  <span>Progresso da campanha</span>
                  <span>{raffle.soldPercent}% vendido</span>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: 10,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${raffle.soldPercent}%`,
                      height: "100%",
                      background: "#d4af37",
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>

              <p style={{ color: "rgba(255,255,255,0.72)", marginBottom: 6 }}>
                {raffle.availableNumbers.toLocaleString("pt-BR")} números
                disponíveis de {raffle.totalNumbers.toLocaleString("pt-BR")}
              </p>
              <p style={{ color: "#fff", marginTop: 0 }}>{raffle.drawDate}</p>

              <Link
                href={`/rifas/${raffle.slug}`}
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  background: "#fff",
                  color: "#111",
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: 12,
                  fontWeight: 700,
                }}
              >
                Ver campanha
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "12px 24px 28px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(212,175,55,0.12))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: 24,
          }}
        >
          <p style={{ color: "#d4af37", fontWeight: 700, margin: "0 0 8px" }}>
            COMO FUNCIONA
          </p>
          <h2 style={{ fontSize: 30, margin: "0 0 20px" }}>
            Fluxo claro para o usuário comprar com confiança
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 18,
            }}
          >
            {steps.map((step, index) => (
              <article
                key={step.title}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 18,
                  padding: 20,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#d4af37",
                    color: "#111",
                    fontWeight: 800,
                    marginBottom: 12,
                  }}
                >
                  {index + 1}
                </span>
                <h3 style={{ marginTop: 0 }}>{step.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 72px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 20,
          }}
        >
          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 22,
              padding: 24,
            }}
          >
            <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
              TRANSPARÊNCIA
            </p>
            <h2 style={{ fontSize: 28, marginTop: 0 }}>
              Elementos que aumentam a confiança do participante
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
              A página de rifas precisa comunicar segurança visual e clareza
              operacional. Por isso, o foco aqui está em dados objetivos,
              disponibilidade, andamento da campanha e acesso rápido ao detalhe da
              rifa.
            </p>
          </article>

          <article
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.16), rgba(255,255,255,0.04))",
              border: "1px solid rgba(212,175,55,0.24)",
              borderRadius: 22,
              padding: 24,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Destaques da página</h3>
            <ul
              style={{
                paddingLeft: 18,
                marginBottom: 0,
                lineHeight: 1.9,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {trustItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}