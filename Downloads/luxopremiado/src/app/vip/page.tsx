import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Área VIP | Bigode das Rifas",
  description:
    "Painel interno do programa VIP com visão de nível, comissões, benefícios e campanhas exclusivas.",
};

const vipUser = {
  name: "Ivan Escobar",
  level: "VIP Ouro",
  nextLevel: "Nível máximo atual",
  commissionRate: "12%",
  totalCommissions: "R$ 4.860,00",
  pendingCommissions: "R$ 740,00",
  referrals: 38,
  activeCampaigns: 6,
  status: "Perfil ativo",
};

const stats = [
  { label: "Comissão total", value: vipUser.totalCommissions },
  { label: "Comissão pendente", value: vipUser.pendingCommissions },
  { label: "Indicados ativos", value: String(vipUser.referrals) },
  { label: "Campanhas disponíveis", value: String(vipUser.activeCampaigns) },
];

const benefits = [
  {
    title: "Comissão ampliada",
    description:
      "Ganhe percentuais mais vantajosos conforme sua evolução dentro do programa.",
  },
  {
    title: "Acesso antecipado",
    description:
      "Entre antes em campanhas estratégicas e aproveite oportunidades exclusivas.",
  },
  {
    title: "Suporte prioritário",
    description:
      "Atendimento preferencial para demandas operacionais e comerciais.",
  },
  {
    title: "Ativações premium",
    description:
      "Participe de campanhas especiais com maior retorno e visibilidade.",
  },
];

const campaigns = [
  {
    title: "Campanha VIP Auto Premium",
    category: "Leilões",
    reward: "Comissão de 12%",
    status: "Ativa",
  },
  {
    title: "Ação exclusiva iPhone Pro",
    category: "Rifas",
    reward: "Comissão de 10%",
    status: "Nova",
  },
  {
    title: "Sorteio especial Smart TV",
    category: "Sorteios",
    reward: "Bônus adicional por meta",
    status: "Encerrando",
  },
];

const commissionHistory = [
  {
    title: "Campanha BMW G 310",
    date: "22/03/2026",
    value: "R$ 320,00",
    status: "Pago",
  },
  {
    title: "Rifa iPhone 15 Pro Max",
    date: "20/03/2026",
    value: "R$ 180,00",
    status: "Pago",
  },
  {
    title: "Campanha Honda Civic Touring",
    date: "18/03/2026",
    value: "R$ 240,00",
    status: "Pendente",
  },
];

export default function AppVipPage() {
  return (
    <main style={{ background: "#0b0b0f", color: "#fff", minHeight: "100vh" }}>
      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "40px 24px 28px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ color: "#d4af37", fontWeight: 700, margin: 0 }}>
              ÁREA INTERNA VIP
            </p>
            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 3.4rem)",
                margin: "10px 0 12px",
              }}
            >
              Bem-vindo, {vipUser.name}
            </h1>
            <p
              style={{
                maxWidth: 760,
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Acompanhe seu nível, suas comissões, campanhas disponíveis e seus
              benefícios exclusivos dentro do programa VIP.
            </p>
          </div>

          <div
            style={{
              minWidth: 280,
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(255,255,255,0.04))",
              border: "1px solid rgba(212,175,55,0.24)",
              borderRadius: 22,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.74)" }}>
              Nível atual
            </p>
            <strong style={{ display: "block", fontSize: 30, marginTop: 8 }}>
              {vipUser.level}
            </strong>
            <p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.8)" }}>
              Comissão atual: {vipUser.commissionRate}
            </p>
            <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.65)" }}>
              Status: {vipUser.status}
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
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
          {stats.map((item) => (
            <article
              key={item.label}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                padding: 20,
              }}
            >
              <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>
                {item.label}
              </p>
              <strong style={{ display: "block", fontSize: 28, marginTop: 8 }}>
                {item.value}
              </strong>
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
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
              BENEFÍCIOS ATIVOS
            </p>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>
              O que o seu nível libera hoje
            </h2>

            <div style={{ display: "grid", gap: 14 }}>
              {benefits.map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 18,
                    padding: 18,
                  }}
                >
                  <strong style={{ display: "block", marginBottom: 8 }}>
                    {item.title}
                  </strong>
                  <span style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.16), rgba(255,255,255,0.04))",
              border: "1px solid rgba(212,175,55,0.24)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
              RESUMO DO PROGRAMA
            </p>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>Sua posição no VIP</h2>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 18,
                padding: 18,
                marginBottom: 14,
              }}
            >
              <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                Nível atual
              </p>
              <strong>{vipUser.level}</strong>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 18,
                padding: 18,
                marginBottom: 14,
              }}
            >
              <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                Próximo nível
              </p>
              <strong>{vipUser.nextLevel}</strong>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 18,
                padding: 18,
              }}
            >
              <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                Comissão atual
              </p>
              <strong>{vipUser.commissionRate}</strong>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <Link
                href="/app/perfil"
                style={{
                  background: "#111",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.16)",
                  fontWeight: 700,
                }}
              >
                Ver meu perfil
              </Link>

              <Link
                href="/vip"
                style={{
                  background: "#fff",
                  color: "#111",
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: 12,
                  fontWeight: 700,
                }}
              >
                Ver landing VIP
              </Link>
            </div>
          </article>
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
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: 24,
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
                CAMPANHAS DISPONÍVEIS
              </p>
              <h2 style={{ fontSize: 28, margin: 0 }}>
                Oportunidades exclusivas para o seu perfil
              </h2>
            </div>

            <span style={{ color: "rgba(255,255,255,0.7)" }}>
              Atualizado conforme seu nível VIP
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
            }}
          >
            {campaigns.map((campaign) => (
              <div
                key={campaign.title}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 20,
                  padding: 20,
                }}
              >
                <strong style={{ display: "block", marginBottom: 10, fontSize: 20 }}>
                  {campaign.title}
                </strong>
                <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.72)" }}>
                  Categoria: {campaign.category}
                </p>
                <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.72)" }}>
                  Benefício: {campaign.reward}
                </p>
                <p style={{ margin: 0, color: "#d4af37", fontWeight: 700 }}>
                  {campaign.status}
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
              "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(212,175,55,0.12))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: 24,
          }}
        >
          <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
            HISTÓRICO DE COMISSÕES
          </p>
          <h2 style={{ marginTop: 0, fontSize: 28 }}>
            Últimos registros do seu painel
          </h2>

          <div style={{ display: "grid", gap: 14 }}>
            {commissionHistory.map((item) => (
              <div
                key={`${item.title}-${item.date}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 12,
                  alignItems: "center",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 18,
                  padding: "16px 18px",
                }}
              >
                <div>
                  <strong style={{ display: "block", marginBottom: 4 }}>
                    {item.title}
                  </strong>
                  <span style={{ color: "rgba(255,255,255,0.68)" }}>{item.date}</span>
                </div>

                <strong>{item.value}</strong>

                <span
                  style={{
                    color: item.status === "Pago" ? "#d4af37" : "rgba(255,255,255,0.78)",
                    fontWeight: 700,
                  }}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}