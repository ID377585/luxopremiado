const trustItems = [
  {
    title: "Pagamento no PIX",
    text: "Fluxo de pagamento rápido para confirmar a participação sem burocracia desnecessária.",
  },
  {
    title: "Compra transparente",
    text: "Página com informações claras sobre prêmio, sorteio, pacotes e regras da campanha.",
  },
  {
    title: "Acompanhamento do participante",
    text: "Área de acesso para conferir pedidos, confirmações e histórico de participação.",
  },
  {
    title: "Campanha organizada",
    text: "Estrutura pensada para dar clareza, confiança visual e decisão de compra mais rápida.",
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