import type { VipUserState } from "@/lib/vip/types";
import { getProgressPercentage, getTicketBonusSummary } from "@/lib/vip/utils";

interface Props {
  user: VipUserState;
}

export function VipProgressPanel({ user }: Props) {
  const percentage = getProgressPercentage(user);

  return (
    <section
      id="progresso"
      style={{
        borderRadius: 28,
        padding: 28,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(12,24,58,0.96) 0%, rgba(7,18,43,0.96) 100%)",
        boxShadow: "0 18px 45px rgba(0,0,0,0.22)",
      }}
    >
      <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        <div
          style={{
            color: "#f2d067",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Painel de progresso
        </div>

        <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.2, fontWeight: 900 }}>
          Seu progresso para entrar oficialmente na Missão Elite
        </h2>

        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,0.78)",
            maxWidth: 900,
            lineHeight: 1.8,
            fontSize: 15,
          }}
        >
          A campanha transforma progressão em vantagem real. Entrar no VIP coloca você no jogo. Evoluir torna você competitivo.
        </p>
      </div>

      <div
        style={{
          height: 16,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "linear-gradient(90deg, #f2d067 0%, #ffd94d 100%)",
            borderRadius: 999,
            boxShadow: "0 0 20px rgba(242,208,103,0.3)",
          }}
        />
      </div>

      <div
        style={{
          marginTop: 22,
          display: "grid",
          gridTemplateColumns: "1.3fr 0.9fr",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          <StatCard label="Seus pontos totais" value={user.totalPoints.toLocaleString("pt-BR")} />
          <StatCard label="Seus pontos próprios" value={user.ownPoints.toLocaleString("pt-BR")} />
          <StatCard
            label="Afiliados qualificados"
            value={`${user.qualifiedAffiliates}/${user.requiredAffiliates}`}
          />
          <StatCard
            label="Falta para liberar VIP"
            value={`${user.pointsToUnlockVip.toLocaleString("pt-BR")} pontos`}
          />
        </div>

        <aside
          style={{
            borderRadius: 24,
            padding: 20,
            background: "rgba(242,208,103,0.06)",
            border: "1px solid rgba(242,208,103,0.14)",
            display: "grid",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: "#f2d067" }}>
            Vantagem competitiva
          </div>

          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.84)",
              lineHeight: 1.7,
              fontSize: 14,
            }}
          >
            {getTicketBonusSummary(user)}
          </p>

          <div
            style={{
              borderRadius: 18,
              padding: 16,
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 10 }}>
              Ao bater o VIP, você libera:
            </div>

            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.8,
                fontSize: 14,
              }}
            >
              <li>1 ticket oficial para a experiência</li>
              <li>selo de Participante Oficial Missão Elite</li>
              <li>acesso às missões premium</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 22,
        padding: 18,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.52)",
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 10, fontSize: 26, fontWeight: 900 }}>{value}</div>
    </div>
  );
}