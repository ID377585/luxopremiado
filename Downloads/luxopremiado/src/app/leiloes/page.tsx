import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Leilões | Bigode das Rifas",
  description:
    "Lotes premium com disputa ao vivo, histórico de lances e experiência de leilão separada das demais modalidades.",
};

const leiloes = [
  {
    slug: "leilao-carro-0km",
    titulo: "Carro 0km",
    descricao:
      "Lote premium com grande apelo de mercado, leitura clara do valor e forte potencial de disputa.",
    lanceAtual: "R$ 48.500",
    status: "Ao vivo",
    observadores: "312 pessoas acompanhando",
  },
  {
    slug: "leilao-moto-esportiva",
    titulo: "Moto esportiva",
    descricao:
      "Leilão com forte competitividade, histórico de lances e alto interesse do público.",
    lanceAtual: "R$ 19.800",
    status: "Disputa quente",
    observadores: "187 pessoas acompanhando",
  },
];

const recursos = [
  {
    titulo: "Disputa ao vivo",
    descricao:
      "Experiência separada e orientada para urgência, competição e leitura de oportunidade.",
  },
  {
    titulo: "Histórico de lances",
    descricao:
      "Visual claro para o usuário acompanhar a movimentação do lote e a evolução da disputa.",
  },
  {
    titulo: "Estrutura premium",
    descricao:
      "Páginas voltadas para lotes de alto valor percebido e maior retenção visual.",
  },
];

export default function LeiloesPage() {
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
          Leilões com lotes premium, disputa ao vivo e maior tensão competitiva
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
          Aqui os lotes são apresentados em uma experiência própria, separada das
          rifas e sorteios, com foco em valor, competição, lances e retenção do
          usuário ao longo da disputa.
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
            href="/leiloes/leilao-carro-0km"
            style={{
              background: "#f2d067",
              color: "#111",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 14,
              fontWeight: 800,
            }}
          >
            Ver leilão em destaque
          </Link>

          <a
            href="#lista-leiloes"
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 14,
              fontWeight: 700,
            }}
          >
            Explorar lotes
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
        {recursos.map((item) => (
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
        id="lista-leiloes"
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
              LEILÕES DISPONÍVEIS
            </p>
            <h2 style={{ fontSize: 34, margin: 0 }}>
              Lotes preparados para disputa e retenção
            </h2>
          </div>

          <p style={{ margin: 0, color: "rgba(255,255,255,0.72)" }}>
            Mais clareza visual para quem acompanha e para quem dá lance.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {leiloes.map((leilao) => (
            <article
              key={leilao.slug}
              style={{
                background: "rgba(0,0,0,0.16)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 24,
                padding: 24,
                boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
              }}
            >
              <h3 style={{ margin: "0 0 10px", fontSize: 28 }}>
                {leilao.titulo}
              </h3>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.65,
                }}
              >
                {leilao.descricao}
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
                    Lance atual
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {leilao.lanceAtual}
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
                    {leilao.status}
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
                    Interesse
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {leilao.observadores}
                  </strong>
                </div>
              </div>

              <Link
                href={`/leiloes/${leilao.slug}`}
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
                Abrir lote
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}