import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const CAMPAIGN_SLUG = "bigode-das-rifas";
const LEGACY_ALIASES = new Set(["luxo-premiado"]);

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "suporte@bigodedasrifas.com";

const ORGANIZER_NAME =
  process.env.NEXT_PUBLIC_ORGANIZER_NAME ?? "Bigode das Rifas";

const ORGANIZER_CNPJ = process.env.NEXT_PUBLIC_ORGANIZER_CNPJ ?? "";

const campaign = {
  slug: CAMPAIGN_SLUG,
  title: "Bigode das Rifas",
  heroTitle: "SUA CHANCE DE OURO COMEÇA AQUI.",
  heroDescription:
    "Escolha seus números, pague no PIX e acompanhe tudo com transparência. Compra rápida, confirmação automática e sorteio auditável.",
  drawDateLabel: "30/04/2026 às 19:00",
  drawDateIso: "2026-04-30T19:00:00-03:00",
  pricePerNumber: "R$ 1,60",
  totalNumbers: 10000,
  soldNumbers: 0,
  reservedNumbers: 0,
  availableNumbers: 10000,
  mainPrize: {
    title: "SHINERAY FREE 150",
    description:
      "Campanha oficial com compra de números e sorteio auditável.",
    value: "R$ 15.990,00",
    yearModel: "2026/2026",
    engine: "150 cilindradas",
    delivery: "Todo o Brasil",
    warranty: "Garantia de fábrica",
  },
  secondaryPrizes: [
    {
      title: "iPhone 17 Pro Max 256 GB",
      label: "Prêmio 2",
    },
    {
      title: "R$ 500,00 em PIX",
      label: "Prêmio 3",
    },
  ],
  packages: [
    {
      title: "Pacote Popular",
      quantity: 10,
      originalPrice: "R$ 16,00",
      price: "R$ 15,20",
      discount: "5%",
      unitPrice: "R$ 1,52",
      cta: "PEGAR 10 AGORA",
    },
    {
      title: "Pacote Turbo",
      quantity: 25,
      originalPrice: "R$ 40,00",
      price: "R$ 36,00",
      discount: "10%",
      unitPrice: "R$ 1,44",
      cta: "PEGAR 25 AGORA",
      badge: "Mais vendido",
    },
    {
      title: "Pacote Top Ranking",
      quantity: 50,
      originalPrice: "R$ 80,00",
      price: "R$ 68,00",
      discount: "15%",
      unitPrice: "R$ 1,36",
      cta: "PEGAR 50 AGORA",
    },
  ],
  testimonials: [
    {
      title: "Pagamento confirmado em minutos",
      text: "Paguei no PIX e meus números apareceram confirmados no painel na mesma hora.",
      author: "João, Campinas/SP",
    },
    {
      title: "Compra pelo celular",
      text: "Escolhi os números no celular e finalizei em menos de 2 minutos.",
      author: "Rodrigo, Campinas/SP",
    },
    {
      title: "Transparência no sorteio",
      text: "Consegui acompanhar tudo e conferir o resultado com clareza na própria página.",
      author: "Leila, Recife/PE",
    },
    {
      title: "Suporte respondeu rápido",
      text: "Tive uma dúvida e o suporte respondeu com clareza no mesmo dia.",
      author: "Karina, Belo Horizonte/MG",
    },
  ],
  winners: [
    {
      name: "Luciana M.",
      prize: "Foto de entrega validada",
      city: "Fortaleza/CE",
      status: "Entrega validada em 12/01/2026",
    },
    {
      name: "Carlos A.",
      prize: "R$ 80.000 em PIX",
      city: "Belo Horizonte/MG",
      status: "Entrega validada em 05/12/2025",
    },
    {
      name: "Vanessa R.",
      prize: "Moto 0km + documentação",
      city: "Campinas/SP",
      status: "Vídeo de entrega publicado",
    },
  ],
  faq: [
    {
      question: "Como sei que meus números foram confirmados?",
      answer:
        "Assim que o pagamento é aprovado, os números ficam marcados como vendidos no seu painel e você recebe confirmação por e-mail.",
    },
    {
      question: "Posso escolher números específicos?",
      answer:
        "Sim. Você pode selecionar manualmente no grid ou usar a seleção aleatória para preencher automaticamente.",
    },
    {
      question: "O que acontece se eu não pagar a tempo?",
      answer:
        "A reserva expira automaticamente no tempo configurado e os números voltam para disponibilidade pública.",
    },
    {
      question: "Como funciona a auditoria do sorteio?",
      answer:
        "Publicamos regras, método, prova do resultado e validação dos números vencedores na área de transparência.",
    },
  ],
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function isAllowedSlug(slug: string) {
  const normalized = normalizeSlug(slug);
  return normalized === CAMPAIGN_SLUG || LEGACY_ALIASES.has(normalized);
}

function getCanonicalSlug(slug: string) {
  const normalized = normalizeSlug(slug);
  if (LEGACY_ALIASES.has(normalized)) {
    return CAMPAIGN_SLUG;
  }
  return normalized;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isAllowedSlug(slug)) {
    return {
      title: "Campanha não encontrada | Bigode das Rifas",
    };
  }

  const canonicalPath = `/r/${getCanonicalSlug(slug)}`;

  return {
    title: `${campaign.title} | Campanha oficial`,
    description: campaign.heroDescription,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${campaign.title} | Campanha oficial`,
      description: campaign.heroDescription,
      type: "website",
      url: canonicalPath,
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${campaign.title} | Campanha oficial`,
      description: campaign.heroDescription,
    },
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RifaPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isAllowedSlug(slug)) {
    notFound();
  }

  const canonicalSlug = getCanonicalSlug(slug);

  const progress =
    campaign.totalNumbers > 0
      ? Math.round((campaign.soldNumbers / campaign.totalNumbers) * 100)
      : 0;

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
        id="inicio"
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
          <a href="#premio" style={topLinkStyle}>
            Prêmio
          </a>
          <a href="#pacotes" style={topLinkStyle}>
            Pacotes
          </a>
          <a href="#vencedores" style={topLinkStyle}>
            Vencedores
          </a>
          <a href="#transparencia" style={topLinkStyle}>
            Transparência
          </a>
          <a href="#faq" style={topLinkStyle}>
            FAQ
          </a>
          <Link href="/login" style={topLinkStyle}>
            Área do Usuário
          </Link>
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
            <p style={eyebrowStyle}>{campaign.title}</p>
            <h1
              style={{
                margin: "8px 0 12px",
                fontSize: "clamp(2.2rem, 5vw, 4.4rem)",
                lineHeight: 1.02,
              }}
            >
              {campaign.heroTitle}
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
              {campaign.heroDescription}
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <span style={pillStyle}>PIX imediato</span>
              <span style={pillStyle}>Números rastreáveis</span>
              <span style={pillStyle}>Sorteio auditável</span>
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
              <span>Sorteio: {campaign.drawDateLabel}</span>
              <span>{campaign.pricePerNumber} por número</span>
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
                QUERO ESCOLHER MEUS NÚMEROS AGORA
              </a>
              <a href="#transparencia" style={secondaryButtonStyle}>
                VER TRANSPARÊNCIA
              </a>
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
              <MetricCard
                label="Prêmio principal"
                value={campaign.mainPrize.title}
              />
              <MetricCard
                label="Valor do prêmio"
                value={campaign.mainPrize.value}
              />
              <MetricCard
                label="Total de números"
                value={String(campaign.totalNumbers)}
              />
              <MetricCard
                label="Disponíveis"
                value={String(campaign.availableNumbers)}
              />
            </div>

            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #f7d978 0%, #d4a63a 100%)",
                  }}
                />
              </div>
              <p
                style={{
                  margin: "10px 0 0",
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                Vendidos: {campaign.soldNumbers} • Reservados:{" "}
                {campaign.reservedNumbers}
              </p>
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
          {campaign.mainPrize.title}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          <MetricCard label="Descrição" value={campaign.mainPrize.description} />
          <MetricCard label="Ano / Modelo" value={campaign.mainPrize.yearModel} />
          <MetricCard label="Motorização" value={campaign.mainPrize.engine} />
          <MetricCard label="Entrega" value={campaign.mainPrize.delivery} />
          <MetricCard label="Garantia" value={campaign.mainPrize.warranty} />
          <MetricCard label="Data do sorteio" value={campaign.drawDateLabel} />
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {campaign.secondaryPrizes.map((item) => (
            <article key={item.title} style={cardStyle}>
              <p style={eyebrowMiniStyle}>{item.label}</p>
              <h3 style={{ margin: "8px 0 0", fontSize: 22 }}>{item.title}</h3>
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
          Leve mais números e aumente suas chances
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 18,
          }}
        >
          {campaign.packages.map((pack) => (
            <article key={pack.title} style={cardStyle}>
              {pack.badge ? <span style={badgeStyle}>{pack.badge}</span> : null}
              <h3 style={{ margin: "12px 0 10px", fontSize: 24 }}>
                {pack.title}
              </h3>
              <p style={{ margin: "0 0 8px", color: "rgba(255,255,255,0.78)" }}>
                {pack.quantity} números
              </p>
              <p style={{ margin: 0, textDecoration: "line-through", opacity: 0.6 }}>
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
              <a href="#checkout" style={{ ...primaryButtonStyle, marginTop: 18 }}>
                {pack.cta}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "8px 24px 28px",
        }}
      >
        <p style={eyebrowStyle}>PROVA SOCIAL</p>
        <h2 style={{ margin: "8px 0 18px", fontSize: 34 }}>
          Quem participa, recomenda
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {campaign.testimonials.map((item) => (
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
        id="vencedores"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "8px 24px 28px",
        }}
      >
        <p style={eyebrowStyle}>VENCEDORES</p>
        <h2 style={{ margin: "8px 0 18px", fontSize: 34 }}>
          Mural de vencedores verificados
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {campaign.winners.map((winner) => (
            <article key={`${winner.name}-${winner.city}`} style={cardStyle}>
              <h3 style={{ margin: "0 0 8px", fontSize: 22 }}>{winner.name}</h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.82)" }}>
                {winner.prize}
              </p>
              <p style={{ margin: "10px 0 0", color: "#f2d067", fontWeight: 800 }}>
                {winner.city}
              </p>
              <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.72)" }}>
                {winner.status}
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
          {campaign.faq.map((item) => (
            <article key={item.question} style={cardStyle}>
              <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>{item.question}</h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", lineHeight: 1.7 }}>
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
          Transparência de verdade
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <MetricCard label="Método do sorteio" value="Baseado na Loteria Federal" />
          <MetricCard label="Organizador" value={ORGANIZER_NAME} />
          <MetricCard label="Contato" value={SUPPORT_EMAIL} />
          <MetricCard
            label="Resumo das regras"
            value="Todos os números ficam auditáveis em tempo real e o regulamento completo é publicado antes da abertura das vendas."
          />
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
            Escolha agora seus números antes do encerramento da campanha
          </h2>
          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.7,
              maxWidth: 860,
            }}
          >
            A campanha já está estruturada com prêmio principal, bônus, pacotes e
            área de transparência. O próximo passo é seguir para o fluxo de compra.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 8,
            }}
          >
            <Link href="/login" style={secondaryButtonStyle}>
              ENTRAR NO PAINEL
            </Link>
            <a href="#pacotes" style={primaryButtonStyle}>
              ESCOLHER PACOTE AGORA
            </a>
          </div>
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "18px 24px 32px",
            display: "flex",
            justifyContent: "space-between",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <div>
            © 2026 {campaign.title}. Todos os direitos reservados.
            <div style={{ marginTop: 8 }}>
              <code>/r/{canonicalSlug}</code>
            </div>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <Link href="/r/bigode-das-rifas" style={footerLinkStyle}>
              Campanha principal
            </Link>
            <Link href="/login" style={footerLinkStyle}>
              Área do usuário
            </Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} style={footerLinkStyle}>
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </footer>
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

const footerLinkStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.82)",
  textDecoration: "none",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  borderRadius: 22,
  padding: 20,
  border: "1px solid rgba(255,255,255,0.08)",
};