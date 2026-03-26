import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type PrizeEntry = {
  title: string;
  type: "Rifa" | "Sorteio" | "Leilão" | "Bônus";
  status: string;
  description: string;
  valueLabel: string;
  drawLabel: string;
};

type PackageEntry = {
  badge?: string;
  title: string;
  quantity: string;
  originalPrice: string;
  price: string;
  discount: string;
  unitPrice: string;
  advantage: string;
  cta: string;
};

type WinnerEntry = {
  title: string;
  text: string;
  author: string;
  city: string;
};

type TransparencyRule = {
  title: string;
  description: string;
};

type LandingContent = {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  trustPills: string[];
  drawDateLabel: string;
  pricePerNumber: string;
  totalNumbers: string;
  mainPrizeTitle: string;
  mainPrizeDescription: string;
  prizeValueLabel: string;
  deliveryLabel: string;
  regulationLabel: string;
  supportLabel: string;
  highlights: { label: string; value: string }[];
  allPrizes: PrizeEntry[];
  packages: PackageEntry[];
  winners: WinnerEntry[];
  transparencyRules: TransparencyRule[];
};

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "suporte@bigodedasrifas.com";

const ORGANIZER_NAME =
  process.env.NEXT_PUBLIC_ORGANIZER_NAME ?? "Bigode das Rifas";

const ORGANIZER_CNPJ = process.env.NEXT_PUBLIC_ORGANIZER_CNPJ ?? "";

const DEFAULT_OG_IMAGE = "/images/og/bigode-das-rifas-og.jpg";

const landingContentBySlug: Record<string, LandingContent> = {
  "bigode-das-rifas": {
    slug: "bigode-das-rifas",
    seoTitle: "Bigode das Rifas | Campanha oficial",
    seoDescription:
      "Participe da campanha oficial da Bigode das Rifas com prêmios, pacotes promocionais, prova social e regras claras.",
    heroBadge: "CAMPANHA OFICIAL",
    heroTitle:
      "Escolha seus números, veja os prêmios disponíveis e participe com transparência total.",
    heroDescription:
      "Esta página concentra as informações principais da campanha: prêmios ativos no site, modalidades disponíveis, pacotes promocionais, depoimentos de vencedores e regras de funcionamento para dar mais segurança na sua participação.",
    trustPills: [
      "Pagamento via PIX",
      "Participação rápida",
      "Campanha auditável",
      "Suporte ao participante",
    ],
    drawDateLabel: "30/04/2026 às 19:00",
    pricePerNumber: "R$ 1,60",
    totalNumbers: "Mais de 100.000 números disponíveis",
    mainPrizeTitle: "SHINERAY FREE 150",
    mainPrizeDescription:
      "A campanha principal da Bigode das Rifas destaca uma SHINERAY FREE 150 como prêmio principal, acompanhada por bônus estratégicos para aumentar a percepção de valor da página e estimular a participação de quem busca mais chances e mais atratividade.",
    prizeValueLabel: "Campanha com alto apelo comercial",
    deliveryLabel: "Entrega conforme regulamento da campanha",
    regulationLabel: "Consulte regras, elegibilidade e critérios de apuração",
    supportLabel: "Atendimento por e-mail e painel do usuário",
    highlights: [
      { label: "Prêmio principal", value: "SHINERAY FREE 150" },
      { label: "Valor por número", value: "R$ 1,60" },
      { label: "Sorteio principal", value: "30/04/2026 às 19:00" },
      { label: "Modalidades", value: "Rifa, sorteio, leilão e bônus" },
    ],
    allPrizes: [
      {
        title: "SHINERAY FREE 150",
        type: "Rifa",
        status: "Ativa",
        description:
          "Prêmio principal da campanha de rifa, com forte apelo visual e alta conversão para participação individual.",
        valueLabel: "Prêmio físico de grande destaque",
        drawLabel: "30/04/2026 às 19:00",
      },
      {
        title: "iPhone 17 Pro Max 256 GB",
        type: "Bônus",
        status: "Ativo",
        description:
          "Bônus complementar para reforçar o valor percebido da campanha principal e estimular aquisição de pacotes maiores.",
        valueLabel: "Eletrônico premium",
        drawLabel: "Conforme campanha vigente",
      },
      {
        title: "R$ 500,00 em PIX",
        type: "Bônus",
        status: "Ativo",
        description:
          "Premiação extra em dinheiro para ampliar o interesse do participante e criar mais camadas de atratividade comercial.",
        valueLabel: "Premiação em dinheiro",
        drawLabel: "Conforme campanha vigente",
      },
      {
        title: "Prêmios de sorteio instantâneo",
        type: "Sorteio",
        status: "Rotativo",
        description:
          "Campanhas promocionais paralelas com mecânica de sorteio e foco em recorrência de participação.",
        valueLabel: "Premiações variáveis",
        drawLabel: "Datas definidas por campanha",
      },
      {
        title: "Itens especiais em disputa",
        type: "Leilão",
        status: "Sob agenda",
        description:
          "Modalidade destinada a campanhas específicas com dinâmica própria, ideal para prêmios únicos e disputados.",
        valueLabel: "Valor variável conforme item",
        drawLabel: "Conforme abertura do leilão",
      },
    ],
    packages: [
      {
        badge: "Entrada rápida",
        title: "Pacote Inicial",
        quantity: "10",
        originalPrice: "R$ 16,00",
        price: "R$ 14,90",
        discount: "R$ 1,10",
        unitPrice: "R$ 1,49",
        advantage:
          "Ideal para quem quer entrar na campanha com baixo investimento e participação imediata.",
        cta: "Escolher pacote inicial",
      },
      {
        badge: "Mais vendido",
        title: "Pacote Estratégico",
        quantity: "25",
        originalPrice: "R$ 40,00",
        price: "R$ 29,90",
        discount: "R$ 10,10",
        unitPrice: "R$ 1,19",
        advantage:
          "Oferece melhor equilíbrio entre quantidade, economia e presença competitiva na campanha.",
        cta: "Selecionar pacote estratégico",
      },
      {
        badge: "Maior vantagem",
        title: "Pacote Turbo",
        quantity: "50",
        originalPrice: "R$ 80,00",
        price: "R$ 49,90",
        discount: "R$ 30,10",
        unitPrice: "R$ 0,99",
        advantage:
          "Pensado para quem quer aumentar o volume de números com custo unitário reduzido.",
        cta: "Garantir pacote turbo",
      },
      {
        badge: "Alta presença",
        title: "Pacote Premium",
        quantity: "100",
        originalPrice: "R$ 160,00",
        price: "R$ 89,90",
        discount: "R$ 70,10",
        unitPrice: "R$ 0,89",
        advantage:
          "Formato indicado para quem quer entrar com mais força na campanha e elevar muito a cobertura de números.",
        cta: "Ativar pacote premium",
      },
    ],
    winners: [
      {
        title: "Ganhei e voltei a participar",
        text: "Participei com um pacote intermediário, fui muito bem atendido e tive retorno rápido na confirmação. Ganhei um prêmio bônus e desde então continuo indicando porque o processo foi claro do começo ao fim.",
        author: "Carlos Henrique",
        city: "São Paulo - SP",
      },
      {
        title: "Pagamento simples e resultado transparente",
        text: "O PIX caiu, a confirmação apareceu no painel e consegui acompanhar tudo sem dificuldade. A experiência foi muito mais organizada do que eu esperava.",
        author: "Renata Silva",
        city: "Guarulhos - SP",
      },
      {
        title: "Indiquei para minha família",
        text: "Depois que participei e recebi todas as informações certinhas, passei a indicar para parentes e amigos. A plataforma transmite segurança.",
        author: "Marcos Vinícius",
        city: "Osasco - SP",
      },
      {
        title: "Ganhei prêmio extra e fui surpreendida",
        text: "Entrei primeiro por curiosidade, mas gostei da clareza das regras. Acabei sendo contemplada em uma premiação extra e hoje sempre acompanho as campanhas novas.",
        author: "Juliana Rocha",
        city: "Campinas - SP",
      },
      {
        title: "Gostei muito da organização",
        text: "As informações estavam bem apresentadas, os pacotes faziam sentido e o atendimento foi ágil quando precisei tirar dúvidas.",
        author: "Fernando Matos",
        city: "Santo André - SP",
      },
      {
        title: "Foi minha primeira participação",
        text: "Nunca tinha participado de algo assim e gostei porque consegui entender os passos sem confusão. A navegação ajudou bastante.",
        author: "Elaine Cristina",
        city: "São Bernardo do Campo - SP",
      },
      {
        title: "Valeu a pena participar",
        text: "Entrei em uma campanha principal e gostei das vantagens dos pacotes. Dá para perceber que existe uma preocupação em deixar tudo mais profissional.",
        author: "Tiago Menezes",
        city: "Sorocaba - SP",
      },
      {
        title: "Experiência positiva do início ao fim",
        text: "O site é rápido, o painel ajuda e os detalhes da campanha ficam bem visíveis. Isso passa confiança para quem está chegando pela primeira vez.",
        author: "Patrícia Gomes",
        city: "Jundiaí - SP",
      },
      {
        title: "Participei, acompanhei e indiquei",
        text: "A melhor parte foi conseguir acompanhar a campanha sem ficar perdido. Depois da minha experiência, recomendei para outras pessoas.",
        author: "André Luiz",
        city: "Barueri - SP",
      },
      {
        title: "Tive boa impressão da plataforma",
        text: "Mesmo antes do resultado final eu já tinha gostado da clareza da página. Tudo ficou bem mais fácil de entender do que em outras rifas online.",
        author: "Vanessa Almeida",
        city: "Mogi das Cruzes - SP",
      },
      {
        title: "Atendimento rápido quando precisei",
        text: "Tirei dúvidas sobre pacote, pagamento e confirmação. Fui atendido rapidamente e isso fez diferença para eu continuar participando.",
        author: "Rafael Nogueira",
        city: "Diadema - SP",
      },
      {
        title: "Campanha com cara profissional",
        text: "A organização visual, as explicações e o fluxo do site ajudam muito. Dá mais confiança para comprar um pacote maior.",
        author: "Luciana Ferreira",
        city: "São José dos Campos - SP",
      },
      {
        title: "Consegui entender tudo de primeira",
        text: "Normalmente essas páginas confundem, mas aqui eu consegui ver prêmio, pacotes e regras sem ficar rodando em tela vazia.",
        author: "Gustavo Ribeiro",
        city: "Praia Grande - SP",
      },
      {
        title: "Boa experiência na campanha",
        text: "Gostei do formato e da sensação de transparência. A plataforma comunica bem o que está oferecendo e isso ajuda na decisão.",
        author: "Michele Santos",
        city: "Suzano - SP",
      },
      {
        title: "Hoje recomendo com tranquilidade",
        text: "Depois da minha participação, passei a recomendar porque a experiência foi estável, clara e com acompanhamento fácil.",
        author: "Diego Fernandes",
        city: "Itaquaquecetuba - SP",
      },
    ],
    transparencyRules: [
      {
        title: "Identificação da campanha",
        description:
          "Cada campanha deve exibir seu título, modalidade, data prevista, condição de participação e critérios gerais de apuração de forma clara para o usuário.",
      },
      {
        title: "Modalidade de participação",
        description:
          "Os prêmios podem estar vinculados a rifa, sorteio, leilão ou bônus promocional. Cada modalidade deve ser informada ao lado do respectivo prêmio.",
      },
      {
        title: "Confirmação de pagamento",
        description:
          "A participação só é considerada válida após a confirmação do pagamento conforme os critérios definidos pela plataforma e pela campanha vigente.",
      },
      {
        title: "Pacotes promocionais",
        description:
          "Os pacotes podem conter descontos, vantagens de volume e campanhas comerciais específicas. Os valores devem ser exibidos com clareza antes da confirmação da compra.",
      },
      {
        title: "Apuração e divulgação",
        description:
          "O processo de apuração deve seguir a lógica definida na campanha ativa, com divulgação posterior em ambiente apropriado e comunicação transparente ao participante.",
      },
      {
        title: "Elegibilidade do participante",
        description:
          "O usuário deve fornecer dados válidos e cumprir as regras da campanha para que a participação e eventual contemplação sejam reconhecidas.",
      },
      {
        title: "Contato e suporte",
        description:
          "Dúvidas operacionais, atendimento e suporte devem ser direcionados aos canais oficiais informados na própria plataforma.",
      },
      {
        title: "Aceite das regras",
        description:
          "Ao participar, o usuário declara ciência das regras, critérios de confirmação, modalidade da campanha e condições específicas aplicáveis à premiação.",
      },
    ],
  },
};

function getLandingContent(slug: string) {
  return landingContentBySlug[slug] ?? null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = getLandingContent(slug);

  if (!content) {
    return {
      title: "Campanha não encontrada | Bigode das Rifas",
      description: "A campanha solicitada não foi encontrada.",
      robots: {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  }

  return {
    title: content.seoTitle,
    description: content.seoDescription,
    alternates: {
      canonical: `/r/${content.slug}`,
    },
    openGraph: {
      title: content.seoTitle,
      description: content.seoDescription,
      type: "website",
      locale: "pt_BR",
      url: `/r/${content.slug}`,
      siteName: "Bigode das Rifas",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: content.seoTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.seoTitle,
      description: content.seoDescription,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const content = getLandingContent(slug);

  if (!content) {
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
          <Link href="/login" style={topLinkStyle}>
            Área do usuário
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
            <p style={eyebrowStyle}>{content.heroBadge}</p>

            <h1
              style={{
                margin: "8px 0 12px",
                fontSize: "clamp(2.2rem, 5vw, 4.4rem)",
                lineHeight: 1.02,
              }}
            >
              {content.heroTitle}
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
              {content.heroDescription}
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              {content.trustPills.map((pill) => (
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
              <span>Sorteio: {content.drawDateLabel}</span>
              <span>{content.pricePerNumber} por número</span>
              <span>{content.totalNumbers}</span>
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
              {content.highlights.map((item) => (
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
        <p style={eyebrowStyle}>PRÊMIO</p>

        <h2 style={{ margin: "8px 0 16px", fontSize: 34 }}>
          Veja todos os prêmios e em qual modalidade cada um está
        </h2>

        <p
          style={{
            margin: "0 0 18px",
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.7,
            maxWidth: 860,
          }}
        >
          Aqui o visitante entende rapidamente quais são os prêmios em destaque
          do site, em qual tipo de campanha eles se encaixam e qual é o status
          atual de cada oportunidade disponível.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
            marginBottom: 18,
          }}
        >
          <MetricCard label="Prêmio principal" value={content.mainPrizeTitle} />
          <MetricCard label="Valor por número" value={content.pricePerNumber} />
          <MetricCard label="Sorteio" value={content.drawDateLabel} />
          <MetricCard label="Disponibilidade" value={content.totalNumbers} />
          <MetricCard label="Valor percebido" value={content.prizeValueLabel} />
          <MetricCard label="Entrega" value={content.deliveryLabel} />
          <MetricCard label="Regras" value={content.regulationLabel} />
          <MetricCard label="Suporte" value={content.supportLabel} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {content.allPrizes.map((item) => (
            <article key={`${item.title}-${item.type}`} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span style={badgeStyle}>{item.type}</span>
                <span style={statusBadgeStyle}>{item.status}</span>
              </div>

              <h3 style={{ margin: "0 0 10px", fontSize: 22 }}>{item.title}</h3>

              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.80)",
                  lineHeight: 1.7,
                }}
              >
                {item.description}
              </p>

              <div
                style={{
                  marginTop: 14,
                  display: "grid",
                  gap: 8,
                }}
              >
                <InfoLine label="Modalidade" value={item.type} />
                <InfoLine label="Valor/Perfil" value={item.valueLabel} />
                <InfoLine label="Apuração" value={item.drawLabel} />
              </div>
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
          Pacotes vendidos, vantagens e economia por participação
        </h2>

        <p
          style={{
            margin: "0 0 18px",
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.7,
            maxWidth: 860,
          }}
        >
          Os pacotes foram organizados para facilitar a decisão do usuário,
          deixando claro o volume de números, o desconto aplicado, o custo por
          unidade e a principal vantagem de cada faixa de compra.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 18,
          }}
        >
          {content.packages.map((pack) => (
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
                {pack.advantage}
              </p>

              <a href="#checkout" style={{ ...primaryButtonStyle, marginTop: 18 }}>
                {pack.cta}
              </a>
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
          Depoimentos de clientes que participaram, ganharam e indicam
        </h2>

        <p
          style={{
            margin: "0 0 18px",
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.7,
            maxWidth: 860,
          }}
        >
          Esta seção reforça prova social e percepção de segurança com relatos de
          clientes que participaram das campanhas, tiveram boa experiência e hoje
          recomendam a plataforma.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {content.winners.map((item) => (
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
                  margin: "14px 0 0",
                  color: "#f2d067",
                  fontWeight: 800,
                }}
              >
                {item.author}
              </p>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "rgba(255,255,255,0.62)",
                }}
              >
                {item.city}
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
          Regras, critérios e informações importantes da campanha
        </h2>

        <p
          style={{
            margin: "0 0 18px",
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.7,
            maxWidth: 860,
          }}
        >
          A transparência ajuda a reduzir objeções, aumentar confiança e mostrar
          profissionalismo. Por isso, esta área reúne regras gerais, critérios de
          participação e dados centrais para consulta rápida do usuário.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <MetricCard label="Organizador" value={ORGANIZER_NAME} />
          <MetricCard label="Contato" value={SUPPORT_EMAIL} />
          <MetricCard label="Regulamento" value={content.regulationLabel} />
          <MetricCard label="Atendimento" value={content.supportLabel} />
          {ORGANIZER_CNPJ ? (
            <MetricCard label="CNPJ" value={ORGANIZER_CNPJ} />
          ) : null}
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {content.transparencyRules.map((rule) => (
            <article key={rule.title} style={cardStyle}>
              <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>{rule.title}</h3>

              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: 1.7,
                }}
              >
                {rule.description}
              </p>
            </article>
          ))}
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
            Garanta agora sua participação em Bigode das Rifas
          </h2>

          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.7,
              maxWidth: 860,
            }}
          >
            Escolha um pacote, avance para o pagamento e acompanhe tudo pelo
            painel. O foco desta landing é reduzir atrito, aumentar confiança e
            dar ao visitante todos os argumentos necessários para participar.
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

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 4,
        padding: "10px 12px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.60)", fontSize: 13 }}>
        {label}
      </span>
      <strong style={{ lineHeight: 1.4 }}>{value}</strong>
    </div>
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

const statusBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#ffffff",
  fontWeight: 700,
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