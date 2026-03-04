"use client";

import { useEffect, useState } from "react";

interface Props {
  raffleSlug: string;
  stats: {
    soldNumbers: number;
    availableNumbers: number;
    reservedNumbers: number;
  };
}

export function LuckyNumberBanner({ raffleSlug, stats }: Props) {
  const [luckyNumber, setLuckyNumber] = useState<number | null>(null);
  const soldOut = stats.availableNumbers === 0;

  useEffect(() => {
    const fetchLucky = async () => {
      if (!soldOut) {
        setLuckyNumber(null);
        return;
      }
      try {
        const res = await fetch(`/api/raffles/${encodeURIComponent(raffleSlug)}/numbers?page=1&pageSize=1&includeStats=true`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        const candidate = json?.stats?.luckyNumber;
        if (typeof candidate === "number") {
          setLuckyNumber(candidate);
        }
      } catch {
        // ignore
      }
    };

    fetchLucky();
  }, [raffleSlug, soldOut]);

  if (!luckyNumber) {
    return null;
  }

  return (
    <section
      style={{
        margin: "1rem auto",
        maxWidth: 960,
        padding: "0.9rem 1rem",
        borderRadius: "14px",
        border: "1px solid rgba(234,88,12,0.35)",
        background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(17,24,39,0.88))",
        boxShadow: "0 10px 28px rgba(15,23,42,0.35)",
        color: "#f8fafc",
        display: "grid",
        gap: "0.25rem",
      }}
    >
      <p style={{ margin: 0, fontSize: "0.9rem", color: "#fb923c", fontWeight: 800, letterSpacing: "0.02em" }}>
        Resultado programado
      </p>
      <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>
        Número da sorte: <span style={{ color: "#22c55e" }}>{luckyNumber}</span>
      </p>
      <p style={{ margin: 0, fontSize: "0.92rem", color: "#cbd5e1" }}>
        O número foi definido pelo admin e exibido automaticamente após 100% das vendas.
      </p>
    </section>
  );
}
