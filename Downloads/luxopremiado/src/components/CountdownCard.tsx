type CountdownCardProps = {
  title: string;
  timeLeft: string;
  subtitle?: string;
};

export default function CountdownCard({
  title,
  timeLeft,
  subtitle,
}: CountdownCardProps) {
  return (
    <article
      style={{
        background:
          "linear-gradient(135deg, rgba(247,217,120,0.16), rgba(10,20,64,0.94))",
        border: "1px solid rgba(242,208,103,0.28)",
        borderRadius: 24,
        padding: 24,
        boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
      }}
    >
      <p style={{ marginTop: 0, marginBottom: 8, color: "#f2d067", fontWeight: 900 }}>
        CONTAGEM REGRESSIVA
      </p>

      <h2 style={{ margin: "0 0 10px", fontSize: 28 }}>{title}</h2>

      <div
        style={{
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: 1.2,
        }}
      >
        {timeLeft}
      </div>

      {subtitle ? (
        <p
          style={{
            margin: "12px 0 0",
            color: "rgba(255,255,255,0.82)",
            lineHeight: 1.7,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </article>
  );
}