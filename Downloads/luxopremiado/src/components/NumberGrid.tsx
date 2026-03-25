type Props = {
  total: number;
  selected: number[];
  onSelect: (n: number) => void;
};

export default function NumberGrid({ total, selected, onSelect }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(10,1fr)",
        gap: 6,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const num = i + 1;
        const active = selected.includes(num);

        return (
          <button
            key={num}
            onClick={() => onSelect(num)}
            style={{
              padding: "10px",
              borderRadius: 8,
              border: active ? "2px solid #f2d067" : "1px solid #333",
              background: active ? "#f2d067" : "#111",
              color: active ? "#000" : "#fff",
              fontWeight: 700,
            }}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
}