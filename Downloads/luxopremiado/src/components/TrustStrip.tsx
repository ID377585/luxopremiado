const trustItems = [
  {
    title: "Pagamento rápido",
    text: "Fluxo simples para reduzir atrito e fazer o usuário concluir mais rápido.",
  },
  {
    title: "Experiência premium",
    text: "Layout forte para aumentar percepção de valor e confiança visual.",
  },
  {
    title: "Campanhas objetivas",
    text: "Menos ruído, mais clareza e mais chance de participação imediata.",
  },
  {
    title: "Mais retenção",
    text: "Rifas, sorteios e leilões organizados para manter o visitante navegando.",
  },
];

export default function TrustStrip() {
  return (
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
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 16,
        }}
      >
        {trustItems.map((item) => (
          <article
            key={item.title}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 22,
              padding: 20,
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 22 }}>
              {item.title}
            </h3>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.7,
              }}
            >
              {item.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}