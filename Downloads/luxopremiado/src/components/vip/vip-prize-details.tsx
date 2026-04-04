export function VipPrizeDetails() {
  return (
    <section
      style={{
        borderRadius: 28,
        padding: 28,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(9,20,49,0.98) 0%, rgba(7,16,39,0.98) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.2)",
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
          O prêmio
        </div>

        <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 900 }}>
          O que o ganhador vive na prática
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 20,
        }}
      >
        <div
          style={{
            borderRadius: 24,
            padding: 24,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.85,
              fontSize: 15,
            }}
          >
            A campanha oferece uma experiência oficial premium com Andressa Urach, planejada, produzida e organizada com regras claras, agenda definida e despesas principais cobertas pela campanha.
          </p>

          <div
            style={{
              marginTop: 20,
              borderRadius: 20,
              padding: 18,
              background: "rgba(242,208,103,0.08)",
              border: "1px solid rgba(242,208,103,0.16)",
            }}
          >
            <div style={{ color: "#f2d067", fontWeight: 800, marginBottom: 8 }}>
              Formulação oficial recomendada
            </div>
            <div style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.9)" }}>
              Tenha uma experiência exclusiva, planejada e inesquecível com Andressa Urach, com despesas principais pagas pela campanha.
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={{ fontWeight: 800, marginBottom: 12 }}>Inclui, por exemplo:</div>
            <div style={{ display: "grid", gap: 12 }}>
              <IncludedItem text="hotel + G.P." />
              <IncludedItem text="deslocamento local" />
              <IncludedItem text="almoço ou jantar programado" />
              <IncludedItem text="participação em ação registrada da campanha" />
            </div>
          </div>
        </div>

        <div
          style={{
            borderRadius: 24,
            padding: 24,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 18 }}>
            Etapas da experiência oficial
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <StepCard
              title="Etapa 1 — Firmar o prêmio"
              text="contato oficial com o ganhador e assinatura de regulamento, imagem e conduta"
            />
            <StepCard
              title="Etapa 2 — Recepção"
              text="check-in e kit experiência Bigode VIP"
            />
            <StepCard
              title="Etapa 3 — Experiência principal"
              text="encontro em local previamente aprovado, almoço ou jantar e participação em ação registrada da campanha"
            />
            <StepCard
              title="Etapa 4 — Conteúdo"
              text="gravação de reels, stories, depoimento do ganhador e making of para uso em site e redes"
            />
            <StepCard
              title="Etapa 5 — Fechamento"
              text="postagem oficial, certificado ou lembrança da experiência e publicação do case do campeão"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function IncludedItem({ text }: { text: string }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: "14px 16px",
        background: "rgba(0,0,0,0.18)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.88)",
        fontWeight: 700,
      }}
    >
      {text}
    </div>
  );
}

function StepCard({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 16,
        background: "rgba(0,0,0,0.18)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 8 }}>{title}</div>
      <div style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7, fontSize: 14 }}>
        {text}
      </div>
    </div>
  );
}