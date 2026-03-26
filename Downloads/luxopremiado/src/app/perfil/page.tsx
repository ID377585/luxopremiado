import type { Metadata } from "next";
import Link from "next/link";

import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Meu Perfil | Bigode das Rifas",
  description:
    "Painel de perfil do usuário com dados cadastrais, status da conta, segurança e atalhos rápidos.",
};

function readUserMetadataValue(
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | null {
  const value = metadata?.[key];

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

export default async function AppPerfilPage() {
  const user = await getSessionUser();
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;

  const profile = {
    name:
      readUserMetadataValue(metadata, "full_name") ??
      readUserMetadataValue(metadata, "name") ??
      "Participante",
    email: user?.email ?? "Não informado",
    phone:
      readUserMetadataValue(metadata, "phone") ??
      readUserMetadataValue(metadata, "telefone") ??
      "Não informado",
    city:
      readUserMetadataValue(metadata, "city") ??
      readUserMetadataValue(metadata, "cidade") ??
      "Não informado",
    status: user ? "Conta ativa" : "Sessão não encontrada",
    vipStatus:
      readUserMetadataValue(metadata, "vip_status") ??
      "Em análise",
    affiliateCode:
      readUserMetadataValue(metadata, "affiliate_code") ??
      "—",
    createdAt: user?.created_at
      ? `Cadastro desde ${new Date(user.created_at).toLocaleDateString("pt-BR")}`
      : "Data de cadastro indisponível",
  };

  const quickActions = [
    {
      title: "Editar dados pessoais",
      description: "Atualize nome, telefone e informações principais do cadastro.",
    },
    {
      title: "Alterar senha",
      description: "Aumente a segurança da conta atualizando sua senha de acesso.",
    },
    {
      title: "Verificar documentos",
      description: "Confirme o status de validação e de segurança do seu perfil.",
    },
    {
      title: "Gerenciar preferências",
      description: "Defina notificações, comunicações e alertas da sua conta.",
    },
  ];

  const accountStatus = [
    { label: "Situação da conta", value: user ? "Ativa" : "Indisponível" },
    { label: "Validação", value: user ? "Concluída" : "Pendente" },
    { label: "Status VIP", value: profile.vipStatus },
    { label: "Código de afiliado", value: profile.affiliateCode },
  ];

  const securityItems = [
    "Senha protegida e atualizável",
    "Validação cadastral concluída",
    "Histórico de acesso monitorado",
    "Canal de suporte disponível",
  ];

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
              ÁREA DO USUÁRIO
            </p>
            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 3.4rem)",
                margin: "10px 0 12px",
              }}
            >
              Meu perfil
            </h1>
            <p
              style={{
                maxWidth: 760,
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Gerencie seus dados, acompanhe a situação da conta e acesse
              rapidamente os recursos principais do seu cadastro.
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
              Status da conta
            </p>
            <strong style={{ display: "block", fontSize: 28, marginTop: 8 }}>
              {profile.status}
            </strong>
            <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.78)" }}>
              {profile.createdAt}
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
            gridTemplateColumns: "1.05fr 0.95fr",
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
              DADOS CADASTRAIS
            </p>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>
              Informações principais da conta
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 18,
                  padding: 18,
                }}
              >
                <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                  Nome
                </p>
                <strong>{profile.name}</strong>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 18,
                  padding: 18,
                }}
              >
                <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                  E-mail
                </p>
                <strong>{profile.email}</strong>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 18,
                  padding: 18,
                }}
              >
                <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                  Telefone
                </p>
                <strong>{profile.phone}</strong>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 18,
                  padding: 18,
                }}
              >
                <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                  Cidade
                </p>
                <strong>{profile.city}</strong>
              </div>
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
              STATUS DA CONTA
            </p>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>
              Visão rápida do seu perfil
            </h2>

            <div style={{ display: "grid", gap: 12 }}>
              {accountStatus.map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.66)" }}>
                    {item.label}
                  </p>
                  <strong>{item.value}</strong>
                </div>
              ))}
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
                AÇÕES RÁPIDAS
              </p>
              <h2 style={{ fontSize: 28, margin: 0 }}>
                Gerencie sua conta com poucos cliques
              </h2>
            </div>

            <span style={{ color: "rgba(255,255,255,0.7)" }}>
              Área preparada para futuras integrações reais
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
            }}
          >
            {quickActions.map((item) => (
              <div
                key={item.title}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 20,
                  padding: 20,
                }}
              >
                <strong style={{ display: "block", marginBottom: 10, fontSize: 20 }}>
                  {item.title}
                </strong>
                <p
                  style={{
                    margin: 0,
                    color: "rgba(255,255,255,0.74)",
                    lineHeight: 1.6,
                  }}
                >
                  {item.description}
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
                "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(212,175,55,0.12))",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <p style={{ color: "#d4af37", fontWeight: 700, marginTop: 0 }}>
              SEGURANÇA
            </p>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>
              Proteção e confiabilidade do cadastro
            </h2>

            <ul
              style={{
                paddingLeft: 18,
                lineHeight: 1.9,
                color: "rgba(255,255,255,0.82)",
                marginBottom: 0,
              }}
            >
              {securityItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

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
              ATALHOS
            </p>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>
              Navegue rápido entre áreas importantes
            </h2>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
              <Link
                href="/app/vip"
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
                Ir para área VIP
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
                Ver página pública VIP
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}