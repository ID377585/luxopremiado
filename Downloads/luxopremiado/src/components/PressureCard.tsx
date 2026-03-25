type Props = {
  isLeading?: boolean;
  gap?: string | null;
  rival?: string | null;
};

export default function PressureCard({ isLeading, gap, rival }: Props) {
  return (
    <div
      style={{
        background: "rgba(255,80,80,0.12)",
        border: "1px solid rgba(255,80,80,0.4)",
        borderRadius: 20,
        padding: 18,
      }}
    >
      <strong style={{ display: "block", marginBottom: 8 }}>
        {isLeading ? "Você está na frente" : "Você pode perder esse lote"}
      </strong>

      {!isLeading && (
        <p style={{ margin: 0, color: "rgba(255,255,255,0.85)" }}>
          {gap
            ? `Faltam apenas ${gap} para você assumir a liderança.`
            : "Outro participante já está liderando."}
        </p>
      )}

      {rival && (
        <span style={{ fontSize: 13, opacity: 0.7 }}>
          Disputando com: {rival}
        </span>
      )}
    </div>
  );
}