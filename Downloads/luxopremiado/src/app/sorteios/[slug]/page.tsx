import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Sorteio = {
  slug: string;
  title: string;
  subtitle: string;
  prize: string;
  prizeDescription: string;
  regulationSummary: string;
  participationRules: string[];
  drawDate: string;
  resultDate: string;
  badge: string;
  highlight: string;
  status: string;
  faq: { question: string; answer: string }[];
};

const sorteios: Sorteio[] = [
  {
    slug: "sorteio-1000-no-pix",
    title: "R$ 1.000 no Pix",
    subtitle: "Campanha promocional com participação simples e regulamento claro.",
    prize: "R$ 1.000,00 via Pix",
    prizeDescription:
      "Um sorteio direto, de alta adesão, ideal para gerar engajamento rápido e participação em massa.",
    regulationSummary:
      "Campanha válida durante o período informado, limitada a usuários elegíveis conforme as regras publicadas nesta página.",
    participationRules: [
      "Ter cadastro válido na plataforma.",
      "Cumprir as condições promocionais da campanha.",
      "Participar dentro do prazo de encerramento.",
      "Aceitar os termos e regras do sorteio.",
    ],
    drawDate: "Encerramento das participações: 31/03 às 18h",
    resultDate: "Resultado divulgado em 31/03 às 20h",
    badge: "Alta adesão",
    highlight: "Participação fácil e prêmio imediato.",
    status: "Ativo",
    faq: [
      {
        question: "Como participo deste sorteio?",
        answer:
          "Basta cumprir os requisitos promocionais informados nesta página e estar dentro do prazo de participação.",
      },
      {
        question: "Como saberei se ganhei?",
        answer:
          "O resultado será divulgado na data informada e o vencedor será contatado pelos canais cadastrados.",
      },
      {
        question: "Existe limite de participação?",
        answer:
          "As regras específicas de elegibilidade e limite ficam descritas no regulamento desta campanha.",
      },
    ],
  },
  {
    slug: "sorteio-smart-tv-55",
    title: 'Smart TV 55" 4K',
    subtitle: "Um prêmio de alto valor percebido para impulsionar o engajamento.",
    prize: 'Smart TV 55" 4K',
    prizeDescription:
      "Campanha promocional desenhada para valorizar o prêmio e ampliar a base de participantes qualificados.",
    regulationSummary:
      "Participação condicionada ao cumprimento das regras promocionais, com apuração e divulgação conforme cronograma desta página.",
    participationRules: [
      "Cadastro ativo e válido.",
      "Cumprimento integral das regras promocionais.",
      "Participação confirmada antes do encerramento.",
      "Aceite dos termos da campanha.",
    ],
    drawDate: "Encerramento das participações: 04/04 às 20h",
    resultDate: "Resultado divulgado em 04/04 às 21h",
    badge: "Campanha especial",
    highlight: "Prêmio premium com comunicação objetiva.",
    status: "Ativo",
    faq: [
      {
        question: "Preciso comprar algo para participar?",
        answer:
          "Isso depende da mecânica definida nesta campanha. Confira as regras completas na seção de regulamento.",
      },
      {
        question: "Quando sai o resultado?",
        answer:
          "A divulgação acontecerá no horário indicado nesta mesma página, após o encerramento.",
      },
      {
        question: "Como o vencedor é validado?",
        answer:
          "A validação segue os critérios de elegibilidade e conferência previstos no regulamento.",
      },
    ],
  },
  {
    slug: "sorteio-viagem-nordeste",
    title: "Viagem para o Nordeste",
    subtitle: "Experiência premium para campanhas de forte apelo promocional.",
    prize: "Pacote de viagem para o Nordeste",
    prizeDescription:
      "Uma campanha voltada para percepção de valor, retenção de atenção e forte potencial de compartilhamento.",
    regulationSummary:
      "A campanha respeita período, critérios e regras previamente divulgados, com comunicação focada em transparência e adesão.",
    participationRules: [
      "Estar elegível segundo as regras publicadas.",
      "Finalizar a participação dentro da vigência.",
      "Fornecer dados válidos para contato.",
      "Aceitar integralmente os termos da promoção.",
    ],
    drawDate: "Encerramento das participações: 08/04 às 21h",
    resultDate: "Resultado divulgado em 08/04 às 22h",
    badge: "Prêmio premium",
    highlight: "Experiência aspiracional para campanhas especiais.",
    status: "Ativo",
    faq: [
      {
        question: "A viagem inclui tudo?",
        answer:
          "Os itens incluídos no prêmio devem ser detalhados no regulamento oficial desta campanha.",
      },
      {
        question: "Posso transferir o prêmio?",
        answer:
          "A possibilidade de transferência depende exclusivamente das regras definidas no regulamento.",
      },
      {
        question: "Como será feita a comunicação do resultado?",
        answer:
          "A divulgação será feita conforme a data prevista e por meio dos canais oficiais da campanha.",
      },
    ],
  },
];

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getSorteio(slug: string) {
  return sorteios.find((item) => item.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sorteio = getSorteio(slug);

  if (!sorteio) {
    return {
      title: "Sorteio | Bigode das Rifas",
      description: "Página individual de sorteio promocional.",
    };
  }

  return {
    title: `${sorteio.title} | Sorteios | Bigode das Rifas`,
    description: sorteio.subtitle,
  };
}

export default async function SorteioSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const sorteio = getSorteio(slug);

  if (!sorteio) {
    notFound();
  }

  return (
    <main style={{ background: "#0b0b0f", color: "#fff", minHeight: "100vh" }}>
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "56px 24px 28px",
        }}
      >
        <Link
          href="/sorteios"
          style={{
            display: "inline-block",
            marginBottom: 18,
            color: "#d4af37",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← Voltar para sorteios
        </Link>

        <div
          style={{
            display: "inline-block",
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(212,175,55,0.16)",
            border: "1px solid rgba(212,175,55,0.22)",
            color: "#f2d67a",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          {sorteio.badge}
        </div>

        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            lineHeight: 1.05,
            margin: "0 0 16px",
          }}
        >
          {sorteio.title}
        </h1>

        <p
          style={{
            maxWidth: 780,
            color: "rgba(255,255,255,0.78)",
            fontSize: 18,
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {sorteio.subtitle}
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 24,
          }}
        >
          <a
            href="#participacao"
            style={{
              background: "#d4af37",
              color: "#111",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Quero participar
          </a>

          <a
            href="#regulamento"
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Ver regulamento
          </a>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 28px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>Prêmio</p>
            <strong style={{ display: "block", fontSize: 24, marginTop: 8 }}>
              {sorteio.prize}
            </strong>
          </article>

          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>Status</p>
            <strong style={{ display: "block", fontSize: 24, marginTop: 8 }}>
              {sorteio.status}
            </strong>
          </article>

          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>
              Encerramento
            </p>
            <strong style={{ display: "block", fontSize: 24, marginTop: 8 }}>
              Dentro do prazo
            </strong>
          </article>

          <article
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(255,255,255,0.04))",
              border: "1px solid rgba(212,175,55,0.24)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.75)" }}>
              Destaque
            </p>
            <strong style={{ display: "block", fontSize: 24, marginTop: 8 }}>
              {sorteio.highlight}
            </strong>
          </article>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "8px 24px 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 20,
          }}
        >
          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
              PRÊMIO DA CAMPANHA
            </p>
            <h2 style={{ fontSize: 30, marginTop: 0 }}>{sorteio.prize}</h2>
            <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
              {sorteio.prizeDescription}
            </p>
            <p style={{ color: "#fff", marginBottom: 8 }}>{sorteio.drawDate}</p>
            <p style={{ color: "rgba(255,255,255,0.78)", marginTop: 0 }}>
              {sorteio.resultDate}
            </p>
          </article>

          <article
            id="participacao"
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.16), rgba(255,255,255,0.04))",
              border: "1px solid rgba(212,175,55,0.24)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
              PARTICIPAÇÃO
            </p>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>Como participar</h2>
            <ul
              style={{
                paddingLeft: 18,
                lineHeight: 1.9,
                color: "rgba(255,255,255,0.82)",
                marginBottom: 0,
              }}
            >
              {sorteio.participationRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section
        id="regulamento"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 24px",
        }}
      >
        <article
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: 24,
          }}
        >
          <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
            REGULAMENTO
          </p>
          <h2 style={{ marginTop: 0, fontSize: 28 }}>
            Regras essenciais desta campanha
          </h2>
          <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
            {sorteio.regulationSummary}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 16,
              marginTop: 18,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 18,
                padding: 18,
              }}
            >
              <strong style={{ display: "block", marginBottom: 8 }}>Prazo</strong>
              <span style={{ color: "rgba(255,255,255,0.75)" }}>
                {sorteio.drawDate}
              </span>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 18,
                padding: 18,
              }}
            >
              <strong style={{ display: "block", marginBottom: 8 }}>
                Divulgação do resultado
              </strong>
              <span style={{ color: "rgba(255,255,255,0.75)" }}>
                {sorteio.resultDate}
              </span>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 18,
                padding: 18,
              }}
            >
              <strong style={{ display: "block", marginBottom: 8 }}>
                Elegibilidade
              </strong>
              <span style={{ color: "rgba(255,255,255,0.75)" }}>
                Cadastro válido e conformidade com as regras da campanha.
              </span>
            </div>
          </div>
        </article>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 72px",
        }}
      >
        <article
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(212,175,55,0.12))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: 24,
          }}
        >
          <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>FAQ</p>
          <h2 style={{ marginTop: 0, fontSize: 28 }}>
            Dúvidas frequentes do sorteio
          </h2>

          <div style={{ display: "grid", gap: 14 }}>
            {sorteio.faq.map((item) => (
              <div
                key={item.question}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 18,
                  padding: 18,
                }}
              >
                <strong style={{ display: "block", marginBottom: 8 }}>
                  {item.question}
                </strong>
                <span style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                  {item.answer}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}