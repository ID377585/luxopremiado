type RankingItem = {
  name: string;
  value: string;
};

type RankingCardProps = {
  title: string;
  subtitle: string;
  items: RankingItem[];
};

export default function RankingCard({
  title,
  subtitle,
  items,
}: RankingCardProps) {
  return (
    <article
      style={{
        background:
          "linear-gradient(180deg, rgba(10,20,64,0.95), rgba(5,16,52,0.95))",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        padding: 24,
      }}
    >
      <p style={{ marginTop: 0, color: "#f2d067", fontWeight: 900 }}>
        RANKING
      </p>
      <h2 style={{ margin: "0 0 10px", fontSize: 30 }}>{title}</h2>
      <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
        {subtitle}
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
        {items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 16,
              padding: "14px 16px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <strong>{item.name}</strong>
            <span style={{ color: "#f2d067", fontWeight: 800 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}