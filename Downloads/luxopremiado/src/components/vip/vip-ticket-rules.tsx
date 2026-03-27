export function VipTicketRules() {
  const rows = [
    ["Usuário Base", "não participa do prêmio principal"],
    ["Ao entrar no VIP", "1 ticket oficial"],
    ["A cada novo nível VIP", "+1 ticket"],
    ["Ao entrar no VIP Elite", "+3 tickets"],
    ["A cada nível Elite", "+2 tickets"],
    ["Missões concluídas", "tickets bônus"],
  ];

  return (
    <section
      style={{
        borderRadius: 28,
        padding: 28,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(8,19,47,0.97) 0%, rgba(7,16,38,0.97) 100%)",
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
          Estrutura de tickets
        </div>

        <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 900 }}>
          Quanto maior seu nível, maiores suas chances
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
          Para forçar progressão, a campanha não trabalha com 1 usuário igual a 1 chance. O sistema usa tickets por nível, metas e evolução.
        </p>
      </div>

      <div
        style={{
          overflow: "hidden",
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            background: "rgba(255,255,255,0.05)",
            fontWeight: 800,
          }}
        >
          <div style={{ padding: "16px 18px" }}>Marco</div>
          <div style={{ padding: "16px 18px" }}>Recompensa</div>
        </div>

        {rows.map(([title, reward]) => (
          <div
            key={title}
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ padding: "16px 18px", color: "#fff", fontWeight: 700 }}>
              {title}
            </div>
            <div style={{ padding: "16px 18px", color: "rgba(255,255,255,0.78)" }}>
              {reward}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 18,
          borderRadius: 18,
          padding: 16,
          background: "rgba(242,208,103,0.08)",
          border: "1px solid rgba(242,208,103,0.16)",
          color: "rgba(255,255,255,0.9)",
          lineHeight: 1.7,
          fontSize: 14,
        }}
      >
        <strong style={{ color: "#f2d067" }}>Resumo estratégico:</strong> entrar no VIP coloca você dentro. Subir de nível faz você disputar de verdade.
      </div>
    </section>
  );
}