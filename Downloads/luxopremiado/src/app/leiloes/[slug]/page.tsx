import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import UrgencyBar from "@/components/UrgencyBar";
import RankingCard from "@/components/RankingCard";
import SocialProof from "@/components/SocialProof";
import CountdownCard from "@/components/CountdownCard";

const leiloes = {
  "carro-0km": {
    titulo: "Carro 0km",
    subtitulo:
      "Lote premium com grande apelo visual, excelente percepção de valor e forte potencial de disputa.",
    lanceAtual: "R$ 48.500",
    lanceMinimo: "R$ 500",
    encerramento: "Hoje às 22:30",
    tempoRestante: "01h 42m 18s",
    status: "Ao vivo",
    observadores: "312 pessoas acompanhando",
    destaque: "Lote principal",
    descricaoLonga:
      "Este é um dos lotes mais fortes da plataforma para gerar retenção, desejo e acompanhamento constante. A combinação entre alto valor percebido, disputa em tempo real e apelo aspiracional faz com que o usuário permaneça mais tempo na página e volte várias vezes para acompanhar a evolução dos lances.",
    especificacoes: [
      "Lote com forte apelo visual e alta percepção de valor",
      "Excelente potencial de retenção em páginas premium",
      "Disputa ao vivo com foco em urgência e competição",
      "Ideal para chamar atenção logo no primeiro acesso",
    ],
  },
  "moto-esportiva": {
    titulo: "Moto esportiva",
    subtitulo:
      "Leilão com forte apelo emocional, ótima retenção e excelente desempenho em páginas de alto impacto.",
    lanceAtual: "R$ 19.800",
    lanceMinimo: "R$ 250",
    encerramento: "Hoje às 21:10",
    tempoRestante: "00h 58m 42s",
    status: "Disputa quente",
    observadores: "187 pessoas acompanhando",
    destaque: "Alta atenção",
    descricaoLonga:
      "A moto esportiva funciona muito bem como lote premium porque ativa desejo imediato, competitividade e sensação de conquista. É uma campanha ideal para manter a atenção do visitante por mais tempo e aumentar a frequência de retorno à página.",
    especificacoes: [
      "Alto apelo emocional e excelente potencial de clique",
      "Leitura visual clara para acompanhar a disputa",
      "Formato ideal para competição mais intensa",
      "Ótimo lote para valorizar a área de leilões",
    ],
  },
  "jet-ski": {
    titulo: "Jet Ski",
    subtitulo:
      "Item aspiracional com grande apelo para público que busca experiências premium e lotes exclusivos.",
    lanceAtual: "R$ 32.900",
    lanceMinimo: "R$ 350",
    encerramento: "Amanhã às 20:40",
    tempoRestante: "18h 11m 25s",
    status: "Subindo",
    observadores: "141 pessoas acompanhando",
    destaque: "Exclusivo",
    descricaoLonga:
      "O Jet Ski é um lote pensado para reforçar exclusividade, desejo e valor percebido. Ele ajuda a diferenciar a área de leilões das demais modalidades e cria uma experiência mais premium para quem busca algo fora do comum.",
    especificacoes: [
      "Lote aspiracional com proposta premium",
      "Excelente para elevar percepção da categoria leilões",
      "Boa capacidade de retenção em campanhas exclusivas",
      "Disputa com foco em desejo e diferenciação",
    ],
  },
  "hilux-blindada": {
    titulo: "Hilux blindada",
    subtitulo:
      "Lote de altíssimo impacto para chamar atenção, elevar desejo e aumentar acompanhamento da disputa.",
    lanceAtual: "R$ 118.000",
    lanceMinimo: "R$ 1.000",
    encerramento: "Hoje às 23:15",
    tempoRestante: "02h 27m 09s",
    status: "Em destaque",
    observadores: "426 pessoas acompanhando",
    destaque: "Super lote",
    descricaoLonga:
      "A Hilux blindada é um lote de altíssimo impacto visual e comercial. Ela serve para ancorar valor no site, gerar desejo imediato e aumentar muito a percepção de que a área de leilões possui itens realmente relevantes. É um lote ideal para picos de atenção, retorno e permanência.",
    especificacoes: [
      "Super lote com forte ancoragem de valor",
      "Grande capacidade de retenção e retorno do usuário",
      "Perfeito para páginas com proposta premium",
      "Disputa intensa e alto interesse visual",
    ],
  },
} as const;

type Slug = keyof typeof leiloes;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = leiloes[slug as Slug];

  if (!item) {
    return {
      title: "Lote não encontrado | Bigode das Rifas",
    };
  }

  return {
    title: `${item.titulo} | Leilões | Bigode das Rifas`,
    description: item.subtitulo,
  };
}

export default async function LeilaoDetalhePage({ params }: PageProps) {
  const { slug } = await params;
  const item = leiloes[slug as Slug];

  if (!item) {
    notFound();
  }

  const historicoLances = [
    { name: "Carlos M.", value: "R$ 117.000" },
    { name: "Amanda R.", value: "R$ 117.500" },
    { name: "Bruno A.", value: item.lanceAtual },
  ];

  const sugestoes = [
    { label: "Lance mínimo", value: item.lanceMinimo },
    { label: "Lance competitivo", value: "R$ 1.500" },
    { label: "Lance agressivo", value: "R$ 3.000" },
  ];

  const motivos = [
    {
      title: "Mais desejo",
      text: "Lotes premium elevam a percepção de valor e fazem o usuário acompanhar a disputa com mais atenção.",
    },
    {
      title: "Mais retenção",
      text: "Quando a disputa parece real e visualmente forte, a chance do usuário voltar mais vezes aumenta.",
    },
    {
      title: "Mais competição",
      text: "O formato de leilão funciona melhor quando comunica urgência, movimento e oportunidade.",
    },
  ];

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
          padding: "56px 24px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div>
          <p style={{ margin: 0, color: "#f2d067", fontWeight: 900 }}>
            {item.destaque}
          </p>

          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 4rem)",
              lineHeight: 1.05,
              margin: "10px 0 14px",
            }}
          >
            {item.titulo}
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
            {item.subtitulo}
          </p>

          <div style={{ marginTop: 18 }}>
            <UrgencyBar
              soldText={item.status}
              reservedText={item.observadores}
              watchersText={`encerra ${item.encerramento.toLowerCase()}`}
            />
          </div>
        </div>

        <aside
          style={{
            background:
              "linear-gradient(180deg, rgba(12,24,70,0.96), rgba(5,15,45,0.96))",
            border: "1px solid rgba(242,208,103,0.22)",
            borderRadius: 28,
            padding: 24,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 28 }}>Resumo do lote</h2>

          <div style={{ display: "grid", gap: 12 }}>
            {[
              ["Lance atual", item.lanceAtual],
              ["Lance mínimo", item.lanceMinimo],
              ["Encerramento", item.encerramento],
              ["Status", item.status],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 18,
                  padding: 14,
                  border: "1px solid rgba(255,255,255,0.07)",
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
            href="#dar-lance"
            style={{
              display: "block",
              marginTop: 18,
              textAlign: "center",
              textDecoration: "none",
              background: "linear-gradient(135deg, #f7d978 0%, #d4a63a 100%)",
              color: "#111",
              borderRadius: 16,
              padding: "14px 18px",
              fontWeight: 900,
            }}
          >
            QUERO ENTRAR NA DISPUTA
          </Link>
        </aside>
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
        <CountdownCard
          title="Este lote está quase virando"
          timeLeft={item.tempoRestante}
          subtitle="Em leilão, tempo e atenção trabalham juntos. Quanto mais o cronômetro avança, maior a chance de outro participante subir o lance antes de você."
        />

        <article
          id="dar-lance"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,20,64,0.95), rgba(5,16,52,0.95))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: 24,
          }}
        >
          <p style={{ marginTop: 0, color: "#f2d067", fontWeight: 900 }}>
            SUGESTÕES DE LANCE
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: 30 }}>
            Entre com estratégia e aumente sua presença na disputa
          </h2>

          <div style={{ display: "grid", gap: 12 }}>
            {sugestoes.map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  padding: "14px 16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <strong>{item.label}</strong>
                <span style={{ color: "#f2d067", fontWeight: 900 }}>
                  {item.value}
                </span>
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
        }}
      >
        <article
          style={{
            background:
              "linear-gradient(180deg, rgba(10,20,64,0.95), rgba(5,16,52,0.95))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 28,
            padding: 28,
          }}
        >
          <p style={{ marginTop: 0, color: "#f2d067", fontWeight: 900 }}>
            SOBRE O LOTE
          </p>
          <h2 style={{ marginTop: 0, fontSize: 34 }}>
            Um lote feito para gerar desejo e acompanhar cada lance com atenção
          </h2>

          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.8,
              maxWidth: 980,
            }}
          >
            {item.descricaoLonga}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              marginTop: 22,
            }}
          >
            {item.especificacoes.map((spec) => (
              <div
                key={spec}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 18,
                  padding: 16,
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {spec}
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
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
        }}
      >
        {motivos.map((item) => (
          <article
            key={item.title}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 22,
              padding: 22,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>{item.title}</h3>
            <p
              style={{
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {item.text}
            </p>
          </article>
        ))}
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
        <RankingCard
          title="Últimos lances"
          subtitle="O histórico ajuda a comunicar movimento, aquecer a disputa e aumentar a sensação de urgência."
          items={historicoLances}
        />

        <SocialProof
          title="A disputa parece real e valiosa"
          items={[
            {
              name: "Marcelo T.",
              text: "O lote ficou muito mais forte visualmente e dá vontade de acompanhar até o final.",
            },
            {
              name: "Bruno A.",
              text: "A leitura dos lances ficou clara e a disputa parece muito mais envolvente.",
            },
            {
              name: "Vanessa C.",
              text: "A página transmite valor e deixa o leilão com cara de oportunidade premium.",
            },
          ]}
        />
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
              "linear-gradient(135deg, rgba(247,217,120,0.18), rgba(10,20,64,0.94))",
            border: "1px solid rgba(242,208,103,0.28)",
            borderRadius: 28,
            padding: 28,
          }}
        >
          <p style={{ color: "#f2d067", fontWeight: 900, marginTop: 0 }}>
            PRÓXIMO PASSO
          </p>
          <h2 style={{ marginTop: 0, fontSize: 34 }}>
            Entre agora antes que outro participante avance no lote
          </h2>

          <p
            style={{
              margin: "0 0 18px",
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.8,
              maxWidth: 900,
            }}
          >
            Em leilão, decisão lenta custa caro. Quanto mais o lote chama
            atenção, maior a chance de outro usuário agir primeiro. Se esse item
            faz sentido para você, o melhor momento para entrar na disputa é
            agora.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="#dar-lance"
              style={{
                textDecoration: "none",
                background: "#fff",
                color: "#111",
                padding: "14px 20px",
                borderRadius: 14,
                fontWeight: 900,
              }}
            >
              DAR LANCE AGORA
            </Link>

            <Link
              href="/leiloes"
              style={{
                textDecoration: "none",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                padding: "14px 20px",
                borderRadius: 14,
                fontWeight: 800,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              VER OUTROS LOTES
            </Link>
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
            href="#dar-lance"
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
            QUERO ENTRAR NA DISPUTA AGORA
          </Link>
        </div>
      </div>
    </main>
  );
}