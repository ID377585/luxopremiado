import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllRaffleSlugs, getRaffleContent } from "@/lib/raffles-content";
import { getSiteUrl } from "@/lib/env";

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "suporte@bigodedasrifas.com";

const ORGANIZER_NAME =
  process.env.NEXT_PUBLIC_ORGANIZER_NAME ?? "Bigode das Rifas";

const ORGANIZER_CNPJ = process.env.NEXT_PUBLIC_ORGANIZER_CNPJ ?? "";

const SITE_URL = getSiteUrl();
const DEFAULT_OG_IMAGE = "/images/og/bigode-das-rifas-og.jpg";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const raffle = getRaffleContent(slug);

  if (!raffle) {
    return {
      title: "Rifa não encontrada | Bigode das Rifas",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalPath = `/rifas/${raffle.slug}`;

  return {
    title: raffle.seoTitle,
    description: raffle.seoDescription,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: raffle.seoTitle,
      description: raffle.seoDescription,
      type: "website",
      locale: "pt_BR",
      url: `${SITE_URL}${canonicalPath}`,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: raffle.seoTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: raffle.seoTitle,
      description: raffle.seoDescription,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export async function generateStaticParams() {
  return getAllRaffleSlugs().map((slug) => ({ slug }));
}

export const revalidate = 300;

export default async function RifaDetalhePage({ params }: PageProps) {
  const { slug } = await params;
  const raffle = getRaffleContent(slug);

  if (!raffle) {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(28,42,120,0.22), transparent 28%), linear-gradient(180deg, #04112f 0%, #071632 100%)",
        color: "#fff",
      }}
    >
      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "36px 24px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <Link href="/rifas" style={topLinkStyle}>
            Voltar para rifas
          </Link>
          <a href="#premio" style={topLinkStyle}>
            Prêmio
          </a>
          <a href="#pacotes" style={topLinkStyle}>
            Pacotes
          </a>
          <a href="#depoimentos" style={topLinkStyle}>
            Depoimentos
          </a>
          <a href="#faq" style={topLinkStyle}>
            FAQ
          </a>
          <a href="#transparencia" style={topLinkStyle}>
            Transparência
          </a>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div>
            <p style={eyebrowStyle}>{raffle.heroBadge}</p>

            <h1
              style={{
                margin: "8px 0 12px",
                fontSize: "clamp(2.2rem, 5vw, 4.4rem)",
                lineHeight: 1.02,
              }}
            >
              {raffle.heroTitle}
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
              {raffle.heroDescription}
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              {raffle.trustPills.map((pill) => (
                <span key={pill} style={pillStyle}>
                  {pill}
                </span>
              ))}
            </div>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                color: "rgba(255,255,255,0.92)",
                fontWeight: 700,
              }}
            >
              <span>Sorteio: {raffle.drawDateLabel}</span>
              <span>{raffle.pricePerNumber} por número</span>
              <span>{raffle.totalNumbers}</span>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 22,
              }}
            >
              <a href="#pacotes" style={primaryButtonStyle}>
                ESCOLHER NÚMEROS AGORA
              </a>

              <Link href="/login" style={secondaryButtonStyle}>
                ENTRAR NO PAINEL
              </Link>
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
              {raffle.highlights.map((item) => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section
        id="premio"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "8px 24px 28px",
        }}
      >
        <p style={eyebrowStyle}>PRÊMIO PRINCIPAL</p>

        <h2 style={{ margin: "8px 0 16px", fontSize: 34 }}>
          {raffle.mainPrizeTitle}
        </h2>

        <p
          style={{
            margin: "0 0 18px",
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.7,
            maxWidth: 860,
          }}
        >
          {raffle.mainPrizeDescription}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          <MetricCard label="Prêmio principal" value={raffle.mainPrizeTitle} />
          <MetricCard label="Valor por número" value={raffle.pricePerNumber} />
          <MetricCard label="Sorteio" value={raffle.drawDateLabel} />
          <MetricCard label="Disponibilidade" value={raffle.totalNumbers} />
          <MetricCard label="Valor percebido" value={raffle.prizeValueLabel} />
          <MetricCard label="Entrega" value={raffle.deliveryLabel} />
          <MetricCard label="Regras" value={raffle.regulationLabel} />
          <MetricCard label="Suporte" value={raffle.supportLabel} />
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {raffle.secondaryPrizes.map((item) => (
            <article key={item} style={cardStyle}>
              <p style={eyebrowMiniStyle}>DESTAQUE</p>
              <h3 style={{ margin: "8px 0 0", fontSize: 22 }}>{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section
        id="pacotes"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "8px 24px 28px",
        }}
      >
        <p style={eyebrowStyle}>PACOTES</p>

        <h2 style={{ margin: "8px 0 18px", fontSize: 34 }}>
          Escolha o pacote que combina com sua estratégia
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 18,
          }}
        >
          {raffle.packages.map((pack) => (
            <article key={pack.title} style={cardStyle}>
              {pack.badge ? <span style={badgeStyle}>{pack.badge}</span> : null}

              <h3 style={{ margin: "12px 0 10px", fontSize: 24 }}>
                {pack.title}
              </h3>

              <p style={{ margin: "0 0 8px", color: "rgba(255,255,255,0.78)" }}>
                {pack.quantity} números
              </p>

              <p
                style={{
                  margin: 0,
                  textDecoration: "line-through",
                  opacity: 0.6,
                }}
              >
                {pack.originalPrice}
              </p>

              <p style={{ margin: "8px 0 4px", fontSize: 30, fontWeight: 900 }}>
                {pack.price}
              </p>

              <p style={{ margin: 0, color: "#f2d067", fontWeight: 800 }}>
                Economia de {pack.discount}
              </p>

              <p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.78)" }}>
                {pack.unitPrice} por número
              </p>

              <p
                style={{
                  margin: "12px 0 0",
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.7,
                }}
              >
                {pack.description}
              </p>

              <Link href="/login" style={{ ...primaryButtonStyle, marginTop: 18 }}>
                {pack.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        id="depoimentos"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "8px 24px 28px",
        }}
      >
        <p style={eyebrowStyle}>PROVA SOCIAL</p>

        <h2 style={{ margin: "8px 0 18px", fontSize: 34 }}>
          Quem vê valor, participa
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {raffle.testimonials.map((item) => (
            <article key={`${item.title}-${item.author}`} style={cardStyle}>
              <h3 style={{ margin: "0 0 10px", fontSize: 20 }}>{item.title}</h3>

              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: 1.7,
                }}
              >
                {item.text}
              </p>

              <p
                style={{
                  margin: "12px 0 0",
                  color: "#f2d067",
                  fontWeight: 800,
                }}
              >
                {item.author}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="faq"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "8px 24px 28px",
        }}
      >
        <p style={eyebrowStyle}>FAQ</p>

        <h2 style={{ margin: "8px 0 18px", fontSize: 34 }}>Dúvidas rápidas</h2>

        <div style={{ display: "grid", gap: 14 }}>
          {raffle.faq.map((item) => (
            <article key={item.question} style={cardStyle}>
              <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>
                {item.question}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: 1.7,
                }}
              >
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="transparencia"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "8px 24px 28px",
        }}
      >
        <p style={eyebrowStyle}>TRANSPARÊNCIA</p>

        <h2 style={{ margin: "8px 0 18px", fontSize: 34 }}>
          Informações da campanha
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <MetricCard label="Organizador" value={ORGANIZER_NAME} />
          <MetricCard label="Contato" value={SUPPORT_EMAIL} />
          <MetricCard label="Regulamento" value={raffle.regulationLabel} />
          <MetricCard label="Atendimento" value={raffle.supportLabel} />
          {ORGANIZER_CNPJ ? (
            <MetricCard label="CNPJ" value={ORGANIZER_CNPJ} />
          ) : null}
        </div>
      </section>

      <section
        id="checkout"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "8px 24px 56px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(247,217,120,0.16), rgba(10,20,64,0.94))",
            border: "1px solid rgba(242,208,103,0.28)",
            borderRadius: 28,
            padding: 28,
            display: "grid",
            gap: 14,
          }}
        >
          <p style={{ margin: 0, color: "#f2d067", fontWeight: 900 }}>
            CTA FINAL
          </p>

          <h2 style={{ margin: 0, fontSize: 34 }}>
            Garanta agora sua participação em {raffle.title}
          </h2>

          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.7,
              maxWidth: 860,
            }}
          >
            Escolha o pacote, avance para o pagamento e acompanhe tudo pelo seu
            painel. O foco aqui é reduzir atrito e facilitar sua entrada na
            campanha.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 8,
            }}
          >
            <Link href="/login" style={primaryButtonStyle}>
              ENTRAR E COMPRAR AGORA
            </Link>
            <a href="#pacotes" style={secondaryButtonStyle}>
              REVER PACOTES
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article style={cardStyle}>
      <p style={{ margin: 0, color: "rgba(255,255,255,0.62)" }}>{label}</p>
      <strong style={{ display: "block", marginTop: 8, lineHeight: 1.5 }}>
        {value}
      </strong>
    </article>
  );
}

const topLinkStyle: React.CSSProperties = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: 700,
  padding: "10px 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#f2d067",
  fontWeight: 900,
  letterSpacing: 0.8,
};

const eyebrowMiniStyle: React.CSSProperties = {
  margin: 0,
  color: "#f2d067",
  fontWeight: 900,
  fontSize: 13,
  letterSpacing: 0.6,
};

const pillStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(242,208,103,0.10)",
  border: "1px solid rgba(242,208,103,0.18)",
  color: "#f2d067",
  fontWeight: 800,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(242,208,103,0.12)",
  border: "1px solid rgba(242,208,103,0.24)",
  color: "#f2d067",
  fontWeight: 800,
  fontSize: 12,
};

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  textAlign: "center",
  background: "linear-gradient(135deg, #f7d978 0%, #d4a63a 100%)",
  color: "#111",
  padding: "14px 18px",
  borderRadius: 16,
  fontWeight: 900,
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  textAlign: "center",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  padding: "14px 18px",
  borderRadius: 16,
  fontWeight: 800,
  border: "1px solid rgba(255,255,255,0.10)",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  borderRadius: 22,
  padding: 20,
  border: "1px solid rgba(255,255,255,0.08)",
};