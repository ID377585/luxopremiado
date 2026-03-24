import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "VIP | Bigode das Rifas",
  description: "Página exclusiva do programa VIP da plataforma.",
};

const benefits = [
  {
    title: "Comissão automática",
    description:
      "Receba comissões por compras confirmadas e acompanhe tudo direto no painel.",
  },
  {
    title: "Atendimento prioritário",
    description:
      "Mais velocidade no suporte e prioridade nas campanhas e ações especiais.",
  },
  {
    title: "Benefícios por nível",
    description:
      "Suba de faixa e desbloqueie novas vantagens operacionais e promocionais.",
  },
];

const levels = [
  {
    name: "VIP Bronze",
    perks: ["Comissão base", "Alertas de campanha", "Acompanhamento no painel"],
  },
  {
    name: "VIP Prata",
    perks: ["Comissão maior", "Acesso antecipado", "Suporte mais rápido"],
  },
  {
    name: "VIP Ouro",
    perks: ["Maior comissão", "Ações especiais", "Ativações premium"],
  },
];

export default function VipPage() {
  return (
    <main style={{ background: "#0b0b0f", color: "#fff", minHeight: "100vh" }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 24px" }}>
        <p style={{ color: "#d4af37", fontWeight: 700 }}>MODALIDADE</p>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)", margin: "10px 0 14px" }}>
          Programa VIP
        </h1>
        <p style={{ maxWidth: 760, color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
          Esta página concentra o funil do VIP: benefícios, níveis, comissão e
          ativação. Assim o usuário entende rapidamente o valor do programa sem
          competir com rifas e leilões.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <Link
            href="/app/vip"
            style={{
              background: "#d4af37",
              color: "#111",
              textDecoration: "none",
              padding: "12px 18px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Abrir área VIP
          </Link>

          <Link
            href="/app/perfil"
            style={{
              border: "1px solid rgba(255,255,255,0.16)",
              color: "#fff",
              textDecoration: "none",
              padding: "12px 18px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Ativar perfil
          </Link>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "8px 24px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
        }}
      >
        {benefits.map((item) => (
          <article
            key={item.title}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>{item.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
              {item.description}
            </p>
          </article>
        ))}
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 72px" }}>
        <h2 style={{ fontSize: 32, marginBottom: 18 }}>Níveis do programa</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {levels.map((level) => (
            <article
              key={level.name}
              style={{
                background:
                  "linear-gradient(135deg, rgba(212,175,55,0.16), rgba(255,255,255,0.04))",
                border: "1px solid rgba(212,175,55,0.24)",
                borderRadius: 20,
                padding: 24,
              }}
            >
              <h3 style={{ marginTop: 0 }}>{level.name}</h3>
              <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.8)" }}>
                {level.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}