type UrgencyBarProps = {
  soldText: string;
  reservedText: string;
  watchersText: string;
};

export default function UrgencyBar({
  soldText,
  reservedText,
  watchersText,
}: UrgencyBarProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
      }}
    >
      {[soldText, reservedText, watchersText].map((item) => (
        <div
          key={item}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "14px 16px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}