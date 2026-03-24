import type { Metadata } from "next";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Sorteio ${slug} | Bigode das Rifas`,
    description: "Página individual de sorteio promocional.",
  };
}

export default async function SorteioSlugPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <main style={{ background: "#0b0b0f", color: "#fff", minHeight: "100vh" }}>
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px" }}>
        <p style={{ color: "#d4af37", fontWeight: 700 }}>MODALIDADE • SORTEIO</p>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", margin: "10px 0 14px" }}>
          {slug.replace(/-/g, " ")}
        </h1>
        <p style={{ maxWidth: 760, color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
          Esta é a página individual do sorteio. Aqui você pode futuramente exibir
          regulamento, prêmio, regras de participação, data de apuração e CTA principal.
        </p>

        <div
          style={{
            marginTop: 28,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 24,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Estrutura sugerida</h2>
          <ul style={{ lineHeight: 1.9, color: "rgba(255,255,255,0.8)" }}>
            <li>Hero do sorteio</li>
            <li>Descrição do prêmio</li>
            <li>Data e regulamento</li>
            <li>Prova social</li>
            <li>FAQ</li>
            <li>CTA principal de participação</li>
          </ul>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <Link
              href="/sorteios"
              style={{
                border: "1px solid rgba(255,255,255,0.16)",
                color: "#fff",
                textDecoration: "none",
                padding: "12px 18px",
                borderRadius: 12,
                fontWeight: 700,
              }}
            >
              Voltar para sorteios
            </Link>

            <Link
              href="/cadastro"
              style={{
                background: "#d4af37",
                color: "#111",
                textDecoration: "none",
                padding: "12px 18px",
                borderRadius: 12,
                fontWeight: 700,
              }}
            >
              Participar
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}