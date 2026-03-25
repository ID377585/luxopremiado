import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import UrgencyBar from "@/components/UrgencyBar";
import RankingCard from "@/components/RankingCard";
import SocialProof from "@/components/SocialProof";

const rifas = {
  "moto-0km": {
    titulo: "Moto 0km",
    subtitulo:
      "Uma das campanhas mais fortes para atrair clique rápido, desejo imediato e participação recorrente.",
    preco: "R$ 1,99",
    premio: "Moto 0km + bônus de R$ 5.000 no PIX",
    numeros: "12.000 números",
    vendidos: "8.420",
    reservados: "311",
    destaque: "Mais procurada",
  },
  "iphone-pro-max": {
    titulo: "iPhone Pro Max",
    subtitulo:
      "Campanha com ótima performance no celular e excelente potencial de decisão por impulso.",
    preco: "R$ 1,49",
    premio: "iPhone Pro Max lacrado",
    numeros: "8.000 números",
    vendidos: "5.930",
    reservados: "204",
    destaque: "Alta conversão",
  },
  "pix-10-mil": {
    titulo: "PIX de R$ 10.000",
    subtitulo:
      "Prêmio direto, fácil de entender e muito eficiente para acelerar entrada de novos participantes.",
    preco: "R$ 0,99",
    premio: "R$ 10.000 no PIX",
    numeros: "15.000 números",
    vendidos: "10.880",
    reservados: "490",
    destaque: "Entrada fácil",
  },
  "tv-55-mais-ps5": {
    titulo: 'TV 55" + PlayStation 5',
    subtitulo:
      "Combo premium com valor percebido alto e excelente capacidade de retenção na página.",
    preco: "R$ 1,79",
    premio: 'TV 55" + PlayStation 5',
    numeros: "10.000 números",
    vendidos: "6.710",
    reservados: "275",
    destaque: "Prêmio combo",
  },
  "hb20-mais-pix": {
    titulo: "HB20 + PIX bônus",
    subtitulo:
      "Oferta forte para campanhas de destaque, com grande apelo visual e percepção elevada de valor.",
    preco: "R$ 2,49",
    premio: "HB20 + bônus de R$ 8.000 no PIX",
    numeros: "20.000 números",
    vendidos: "13.420",
    reservados: "590",
    destaque: "Super destaque",
  },
  "macbook-air": {
    titulo: "MacBook Air",
    subtitulo:
      "Campanha aspiracional com excelente apelo para público que busca prêmio premium.",
    preco: "R$ 1,69",
    premio: "MacBook Air",
    numeros: "9.000 números",
    vendidos: "4.980",
    reservados: "163",
    destaque: "Alta atenção",
  },
} as const;

type Slug = keyof typeof rifas;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = rifas[slug as Slug];

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

export default async function RifaDetalhePage({ params }: PageProps) {
  const { slug } = await params;
  const item = rifas[slug as Slug];

  if (!item) {
    notFound();
  }

  const pacotes = [
    { label: "10 números", price: "R$ 17,90" },
    { label: "25 números", price: "R$ 41,90" },
    { label: "60 números", price: "R$ 94,90" },
    { label: "120 números", price: "R$ 179,90" },
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
              soldText={`${item.vendidos} vendidos`}
              reservedText={`${item.reservados} reservados`}
              watchersText="muita gente acompanhando agora"
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
              ["Valor por número", item.preco],
              ["Total disponível", item.numeros],
              ["Vendidos", item.vendidos],
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
            href="#pacotes"
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
            ESCOLHER PACOTE AGORA
          </Link>
        </aside>
      </section>

      <section
        id="pacotes"
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
              PACOTES
            </p>
            <h2 style={{ margin: "8px 0 0", fontSize: 34 }}>
              Entre com mais força e aumente sua presença na campanha
            </h2>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          {pacotes.map((pack) => (
            <article
              key={pack.label}
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 22,
                padding: 22,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>{pack.label}</h3>
              <p style={{ fontSize: 30, fontWeight: 900, margin: "10px 0" }}>
                {pack.price}
              </p>
              <p style={{ color: "rgba(255,255,255,0.76)", lineHeight: 1.7, margin: 0 }}>
                Pacote pensado para elevar ticket, melhorar cobertura e aumentar
                participação de forma mais agressiva.
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
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        <RankingCard
          title="Ranking da campanha"
          subtitle="Quem entra com mais força costuma ganhar mais visibilidade e chamar mais atenção."
          items={[
            { name: "Carlos M.", value: "120 números" },
            { name: "Amanda R.", value: "60 números" },
            { name: "Juliano P.", value: "60 números" },
          ]}
        />

        <SocialProof
          title="Quem entra percebe valor"
          items={[
            {
              name: "Renata S.",
              text: "A campanha ficou muito mais clara e dá vontade de entrar com pacote maior.",
            },
            {
              name: "Diego A.",
              text: "O visual passa confiança e faz a oferta parecer mais forte.",
            },
            {
              name: "Marcos T.",
              text: "A sensação é de oportunidade real, não de página genérica.",
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
            href="#pacotes"
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