import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça a proposta do Bigode das Rifas, com foco em campanhas claras, participação simples e experiência transparente.",
  alternates: {
    canonical: "/sobre",
  },
  openGraph: {
    title: "Sobre | Bigode das Rifas",
    description:
      "Conheça a proposta do Bigode das Rifas, com foco em campanhas claras, participação simples e experiência transparente.",
    url: "/sobre",
  },
};

export default function AboutPage() {
  return (
    <main
      style={{
        margin: "0 auto",
        maxWidth: 980,
        padding: "3rem 1.25rem 4rem",
      }}
    >
      <p style={{ margin: 0, color: "#f2d067", fontWeight: 900 }}>SOBRE</p>

      <h1 style={{ margin: "12px 0 16px", fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>
        Uma plataforma pensada para participação simples, rápida e transparente.
      </h1>

      <section
        style={{
          display: "grid",
          gap: "1rem",
          color: "#e2e8f0",
          lineHeight: 1.75,
        }}
      >
        <p>
          O <strong>Bigode das Rifas</strong> foi estruturado para oferecer uma experiência
          mais direta ao usuário, com campanhas apresentadas de forma clara, fluxo de compra
          objetivo e informações relevantes visíveis com menos atrito.
        </p>

        <p>
          A proposta da plataforma é unir comunicação forte, páginas de campanha mais organizadas,
          meios de pagamento práticos e acompanhamento transparente para que o participante entenda
          rapidamente como entrar, pagar e acompanhar seu pedido.
        </p>

        <p>
          Além da navegação principal, o projeto também prioriza elementos de confiança, páginas
          institucionais e organização estrutural para facilitar suporte, entendimento das regras
          e acesso às informações essenciais da plataforma.
        </p>
      </section>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 28,
        }}
      >
        <Link
          href="/rifas"
          style={{
            textDecoration: "none",
            background: "linear-gradient(135deg, #f7d978 0%, #d4a63a 100%)",
            color: "#111",
            padding: "14px 18px",
            borderRadius: 14,
            fontWeight: 900,
          }}
        >
          Ver rifas
        </Link>

        <Link
          href="/contato"
          style={{
            textDecoration: "none",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            padding: "14px 18px",
            borderRadius: 14,
            fontWeight: 800,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          Falar com o suporte
        </Link>
      </div>
    </main>
  );
}