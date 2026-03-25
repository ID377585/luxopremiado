import type { Metadata } from "next";
import Link from "next/link";
import QuickAccessBar from "@/components/QuickAccessBar";

export const metadata: Metadata = {
  title: "Leilões | Bigode das Rifas",
  description:
    "Leilões com lotes premium, disputa intensa, percepção de valor elevada e experiência pensada para retenção.",
};

const leiloes = [
  {
    slug: "carro-0km",
    titulo: "Carro 0km",
    descricao:
      "Lote premium com grande apelo visual, excelente percepção de valor e forte potencial de disputa.",
    lanceAtual: "R$ 48.500",
    status: "Ao vivo",
    observadores: "312 pessoas acompanhando",
    destaque: "Lote principal",
  },
  {
    slug: "moto-esportiva",
    titulo: "Moto esportiva",
    descricao:
      "Leilão com forte apelo emocional, ótima retenção e excelente desempenho em páginas de alto impacto.",
    lanceAtual: "R$ 19.800",
    status: "Disputa quente",
    observadores: "187 pessoas acompanhando",
    destaque: "Alta atenção",
  },
  {
    slug: "jet-ski",
    titulo: "Jet Ski",
    descricao:
      "Item aspiracional com grande apelo para público que busca experiências premium e lotes exclusivos.",
    lanceAtual: "R$ 32.900",
    status: "Subindo",
    observadores: "141 pessoas acompanhando",
    destaque: "Exclusivo",
  },
  {
    slug: "hilux-blindada",
    titulo: "Hilux blindada",
    descricao:
      "Lote de altíssimo impacto para chamar atenção, elevar desejo e aumentar acompanhamento da disputa.",
    lanceAtual: "R$ 118.000",
    status: "Em destaque",
    observadores: "426 pessoas acompanhando",
    destaque: "Super lote",
  },
];

const recursos = [
  {
    title: "Disputa ao vivo",
    description:
      "A página valoriza o movimento do lote e reforça a sensação de competição em tempo real.",
  },
  {
    title: "Lotes premium",
    description:
      "Itens mais fortes pedem uma experiência própria para elevar valor percebido e retenção.",
  },
  {
    title: "Leitura clara",
    description:
      "Informações rápidas de entender para o usuário entrar na disputa sem travar.",
  },
];

const depoimentos = [
  {
    name: "Marcelo T.",
    text: "A página de leilão ficou muito mais forte. Dá vontade de acompanhar o lote até o fim.",
  },
  {
    name: "Bruno A.",
    text: "A disputa fica mais envolvente quando o lote ganha uma apresentação própria.",
  },
  {
    name: "Vanessa C.",
    text: "O visual ajuda a perceber valor e deixa a experiência bem mais premium.",
  },
];

const faqs = [
  {
    question: "Como entro em um leilão?",
    answer:
      "Você acessa o lote, acompanha o momento da disputa e entra conforme a dinâmica disponível naquela campanha.",
  },
  {
    question: "Como sei se o lote está disputado?",
    answer:
      "A página destaca status, interesse e movimento do lote para comunicar melhor a intensidade da disputa.",
  },
  {
    question: "Por que separar leilões das outras modalidades?",
    answer:
      "Porque leilão exige mais tensão, mais acompanhamento e mais percepção de valor do item.",
  },
];

export default function LeiloesPage() {
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
        chooseHref="/r/bigode-das-rifas#premio"
        userHref="/r/bigode-das-rifas#painel"
        vipHref="/vip"
      />

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "40px 24px 28px",
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
          LEILÕES
        </p>

        <h1
          style={{
            fontSize: "clamp(2.3rem, 5vw, 4.4rem)",
            lineHeight: 1.04,
            margin: "12px 0 16px",
            maxWidth: 900,
          }}
        >
          Entre na disputa agora e mantenha acesso fácil ao lote, ao painel e às
          outras campanhas.
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: 860,
            color: "rgba(255,255,255,0.82)",
            fontSize: 18,
            lineHeight: 1.75,
          }}
        >
          A área de leilões precisa ser premium, mas não pode esconder o fluxo
          real. O usuário precisa encontrar rápido o lote, a disputa e a área
          do usuário sem ficar perdido.
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
            href="/leiloes/carro-0km"
            style={{
              background: "linear-gradient(135deg, #f7d978 0%, #d4a63a 100%)",
              color: "#111",
              textDecoration: "none",
              padding: "15px 22px",
              borderRadius: 16,
              fontWeight: 900,
            }}
          >
            Ver lote em destaque
          </Link>

          <Link
            href="/r/bigode-das-rifas#painel"
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
            Abrir área do usuário
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
        {recursos.map((item) => (
          <article
            key={item.title}
            style={{
              background:
                "linear-gradient(180deg, rgba(13,25,74,0.92), rgba(6,18,58,0.92))",
              border: "1px solid rgba(242,208,103,0.20)",
              borderRadius: 24,
              padding: 24,
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
        id="lista-leiloes"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "8px 24px 28px",
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
              LOTES DISPONÍVEIS
            </p>
            <h2 style={{ margin: "8px 0 0", fontSize: 34 }}>
              Itens que elevam desejo e fazem o usuário acompanhar mais
            </h2>
          </div>

          <p style={{ margin: 0, color: "rgba(255,255,255,0.72)", maxWidth: 420 }}>
            Quanto maior o valor percebido do lote, maior a tendência de
            permanência e disputa.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {leiloes.map((leilao) => (
            <article
              key={leilao.slug}
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,20,64,0.95), rgba(5,16,52,0.95))",
                border: "1px solid rgba(242,208,103,0.22)",
                borderRadius: 26,
                padding: 24,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "7px 11px",
                  borderRadius: 999,
                  background: "rgba(242,208,103,0.12)",
                  border: "1px solid rgba(242,208,103,0.24)",
                  color: "#f2d067",
                  fontSize: 13,
                  fontWeight: 800,
                  marginBottom: 14,
                }}
              >
                {leilao.destaque}
              </div>

              <h3 style={{ margin: "0 0 10px", fontSize: 28 }}>
                {leilao.titulo}
              </h3>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.65,
                }}
              >
                {leilao.descricao}
              </p>

              <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                {[
                  ["Lance atual", leilao.lanceAtual],
                  ["Status", leilao.status],
                  ["Interesse", leilao.observadores],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 18,
                      padding: 14,
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.64)" }}>
                      {label}
                    </p>
                    <strong style={{ display: "block", marginTop: 6 }}>
                      {value}
                    </strong>
                  </div>
                ))}
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
                  href={`/leiloes/${leilao.slug}`}
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
                  Abrir lote
                </Link>

                <Link
                  href="/r/bigode-das-rifas#painel"
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
                  Área do usuário
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
          }}
        >
          <p style={{ color: "#f2d067", fontWeight: 800, marginTop: 0 }}>
            PROVA SOCIAL
          </p>
          <h2 style={{ fontSize: 32, marginTop: 0 }}>
            Como os usuários percebem a experiência dos leilões
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {depoimentos.map((item) => (
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
          }}
        >
          <p style={{ color: "#f2d067", fontWeight: 800, marginTop: 0 }}>
            FAQ
          </p>
          <h2 style={{ fontSize: 32, marginTop: 0 }}>
            Dúvidas frequentes sobre os leilões
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
            href="/leiloes/carro-0km"
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
            QUERO ENTRAR NO LEILÃO AGORA
          </Link>
        </div>
      </div>
    </main>
  );
}