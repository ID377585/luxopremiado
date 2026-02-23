import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ margin: "0 auto", maxWidth: "980px", padding: "4rem 1.25rem" }}>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "1rem" }}>Luxo Premiado</h1>
      <p style={{ color: "#cbd5e1", maxWidth: "60ch", marginBottom: "1.5rem" }}>
        Plataforma pronta para campanhas premium com seleção de números, pagamentos, auditoria e painel do usuário.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        <Link
          href="/r/luxo-premiado"
          style={{
            background: "linear-gradient(95deg, #fb923c, #ea580c)",
            borderRadius: "0.75rem",
            color: "white",
            fontWeight: 700,
            padding: "0.75rem 1rem",
          }}
        >
          Abrir landing da rifa
        </Link>
        <Link
          href="/app"
          style={{
            border: "1px solid rgba(148, 163, 184, 0.45)",
            borderRadius: "0.75rem",
            color: "#f8fafc",
            fontWeight: 700,
            padding: "0.75rem 1rem",
          }}
        >
          Abrir painel do usuário
        </Link>
      </div>
    </main>
  );
}
