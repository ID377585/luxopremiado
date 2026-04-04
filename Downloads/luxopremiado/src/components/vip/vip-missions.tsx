import { MISSIONS } from "@/lib/vip/constants";

export function VipMissions() {
  return (
    <section
      style={{
        borderRadius: 28,
        padding: 28,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(9,20,47,0.98) 0%, rgba(7,16,39,0.98) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ display: "grid", gap: 8, marginBottom: 22 }}>
        <div
          style={{
            color: "#f2d067",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Missões da campanha
        </div>

        <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 900 }}>
          Rota Andressa Urach
        </h2>

        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,0.76)",
            lineHeight: 1.8,
            fontSize: 15,
            maxWidth: 900,
          }}
        >
          Missões específicas aceleram sua progressão e multiplicam suas chances dentro da campanha.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        {MISSIONS.map((mission, index) => (
          <article
            key={mission.id}
            style={{
              borderRadius: 24,
              padding: 22,
              background:
                index === 4
                  ? "linear-gradient(180deg, rgba(242,208,103,0.12) 0%, rgba(255,255,255,0.04) 100%)"
                  : "rgba(255,255,255,0.04)",
              border:
                index === 4
                  ? "1px solid rgba(242,208,103,0.24)"
                  : "1px solid rgba(255,255,255,0.08)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                marginBottom: 14,
                padding: "7px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 12,
                fontWeight: 800,
                color: index === 4 ? "#f2d067" : "rgba(255,255,255,0.72)",
              }}
            >
              Missão {index + 1}
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: 22,
                lineHeight: 1.3,
                fontWeight: 900,
              }}
            >
              {mission.title.replace(`Missão ${index + 1} — `, "")}
            </h3>

            <p
              style={{
                margin: "12px 0 0",
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.8,
                fontSize: 15,
              }}
            >
              {mission.description}
            </p>

            <div
              style={{
                marginTop: 18,
                borderRadius: 16,
                padding: 14,
                background: "rgba(0,0,0,0.18)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.52)" }}>
                Recompensa
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: "#f2d067",
                  fontWeight: 800,
                  lineHeight: 1.6,
                }}
              >
                {mission.reward}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}