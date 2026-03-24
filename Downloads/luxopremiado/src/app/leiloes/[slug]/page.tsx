import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Bid = {
  user: string;
  amount: string;
  time: string;
};

type Leilao = {
  slug: string;
  title: string;
  subtitle: string;
  lotDescription: string;
  currentBid: string;
  minimumNextBid: string;
  reserveStatus: string;
  closingTime: string;
  watchers: number;
  totalBids: number;
  proxyBidEnabled: boolean;
  badge: string;
  status: string;
  history: Bid[];
  highlights: string[];
  faq: { question: string; answer: string }[];
};

const leiloes: Leilao[] = [
  {
    slug: "leilao-honda-civic-touring",
    title: "Honda Civic Touring",
    subtitle:
      "Lote premium com disputa ao vivo, histórico de lances e forte apelo competitivo.",
    lotDescription:
      "Este lote foi estruturado para uma experiência de leilão mais intensa, com leitura rápida do lance atual, encerramento visível e incentivo claro à disputa.",
    currentBid: "R$ 92.500",
    minimumNextBid: "R$ 93.000",
    reserveStatus: "Lance de reserva atingido",
    closingTime: "Encerra hoje às 22h",
    watchers: 328,
    totalBids: 47,
    proxyBidEnabled: true,
    badge: "Ao vivo",
    status: "Recebendo lances",
    history: [
      { user: "Usuário #4812", amount: "R$ 92.500", time: "21:42" },
      { user: "Usuário #1048", amount: "R$ 92.000", time: "21:39" },
      { user: "Usuário #7701", amount: "R$ 91.500", time: "21:33" },
      { user: "Usuário #2254", amount: "R$ 91.000", time: "21:29" },
      { user: "Usuário #9981", amount: "R$ 90.500", time: "21:20" },
    ],
    highlights: [
      "Disputa em tempo real",
      "Histórico de lances visível",
      "Lote premium com alto valor percebido",
      "Proxy bid disponível",
    ],
    faq: [
      {
        question: "Como faço um lance?",
        answer:
          "Basta acessar a área do lote e ofertar um valor igual ou superior ao próximo lance mínimo.",
      },
      {
        question: "O que é proxy bid?",
        answer:
          "É a função que permite definir um valor máximo para que o sistema lance automaticamente dentro do seu limite.",
      },
      {
        question: "Como sei se o lote encerrou?",
        answer:
          "O status do lote e o horário de encerramento ficam destacados na própria página.",
      },
    ],
  },
  {
    slug: "leilao-bmw-g-310",
    title: "BMW G 310",
    subtitle:
      "Lote competitivo com acompanhamento de disputa, urgência e interesse qualificado.",
    lotDescription:
      "Página preparada para reforçar urgência, credibilidade do lote e leitura clara da dinâmica de lances.",
    currentBid: "R$ 24.800",
    minimumNextBid: "R$ 25.200",
    reserveStatus: "Próxima do valor de reserva",
    closingTime: "Encerra amanhã às 21h",
    watchers: 190,
    totalBids: 31,
    proxyBidEnabled: true,
    badge: "Disputa quente",
    status: "Recebendo lances",
    history: [
      { user: "Usuário #3380", amount: "R$ 24.800", time: "18:10" },
      { user: "Usuário #4401", amount: "R$ 24.400", time: "18:04" },
      { user: "Usuário #1172", amount: "R$ 24.000", time: "17:58" },
      { user: "Usuário #9250", amount: "R$ 23.600", time: "17:49" },
      { user: "Usuário #6315", amount: "R$ 23.200", time: "17:35" },
    ],
    highlights: [
      "Encerramento próximo",
      "Bom ritmo de lances",
      "Mais pessoas acompanhando o lote",
      "Proxy bid ativo",
    ],
    faq: [
      {
        question: "Posso acompanhar sem dar lance?",
        answer:
          "Sim. O número de observadores ajuda a indicar o interesse no lote, mesmo antes da disputa ativa.",
      },
      {
        question: "Existe incremento mínimo?",
        answer:
          "Sim. O próximo valor mínimo aparece com destaque para orientar o participante.",
      },
      {
        question: "Quando meu lance é confirmado?",
        answer:
          "A confirmação acontece quando o sistema registra o valor como o lance líder dentro das regras do lote.",
      },
    ],
  },
  {
    slug: "leilao-iphone-15-ultra",
    title: "iPhone 15 Pro Max",
    subtitle:
      "Lote premium de alta atratividade, ideal para disputa rápida e retenção visual.",
    lotDescription:
      "Uma estrutura de leilão pensada para elevar a percepção de valor e facilitar o entendimento dos próximos passos do usuário.",
    currentBid: "R$ 6.200",
    minimumNextBid: "R$ 6.350",
    reserveStatus: "Lote premium ativo",
    closingTime: "Encerra em 2 dias às 20h",
    watchers: 412,
    totalBids: 19,
    proxyBidEnabled: true,
    badge: "Lote premium",
    status: "Recebendo lances",
    history: [
      { user: "Usuário #8821", amount: "R$ 6.200", time: "16:32" },
      { user: "Usuário #6004", amount: "R$ 6.050", time: "16:26" },
      { user: "Usuário #9130", amount: "R$ 5.900", time: "16:14" },
      { user: "Usuário #7012", amount: "R$ 5.750", time: "16:05" },
      { user: "Usuário #4438", amount: "R$ 5.600", time: "15:57" },
    ],
    highlights: [
      "Produto premium",
      "Grande volume de observadores",
      "Disputa com alto potencial",
      "Proxy bid habilitado",
    ],
    faq: [
      {
        question: "Como funciona o encerramento?",
        answer:
          "O lote encerra no horário informado, respeitando as regras da plataforma para fechamento da disputa.",
      },
      {
        question: "O histórico de lances é atualizado?",
        answer:
          "Sim. A proposta da página é justamente exibir a evolução da disputa com clareza.",
      },
      {
        question: "Vale a pena usar proxy bid?",
        answer:
          "Sim, principalmente para quem não quer acompanhar cada minuto da disputa manualmente.",
      },
    ],
  },
];

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getLeilao(slug: string) {
  return leiloes.find((item) => item.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const leilao = getLeilao(slug);

  if (!leilao) {
    return {
      title: "Leilão | Bigode das Rifas",
      description: "Página individual de lote em leilão.",
    };
  }

  return {
    title: `${leilao.title} | Leilões | Bigode das Rifas`,
    description: leilao.subtitle,
  };
}

export default async function LeilaoSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const leilao = getLeilao(slug);

  if (!leilao) {
    notFound();
  }

  return (
    <main style={{ background: "#0b0b0f", color: "#fff", minHeight: "100vh" }}>
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "56px 24px 28px",
        }}
      >
        <Link
          href="/leiloes"
          style={{
            display: "inline-block",
            marginBottom: 18,
            color: "#d4af37",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← Voltar para leilões
        </Link>

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
          {leilao.badge}
        </div>

        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            lineHeight: 1.05,
            margin: "0 0 16px",
          }}
        >
          {leilao.title}
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
          {leilao.subtitle}
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 24,
          }}
        >
          <a
            href="#dar-lance"
            style={{
              background: "#d4af37",
              color: "#111",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Dar lance agora
          </a>

          <a
            href="#historico"
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Ver histórico
          </a>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 28px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>
              Lance atual
            </p>
            <strong style={{ display: "block", fontSize: 24, marginTop: 8 }}>
              {leilao.currentBid}
            </strong>
          </article>

          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>
              Próximo mínimo
            </p>
            <strong style={{ display: "block", fontSize: 24, marginTop: 8 }}>
              {leilao.minimumNextBid}
            </strong>
          </article>

          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>Status</p>
            <strong style={{ display: "block", fontSize: 24, marginTop: 8 }}>
              {leilao.status}
            </strong>
          </article>

          <article
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(255,255,255,0.04))",
              border: "1px solid rgba(212,175,55,0.24)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.75)" }}>
              Encerramento
            </p>
            <strong style={{ display: "block", fontSize: 24, marginTop: 8 }}>
              {leilao.closingTime}
            </strong>
          </article>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "8px 24px 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.08fr 0.92fr",
            gap: 20,
          }}
        >
          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
              SOBRE O LOTE
            </p>
            <h2 style={{ fontSize: 30, marginTop: 0 }}>{leilao.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
              {leilao.lotDescription}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
                marginTop: 20,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                  Observadores
                </p>
                <strong>{leilao.watchers}</strong>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                  Total de lances
                </p>
                <strong>{leilao.totalBids}</strong>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                  Reserva
                </p>
                <strong>{leilao.reserveStatus}</strong>
              </div>
            </div>
          </article>

          <article
            id="dar-lance"
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.16), rgba(255,255,255,0.04))",
              border: "1px solid rgba(212,175,55,0.24)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
              ÁREA DE LANCE
            </p>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>Pronto para disputar?</h2>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 18,
                padding: 18,
                marginBottom: 14,
              }}
            >
              <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                Lance atual
              </p>
              <strong style={{ fontSize: 26 }}>{leilao.currentBid}</strong>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 18,
                padding: 18,
                marginBottom: 18,
              }}
            >
              <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                Próximo lance mínimo
              </p>
              <strong style={{ fontSize: 26 }}>{leilao.minimumNextBid}</strong>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button
                type="button"
                style={{
                  background: "#111",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.16)",
                  padding: "12px 18px",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Dar lance manual
              </button>

              <button
                type="button"
                style={{
                  background: "#fff",
                  color: "#111",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {leilao.proxyBidEnabled ? "Ativar proxy bid" : "Proxy bid indisponível"}
              </button>
            </div>
          </article>
        </div>
      </section>

      <section
        id="historico"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
              HISTÓRICO DE LANCES
            </p>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>
              Evolução recente da disputa
            </h2>

            <div style={{ display: "grid", gap: 12 }}>
              {leilao.history.map((item) => (
                <div
                  key={`${item.user}-${item.time}-${item.amount}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 12,
                    alignItems: "center",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 18,
                    padding: "14px 16px",
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.82)" }}>{item.user}</span>
                  <strong>{item.amount}</strong>
                  <span style={{ color: "rgba(255,255,255,0.62)" }}>{item.time}</span>
                </div>
              ))}
            </div>
          </article>

          <article
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(212,175,55,0.12))",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
              DESTAQUES DO LEILÃO
            </p>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>
              Elementos que reforçam a competitividade
            </h2>

            <ul
              style={{
                paddingLeft: 18,
                lineHeight: 1.9,
                color: "rgba(255,255,255,0.82)",
                marginBottom: 0,
              }}
            >
              {leilao.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 72px",
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
          <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>FAQ</p>
          <h2 style={{ marginTop: 0, fontSize: 28 }}>
            Dúvidas frequentes do leilão
          </h2>

          <div style={{ display: "grid", gap: 14 }}>
            {leilao.faq.map((item) => (
              <div
                key={item.question}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 18,
                  padding: 18,
                }}
              >
                <strong style={{ display: "block", marginBottom: 8 }}>
                  {item.question}
                </strong>
                <span style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                  {item.answer}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}