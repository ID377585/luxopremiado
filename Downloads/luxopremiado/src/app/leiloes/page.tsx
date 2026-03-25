import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Leilões | Bigode das Rifas",
  description:
    "Lotes premium com disputa ao vivo, visual sofisticado e páginas criadas para elevar desejo e retenção.",
};

const leiloes = [
  {
    slug: "carro-0km",
    titulo: "Carro 0km",
    descricao:
      "Lote premium com forte apelo emocional, alto valor percebido e grande capacidade de retenção.",
    lanceAtual: "R$ 48.500",
    status: "Ao vivo",
    observadores: "312 pessoas acompanhando",
    destaque: "Lote principal",
  },
  {
    slug: "moto-esportiva",
    titulo: "Moto esportiva",
    descricao:
      "Oferta com dinâmica intensa de disputa e ótima leitura visual para acompanhar a competição.",
    lanceAtual: "R$ 19.800",
    status: "Disputa quente",
    observadores: "187 pessoas acompanhando",
    destaque: "Alta atenção",
  },
  {
    slug: "jet-ski",
    titulo: "Jet Ski",
    descricao:
      "Item premium com grande força de atração para público que busca lotes mais exclusivos.",
    lanceAtual: "R$ 32.900",
    status: "Subindo",
    observadores: "141 pessoas acompanhando",
    destaque: "Exclusivo",
  },
];

const recursos = [
  {
    title: "Disputa ao vivo",
    description:
      "Sensação real de urgência e competição para manter o usuário acompanhando mais tempo.",
  },
  {
    title: "Lotes premium",
    description:
      "Itens com maior desejo e maior valor percebido para elevar atenção e retenção.",
  },
  {
    title: "Leitura clara",
    description:
      "Informação fácil de ver para reduzir dúvida e aumentar entrada na disputa.",
  },
];

const faqs = [
  {
    question: "Como entro em um leilão?",
    answer:
      "Você acessa o lote, acompanha o cenário atual da disputa e entra conforme a proposta daquela campanha.",
  },
  {
    question: "Como vejo se o lote está quente?",
    answer:
      "A página mostra status, interesse e movimento para comunicar melhor a força da disputa.",
  },
  {
    question: "Por que separar os leilões das rifas e sorteios?",
    answer:
      "Porque leilão pede outra experiência: mais tensão, mais acompanhamento e mais percepção de valor.",
  },
];

const depoimentos = [
  {
    name: "Marcelo T.",
    text: "O lote passa muito mais valor quando entra numa página própria. Dá vontade de acompanhar.",
  },
  {
    name: "Bruno A.",
    text: "A disputa fica mais envolvente. Não parece uma campanha comum, parece algo especial.",
  },
  {
    name: "Vanessa C.",
    text: "O visual ajuda a entender rápido o andamento e deixa a experiência mais premium.",
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
      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "56px 24px 28px",
        }}
      >
        <p style={{ margin: 0, color: "#f2d067", fontWeight: 900, letterSpacing: 1.2 }}>
          LEILÕES
        </p>

        <h1
          style={{
            fontSize: "clamp(2.3rem, 5vw, 4.4rem)",
            lineHeight: 1.04,
            margin: "12px 0 16px",
            maxWidth: 860,
          }}
        >
          Entre na disputa agora e tente levar lotes premium antes que outro usuário avance.
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
          Leilões funcionam melhor quando geram desejo, urgência e acompanhamento constante.
          Aqui a página foi pensada para valorizar o lote e intensificar a sensação de competição.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
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

          <a
            href="#lista-leiloes"
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
            Explorar lotes
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
              LOTES DISPONÍVEIS
            </p>
            <h2 style={{ fontSize: 34, margin: 0 }}>
              Itens que prendem atenção e elevam o desejo de disputa
            </h2>
          </div>

          <p style={{ margin: 0, color: "rgba(255,255,255,0.72)" }}>
            Quanto mais valioso o lote parece, maior a tendência do usuário continuar acompanhando.
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

              <h3 style={{ margin: "0 0 10px", fontSize: 28 }}>{leilao.titulo}</h3>

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
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.64)" }}>{label}</p>
                    <strong style={{ display: "block", marginTop: 6 }}>{value}</strong>
                  </div>
                ))}
              </div>

              <Link
                href={`/leiloes/${leilao.slug}`}
                style={{
                  display: "inline-block",
                  marginTop: 8,
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
          <p style={{ color: "#f2d067", fontWeight: 800, marginTop: 0 }}>PROVA SOCIAL</p>
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
                <strong style={{ display: "block", marginBottom: 8 }}>{item.name}</strong>
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
          <p style={{ color: "#f2d067", fontWeight: 800, marginTop: 0 }}>FAQ</p>
          <h2 style={{ fontSize: 32, marginTop: 0 }}>Dúvidas frequentes sobre os leilões</h2>

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
                <strong style={{ display: "block", marginBottom: 8 }}>{item.question}</strong>
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