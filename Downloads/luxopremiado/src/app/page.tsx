import type { Metadata } from "next";
import Link from "next/link";

import { resolveAvailableRaffleSlug } from "@/lib/raffle-slug.server";
import { getRaffleLandingData } from "@/lib/raffles";

export const metadata: Metadata = {
  title: "Bigode das Rifas",
  description:
    "Escolha sua modalidade: rifas, sorteios, leilões e VIP em páginas separadas.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const featuredSlug = await resolveAvailableRaffleSlug(null);
  const featuredRaffle = await getRaffleLandingData(featuredSlug, {
    timeoutMs: 8000,
    allowUnavailableFallback: true,
    resolveToAvailableSlug: true,
  });

  const modalities = [
    {
      title: "Rifas",
      description:
        "Campanhas com números, compra rápida, progresso em tempo real e transparência.",
      href: "/rifas",
      cta: "Ver rifas",
    },
    {
      title: "Sorteios",
      description:
        "Campanhas promocionais separadas, com foco em regulamento, prêmio e participação.",
      href: "/sorteios",
      cta: "Ver sorteios",
    },
    {
      title: "Leilões",
      description:
        "Lotes premium com disputa ao vivo, histórico de lances e proxy bid.",
      href: "/leiloes",
      cta: "Ver leilões",
    },
    {
      title: "VIP",
      description:
        "Programa de benefícios, níveis, comissões e vantagens exclusivas.",
      href: "/vip",
      cta: "Conhecer o VIP",
    },
  ];

  return (
    <main style={{ background: "#0b0b0f", color: "#fff", minHeight: "100vh" }}>
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "64px 24px 32px",
        }}
      >
        <p style={{ color: "#d4af37", fontWeight: 700, letterSpacing: 1 }}>
          BIGODE DAS RIFAS
        </p>

        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            lineHeight: 1.05,
            margin: "12px 0 16px",
          }}
        >
          Agora cada modalidade tem sua própria página.
        </h1>

        <p
          style={{
            maxWidth: 760,
            color: "rgba(255,255,255,0.78)",
            fontSize: 18,
            lineHeight: 1.6,
          }}
        >
          Reestruturamos a navegação para separar rifas, sorteios, leilões e VIP.
          Isso melhora a experiência, deixa a comunicação mais clara e aumenta o
          foco de cada funil.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
          <Link
            href={`/rifas/${featuredRaffle.slug}`}
            style={{
              background: "#d4af37",
              color: "#111",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Entrar na rifa em destaque
          </Link>

          <Link
            href="/leiloes"
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Explorar leilões
          </Link>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
        }}
      >
        {modalities.map((item) => (
          <article
            key={item.title}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 28 }}>{item.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
              {item.description}
            </p>
            <Link
              href={item.href}
              style={{
                display: "inline-block",
                marginTop: 12,
                color: "#d4af37",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              {item.cta}
            </Link>
          </article>
        ))}
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 24px 72px",
        }}
      >
        <article
          style={{
            background:
              "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(255,255,255,0.04))",
            border: "1px solid rgba(212,175,55,0.28)",
            borderRadius: 24,
            padding: 28,
          }}
        >
          <p style={{ color: "#d4af37", fontWeight: 700, marginBottom: 8 }}>
            Campanha em destaque
          </p>
          <h3 style={{ margin: "0 0 8px", fontSize: 32 }}>
            {featuredRaffle.prize.title}
          </h3>
          <p style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
            {featuredRaffle.prize.description}
          </p>
          <p style={{ marginTop: 16, color: "#fff" }}>
            {featuredRaffle.hero.drawDateLabel} • {featuredRaffle.hero.priceLabel}
          </p>
          <Link
            href={`/rifas/${featuredRaffle.slug}`}
            style={{
              display: "inline-block",
              marginTop: 16,
              background: "#fff",
              color: "#111",
              textDecoration: "none",
              padding: "12px 18px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            Abrir página da rifa
          </Link>
        </article>
      </section>
    </main>
  );
}