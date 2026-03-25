import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bigode das Rifas | Rifas, sorteios e leilões com PIX imediato",
  description:
    "Escolha seus números, participe de rifas, sorteios e leilões com experiência premium, campanhas fortes e pagamento rápido no PIX.",
};

const categorias = [
  {
    title: "Rifas em alta",
    description:
      "Campanhas com entrada rápida, tickets acessíveis e prêmios que chamam atenção logo no primeiro clique.",
    href: "/rifas",
    cta: "Explorar rifas",
  },
  {
    title: "Sorteios promocionais",
    description:
      "Ofertas diretas, prêmios desejados e regras claras para facilitar a decisão de participação.",
    href: "/sorteios",
    cta: "Ver sorteios",
  },
  {
    title: "Leilões premium",
    description:
      "Lotes que geram desejo, disputa e retenção para quem gosta de acompanhar e entrar na hora certa.",
    href: "/leiloes",
    cta: "Abrir leilões",
  },
];

const premios = [
  {
    title: "Moto 0km",
    badge: "Mais desejado",
    description:
      "Um dos prêmios com maior apelo popular e excelente capacidade de chamar clique na home.",
  },
  {
    title: "iPhone Pro Max",
    badge: "Alta conversão",
    description:
      "Prêmio de giro rápido, ótimo para campanhas que precisam performar bem no celular.",
  },
  {
    title: "PIX de R$ 10.000",
    badge: "Decisão rápida",
    description:
      "Oferta direta, simples de entender e muito forte para quem quer entrar sem enrolação.",
  },
  {
    title: "PlayStation 5 + TV 55”",
    badge: "Combo premium",
    description:
      "Campanha com alto valor percebido e ótimo potencial para aumentar permanência na página.",
  },
];

const campanhas = [
  {
    title: "Rifa Relâmpago da Semana",
    description:
      "Poucos números, urgência maior e mais chance de estimular compra por impulso.",
  },
  {
    title: "Sorteio Premium do Mês",
    description:
      "Campanha de maior valor para reforçar percepção de prêmio forte e participação relevante.",
  },
  {
    title: "Leilão de Lote Especial",
    description:
      "Formato ideal para aumentar retorno ao site e fazer o usuário acompanhar a disputa mais vezes.",
  },
  {
    title: "Ranking de Compradores",
    description:
      "Estratégia para incentivar recorrência, volume de compra e competição entre participantes.",
  },
];

const beneficios = [
  "Pagamento rápido no PIX",
  "Mais campanhas para manter atenção",
  "Visual premium para aumentar confiança",
  "Prêmios com forte apelo popular",
  "Navegação simples no celular",
  "CTAs fortes em toda a jornada",
];

const depoimentos = [
  {
    name: "Carlos, Campinas/SP",
    text: "A página ficou muito mais clara. Entrei em uma campanha e acabei vendo outras também.",
  },
  {
    name: "Juliana, São Paulo/SP",
    text: "Gostei porque ficou fácil entender as modalidades e escolher onde participar primeiro.",
  },
  {
    name: "Rafael, Goiânia/GO",
    text: "O visual passa confiança e dá vontade de agir rápido antes de perder a oportunidade.",
  },
];

const faqs = [
  {
    question: "Como participo?",
    answer:
      "Você escolhe a modalidade, entra na campanha desejada e segue o fluxo disponível na oferta para confirmar sua participação.",
  },
  {
    question: "Qual modalidade costuma chamar mais atenção?",
    answer:
      "Rifas atraem entrada rápida, sorteios funcionam muito bem para campanhas simples e leilões aumentam retenção por disputa.",
  },
  {
    question: "Posso participar de mais de uma campanha?",
    answer:
      "Sim. A estrutura foi pensada exatamente para fazer o usuário navegar entre modalidades diferentes e encontrar mais oportunidades.",
  },
];

export default function HomePage() {
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
          padding: "56px 24px 34px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#f2d067",
              fontWeight: 900,
              letterSpacing: 1.2,
            }}
          >
            BIGODE DAS RIFAS
          </p>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 4.8rem)",
              lineHeight: 1.03,
              margin: "12px 0 18px",
              maxWidth: 780,
            }}
          >
            Escolha sua campanha agora e aumente suas chances antes que as
            melhores oportunidades acabem.
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
            Rifas, sorteios e leilões em um ambiente mais forte, mais direto e
            mais preparado para fazer o visitante agir rápido. Aqui o objetivo é
            simples: chamar atenção, manter o usuário navegando e transformar
            interesse em participação.
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
              href="/rifas"
              style={{
                background: "linear-gradient(135deg, #f7d978 0%, #d4a63a 100%)",
                color: "#111",
                textDecoration: "none",
                padding: "15px 22px",
                borderRadius: 16,
                fontWeight: 900,
                boxShadow: "0 14px 30px rgba(0,0,0,0.24)",
              }}
            >
              QUERO ENTRAR AGORA
            </Link>

            <Link
              href="/leiloes"
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
              Ver leilões premium
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 18,
            }}
          >
            {[
              "PIX imediato",
              "Campanhas fortes",
              "Mais retenção",
              "Compra rápida",
            ].map((item) => (
              <span
                key={item}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside
          style={{
            background:
              "linear-gradient(180deg, rgba(12,24,70,0.96), rgba(5,15,45,0.96))",
            border: "1px solid rgba(242,208,103,0.22)",
            borderRadius: 28,
            padding: 24,
            boxShadow: "0 20px 40px rgba(0,0,0,0.24)",
          }}
        >
          <p style={{ marginTop: 0, color: "#f2d067", fontWeight: 800 }}>
            CAMPANHA EM DESTAQUE
          </p>
          <h2 style={{ fontSize: 32, margin: "0 0 14px" }}>
            Moto 0km + bônus em PIX
          </h2>
          <p
            style={{
              margin: "0 0 18px",
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.7,
            }}
          >
            Oferta com forte apelo visual, ótima percepção de valor e excelente
            potencial para puxar o primeiro clique da home.
          </p>

          <div style={{ display: "grid", gap: 12 }}>
            {[
              ["Valor por número", "R$ 1,99"],
              ["Prêmio bônus", "PIX de R$ 5.000"],
              ["Modalidade", "Rifa em alta"],
              ["Status", "Entrada acelerada"],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <p style={{ margin: 0, color: "rgba(255,255,255,0.62)" }}>
                  {label}
                </p>
                <strong style={{ display: "block", marginTop: 6 }}>
                  {value}
                </strong>
              </div>
            ))}
          </div>

          <Link
            href="/rifas/moto-0km"
            style={{
              display: "block",
              marginTop: 18,
              textAlign: "center",
              textDecoration: "none",
              background: "#fff",
              color: "#111",
              borderRadius: 16,
              padding: "14px 18px",
              fontWeight: 900,
            }}
          >
            ESCOLHER NÚMEROS
          </Link>
        </aside>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
        }}
      >
        {categorias.map((item) => (
          <article
            key={item.title}
            style={{
              background:
                "linear-gradient(180deg, rgba(10,20,64,0.94), rgba(5,16,52,0.94))",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 14px 34px rgba(0,0,0,0.18)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 28 }}>{item.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
              {item.description}
            </p>
            <Link
              href={item.href}
              style={{
                display: "inline-block",
                marginTop: 10,
                color: "#f2d067",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              {item.cta}
            </Link>
          </article>
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
              PRÊMIOS QUE CHAMAM CLIQUE
            </p>
            <h2 style={{ margin: "8px 0 0", fontSize: 34 }}>
              Campanhas com valor percebido mais forte
            </h2>
          </div>

          <p style={{ margin: 0, color: "rgba(255,255,255,0.72)", maxWidth: 420 }}>
            Quanto mais desejo o prêmio gera, maior a chance do visitante
            continuar navegando e entrar em mais de uma campanha.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          {premios.map((item) => (
            <article
              key={item.title}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 24,
                padding: 22,
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
                {item.badge}
              </span>
              <h3 style={{ margin: "14px 0 10px", fontSize: 26 }}>
                {item.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.7,
                }}
              >
                {item.description}
              </p>
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
              "linear-gradient(135deg, rgba(247,217,120,0.15), rgba(8,22,66,0.95))",
            border: "1px solid rgba(242,208,103,0.25)",
            borderRadius: 28,
            padding: 28,
          }}
        >
          <p style={{ marginTop: 0, color: "#f2d067", fontWeight: 900 }}>
            O QUE MAIS RETÉM O USUÁRIO
          </p>
          <h2 style={{ fontSize: 34, margin: "0 0 16px" }}>
            Mais campanhas, mais formatos e mais motivos para continuar no site
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {campanhas.map((item) => (
              <div
                key={item.title}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 20,
                  padding: 18,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <strong style={{ display: "block", marginBottom: 8 }}>
                  {item.title}
                </strong>
                <p
                  style={{
                    margin: 0,
                    color: "rgba(255,255,255,0.8)",
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

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        <article
          style={{
            background:
              "linear-gradient(180deg, rgba(10,20,64,0.95), rgba(5,16,52,0.95))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: 24,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Por que essa estrutura vende mais</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {beneficios.map((item) => (
              <div
                key={item}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  padding: 14,
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article
          style={{
            background:
              "linear-gradient(180deg, rgba(10,20,64,0.95), rgba(5,16,52,0.95))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: 24,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Quem entra, tende a continuar</h2>
          <div style={{ display: "grid", gap: 14 }}>
            {depoimentos.map((item) => (
              <div
                key={item.name}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 18,
                  padding: 16,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <strong style={{ display: "block", marginBottom: 8 }}>
                  {item.name}
                </strong>
                <p
                  style={{
                    margin: 0,
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1.7,
                  }}
                >
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
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 28,
            padding: 28,
          }}
        >
          <p style={{ marginTop: 0, color: "#f2d067", fontWeight: 900 }}>
            FAQ
          </p>
          <h2 style={{ marginTop: 0, fontSize: 34 }}>
            Dúvidas frequentes sobre a plataforma
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
                <span
                  style={{
                    color: "rgba(255,255,255,0.76)",
                    lineHeight: 1.7,
                  }}
                >
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
            href="/rifas"
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
              boxShadow: "0 12px 26px rgba(0,0,0,0.25)",
            }}
          >
            QUERO ESCOLHER MINHA CAMPANHA AGORA
          </Link>
        </div>
      </div>
    </main>
  );
}