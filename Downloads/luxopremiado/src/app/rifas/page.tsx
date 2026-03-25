import type { Metadata } from "next";
import Link from "next/link";

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
  {
    slug: "tv-55-mais-ps5",
    titulo: 'TV 55" + PlayStation 5',
    descricao:
      "Combo premium com alto valor percebido para aumentar o desejo e a permanência na página.",
    preco: "R$ 1,79",
    numeros: "10.000 números",
    destaque: "Prêmio combo",
  },
  {
    slug: "hb20-mais-pix",
    titulo: "HB20 + PIX bônus",
    descricao:
      "Campanha forte para chamar atenção na home e puxar participação com mais intensidade.",
    preco: "R$ 2,49",
    numeros: "20.000 números",
    destaque: "Super destaque",
  },
  {
    slug: "macbook-air",
    titulo: "MacBook Air",
    descricao:
      "Prêmio com apelo aspiracional e ótima performance para público que busca valor percebido alto.",
    preco: "R$ 1,69",
    numeros: "9.000 números",
    destaque: "Alta atenção",
  },
];

const pacotes = [
  {
    title: "Pacote Inicial",
    numbers: "10 números",
    oldPrice: "R$ 19,90",
    price: "R$ 17,90",
    description:
      "Para entrar rápido e começar a participar com melhor custo logo na primeira compra.",
  },
  {
    title: "Pacote Turbo",
    numbers: "25 números",
    oldPrice: "R$ 49,75",
    price: "R$ 41,90",
    description:
      "Melhor equilíbrio entre volume, economia e chance real de ganhar presença na campanha.",
  },
  {
    title: "Pacote Top Ranking",
    numbers: "60 números",
    oldPrice: "R$ 119,40",
    price: "R$ 94,90",
    description:
      "Pensado para quem quer mais cobertura, mais força na disputa e mais visibilidade.",
  },
  {
    title: "Pacote Dominação",
    numbers: "120 números",
    oldPrice: "R$ 238,80",
    price: "R$ 179,90",
    description:
      "Ideal para elevar ticket médio e incentivar o usuário a entrar com muito mais força.",
  },
];

const motivos = [
  "Rifas fáceis de entender e comprar",
  "Pacotes que aumentam ticket médio",
  "Prêmios com forte desejo popular",
  "Navegação simples para celular",
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
      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "56px 24px 28px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#f2d067",
            fontWeight: 900,
            letterSpacing: 1.2,
          }}
        >
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
          Escolha seus números agora e entre nas rifas que mais fazem o usuário
          agir rápido.
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
          Aqui a lógica é simples: prêmios desejados, tickets acessíveis,
          pacotes bem posicionados e páginas pensadas para aumentar conversão e
          ticket médio.
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
            href="/rifas/moto-0km"
            style={{
              background: "linear-gradient(135deg, #f7d978 0%, #d4a63a 100%)",
              color: "#111",
              textDecoration: "none",
              padding: "15px 22px",
              borderRadius: 16,
              fontWeight: 900,
            }}
          >
            Entrar na rifa em destaque
          </Link>

          <a
            href="#pacotes"
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
            Ver pacotes
          </a>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 16,
        }}
      >
        {motivos.map((item) => (
          <div
            key={item}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 18,
              fontWeight: 700,
            }}
          >
            {item}
          </div>
        ))}
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px 28px",
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
              RIFAS DISPONÍVEIS
            </p>
            <h2 style={{ margin: "8px 0 0", fontSize: 34 }}>
              Campanhas criadas para girar rápido e prender atenção
            </h2>
          </div>

          <p style={{ margin: 0, color: "rgba(255,255,255,0.72)", maxWidth: 420 }}>
            Quanto maior o desejo pelo prêmio, maior a tendência do visitante
            entrar agora e continuar vendo outras oportunidades.
          </p>
        </div>

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

              <Link
                href={`/rifas/${item.slug}`}
                style={{
                  display: "inline-block",
                  marginTop: 18,
                  background: "#fff",
                  color: "#111",
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: 14,
                  fontWeight: 900,
                }}
              >
                Escolher números
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        id="pacotes"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px 72px",
        }}
      >
        <article
          style={{
            background:
              "linear-gradient(135deg, rgba(247,217,120,0.15), rgba(8,22,66,0.95))",
            border: "1px solid rgba(242,208,103,0.25)",
            borderRadius: 28,
            padding: 28,
          }}
        >
          <p style={{ marginTop: 0, color: "#f2d067", fontWeight: 900 }}>
            PACOTES QUE AUMENTAM TICKET
          </p>
          <h2 style={{ marginTop: 0, fontSize: 34 }}>
            Leve mais números e aumente sua presença nas campanhas
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
            }}
          >
            {pacotes.map((item) => (
              <div
                key={item.title}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 22,
                  padding: 22,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <h3 style={{ marginTop: 0 }}>{item.title}</h3>
                <p style={{ color: "#f2d067", fontWeight: 800 }}>
                  {item.numbers}
                </p>
                <p
                  style={{
                    margin: "6px 0",
                    color: "rgba(255,255,255,0.55)",
                    textDecoration: "line-through",
                  }}
                >
                  {item.oldPrice}
                </p>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: 30,
                    fontWeight: 900,
                  }}
                >
                  {item.price}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "rgba(255,255,255,0.78)",
                    lineHeight: 1.7,
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "12px 16px",
          background: "rgba(4,13,44,0.96)",
          borderTop: "1px solid rgba(242,208,103,0.18)",
          backdropFilter: "blur(10px)",
          zIndex: 999,
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Link
            href="/rifas/moto-0km"
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              textDecoration: "none",
              background: "linear-gradient(135deg, #f7d978 0%, #d4a63a 100%)",
              color: "#111",
              padding: "16px 18px",
              borderRadius: 16,
              fontWeight: 900,
            }}
          >
            QUERO ESCOLHER MEUS NÚMEROS AGORA
          </Link>
        </div>
      </div>
    </main>
  );
}