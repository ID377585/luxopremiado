import type { Metadata } from "next";
import Link from "next/link";

import { Auction } from "@/components/raffle/Auction";
import { resolveAvailableRaffleSlug } from "@/lib/raffle-slug.server";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ raffleSlug?: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Leilão ${slug} | Bigode das Rifas`,
    description:
      "Página individual do leilão com foco em lote, contador, histórico e lance atual.",
  };
}

export default async function LeilaoSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const raffleSlug = query.raffleSlug
    ? query.raffleSlug
    : await resolveAvailableRaffleSlug(null);

  return (
    <main style={{ background: "#0b0b0f", minHeight: "100vh" }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 8px" }}>
        <p style={{ color: "#d4af37", fontWeight: 700, marginBottom: 8 }}>
          MODALIDADE • LEILÃO
        </p>

        <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 4vw, 3.4rem)", margin: 0 }}>
          Página individual do lote
        </h1>

        <p style={{ color: "rgba(255,255,255,0.75)", maxWidth: 760, lineHeight: 1.7 }}>
          Nesta rota o foco é total no leilão. Sem blocos de rifa e sem mistura com
          outras modalidades. O usuário entra aqui para acompanhar a disputa.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <Link
            href="/leiloes"
            style={{
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.16)",
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            Voltar para leilões
          </Link>

          <Link
            href={`/rifas/${raffleSlug}`}
            style={{
              color: "#d4af37",
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            Ver rifa associada
          </Link>
        </div>
      </section>

      <Auction raffleSlug={raffleSlug} auctionSlug={slug} />
    </main>
  );
}