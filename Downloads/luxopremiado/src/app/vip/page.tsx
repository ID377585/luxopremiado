import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "VIP | Bigode das Rifas",
  description:
    "Área VIP com benefícios exclusivos, acesso prioritário e vantagens para quem participa mais.",
};

const beneficios = [
  {
    title: "Comissão e vantagens",
    text: "Estrutura pensada para quem quer participar mais e aproveitar benefícios extras.",
  },
  {
    title: "Acesso prioritário",
    text: "Veja campanhas fortes antes de perder as melhores oportunidades.",
  },
  {
    title: "Mais destaque",
    text: "Quem participa com mais força ganha mais visibilidade e recorrência no ecossistema.",
  },
];

export default function VipPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(28,42,120,0.28), transparent 30%), linear-gradient(180deg, #04112f 0%, #071632 100%)",
        color: "#fff",
        paddingBottom: 100,
      }}
    >
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "56px 24px 28px",
        }}
      >
        <p style={{ margin: 0, color: "#f2d067", fontWeight: 900 }}>
          ÁREA VIP
        </p>

        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            lineHeight: 1.05,
            margin: "12px 0 16px",
          }}
        >
          Benefícios exclusivos para quem quer ir além nas campanhas.
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
          A área VIP foi criada para destacar vantagens, recorrência,
          relacionamento e oportunidades para quem participa com mais frequência.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
            marginTop: 28,
          }}
        >
          {beneficios.map((item) => (
            <article
              key={item.title}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 22,
                padding: 22,
              }}
            >
              <h2 style={{ marginTop: 0, fontSize: 24 }}>{item.title}</h2>
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.7,
                }}
              >
                {item.text}
              </p>
            </article>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 28,
          }}
        >
          <Link
            href="/rifas"
            style={{
              textDecoration: "none",
              background: "linear-gradient(135deg, #f7d978 0%, #d4a63a 100%)",
              color: "#111",
              padding: "14px 18px",
              borderRadius: 14,
              fontWeight: 900,
            }}
          >
            Ver campanhas
          </Link>

          <Link
            href="/app"
            style={{
              textDecoration: "none",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              padding: "14px 18px",
              borderRadius: 14,
              fontWeight: 800,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Ir para área do usuário
          </Link>
        </div>
      </section>
    </main>
  );
}