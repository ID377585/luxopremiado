import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Leilões | Bigode das Rifas",
  description:
    "Lotes premium com disputa ao vivo, histórico de lances e funcionalidade de proxy bid.",
};

const auctions = [
  {
    slug: "leilao-honda-civic-touring",
    title: "Honda Civic Touring",
    currentBid: "R$ 92.500",
    nextMinimum: "R$ 93.000",
    endTime: "Encerra hoje às 22h",
    bids: 47,
    watchers: 328,
    reserveStatus: "Lance de reserva atingido",
    badge: "Ao vivo",
  },
  {
    slug: "leilao-bmw-g-310",
    title: "BMW G 310",
    currentBid: "R$ 24.800",
    nextMinimum: "R$ 25.200",
    endTime: "Encerra amanhã às 21h",
    bids: 31,
    watchers: 190,
    reserveStatus: "Próxima do valor de reserva",
    badge: "Disputa quente",
  },
  {
    slug: "leilao-iphone-15-ultra",
    title: "iPhone 15 Pro Max",
    currentBid: "R$ 6.200",
    nextMinimum: "R$ 6.350",
    endTime: "Encerra em 2 dias às 20h",
    bids: 19,
    watchers: 412,
    reserveStatus: "Lote premium ativo",
    badge: "Lote premium",
  },
];

const features = [
  {
    title: "Disputa ao vivo",
    description:
      "Página focada em tensão competitiva, atualização visual e senso de oportunidade.",
  },
  {
    title: "Histórico de lances",
    description:
      "O participante acompanha a movimentação do lote e entende o ritmo da disputa.",
  },
  {
    title: "Proxy bid",
    description:
      "O usuário define um teto automático e o sistema disputa dentro do limite informado.",
  },
];

const historyRows = [
  { user: "Usuário #4812", amount: "R$ 92.500", time: "21:42" },
  { user: "Usuário #1048", amount: "R$ 92.000", time: "21:39" },
  { user: "Usuário #7701", amount: "R$ 91.500", time: "21:33" },
  { user: "Usuário #2254", amount: "R$ 91.000", time: "21:29" },
];

export default function LeiloesPage() {
  return (
    <main style={{ background: "#0b0b0f", color: "#fff", minHeight: "100vh" }}>
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "56px 24px 28px",
        }}
      >
        <p style={{ color: "#d4af37", fontWeight: 700, letterSpacing: 1.2 }}>
          MODALIDADE
        </p>

        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            lineHeight: 1.05,
            margin: "12px 0 16px",
          }}
        >
          Leilões com lotes premium, disputa ao vivo e leitura clara dos lances.
        </h1>

        <p
          style={{
            maxWidth: 780,
            color: "rgba(255,255,255,0.78)",
            fontSize: 18,
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Esta página separa a experiência de leilão das demais modalidades para
          destacar urgência, competição, histórico de lances e o uso de proxy bid
          como ferramenta de conveniência e retenção.
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
            href={`/leiloes/${auctions[0].slug}`}
            style={{
              background: "#d4af37",
              color: "#111",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Entrar no leilão ao vivo
          </Link>

          <a
            href="#lotes-leilao"
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Ver lotes
          </a>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
        }}
      >
        {features.map((feature) => (
          <article
            key={feature.title}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 26 }}>{feature.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.65 }}>
              {feature.description}
            </p>
          </article>
        ))}
      </section>

      <section
        id="lotes-leilao"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "8px 24px 28px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div>
            <p style={{ color: "#d4af37", fontWeight: 700, marginBottom: 8 }}>
              LOTES DISPONÍVEIS
            </p>
            <h2 style={{ fontSize: 32, margin: 0 }}>
              Estrutura pronta para alto valor percebido
            </h2>
          </div>

          <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>
            Foco em lance atual, encerramento e competitividade.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {auctions.map((auction) => (
            <article
              key={auction.slug}
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
                {auction.badge}
              </div>

              <h3 style={{ margin: "0 0 12px", fontSize: 28 }}>{auction.title}</h3>

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
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                    Lance atual
                  </p>
                  <strong>{auction.currentBid}</strong>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                    Próximo mínimo
                  </p>
                  <strong>{auction.nextMinimum}</strong>
                </div>
              </div>

              <p style={{ color: "rgba(255,255,255,0.84)", marginBottom: 6 }}>
                {auction.endTime}
              </p>
              <p style={{ color: "rgba(255,255,255,0.72)", margin: "0 0 6px" }}>
                {auction.bids} lances registrados
              </p>
              <p style={{ color: "rgba(255,255,255,0.72)", margin: "0 0 18px" }}>
                {auction.watchers} pessoas acompanhando • {auction.reserveStatus}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href={`/leiloes/${auction.slug}`}
                  style={{
                    display: "inline-block",
                    background: "#fff",
                    color: "#111",
                    textDecoration: "none",
                    padding: "12px 18px",
                    borderRadius: 12,
                    fontWeight: 700,
                  }}
                >
                  Dar lance
                </Link>

                <button
                  type="button"
                  style={{
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "transparent",
                    color: "#fff",
                    padding: "12px 18px",
                    borderRadius: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Configurar proxy bid
                </button>
              </div>
            </article>
          ))}
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
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: 20,
          }}
        >
          <article
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(255,255,255,0.04))",
              border: "1px solid rgba(212,175,55,0.24)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
              HISTÓRICO DE LANCES
            </p>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>
              Transparência visual para sustentar a disputa
            </h2>

            <div
              style={{
                display: "grid",
                gap: 10,
                marginTop: 16,
              }}
            >
              {historyRows.map((row) => (
                <div
                  key={`${row.user}-${row.time}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 12,
                    alignItems: "center",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 16,
                    padding: "14px 16px",
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.8)" }}>{row.user}</span>
                  <strong>{row.amount}</strong>
                  <span style={{ color: "rgba(255,255,255,0.62)" }}>{row.time}</span>
                </div>
              ))}
            </div>
          </article>

          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
              PROXY BID
            </p>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>
              Mais praticidade para quem quer disputar com estratégia
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
              O recurso de proxy bid permite que o usuário defina um valor máximo.
              O sistema faz incrementos automáticos até aquele limite, reduzindo
              atrito e mantendo o lote competitivo.
            </p>

            <ul
              style={{
                paddingLeft: 18,
                lineHeight: 1.9,
                color: "rgba(255,255,255,0.82)",
                marginBottom: 0,
              }}
            >
              <li>Configuração rápida do teto máximo</li>
              <li>Mais retenção na disputa</li>
              <li>Melhor experiência em lotes premium</li>
              <li>Histórico claro para auditoria visual</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}