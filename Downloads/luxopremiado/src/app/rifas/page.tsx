import type { Metadata } from "next";
import Link from "next/link";
import QuickAccessBar from "@/components/QuickAccessBar";

export const metadata: Metadata = {
  title: "Rifas | Bigode das Rifas",
  description:
    "Rifas com forte apelo comercial, pacotes estratégicos e campanhas criadas para converter rápido.",
};

const rifas = [
  {
    slug: "moto-0km",
    titulo: "Moto 0km",
    descricao:
      "Campanha com alto desejo popular, excelente clique e ótima percepção de prêmio principal.",
    preco: "R$ 1,99",
    numeros: "12.000 números",
    destaque: "Mais procurada",
  },
  {
    slug: "iphone-pro-max",
    titulo: "iPhone Pro Max",
    descricao:
      "Oferta de giro rápido, muito forte para tráfego mobile e decisão imediata.",
    preco: "R$ 1,49",
    numeros: "8.000 números",
    destaque: "Conversão alta",
  },
  {
    slug: "pix-10-mil",
    titulo: "PIX de R$ 10.000",
    descricao:
      "Prêmio direto, simples de entender e muito eficiente para campanhas promocionais.",
    preco: "R$ 0,99",
    numeros: "15.000 números",
    destaque: "Entrada fácil",
  },
];

export default function RifasPage() {
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
        chooseHref="/app/comprar"
        userHref="/area-do-usuario"
        vipHref="/vip"
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
          Veja as rifas em destaque e entre no fluxo real de compra sem perder tempo.
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
          Esta página precisa vender, mas também precisa devolver o acesso ao
          que sumiu: compra, área do usuário e navegação útil.
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
          {rifas.map((item) => (
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
                {item.destaque}
              </span>

              <h2 style={{ margin: "14px 0 10px", fontSize: 30 }}>
                {item.titulo}
              </h2>

              <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
                {item.descricao}
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
                    {item.preco}
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
                    Disponibilidade
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {item.numeros}
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
                  href={`/rifas/${item.slug}`}
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
                  href="/app/comprar"
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
                  Comprar números
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}