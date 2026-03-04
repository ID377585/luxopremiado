"use client";

import { useEffect, useState } from "react";

const PRIZES = [
  { prizeOrder: 1, prizeLabel: "1º Prêmio Principal" },
  { prizeOrder: 2, prizeLabel: "2º Segundo Prêmio" },
  { prizeOrder: 3, prizeLabel: "3º Terceiro Prêmio" },
];

interface PrizeConfig {
  prizeOrder: number;
  prizeLabel: string;
  totalNumbers: number;
  drawDate: string;
  luckyNumber: number;
}

interface Props {
  raffleSlug: string;
}

export function PrizeConfigForm({ raffleSlug }: Props) {
  const [prizes, setPrizes] = useState<PrizeConfig[]>(
    PRIZES.map((p) => ({
      ...p,
      totalNumbers: 100,
      drawDate: new Date().toISOString().slice(0, 16),
      luckyNumber: 1,
    })),
  );
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/prize-config?raffleSlug=${encodeURIComponent(raffleSlug)}`);
        if (!res.ok) return;
        const json = (await res.json()) as { prizes?: Array<Record<string, unknown>> };
        if (json.prizes?.length) {
          setPrizes(
            PRIZES.map((base) => {
              const match = (json.prizes ?? []).find((p) => (p as Record<string, unknown>).prize_order === base.prizeOrder) as
                | Record<string, unknown>
                | undefined;

              const prizeLabel =
                typeof match?.prize_label === "string" && match.prize_label.trim().length > 0
                  ? (match.prize_label as string)
                  : base.prizeLabel;

              const totalNumbers =
                typeof match?.total_numbers === "number" && match.total_numbers > 0 ? (match.total_numbers as number) : 100;

              const drawDateRaw = typeof match?.draw_date === "string" ? (match.draw_date as string) : null;
              const drawDate = drawDateRaw ? drawDateRaw.slice(0, 16) : new Date().toISOString().slice(0, 16);

              const luckyNumber =
                typeof match?.lucky_number === "number" && match.lucky_number > 0 ? (match.lucky_number as number) : 1;

              return {
                prizeOrder: base.prizeOrder,
                prizeLabel,
                totalNumbers,
                drawDate,
                luckyNumber,
              };
            }),
          );
        }
      } catch {
        // noop
      }
    };
    fetchData();
  }, [raffleSlug]);

  const handleChange = (index: number, field: keyof PrizeConfig, value: string) => {
    setPrizes((prev) => {
      const next = [...prev];
      const current = { ...next[index] };
      if (field === "totalNumbers" || field === "luckyNumber" || field === "prizeOrder") {
        current[field] = Number(value) as PrizeConfig[typeof field];
      } else {
        current[field] = value as PrizeConfig[typeof field];
      }
      next[index] = current;
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const payload = {
      raffleSlug,
      prizes: prizes.map((p) => ({
        prizeOrder: p.prizeOrder,
        prizeLabel: p.prizeLabel,
        totalNumbers: p.totalNumbers,
        drawDate: p.drawDate,
        luckyNumber: p.luckyNumber,
      })),
    };

    const res = await fetch("/api/admin/prize-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setStatus(json.error ?? "Erro ao salvar.");
    } else {
      setStatus("Configurações salvas com sucesso.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", maxWidth: 720 }}>
      <p style={{ color: "#cbd5e1" }}>
        Apenas o administrador autorizado pode alterar estas configurações. Rifa alvo: <strong>{raffleSlug}</strong>
      </p>
      {prizes.map((prize, index) => (
        <div
          key={prize.prizeOrder}
          style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(17,24,39,0.85))",
            border: "1px solid rgba(234,88,12,0.35)",
            borderRadius: "14px",
            padding: "1rem",
            boxShadow: "0 10px 28px rgba(15,23,42,0.35)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".6rem" }}>
            <h3 style={{ color: "#f8fafc", margin: 0 }}>{prize.prizeLabel}</h3>
            <span style={{ color: "#cbd5e1", fontSize: ".9rem" }}>Ordem {prize.prizeOrder}</span>
          </div>
          <div style={{ display: "grid", gap: ".65rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Título do prêmio
              <input
                value={prize.prizeLabel}
                onChange={(e) => handleChange(index, "prizeLabel", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Total de números
              <input
                type="number"
                min={1}
                value={prize.totalNumbers}
                onChange={(e) => handleChange(index, "totalNumbers", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Data do sorteio
              <input
                type="datetime-local"
                value={prize.drawDate}
                onChange={(e) => handleChange(index, "drawDate", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Número da sorte (fixo)
              <input
                type="number"
                min={1}
                value={prize.luckyNumber}
                onChange={(e) => handleChange(index, "luckyNumber", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        style={{
          background: "linear-gradient(95deg, #fb923c, #ea580c)",
          color: "#0f172a",
          fontWeight: 800,
          borderRadius: "12px",
          padding: "0.75rem 1rem",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Salvando..." : "Salvar configurações"}
      </button>
      {status && <p style={{ color: status.includes("sucesso") ? "#22c55e" : "#f87171" }}>{status}</p>}
    </form>
  );
}
