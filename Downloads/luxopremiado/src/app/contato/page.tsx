import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Entre em contato com o Bigode das Rifas para dúvidas gerais, suporte operacional e solicitações relacionadas à plataforma.",
  alternates: {
    canonical: "/contato",
  },
  openGraph: {
    title: "Contato | Bigode das Rifas",
    description:
      "Entre em contato com o Bigode das Rifas para dúvidas gerais, suporte operacional e solicitações relacionadas à plataforma.",
    url: "/contato",
  },
};

export default function ContactPage() {
  return (
    <main
      style={{
        margin: "0 auto",
        maxWidth: 920,
        padding: "3rem 1.25rem 4rem",
      }}
    >
      <p style={{ margin: 0, color: "#f2d067", fontWeight: 900 }}>CONTATO</p>

      <h1 style={{ margin: "12px 0 16px", fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>
        Canais oficiais de contato da plataforma.
      </h1>

      <p
        style={{
          color: "#e2e8f0",
          lineHeight: 1.75,
          maxWidth: 760,
        }}
      >
        Use os canais oficiais para tirar dúvidas sobre campanhas, pedidos,
        confirmação de pagamento, suporte de conta e solicitações formais.
      </p>

      <section
        style={{
          display: "grid",
          gap: 18,
          marginTop: 28,
        }}
      >
        <article
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            padding: 22,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Suporte por e-mail</h2>
          <p style={{ margin: 0, color: "#e2e8f0", lineHeight: 1.7 }}>
            suporte@bigodedasrifas.com
          </p>
        </article>

        <article
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            padding: 22,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Atendimento operacional</h2>
          <p style={{ margin: 0, color: "#e2e8f0", lineHeight: 1.7 }}>
            Utilize os canais informados nas páginas oficiais das campanhas e na área do usuário
            para dúvidas sobre pedidos, pagamentos e participação.
          </p>
        </article>

        <article
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            padding: 22,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Privacidade e solicitações formais</h2>
          <p style={{ margin: 0, color: "#e2e8f0", lineHeight: 1.7 }}>
            Para solicitações relacionadas a dados pessoais, direitos do titular,
            termos ou comunicações formais, envie a demanda pelos canais oficiais
            com identificação suficiente para validação do pedido.
          </p>
        </article>
      </section>
    </main>
  );
}