type SocialProofItem = {
  name: string;
  text: string;
};

type SocialProofProps = {
  title: string;
  items: SocialProofItem[];
};

export default function SocialProof({ title, items }: SocialProofProps) {
  return (
    <article
      style={{
        background:
          "linear-gradient(135deg, rgba(247,217,120,0.18), rgba(10,20,64,0.94))",
        border: "1px solid rgba(242,208,103,0.28)",
        borderRadius: 24,
        padding: 24,
      }}
    >
      <p style={{ marginTop: 0, color: "#f2d067", fontWeight: 900 }}>
        PROVA SOCIAL
      </p>
      <h2 style={{ margin: "0 0 16px", fontSize: 30 }}>{title}</h2>

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 16,
              padding: 16,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <strong style={{ display: "block", marginBottom: 8 }}>{item.name}</strong>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", lineHeight: 1.7 }}>
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}