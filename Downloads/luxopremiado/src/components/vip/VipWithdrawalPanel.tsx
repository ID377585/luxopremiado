"use client";

import { useState } from "react";

type WithdrawalRequest = {
  id: string;
  amountCents: number;
  status: string;
  destinationPixKey: string | null;
  requestedLevelLabel: string | null;
  createdAt: string;
};

type WithdrawalSnapshot = {
  availableBalanceCents: number;
  pendingAmountCents: number;
  maxWithdrawalCents: number;
  levelLabel: string;
  requests: WithdrawalRequest[];
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents ?? 0) / 100);
}

export function VipWithdrawalPanel({ initialSnapshot }: { initialSnapshot: WithdrawalSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/vip/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        destinationPixKey: pixKey || null,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string; snapshot?: WithdrawalSnapshot };

    if (!response.ok || !data.snapshot) {
      setStatus(data.error ?? "Não foi possível solicitar o saque VIP.");
      setLoading(false);
      return;
    }

    setSnapshot(data.snapshot);
    setAmount("");
    setPixKey("");
    setStatus("Solicitação de saque VIP criada com sucesso.");
    setLoading(false);
  }

  return (
    <article
      style={{
        background: "rgba(15,23,42,0.82)",
        border: "1px solid rgba(148,163,184,0.28)",
        borderRadius: "0.8rem",
        padding: "0.9rem",
      }}
    >
      <strong>Saque VIP</strong>
      <p style={{ color: "#cbd5e1", marginTop: "0.4rem" }}>
        Disponível: {formatMoney(snapshot.availableBalanceCents)} · pendente: {formatMoney(snapshot.pendingAmountCents)} ·
        limite do nível {snapshot.levelLabel}: {formatMoney(snapshot.maxWithdrawalCents)}
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem", marginTop: "0.9rem" }}>
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Valor do saque em reais"
          style={{
            background: "rgba(15,23,42,0.75)",
            border: "1px solid rgba(148,163,184,0.3)",
            borderRadius: "10px",
            color: "#f8fafc",
            padding: "0.78rem 0.9rem",
          }}
        />
        <input
          value={pixKey}
          onChange={(event) => setPixKey(event.target.value)}
          placeholder="Chave PIX para saque (opcional se já estiver no perfil)"
          style={{
            background: "rgba(15,23,42,0.75)",
            border: "1px solid rgba(148,163,184,0.3)",
            borderRadius: "10px",
            color: "#f8fafc",
            padding: "0.78rem 0.9rem",
          }}
        />
        <button
          disabled={loading}
          style={{
            background: "linear-gradient(95deg, #22c55e, #16a34a)",
            border: 0,
            borderRadius: "10px",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 800,
            padding: "0.82rem 1.15rem",
          }}
          type="submit"
        >
          {loading ? "Solicitando..." : "Solicitar saque VIP"}
        </button>
      </form>

      {status ? <p style={{ color: "#fde68a", marginTop: "0.75rem" }}>{status}</p> : null}

      <div style={{ display: "grid", gap: "0.65rem", marginTop: "1rem" }}>
        {snapshot.requests.length ? (
          snapshot.requests.map((request) => (
            <div
              key={request.id}
              style={{
                background: "rgba(2,6,23,0.38)",
                border: "1px solid rgba(148,163,184,0.16)",
                borderRadius: "12px",
                padding: "0.8rem",
              }}
            >
              <p style={{ color: "#f8fafc" }}>
                {formatMoney(request.amountCents)} · {request.status}
              </p>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                {request.requestedLevelLabel ?? "Nível atual"} · {new Date(request.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
          ))
        ) : (
          <p style={{ color: "#94a3b8" }}>Nenhuma solicitação de saque VIP registrada.</p>
        )}
      </div>
    </article>
  );
}
