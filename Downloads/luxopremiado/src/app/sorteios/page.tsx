import type { Metadata } from "next";
import Link from "next/link";
import QuickAccessBar from "@/components/QuickAccessBar";

export const metadata: Metadata = {
  title: "Sorteios | Bigode das Rifas",
  description:
    "Campanhas promocionais com regulamento claro, prêmios atrativos e fluxo simples de participação.",
};

const sorteios = [
  {
    slug: "sorteio-1000-no-pix",
    titulo: "R$ 1.000 no Pix",
    premio: "Prêmio instantâneo em dinheiro",
    descricao:
      "Campanha promocional simples, direta e com excelente potencial de adesão.",
    participacao: "Participação rápida",
    status: "Aberto",
    destaque: "Alta adesão",
  },
  {
    slug: "sorteio-viagem-nordeste",
    titulo: "Viagem para o Nordeste",
    premio: "Experiência premium",
    descricao:
      "Sorteio aspiracional com excelente apelo emocional e forte capacidade de engajamento.",
    participacao: "Cadastro + elegibilidade",
    status: "Em destaque",
    destaque: "Prêmio premium",
  },
  {
    slug: "sorteio-iphone-15-pro",
    titulo: "iPhone 15 Pro",
    premio: "Prêmio desejado e popular",
    descricao:
      "Oferta de alto apelo para tráfego mobile e campanhas com forte decisão por impulso.",
    participacao: "Entrada simples",
    status: "Aquecendo",
    destaque: "Conversão forte",
  },
  {
    slug: "sorteio-ps5-tv",
    titulo: 'PlayStation 5 + TV 55"',
    premio: "Combo de alto valor percebido",
    descricao:
      "Campanha muito eficiente para segurar atenção e estimular participação rápida.",
    participacao: "Participação imediata",
    status: "Em alta",
    destaque: "Combo premium",
  },
];

const benefits = [
  {
    title: "Regulamento visível",
    description:
      "Cada campanha é apresentada com mais clareza, explicando prazo, critérios e participação.",
  },
  {
    title: "Prêmios valorizados",
    description:
      "O usuário entende com rapidez o valor da oferta e o que está em jogo na campanha.",
  },
  {
    title: "Participação simplificada",
    description:
      "Menos ruído visual e mais foco no que importa: entender e participar.",
  },
];

const testimonials = [
  {
    name: "Amanda P.",
    text: "A comunicação ficou muito mais clara. Agora entendo exatamente como participar.",
  },
  {
    name: "Ricardo L.",
    text: "Gostei do foco no prêmio e das regras resumidas de forma objetiva.",
  },
  {
    name: "Priscila N.",
    text: "Separar sorteios das rifas deixou tudo mais organizado e profissional.",
  },
];

const faqs = [
  {
    question: "Como participo do sorteio?",
    answer:
      "Cada campanha define sua própria mecânica, sempre apresentada com destaque e linguagem objetiva na página.",
  },
  {
    question: "Onde vejo as regras?",
    answer:
      "O regulamento e as informações principais do sorteio devem aparecer com clareza na campanha individual.",
  },
  {
    question: "Quando o resultado é divulgado?",
    answer:
      "Cada campanha informa seu cronograma e a forma de comunicação do resultado diretamente na página.",
  },
];

export default function SorteiosPage() {
  return (
    <main
      style={{
        background:
          "radial-gradient(circle at top, rgba(28,42,120,0.28), transparent 30%), linear-gradient(180deg, #04112f 0%, #071632 100%)",
        color: "#fff",
        minHeight: "100vh",
        paddingBottom: 110,
      }}
    >
      <QuickAccessBar />

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "40px 24px 28px",
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
          MODALIDADE
        </p>

        <h1
          style={{
            fontSize: "clamp(2.3rem, 5vw, 4.2rem)",
            lineHeight: 1.04,
            margin: "12px 0 16px",
          }}
        >
          Participe agora de sorteios confiáveis, com regras claras e acesso rápido
          ao fluxo real de participação.
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
          Esta página não pode ser só apresentação. Ela precisa ajudar o usuário
          a entender, confiar e chegar rápido à participação, à área do usuário e
          às campanhas principais.
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
            href="/app/comprar"
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
            PARTICIPAR AGORA
          </Link>

          <Link
            href="/area-do-usuario"
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
            ABRIR ÁREA DO USUÁRIO
          </Link>
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
        id="lista-sorteios"
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
              SORTEIOS DISPONÍVEIS
            </p>
            <h2 style={{ fontSize: 34, margin: 0 }}>
              Campanhas promocionais que chamam clique e participação
            </h2>
          </div>

          <p style={{ margin: 0, color: "rgba(255,255,255,0.72)" }}>
            Entre rápido no fluxo real e não deixe a página virar só vitrine.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {sorteios.map((sorteio) => (
            <article
              key={sorteio.slug}
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
                {sorteio.destaque}
              </div>

              <h3 style={{ margin: "0 0 10px", fontSize: 28 }}>
                {sorteio.titulo}
              </h3>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.65,
                }}
              >
                {sorteio.descricao}
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
                    Prêmio
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {sorteio.premio}
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
                    Participação
                  </p>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {sorteio.participacao}
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
                    {sorteio.status}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 8,
                }}
              >
                <Link
                  href={`/sorteios/${sorteio.slug}`}
                  style={{
                    display: "inline-block",
                    background: "#fff",
                    color: "#111",
                    textDecoration: "none",
                    padding: "12px 18px",
                    borderRadius: 14,
                    fontWeight: 800,
                  }}
                >
                  Abrir campanha
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
                  Participar
                </Link>
              </div>
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
            A percepção de quem já acompanha as campanhas
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
            background:
              "linear-gradient(180deg, rgba(10,20,64,0.95), rgba(5,16,52,0.95))",
            border: "1px solid rgba(242,208,103,0.22)",
            borderRadius: 28,
            padding: 28,
            boxShadow: "0 18px 42px rgba(0,0,0,0.24)",
          }}
        >
          <p style={{ color: "#f2d067", fontWeight: 800, marginTop: 0 }}>
            FAQ
          </p>
          <h2 style={{ fontSize: 32, marginTop: 0 }}>
            Dúvidas frequentes sobre os sorteios
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
            href="/app/comprar"
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
            QUERO PARTICIPAR AGORA
          </Link>
        </div>
      </div>
    </main>
  );
}