import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Leilões | Bigode das Rifas",
  description:
    "Lotes premium com disputa ao vivo, visual elegante, histórico de lances e experiência mais competitiva.",
};

const leiloes = [
  {
    slug: "leilao-carro-0km",
    titulo: "Carro 0km",
    descricao:
      "Lote premium com grande apelo de mercado, excelente valor percebido e alto potencial de disputa.",
    lanceAtual: "R$ 48.500",
    status: "Ao vivo",
    observadores: "312 pessoas acompanhando",
    destaque: "Lote principal",
  },
  {
    slug: "leilao-moto-esportiva",
    titulo: "Moto esportiva",
    descricao:
      "Leilão com dinâmica mais competitiva, ótima retenção visual e excelente interesse do público.",
    lanceAtual: "R$ 19.800",
    status: "Disputa quente",
    observadores: "187 pessoas acompanhando",
    destaque: "Alta atenção",
  },
];

const resources = [
  {
    title: "Disputa ao vivo",
    description:
      "Experiência criada para transmitir urgência, valor e sensação real de competição.",
  },
  {
    title: "Lotes premium",
    description:
      "Páginas separadas para valorizar itens de maior apelo e maior ticket percebido.",
  },
  {
    title: "Histórico e leitura clara",
    description:
      "Mais facilidade para entender lance atual, interesse do público e andamento do lote.",
  },
];

const faqs = [
  {
    question: "Como entro em um leilão?",
    answer:
      "Basta abrir o lote desejado e visualizar as informações principais da disputa, como valor atual e andamento.",
  },
  {
    question: "Como acompanho o interesse no lote?",
    answer:
      "A página destaca o número de pessoas acompanhando e o contexto do lote para aumentar a clareza da disputa.",
  },
  {
    question: "Os leilões são separados das outras modalidades?",
    answer:
      "Sim. Isso foi feito para valorizar os lotes premium e criar uma experiência específica de competição.",
  },
];

const testimonials = [
  {
    name: "Marcelo T.",
    text: "A experiência ficou muito mais premium. O lote ganha outra percepção de valor.",
  },
  {
    name: "Bruno A.",
    text: "Gostei da separação dos leilões. A navegação ficou muito mais estratégica.",
  },
  {
    name: "Vanessa C.",
    text: "O visual ajuda muito a acompanhar o lote e entender melhor a disputa.",
  },
];

export default function LeiloesPage() {
  return (
    <main
      style={{
        background:
          "radial-gradient(circle at top, #123ea8 0%, #082c8c 36%, #051d63 100%)",
        color: "#fff",
        minHeight: "100vh",
        paddingBottom: 110,
      }}
    >
      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "56px 24px 28px",
        }}
      >
        <p style={{ color: "#f2d067", fontWeight: 800, letterSpacing: 1.2, margin: 0 }}>
          MODALIDADE
        </p>

        <h1
          style={{
            fontSize: "clamp(2.3rem, 5vw, 4.2rem)",
            lineHeight: 1.04,
            margin: "12px 0 16px",
          }}
        >
          Leilões com lotes premium, visual sofisticado e disputa mais envolvente
        </h1>

        <p
          style={{
            maxWidth: 860,
            color: "rgba(255,255,255,0.84)",
            fontSize: 18,
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Os leilões foram organizados em uma experiência própria para destacar lotes
          premium, aumentar retenção e comunicar com mais força a disputa, o valor do
          item e o interesse do público.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
          <Link
            href="/leiloes/leilao-carro-0km"
            style={{
              background: "linear-gradient(135deg, #f7d978 0%, #d4a63a 100%)",
              color: "#111",
              textDecoration: "none",
              padding: "15px 22px",
              borderRadius: 16,
              fontWeight: 800,
              boxShadow: "0 14px 28px rgba(0,0,0,0.22)",
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
              padding: "15px 22px",
              borderRadius: 16,
              fontWeight: 700,
              background: "rgba(255,255,255,0.04)",
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
        {resources.map((item) => (
          <article
            key={item.title}
            style={{
              background:
                "linear-gradient(180deg, rgba(13,25,74,0.92), rgba(6,18,58,0.92))",
              border: "1px solid rgba(242,208,103,0.20)",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 16px 40px rgba(0,0,0,0.24)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 26 }}>{item.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
              {item.description}
            </p>
          </article>
        ))}
      </section>

      <section
        id="lista-leiloes"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "8px 24px 28px",
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
              Lotes com maior valor percebido e leitura mais clara da disputa
            </h2>
          </div>

          <p style={{ margin: 0, color: "rgba(255,255,255,0.72)" }}>
            Estrutura pensada para tensão competitiva e retenção.
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
                background:
                  "linear-gradient(180deg, rgba(10,20,64,0.95), rgba(5,16,52,0.95))",
                border: "1px solid rgba(242,208,103,0.22)",
                borderRadius: 26,
                padding: 24,
                boxShadow: "0 18px 42px rgba(0,0,0,0.24)",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "7px 11px",
                  borderRadius: 999,
                  background:
                    "linear-gradient(135deg, rgba(247,217,120,0.18), rgba(212,166,58,0.18))",
                  border: "1px solid rgba(242,208,103,0.30)",
                  color: "#f2d067",
                  fontSize: 13,
                  fontWeight: 800,
                  marginBottom: 14,
                }}
              >
                {leilao.destaque}
              </div>

              <h3 style={{ margin: "0 0 10px", fontSize: 28 }}>{leilao.titulo}</h3>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.65,
                }}
              >
                {leilao.descricao}
              </p>

              <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 18,
                    padding: 14,
                    border: "1px solid rgba(255,255,255,0.06)",
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
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 18,
                    padding: 14,
                    border: "1px solid rgba(255,255,255,0.06)",
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
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 18,
                    padding: 14,
                    border: "1px solid rgba(255,255,255,0.06)",
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
                  borderRadius: 14,
                  fontWeight: 800,
                }}
              >
                Abrir lote
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px 28px",
        }}
      >
        <article
          style={{
            background:
              "linear-gradient(135deg, rgba(247,217,120,0.18), rgba(10,20,64,0.94))",
            border: "1px solid rgba(242,208,103,0.28)",
            borderRadius: 28,
            padding: 28,
            boxShadow: "0 20px 44px rgba(0,0,0,0.24)",
          }}
        >
          <p style={{ color: "#f2d067", fontWeight: 800, marginTop: 0 }}>
            PROVA SOCIAL
          </p>
          <h2 style={{ fontSize: 32, marginTop: 0 }}>
            Como os usuários percebem a experiência dos leilões
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {testimonials.map((item) => (
              <div
                key={item.name}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 20,
                  padding: 18,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <strong style={{ display: "block", marginBottom: 8 }}>
                  {item.name}
                </strong>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px 72px",
        }}
      >
        <article
          style={{
            background:
              "linear-gradient(180deg, rgba(10,20,64,0.95), rgba(5,16,52,0.95))",
            border: "1px solid rgba(242,208,103,0.22)",
            borderRadius: 28,
            padding: 28,
            boxShadow: "0 18px 42px rgba(0,0,0,0.24)",
          }}
        >
          <p style={{ color: "#f2d067", fontWeight: 800, marginTop: 0 }}>FAQ</p>
          <h2 style={{ fontSize: 32, marginTop: 0 }}>
            Dúvidas frequentes sobre os leilões
          </h2>

          <div style={{ display: "grid", gap: 14 }}>
            {faqs.map((item) => (
              <div
                key={item.question}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 18,
                  padding: 18,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <strong style={{ display: "block", marginBottom: 8 }}>
                  {item.question}
                </strong>
                <span style={{ color: "rgba(255,255,255,0.76)", lineHeight: 1.7 }}>
                  {item.answer}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 16px",
          background: "rgba(4,13,44,0.96)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(242,208,103,0.18)",
          zIndex: 999,
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Link
            href="/leiloes/leilao-carro-0km"
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              background: "linear-gradient(135deg, #f7d978 0%, #d4a63a 100%)",
              color: "#111",
              textDecoration: "none",
              padding: "16px 18px",
              borderRadius: 16,
              fontWeight: 900,
              boxShadow: "0 12px 26px rgba(0,0,0,0.25)",
            }}
          >
            QUERO ENTRAR NO LEILÃO AGORA
          </Link>
        </div>
      </div>
    </main>
  );
}