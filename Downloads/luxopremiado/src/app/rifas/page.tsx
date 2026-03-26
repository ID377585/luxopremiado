import type { Metadata } from "next";
import Link from "next/link";
import QuickAccessBar from "@/components/QuickAccessBar";
import { getAllRaffles } from "@/lib/raffles-content";

export const metadata: Metadata = {
  title: "Rifas | Bigode das Rifas",
  description:
    "Veja as rifas em destaque, compare campanhas e escolha a melhor para participar agora.",
};

export default function RifasPage() {
  const raffles = getAllRaffles();

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
        chooseHref="/rifas"
        userHref="/login"
        vipHref="/r/bigode-das-rifas#transparencia"
      />

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "40px 24px 28px",
        }}
      >
        <p style={{ margin: 0, color: "#f2d067", fontWeight: 900 }}>
          RIFAS
        </p>

        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4.3rem)",
            lineHeight: 1.05,
            margin: "12px 0 16px",
            maxWidth: 860,
          }}
        >
          Escolha a campanha que mais faz sentido para você entrar agora.
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: 820,
            color: "rgba(255,255,255,0.82)",
            fontSize: 18,
            lineHeight: 1.75,
          }}
        >
          Aqui você encontra campanhas com forte apelo comercial, prêmios
          desejados e pacotes pensados para acelerar participação.
        </p>
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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {raffles.map((item) => (
            <article
              key={item.slug}
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,20,64,0.95), rgba(5,16,52,0.95))",
                border: "1px solid rgba(242,208,103,0.22)",
                borderRadius: 26,
                padding: 24,
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
                {item.heroBadge}
              </span>

              <h2 style={{ margin: "14px 0 10px", fontSize: 30 }}>
                {item.title}
              </h2>

              <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
                {item.shortDescription}
              </p>

              <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 16,
                    padding: 14,
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.62)" }}>
                    Valor por número
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {item.pricePerNumber}
                  </strong>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 16,
                    padding: 14,
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.62)" }}>
                    Sorteio
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {item.drawDateLabel}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 18,
                }}
              >
                <Link
                  href={`/r/${item.slug}`}
                  style={{
                    display: "inline-block",
                    background: "#fff",
                    color: "#111",
                    textDecoration: "none",
                    padding: "12px 18px",
                    borderRadius: 14,
                    fontWeight: 900,
                  }}
                >
                  Ver detalhes
                </Link>

                <Link
                  href={`/r/${item.slug}#pacotes`}
                  style={{
                    display: "inline-block",
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "12px 18px",
                    borderRadius: 14,
                    fontWeight: 800,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Escolher pacote
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}