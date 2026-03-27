import Link from "next/link";
import { CAMPAIGN_COPY } from "@/lib/vip/constants";
import type { VipUserState } from "@/lib/vip/types";
import { getCampaignStatusMessage, getTierLabel } from "@/lib/vip/utils";

interface Props {
  user: VipUserState;
}

export function VipHero({ user }: Props) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        border: "1px solid rgba(242,208,103,0.16)",
        background:
          "linear-gradient(135deg, rgba(18,35,79,0.98) 0%, rgba(8,18,45,0.98) 55%, rgba(11,19,34,0.98) 100%)",
        boxShadow:
          "0 30px 70px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
        padding: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -140,
          right: -80,
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "rgba(242,208,103,0.14)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: -120,
          left: -80,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(66,133,244,0.12)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1.4fr 0.9fr",
          gap: 24,
          padding: 32,
        }}
      >
        <div style={{ display: "grid", gap: 18 }}>
          <div
            style={{
              display: "inline-flex",
              width: "fit-content",
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(242,208,103,0.1)",
              border: "1px solid rgba(242,208,103,0.18)",
              color: "#f2d067",
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: 0.3,
            }}
          >
            {CAMPAIGN_COPY.eyebrow}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 42,
                lineHeight: 1.08,
                fontWeight: 900,
                maxWidth: 760,
              }}
            >
              {CAMPAIGN_COPY.heroTitle}
            </h1>

            <p
              style={{
                margin: 0,
                color: "#f2d067",
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              {CAMPAIGN_COPY.heroLead}
            </p>

            <p
              style={{
                margin: 0,
                maxWidth: 760,
                color: "rgba(255,255,255,0.82)",
                fontSize: 16,
                lineHeight: 1.8,
              }}
            >
              {CAMPAIGN_COPY.heroDescription}
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="#progresso" style={primaryButtonStyle}>
              {CAMPAIGN_COPY.unlockButton}
            </Link>

            <Link href="#regras" style={secondaryButtonStyle}>
              {CAMPAIGN_COPY.rulesButton}
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 14,
              marginTop: 8,
            }}
          >
            <MiniInfoCard
              label="Duração"
              value="30 dias"
              description="Campanha oficial com progressão"
            />
            <MiniInfoCard
              label="Entrada"
              value="VIP"
              description="É preciso ter ou atingir VIP"
            />
            <MiniInfoCard
              label="Vantagem máxima"
              value="Elite"
              description="Mais tickets, baús e prioridade"
            />
          </div>
        </div>

        <aside
          style={{
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(10px)",
            padding: 22,
            display: "grid",
            gap: 16,
            alignSelf: "stretch",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  color: "rgba(255,255,255,0.52)",
                }}
              >
                Seu status atual
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 28,
                  fontWeight: 900,
                  color: "#f2d067",
                }}
              >
                {getTierLabel(user.tier)}
              </div>
            </div>

            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(242,208,103,0.14)",
                border: "1px solid rgba(242,208,103,0.22)",
                color: "#f2d067",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              Missão Elite
            </div>
          </div>

          <div
            style={{
              borderRadius: 20,
              background: "rgba(4,13,31,0.52)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 16,
              color: "rgba(255,255,255,0.88)",
              lineHeight: 1.7,
              fontSize: 14,
            }}
          >
            {getCampaignStatusMessage(user)}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <MetricCard label="Tickets atuais" value={String(user.currentTickets)} />
            <MetricCard
              label="XP na campanha"
              value={user.xpInCampaign.toLocaleString("pt-BR")}
            />
            <MetricCard
              label="Afiliados válidos"
              value={`${user.qualifiedAffiliates}/${user.requiredAffiliates}`}
            />
            <MetricCard
              label="Pontos próprios"
              value={user.ownPoints.toLocaleString("pt-BR")}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}

function MiniInfoCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 20, fontWeight: 900 }}>{value}</div>
      <div
        style={{
          marginTop: 6,
          fontSize: 13,
          color: "rgba(255,255,255,0.68)",
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 16,
        background: "rgba(0,0,0,0.22)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.54)" }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "14px 22px",
  background: "#f2d067",
  color: "#071632",
  fontWeight: 900,
  textDecoration: "none",
  boxShadow: "0 10px 30px rgba(242,208,103,0.18)",
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "14px 22px",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  fontWeight: 800,
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.1)",
};