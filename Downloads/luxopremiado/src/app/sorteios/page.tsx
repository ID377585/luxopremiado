import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sorteios | Bigode das Rifas",
  description:
    "Campanhas promocionais separadas com foco em regulamento, prêmio e participação.",
};

const sorteios = [
  {
    slug: "sorteio-1000-no-pix",
    titulo: "R$ 1.000 no Pix",
    premio: "Prêmio instantâneo em dinheiro",
    descricao:
      "Campanha promocional simples e de forte adesão, com comunicação direta e foco no regulamento.",
    participacao: "Participação rápida",
    status: "Aberto",
  },
  {
    slug: "sorteio-viagem-nordeste",
    titulo: "Viagem para o Nordeste",
    premio: "Experiência premium",
    descricao:
      "Sorteio aspiracional com alto valor percebido e excelente potencial de engajamento.",
    participacao: "Cadastro + elegibilidade",
    status: "Em destaque",
  },
];

const destaques = [
  {
    titulo: "Regulamento visível",
    descricao:
      "Cada campanha precisa explicar regras, prazo, critérios e forma de apuração.",
  },
  {
    titulo: "Prêmio valorizado",
    descricao:
      "O usuário precisa entender rapidamente o valor do que está sendo sorteado.",
  },
  {
    titulo: "Participação simples",
    descricao:
      "Fluxo claro para reduzir atrito e facilitar o engajamento com a campanha.",
  },
];

export default function SorteiosPage() {
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
          MODALIDADE
        </p>

        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            lineHeight: 1.05,
            margin: "12px 0 16px",
          }}
        >
          Sorteios promocionais com foco em prêmio, regulamento e participação
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
          Esta página reúne os sorteios promocionais da plataforma em um espaço
          separado das rifas e leilões, deixando a comunicação mais clara e a
          experiência muito mais objetiva para o usuário.
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
            href="/sorteios/sorteio-1000-no-pix"
            style={{
              background: "#f2d067",
              color: "#111",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 14,
              fontWeight: 800,
            }}
          >
            Ver sorteio em destaque
          </Link>

          <a
            href="#lista-sorteios"
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 14,
              fontWeight: 700,
            }}
          >
            Ver campanhas
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
        {destaques.map((item) => (
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
        id="lista-sorteios"
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
              SORTEIOS DISPONÍVEIS
            </p>
            <h2 style={{ fontSize: 34, margin: 0 }}>
              Campanhas promocionais separadas por modalidade
            </h2>
          </div>

          <p style={{ margin: 0, color: "rgba(255,255,255,0.72)" }}>
            Mais clareza para o usuário e melhor leitura da oferta.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {sorteios.map((sorteio) => (
            <article
              key={sorteio.slug}
              style={{
                background: "rgba(0,0,0,0.16)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 24,
                padding: 24,
                boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
              }}
            >
              <h3 style={{ margin: "0 0 10px", fontSize: 28 }}>
                {sorteio.titulo}
              </h3>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.65,
                }}
              >
                {sorteio.descricao}
              </p>

              <div
                style={{
                  display: "grid",
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
                    Prêmio
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {sorteio.premio}
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
                    Participação
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {sorteio.participacao}
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
                    {sorteio.status}
                  </strong>
                </div>
              </div>

              <Link
                href={`/sorteios/${sorteio.slug}`}
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
                Abrir campanha
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}