import { SECURITY_RULES } from "@/lib/vip/constants";

export function VipRules() {
  return (
    <section
      id="regras"
      style={{
        borderRadius: 28,
        padding: 28,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(8,18,44,0.98) 0%, rgba(7,16,39,0.98) 100%)",
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
          Regras e segurança
        </div>

        <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 900 }}>
          Regras oficiais da campanha
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 20,
        }}
      >
        <div
          style={{
            borderRadius: 24,
            padding: 24,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "grid",
            gap: 14,
            color: "rgba(255,255,255,0.82)",
            lineHeight: 1.8,
            fontSize: 15,
          }}
        >
          <p style={{ margin: 0 }}>
            A campanha <strong>“Missão Elite: 1 dia com Andressa Urach”</strong> é promocional e limitada ao período divulgado na página oficial.
          </p>

          <p style={{ margin: 0 }}>
            Para participar do sorteio principal, o usuário deve atingir ou já possuir status VIP válido, conforme os critérios vigentes da plataforma.
          </p>

          <p style={{ margin: 0 }}>
            Usuários que alcançarem VIP Elite durante a campanha receberão benefícios adicionais, como tickets extras e vantagens promocionais.
          </p>

          <p style={{ margin: 0 }}>
            A experiência será realizada em formato oficial, previamente organizado, com agenda, local, duração e despesas cobertas definidos no regulamento específico.
          </p>

          <p style={{ margin: 0 }}>
            O prêmio é pessoal, intransferível e sujeito à disponibilidade de agenda, produção, validação cadastral e cumprimento das regras da plataforma.
          </p>
        </div>

        <div
          style={{
            borderRadius: 24,
            padding: 24,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>
            Transparência, segurança e formato oficial
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {SECURITY_RULES.map((rule) => (
              <div
                key={rule.id}
                style={{
                  borderRadius: 16,
                  padding: "14px 16px",
                  background: "rgba(0,0,0,0.18)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                {rule.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}