import type { Metadata } from "next";
import Link from "next/link";

import { resolveAvailableRaffleSlug } from "@/lib/raffle-slug.server";
import { getRaffleLandingData } from "@/lib/raffles";

export const metadata: Metadata = {
  title: "Rifas | Bigode das Rifas",
  description: "Página exclusiva para listar e acessar as rifas da plataforma.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RifasPage() {
  const slug = await resolveAvailableRaffleSlug(null);
  const raffle = await getRaffleLandingData(slug, {
    timeoutMs: 8000,
    allowUnavailableFallback: true,
    resolveToAvailableSlug: true,
  });

  const total =
    raffle.stats.availableNumbers +
    raffle.stats.reservedNumbers +
    raffle.stats.soldNumbers;

  const soldPercent =
    total > 0 ? Math.round((raffle.stats.soldNumbers / total) * 100) : 0;

  const items = [
    {
      title: raffle.prize.title,
      slug: raffle.slug,
      description: raffle.prize.description,
      drawDate: raffle.hero.drawDateLabel,
      price: raffle.hero.priceLabel,
      sold: raffle.stats.soldNumbers,
      available: raffle.stats.availableNumbers,
      progress: soldPercent,
    },
  ];

  return (
    <main style={{ background: "#0b0b0f", color: "#fff", minHeight: "100vh" }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 24px" }}>
        <p style={{ color: "#d4af37", fontWeight: 700 }}>MODALIDADE</p>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)", margin: "10px 0 14px" }}>
          Rifas
        </h1>
        <p style={{ maxWidth: 760, color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
          Nesta área o usuário encontra apenas as campanhas de rifa. O foco aqui
          é compra de números, progresso da campanha, transparência e conversão.
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
              {item.description}
            </p>
            <p style={{ margin: "12px 0 6px" }}>{item.drawDate}</p>
            <p style={{ margin: 0, color: "#d4af37", fontWeight: 700 }}>{item.price}</p>

            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  width: "100%",
                  height: 10,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${item.progress}%`,
                    height: "100%",
                    background: "#d4af37",
                  }}
                />
              </div>
              <p style={{ marginTop: 8, color: "rgba(255,255,255,0.75)" }}>
                {item.sold.toLocaleString("pt-BR")} vendidos •{" "}
                {item.available.toLocaleString("pt-BR")} disponíveis
              </p>
            </div>

            <Link
              href={`/rifas/${item.slug}`}
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
              Abrir campanha
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}