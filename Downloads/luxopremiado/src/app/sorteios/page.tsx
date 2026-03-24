import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sorteios | Bigode das Rifas",
  description:
    "Página exclusiva para sorteios e campanhas promocionais da plataforma.",
};

const items = [
  {
    slug: "campanha-especial",
    title: "Campanha Especial",
    description:
      "Página dedicada para sorteios promocionais, ações sazonais e campanhas especiais.",
    drawDate: "Em breve",
    status: "Pré-lançamento",
  },
];

export default function SorteiosPage() {
  return (
    <main style={{ background: "#0b0b0f", color: "#fff", minHeight: "100vh" }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 24px" }}>
        <p style={{ color: "#d4af37", fontWeight: 700 }}>MODALIDADE</p>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)", margin: "10px 0 14px" }}>
          Sorteios
        </h1>
        <p style={{ maxWidth: 760, color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
          Esta seção foi criada para separar os sorteios das rifas e dos leilões.
          Aqui o foco é regulamento, prêmio, data do resultado e participação na campanha.
        </p>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "8px 24px 72px",
          display: "grid",
          gap: 20,
        }}
      >
        {items.map((item) => (
          <article
            key={item.slug}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 24,
            }}
          >
            <h2 style={{ margin: "0 0 10px", fontSize: 30 }}>{item.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.74)", lineHeight: 1.6 }}>
              {item.description}
            </p>
            <p style={{ margin: "14px 0 6px" }}>Data: {item.drawDate}</p>
            <p style={{ margin: 0, color: "#d4af37", fontWeight: 700 }}>
              Status: {item.status}
            </p>

            <Link
              href={`/sorteios/${item.slug}`}
              style={{
                display: "inline-block",
                marginTop: 18,
                background: "#d4af37",
                color: "#111",
                textDecoration: "none",
                padding: "12px 18px",
                borderRadius: 12,
                fontWeight: 700,
              }}
            >
              Abrir sorteio
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}