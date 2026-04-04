import { FAQ_ITEMS } from "@/lib/vip/constants";

export function VipFaq() {
  return (
    <section
      style={{
        borderRadius: 28,
        padding: 28,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(8,18,42,0.98) 0%, rgba(7,16,39,0.98) 100%)",
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
          FAQ
        </div>

        <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 900 }}>
          Perguntas frequentes
        </h2>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {FAQ_ITEMS.map((item, index) => (
          <article
            key={item.question}
            style={{
              borderRadius: 22,
              padding: 20,
              background:
                index === 0
                  ? "rgba(242,208,103,0.08)"
                  : "rgba(255,255,255,0.04)",
              border:
                index === 0
                  ? "1px solid rgba(242,208,103,0.16)"
                  : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 20,
                lineHeight: 1.35,
                fontWeight: 900,
              }}
            >
              {item.question}
            </h3>

            <p
              style={{
                margin: "10px 0 0",
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.8,
                fontSize: 15,
              }}
            >
              {item.answer}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}