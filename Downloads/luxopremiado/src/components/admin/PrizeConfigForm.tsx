"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const PRIZES = [
  { prizeOrder: 1, prizeLabel: "1º Prêmio Principal" },
  { prizeOrder: 2, prizeLabel: "2º Segundo Prêmio" },
  { prizeOrder: 3, prizeLabel: "3º Terceiro Prêmio" },
];

interface PrizeConfig {
  prizeOrder: number;
  prizeLabel: string;
  prizeValueCents: number;
  prizeValueLabel: string;
  imageUrl: string;
  totalNumbersLabel: string;
  totalNumbers: number;
  drawDateLabel: string;
  drawDate: string;
  luckyNumberLabel: string;
  luckyNumber: number;
  yearModelLabel: string;
  yearModelValue: string;
  motorLabel: string;
  motorValue: string;
  guaranteeLabel: string;
  guaranteeValue: string;
  deliveryLabel: string;
  deliveryValue: string;
}

interface Props {
  raffleSlug: string;
}

export function PrizeConfigForm({ raffleSlug }: Props) {
  const [prizes, setPrizes] = useState<PrizeConfig[]>(
    PRIZES.map((p) => ({
      ...p,
      totalNumbers: 100,
      totalNumbersLabel: "Total de números",
      drawDate: new Date().toISOString().slice(0, 16),
      drawDateLabel: "Data do sorteio",
      luckyNumber: 1,
      luckyNumberLabel: "Número da sorte (fixo)",
      prizeValueCents: 0,
      prizeValueLabel: "Valor do prêmio (R$)",
      imageUrl: "",
      yearModelLabel: "Ano/Modelo",
      yearModelValue: "",
      motorLabel: "Motor",
      motorValue: "",
      guaranteeLabel: "Garantia",
      guaranteeValue: "Fábrica",
      deliveryLabel: "Entrega",
      deliveryValue: "Todo o Brasil",
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

              const prizeValueLabel =
                typeof match?.prize_value_label === "string" && match.prize_value_label.trim().length > 0
                  ? (match.prize_value_label as string)
                  : "Valor do prêmio (R$)";
              const totalNumbers =
                typeof match?.total_numbers === "number" && match.total_numbers > 0 ? (match.total_numbers as number) : 100;
              const totalNumbersLabel =
                typeof match?.total_numbers_label === "string" && match.total_numbers_label.trim().length > 0
                  ? (match.total_numbers_label as string)
                  : "Total de números";

              const drawDateRaw = typeof match?.draw_date === "string" ? (match.draw_date as string) : null;
              const drawDate = drawDateRaw ? drawDateRaw.slice(0, 16) : new Date().toISOString().slice(0, 16);
              const drawDateLabel =
                typeof match?.draw_date_label === "string" && match.draw_date_label.trim().length > 0
                  ? (match.draw_date_label as string)
                  : "Data do sorteio";

              const luckyNumber =
                typeof match?.lucky_number === "number" && match.lucky_number > 0 ? (match.lucky_number as number) : 1;
              const luckyNumberLabel =
                typeof match?.lucky_number_label === "string" && match.lucky_number_label.trim().length > 0
                  ? (match.lucky_number_label as string)
                  : "Número da sorte (fixo)";

              const prizeValueCents =
                typeof match?.prize_value_cents === "number" && match.prize_value_cents >= 0
                  ? (match.prize_value_cents as number)
                  : 0;

              const imageUrl =
                typeof match?.image_url === "string" && match.image_url.trim().length > 0 ? (match.image_url as string) : "";

              const yearModelLabel =
                typeof match?.year_model_label === "string" && match.year_model_label.trim().length > 0
                  ? (match.year_model_label as string)
                  : "Ano/Modelo";
              const yearModelValue =
                typeof match?.year_model_value === "string" && match.year_model_value.trim().length > 0
                  ? (match.year_model_value as string)
                  : "";

              const motorLabel =
                typeof match?.motor_label === "string" && match.motor_label.trim().length > 0
                  ? (match.motor_label as string)
                  : "Motor";
              const motorValue =
                typeof match?.motor_value === "string" && match.motor_value.trim().length > 0
                  ? (match.motor_value as string)
                  : "";

              const guaranteeLabel =
                typeof match?.guarantee_label === "string" && match.guarantee_label.trim().length > 0
                  ? (match.guarantee_label as string)
                  : "Garantia";
              const guaranteeValue =
                typeof match?.guarantee_value === "string" && match.guarantee_value.trim().length > 0
                  ? (match.guarantee_value as string)
                  : "Fábrica";

              const deliveryLabel =
                typeof match?.delivery_label === "string" && match.delivery_label.trim().length > 0
                  ? (match.delivery_label as string)
                  : "Entrega";
              const deliveryValue =
                typeof match?.delivery_value === "string" && match.delivery_value.trim().length > 0
                  ? (match.delivery_value as string)
                  : "Todo o Brasil";

              return {
                prizeOrder: base.prizeOrder,
                prizeLabel,
                prizeValueLabel,
                totalNumbersLabel,
                prizeValueCents,
                imageUrl,
                totalNumbers,
                drawDate,
                drawDateLabel,
                luckyNumber,
                luckyNumberLabel,
                yearModelLabel,
                yearModelValue,
                motorLabel,
                motorValue,
                guaranteeLabel,
                guaranteeValue,
                deliveryLabel,
                deliveryValue,
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
      } else if (field === "prizeValueCents") {
        const cents = Number(value.replace(/\D/g, "")) || 0;
        current.prizeValueCents = cents;
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
        prizeValueLabel: p.prizeValueLabel,
        prizeValueCents: p.prizeValueCents,
        imageUrl: p.imageUrl,
        totalNumbersLabel: p.totalNumbersLabel,
        totalNumbers: p.totalNumbers,
        drawDate: p.drawDate,
        drawDateLabel: p.drawDateLabel,
        luckyNumber: p.luckyNumber,
        luckyNumberLabel: p.luckyNumberLabel,
        yearModelLabel: p.yearModelLabel,
        yearModelValue: p.yearModelValue,
        motorLabel: p.motorLabel,
        motorValue: p.motorValue,
        guaranteeLabel: p.guaranteeLabel,
        guaranteeValue: p.guaranteeValue,
        deliveryLabel: p.deliveryLabel,
        deliveryValue: p.deliveryValue,
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
        Apenas o administrador autorizado pode alterar estas configurações da campanha principal da Bigode das Rifas.
      </p>
      {prizes.map((prize, index) => (
        <div
          key={prize.prizeOrder}
          style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(17,24,39,0.92))",
            border: "1px solid rgba(234,88,12,0.4)",
            borderRadius: "14px",
            padding: "1rem",
            boxShadow: "0 10px 28px rgba(15,23,42,0.35)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".6rem" }}>
            <h3 style={{ color: "#f8fafc", margin: 0 }}>{prize.prizeLabel}</h3>
            <span style={{ color: "#cbd5e1", fontSize: ".9rem" }}>Prêmio {prize.prizeOrder}</span>
          </div>
          <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Título do prêmio
              <input
                value={prize.prizeLabel}
                onChange={(e) => handleChange(index, "prizeLabel", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Rótulo valor do prêmio
              <input
                value={prize.prizeValueLabel}
                onChange={(e) => handleChange(index, "prizeValueLabel", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              {prize.prizeValueLabel || "Valor do prêmio (R$)"}
              <input
                inputMode="numeric"
                value={(prize.prizeValueCents / 100).toFixed(2)}
                onChange={(e) => {
                  const cents = Math.round(Number(e.target.value.replace(/[^0-9,\\.]/g, "").replace(",", ".")) * 100) || 0;
                  handleChange(index, "prizeValueCents", String(cents));
                }}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Rótulo total de números
              <input
                value={prize.totalNumbersLabel}
                onChange={(e) => handleChange(index, "totalNumbersLabel", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              {prize.totalNumbersLabel || "Total de números"}
              <input
                type="number"
                min={1}
                value={prize.totalNumbers}
                onChange={(e) => handleChange(index, "totalNumbers", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Rótulo data do sorteio
              <input
                value={prize.drawDateLabel}
                onChange={(e) => handleChange(index, "drawDateLabel", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              {prize.drawDateLabel || "Data do sorteio"}
              <input
                type="datetime-local"
                value={prize.drawDate}
                onChange={(e) => handleChange(index, "drawDate", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Rótulo número da sorte
              <input
                value={prize.luckyNumberLabel}
                onChange={(e) => handleChange(index, "luckyNumberLabel", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              {prize.luckyNumberLabel || "Número da sorte (fixo)"}
              <input
                type="number"
                min={1}
                value={prize.luckyNumber}
                onChange={(e) => handleChange(index, "luckyNumber", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Rótulo Ano/Modelo
              <input
                value={prize.yearModelLabel}
                onChange={(e) => handleChange(index, "yearModelLabel", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Valor Ano/Modelo
              <input
                value={prize.yearModelValue}
                onChange={(e) => handleChange(index, "yearModelValue", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Rótulo Motor
              <input
                value={prize.motorLabel}
                onChange={(e) => handleChange(index, "motorLabel", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Valor do motor
              <input
                value={prize.motorValue}
                onChange={(e) => handleChange(index, "motorValue", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Rótulo garantia
              <input
                value={prize.guaranteeLabel}
                onChange={(e) => handleChange(index, "guaranteeLabel", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              {prize.guaranteeLabel || "Garantia"}
              <input
                value={prize.guaranteeValue}
                onChange={(e) => handleChange(index, "guaranteeValue", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Rótulo entrega
              <input
                value={prize.deliveryLabel}
                onChange={(e) => handleChange(index, "deliveryLabel", e.target.value)}
                style={{ padding: ".55rem .7rem", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              {prize.deliveryLabel || "Entrega"}
              <select
                value={prize.deliveryValue}
                onChange={(e) => handleChange(index, "deliveryValue", e.target.value)}
                style={{
                  padding: ".55rem .7rem",
                  borderRadius: "10px",
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#f8fafc",
                }}
              >
                <option value="Todo o Brasil">Todo o Brasil</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
            </label>
            <label style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", gap: ".25rem" }}>
              Imagem do prêmio (URL ou upload)
              <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="https://..."
                  value={prize.imageUrl}
                  onChange={(e) => handleChange(index, "imageUrl", e.target.value)}
                  style={{
                    flex: 1,
                    padding: ".55rem .7rem",
                    borderRadius: "10px",
                    border: "1px solid #334155",
                    background: "#0f172a",
                    color: "#f8fafc",
                  }}
                />
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".35rem",
                    padding: ".55rem .9rem",
                    borderRadius: "10px",
                    border: "1px dashed #ea580c",
                    background: "rgba(234,88,12,0.08)",
                    color: "#f8fafc",
                    cursor: "pointer",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  Upload imagem
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const metaRes = await fetch("/api/admin/prize-upload", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ fileName: file.name, prizeOrder: prize.prizeOrder }),
                        });
                        if (!metaRes.ok) {
                          const metaJson = await metaRes.json().catch(() => ({}));
                          throw new Error(metaJson.error ?? "Erro ao preparar upload");
                        }
                        const metaJson = (await metaRes.json()) as { signedUrl: string; publicUrl: string };

                        const uploadRes = await fetch(metaJson.signedUrl, {
                          method: "PUT",
                          headers: { "Content-Type": file.type || "application/octet-stream" },
                          body: file,
                        });
                        if (!uploadRes.ok) {
                          throw new Error("Falha ao enviar o arquivo (RLS ou Content-Type)");
                        }

                        handleChange(index, "imageUrl", metaJson.publicUrl);
                        setStatus(null);
                      } catch (err) {
                        const message = err instanceof Error ? err.message : String(err);
                        setStatus(`Erro ao enviar imagem: ${message}`);
                      }
                    }}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              {prize.imageUrl && (
                <div style={{ position: "relative", marginTop: ".4rem", height: 120, maxWidth: 200 }}>
                  <Image
                    alt="Preview do prêmio"
                    src={prize.imageUrl}
                    fill
                    sizes="200px"
                    style={{ objectFit: "cover", borderRadius: "10px", border: "1px solid #334155" }}
                  />
                </div>
              )}
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
