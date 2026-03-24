import type { Metadata } from "next";
import Link from "next/link";

import { getDefaultAuctionConfig } from "@/lib/auction";
import { resolveAvailableRaffleSlug } from "@/lib/raffle-slug.server";

export const metadata: Metadata = {
  title: "Leilões | Bigode das Rifas",
  description: "Página exclusiva para os leilões da plataforma.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LeiloesPage() {
  const raffleSlug = await resolveAvailableRaffleSlug(null);
  const auction = getDefaultAuctionConfig(raffleSlug);

  const items = [
    {
      title: auction.title,
      slug: auction.slug,
      subtitle: auction.subtitle,
      endsAt: auction.endsAt,
      openingBid: auction.openingBidCents,
      minIncrement: auction.minIncrementCents,
    },
  ];

  return (
    <main style={{ background: "#0b0b0f", color: "#fff", minHeight: "100vh" }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 24px" }}>
        <p style={{ color: "#d4af37", fontWeight: 700 }}>MODALIDADE</p>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)", margin: "10px 0 14px" }}>
          Leilões
        </h1>
        <p style={{ maxWidth: 760, color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
          Aqui ficam apenas os lotes em disputa. O foco desta área é o valor atual,
          o histórico de lances, o contador e a urgência de fechamento.
        </p>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "8px 24px 72px",
          display: "grid",
          gap: 20,
        }}
      >
        {items.map((item) => (
          <article
            key={item.slug}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 24,
            }}
          >
            <h2 style={{ margin: "0 0 10px", fontSize: 30 }}>{item.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.74)", lineHeight: 1.6 }}>
              {item.subtitle}
            </p>
            <p style={{ margin: "14px 0 6px" }}>
              Encerramento: {new Date(item.endsAt).toLocaleString("pt-BR")}
            </p>
            <p style={{ margin: 0, color: "#d4af37", fontWeight: 700 }}>
              Lance inicial: R${" "}
              {(item.openingBid / 100).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}{" "}
              • Incremento mínimo: R${" "}
              {(item.minIncrement / 100).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>

            <Link
              href={`/leiloes/${item.slug}?raffleSlug=${encodeURIComponent(raffleSlug)}`}
              style={{
                display: "inline-block",
                marginTop: 18,
                background: "#d4af37",
                color: "#111",
                textDecoration: "none",
                padding: "12px 18px",
                borderRadius: 12,
                fontWeight: 700,
              }}
            >
              Abrir leilão
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}