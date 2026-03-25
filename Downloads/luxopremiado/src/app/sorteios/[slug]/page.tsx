import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import UrgencyBar from "@/components/UrgencyBar";
import RankingCard from "@/components/RankingCard";
import SocialProof from "@/components/SocialProof";

const sorteios = {
  "sorteio-1000-no-pix": {
    titulo: "R$ 1.000 no Pix",
    subtitulo:
      "Campanha simples, direta e muito forte para gerar entrada rápida com baixo atrito.",
    premio: "R$ 1.000 no PIX",
    status: "Aberto",
    participacao: "Participação rápida",
    destaque: "Alta adesão",
  },
  "sorteio-viagem-nordeste": {
    titulo: "Viagem para o Nordeste",
    subtitulo:
      "Sorteio aspiracional com forte apelo emocional e ótima retenção de atenção.",
    premio: "Viagem premium",
    status: "Em destaque",
    participacao: "Cadastro + elegibilidade",
    destaque: "Prêmio premium",
  },
  "sorteio-iphone-15-pro": {
    titulo: "iPhone 15 Pro",
    subtitulo:
      "Prêmio com altíssimo apelo para tráfego mobile e campanhas rápidas.",
    premio: "iPhone 15 Pro",
    status: "Aquecendo",
    participacao: "Entrada simples",
    destaque: "Conversão forte",
  },
  "sorteio-ps5-tv": {
    titulo: 'PlayStation 5 + TV 55"',
    subtitulo:
      "Combo que aumenta valor percebido e chama atenção com muito mais força.",
    premio: 'PlayStation 5 + TV 55"',
    status: "Em alta",
    participacao: "Participação imediata",
    destaque: "Combo premium",
  },
} as const;

type Slug = keyof typeof sorteios;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = sorteios[slug as Slug];

  if (!item) {
    return {
      title: "Campanha não encontrada | Bigode das Rifas",
    };
  }

  return {
    title: `${item.titulo} | Bigode das Rifas`,
    description: item.subtitulo,
  };
}

export default async function SorteioDetalhePage({ params }: PageProps) {
  const { slug } = await params;
  const item = sorteios[slug as Slug];

  if (!item) {
    notFound();
  }

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
              soldText="campanha recebendo muita atenção"
              reservedText="participações acontecendo agora"
              watchersText="forte movimento na página"
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
          <h2 style={{ marginTop: 0, fontSize: 28 }}>Resumo da campanha</h2>

          <div style={{ display: "grid", gap: 12 }}>
            {[
              ["Prêmio", item.premio],
              ["Status", item.status],
              ["Participação", item.participacao],
              ["Destaque", item.destaque],
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
                <strong style={{ display: "block", marginTop: 6 }}>{value}</strong>
              </div>
            ))}
          </div>

          <Link
            href="#participar"
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
            PARTICIPAR AGORA
          </Link>
        </aside>
      </section>

      <section
        id="participar"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
        }}
      >
        {[
          {
            title: "Entenda rápido",
            text: "A campanha é explicada de forma simples para reduzir dúvida e acelerar decisão.",
          },
          {
            title: "Veja o valor",
            text: "O prêmio é apresentado com clareza para elevar percepção de vantagem.",
          },
          {
            title: "Entre agora",
            text: "A estrutura da página foi pensada para levar o usuário à ação com menos atrito.",
          },
        ].map((item) => (
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
            <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7, margin: 0 }}>
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
          title="Campanhas mais quentes"
          subtitle="Quem navega por uma oferta forte tende a continuar vendo outras campanhas da plataforma."
          items={[
            { name: "iPhone 15 Pro", value: "alta procura" },
            { name: "R$ 1.000 no Pix", value: "entrada rápida" },
            { name: 'PlayStation 5 + TV 55"', value: "valor percebido alto" },
          ]}
        />

        <SocialProof
          title="A campanha passa confiança"
          items={[
            {
              name: "Amanda P.",
              text: "Agora ficou muito mais fácil entender a oferta e participar sem confusão.",
            },
            {
              name: "Ricardo L.",
              text: "A campanha ficou mais clara e mais forte visualmente.",
            },
            {
              name: "Priscila N.",
              text: "Separar sorteios das rifas deixou tudo mais organizado e convincente.",
            },
          ]}
        />
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
            href="#participar"
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
            QUERO PARTICIPAR DESTA CAMPANHA
          </Link>
        </div>
      </div>
    </main>
  );
}