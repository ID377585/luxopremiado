import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sorteios | Bigode das Rifas",
  description:
    "Campanhas promocionais separadas, com foco em regulamento, prêmio e participação.",
};

const draws = [
  {
    slug: "sorteio-1000-no-pix",
    title: "R$ 1.000 no Pix",
    prize: "Prêmio instantâneo em dinheiro via Pix",
    regulation: "Regulamento simplificado com período, critérios e validade.",
    participation: "1 participação por cadastro elegível",
    endDate: "Participações até 31/03 às 18h",
    badge: "Alta adesão",
  },
  {
    slug: "sorteio-smart-tv-55",
    title: 'Smart TV 55" 4K',
    prize: "Eletrônico premium para campanhas de alto engajamento.",
    regulation: "Regras, prazo, anúncio do vencedor e critérios de elegibilidade.",
    participation: "Participação vinculada à ação promocional",
    endDate: "Participações até 04/04 às 20h",
    badge: "Campanha especial",
  },
  {
    slug: "sorteio-viagem-nordeste",
    title: "Viagem para o Nordeste",
    prize: "Experiência de alto valor percebido para ações promocionais.",
    regulation: "Página focada em transparência de prêmio e mecânica promocional.",
    participation: "Cadastro + cumprimento das condições da campanha",
    endDate: "Participações até 08/04 às 21h",
    badge: "Prêmio premium",
  },
];

const pillars = [
  {
    title: "Regulamento claro",
    description:
      "Toda campanha promocional precisa explicar regras, período, elegibilidade e forma de apuração.",
  },
  {
    title: "Prêmio bem apresentado",
    description:
      "A promessa central do sorteio deve ser visível, compreensível e valorizada logo no topo da página.",
  },
  {
    title: "Participação simples",
    description:
      "O usuário precisa entender rapidamente como participar, sem ruído com outras modalidades.",
  },
];

const faq = [
  {
    question: "Como participar?",
    answer:
      "Cada sorteio define uma mecânica própria, sempre apresentada com clareza na página da campanha.",
  },
  {
    question: "Onde vejo o regulamento?",
    answer:
      "O regulamento deve ficar destacado no card da campanha e reforçado na página individual.",
  },
  {
    question: "Quando sai o resultado?",
    answer:
      "A data de encerramento e o critério de divulgação do vencedor aparecem junto ao prêmio.",
  },
];

export default function SorteiosPage() {
  return (
    <main style={{ background: "#0b0b0f", color: "#fff", minHeight: "100vh" }}>
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "56px 24px 28px",
        }}
      >
        <p style={{ color: "#d4af37", fontWeight: 700, letterSpacing: 1.2 }}>
          MODALIDADE
        </p>

        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            lineHeight: 1.05,
            margin: "12px 0 16px",
          }}
        >
          Sorteios promocionais com foco no regulamento, no prêmio e na participação.
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
          Esta área separa os sorteios das rifas e dos leilões para deixar a
          comunicação mais precisa. Aqui a prioridade é explicar a campanha
          promocional, valorizar o prêmio e reduzir dúvidas sobre a participação.
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
            href={`/sorteios/${draws[0].slug}`}
            style={{
              background: "#d4af37",
              color: "#111",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Ver sorteio em destaque
          </Link>

          <a
            href="#campanhas-sorteio"
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Explorar campanhas
          </a>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
        }}
      >
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 26 }}>{pillar.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.65 }}>
              {pillar.description}
            </p>
          </article>
        ))}
      </section>

      <section
        id="campanhas-sorteio"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "8px 24px 28px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div>
            <p style={{ color: "#d4af37", fontWeight: 700, marginBottom: 8 }}>
              CAMPANHAS PROMOCIONAIS
            </p>
            <h2 style={{ fontSize: 32, margin: 0 }}>
              Páginas com leitura rápida e sem confusão entre modalidades
            </h2>
          </div>

          <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>
            Mais clareza para o usuário, mais foco para a campanha.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {draws.map((draw) => (
            <article
              key={draw.slug}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 24,
                padding: 24,
              }}
            >
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
                {draw.badge}
              </div>

              <h3 style={{ margin: "0 0 10px", fontSize: 28 }}>{draw.title}</h3>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                    Prêmio
                  </p>
                  <strong>{draw.prize}</strong>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                    Regulamento
                  </p>
                  <span style={{ color: "rgba(255,255,255,0.84)" }}>
                    {draw.regulation}
                  </span>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                    Participação
                  </p>
                  <span style={{ color: "rgba(255,255,255,0.84)" }}>
                    {draw.participation}
                  </span>
                </div>
              </div>

              <p style={{ marginTop: 0, color: "#fff" }}>{draw.endDate}</p>

              <Link
                href={`/sorteios/${draw.slug}`}
                style={{
                  display: "inline-block",
                  marginTop: 6,
                  background: "#fff",
                  color: "#111",
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: 12,
                  fontWeight: 700,
                }}
              >
                Abrir campanha
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 72px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <article
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(255,255,255,0.04))",
              border: "1px solid rgba(212,175,55,0.24)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
              ESTRUTURA IDEAL
            </p>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>
              O que não pode faltar numa boa página de sorteio
            </h2>
            <ul
              style={{
                paddingLeft: 18,
                lineHeight: 1.9,
                color: "rgba(255,255,255,0.82)",
                marginBottom: 0,
              }}
            >
              <li>Prêmio em destaque</li>
              <li>Regulamento visível</li>
              <li>Critério de participação objetivo</li>
              <li>Prazo e resultado bem explicados</li>
            </ul>
          </article>

          <article
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>FAQ</p>
            <div style={{ display: "grid", gap: 14 }}>
              {faq.map((item) => (
                <div
                  key={item.question}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 16,
                    padding: 16,
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
        </div>
      </section>
    </main>
  );
}