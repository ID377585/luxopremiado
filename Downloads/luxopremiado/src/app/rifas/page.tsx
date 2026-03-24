import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rifas | Bigode das Rifas",
  description:
    "Participe das rifas do Bigode das Rifas com campanhas premium, transparência em tempo real e compra rápida.",
};

const rifas = [
  {
    slug: "bigode-das-rifas",
    titulo: "Shineray Free 150",
    descricao:
      "Campanha principal da plataforma, com forte apelo comercial, ritmo de vendas acelerado e excelente percepção de valor.",
    preco: "A partir de R$ 0,10",
    status: "Campanha principal",
    destaque: "Mais procurada",
  },
  {
    slug: "iphone-17-pro-max",
    titulo: "iPhone 17 Pro Max 256 GB – Laranja cósmico – eSIM",
    descricao:
      "Produto premium com altíssima procura, ideal para reforçar desejo, urgência e retenção do usuário na página.",
    preco: "A partir de R$ 0,20",
    status: "Alta demanda",
    destaque: "Prêmio premium",
  },
  {
    slug: "500-reais",
    titulo: "500,00 Reais",
    descricao:
      "Rifa de entrada rápida, excelente para novos usuários e para campanhas com forte taxa de conversão.",
    preco: "A partir de R$ 0,05",
    status: "Participação rápida",
    destaque: "Conversão alta",
  },
];

const benefits = [
  {
    title: "Compra rápida",
    description:
      "Fluxo enxuto para o usuário escolher números e avançar sem distrações desnecessárias.",
  },
  {
    title: "Atualização em tempo real",
    description:
      "Disponíveis, reservados e vendidos aparecem com mais clareza para gerar urgência real.",
  },
  {
    title: "Campanhas premium",
    description:
      "Prêmios com forte apelo comercial e excelente potencial de engajamento e recompra.",
  },
];

const faqs = [
  {
    question: "Como escolho meus números?",
    answer:
      "Ao entrar na campanha, você visualiza os números disponíveis e pode selecionar rapidamente os que deseja reservar ou comprar.",
  },
  {
    question: "Os dados da campanha são atualizados?",
    answer:
      "Sim. A proposta da plataforma é exibir progresso, disponibilidade e movimentação de forma muito mais transparente.",
  },
  {
    question: "Posso acompanhar mais de uma campanha ao mesmo tempo?",
    answer:
      "Sim. A navegação por modalidade facilita visualizar diferentes rifas e escolher a campanha com melhor apelo para você.",
  },
];

const testimonials = [
  {
    name: "Carlos M.",
    text: "A experiência ficou muito mais clara. Entrei, escolhi meus números e finalizei rápido.",
  },
  {
    name: "Juliana R.",
    text: "Gostei da transparência da página e do visual premium das campanhas.",
  },
  {
    name: "Fernando S.",
    text: "A divisão por modalidade ajuda demais. Fica muito mais fácil encontrar o que quero.",
  },
];

export default function RifasPage() {
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
        <p
          style={{
            color: "#f2d067",
            fontWeight: 800,
            letterSpacing: 1.2,
            margin: 0,
          }}
        >
          BIGODE DAS RIFAS
        </p>

        <h1
          style={{
            fontSize: "clamp(2.3rem, 5vw, 4.4rem)",
            lineHeight: 1.02,
            margin: "12px 0 16px",
          }}
        >
          Rifas com visual premium, urgência real e experiência pensada para conversão
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
          Explore campanhas com forte apelo comercial, acompanhe a disponibilidade
          em tempo real e escolha seus números em um ambiente mais elegante, confiável
          e preparado para acelerar a decisão de compra.
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
            href="/rifas/bigode-das-rifas"
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
            Entrar na campanha principal
          </Link>

          <a
            href="#lista-rifas"
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
            Ver todas as rifas
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
        {benefits.map((item) => (
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
        id="lista-rifas"
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
              RIFAS DISPONÍVEIS
            </p>
            <h2 style={{ fontSize: 34, margin: 0 }}>
              Campanhas com forte apelo visual e comercial
            </h2>
          </div>

          <p style={{ margin: 0, color: "rgba(255,255,255,0.72)" }}>
            Estrutura criada para vender melhor e reter mais atenção.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {rifas.map((rifa) => (
            <article
              key={rifa.slug}
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
                {rifa.destaque}
              </div>

              <h3 style={{ margin: "0 0 10px", fontSize: 28 }}>{rifa.titulo}</h3>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.65,
                }}
              >
                {rifa.descricao}
              </p>

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
                    borderRadius: 18,
                    padding: 14,
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.64)" }}>
                    Preço
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {rifa.preco}
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
                    {rifa.status}
                  </strong>
                </div>
              </div>

              <Link
                href={`/rifas/${rifa.slug}`}
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
                Ver campanha
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
            O que os participantes estão dizendo
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
            Dúvidas frequentes sobre as rifas
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
            href="/rifas/bigode-das-rifas"
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
            QUERO ESCOLHER MEUS NÚMEROS AGORA
          </Link>
        </div>
      </div>
    </main>
  );
}