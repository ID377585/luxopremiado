import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rifas | Bigode das Rifas",
  description:
    "Participe das rifas do Bigode das Rifas com compra rápida, transparência e campanhas em destaque.",
};

const rifas = [
  {
    slug: "bigode-das-rifas",
    titulo: "Shineray Free 150",
    descricao:
      "Campanha principal com números acessíveis, atualização em tempo real e forte apelo de conversão.",
    preco: "A partir de R$ 0,10",
    status: "Números acabando",
    destaque: "Campanha principal",
  },
  {
    slug: "iphone-17-pro-max",
    titulo: "iPhone 17 Pro Max 256 GB – Laranja cósmico – eSIM",
    descricao:
      "Prêmio premium com alta procura, ótima percepção de valor e excelente potencial de giro.",
    preco: "A partir de R$ 0,20",
    status: "Em destaque",
    destaque: "Alta demanda",
  },
  {
    slug: "500-reais",
    titulo: "500,00 Reais",
    descricao:
      "Campanha de entrada rápida com forte atratividade e excelente conversão para novos participantes.",
    preco: "A partir de R$ 0,05",
    status: "Últimas vagas",
    destaque: "Acesso rápido",
  },
];

const beneficios = [
  {
    titulo: "Compra rápida",
    descricao:
      "Fluxo simples para o usuário escolher números e avançar sem fricção.",
  },
  {
    titulo: "Transparência em tempo real",
    descricao:
      "Atualização contínua de números disponíveis, reservados e vendidos.",
  },
  {
    titulo: "Campanhas de alto apelo",
    descricao:
      "Prêmios com forte percepção de valor e capacidade de engajamento.",
  },
];

export default function RifasPage() {
  return (
    <main style={{ background: "#082c8c", color: "#fff", minHeight: "100vh" }}>
      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "56px 24px 28px",
        }}
      >
        <p
          style={{
            color: "#f2d067",
            fontWeight: 800,
            letterSpacing: 1.2,
            margin: 0,
          }}
        >
          BIGODE DAS RIFAS
        </p>

        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4.2rem)",
            lineHeight: 1.05,
            margin: "12px 0 16px",
          }}
        >
          Rifas com compra rápida, transparência e campanhas em destaque
        </h1>

        <p
          style={{
            maxWidth: 820,
            color: "rgba(255,255,255,0.82)",
            fontSize: 18,
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Escolha sua campanha, acompanhe os números em tempo real e participe
          com segurança. Esta página foi criada para concentrar as rifas em um
          ambiente mais claro, direto e focado em conversão.
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
            href="/rifas/bigode-das-rifas"
            style={{
              background: "#f2d067",
              color: "#111",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 14,
              fontWeight: 800,
            }}
          >
            Entrar na campanha principal
          </Link>

          <a
            href="#lista-rifas"
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 14,
              fontWeight: 700,
            }}
          >
            Ver todas as rifas
          </a>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 18,
        }}
      >
        {beneficios.map((item) => (
          <article
            key={item.titulo}
            style={{
              background: "rgba(0,0,0,0.16)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 22,
              padding: 24,
              boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 26 }}>{item.titulo}</h2>
            <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.65 }}>
              {item.descricao}
            </p>
          </article>
        ))}
      </section>

      <section
        id="lista-rifas"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "8px 24px 72px",
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
            <p style={{ color: "#f2d067", fontWeight: 800, marginBottom: 8 }}>
              RIFAS DISPONÍVEIS
            </p>
            <h2 style={{ fontSize: 34, margin: 0 }}>
              Campanhas prontas para participação
            </h2>
          </div>

          <p style={{ margin: 0, color: "rgba(255,255,255,0.72)" }}>
            Páginas separadas para melhorar a experiência de navegação.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {rifas.map((rifa) => (
            <article
              key={rifa.slug}
              style={{
                background: "rgba(0,0,0,0.16)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 24,
                padding: 24,
                boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(242,208,103,0.14)",
                  border: "1px solid rgba(242,208,103,0.28)",
                  color: "#f2d067",
                  fontSize: 13,
                  fontWeight: 800,
                  marginBottom: 14,
                }}
              >
                {rifa.destaque}
              </div>

              <h3 style={{ margin: "0 0 10px", fontSize: 28 }}>{rifa.titulo}</h3>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.65,
                }}
              >
                {rifa.descricao}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    background: "rgba(0,0,0,0.18)",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.64)" }}>
                    Preço
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {rifa.preco}
                  </strong>
                </div>

                <div
                  style={{
                    background: "rgba(0,0,0,0.18)",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.64)" }}>
                    Status
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {rifa.status}
                  </strong>
                </div>
              </div>

              <Link
                href={`/rifas/${rifa.slug}`}
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  background: "#fff",
                  color: "#111",
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: 12,
                  fontWeight: 800,
                }}
              >
                Ver campanha
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}