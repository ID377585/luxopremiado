"use client";

import { startTransition, useEffect, useState } from "react";

type WithdrawalRequest = {
  id: string;
  userId: string;
  userName: string | null;
  amountCents: number;
  status: string;
  requestedLevelLabel: string | null;
  destinationPixKey: string | null;
  provider: string | null;
  providerReference: string | null;
  providerStatus: string | null;
  adminNotes: string | null;
  createdAt: string;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents ?? 0) / 100);
}

export function VipWithdrawalsAdminForm() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const response = await fetch("/api/admin/vip/withdrawals");
      const data = (await response.json().catch(() => ({}))) as { requests?: WithdrawalRequest[]; error?: string };
      if (!active) {
        return;
      }
      if (!response.ok) {
        startTransition(() => setStatus(data.error ?? "Erro ao carregar saques VIP."));
        return;
      }
      startTransition(() => setRequests(data.requests ?? []));
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  async function handleStatus(requestId: string, nextStatus: "approved" | "paid" | "rejected" | "canceled") {
    const response = await fetch("/api/admin/vip/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId,
        status: nextStatus,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as { requests?: WithdrawalRequest[]; error?: string };
    if (!response.ok) {
      setStatus(data.error ?? "Erro ao atualizar saque VIP.");
      return;
    }
    setRequests(data.requests ?? []);
    setStatus(`Solicitação ${nextStatus}.`);
  }

  return (
    <section
      style={{
        background: "linear-gradient(145deg, rgba(15,23,42,0.94), rgba(17,24,39,0.92))",
        border: "1px solid rgba(74,222,128,0.28)",
        borderRadius: "16px",
        boxShadow: "0 14px 34px rgba(15,23,42,0.32)",
        marginTop: "1rem",
        maxWidth: 840,
        padding: "1rem",
      }}
    >
      <h2 style={{ color: "#f8fafc", fontSize: "1.15rem", fontWeight: 800, marginBottom: "0.35rem" }}>
        Saques VIP
      </h2>
      <p style={{ color: "#cbd5e1", marginBottom: "0.9rem" }}>
        Aprove, pague ou rejeite solicitações de retirada conforme o nível VIP e o saldo disponível.
      </p>

      {status ? <p style={{ color: "#fde68a", marginBottom: "0.75rem" }}>{status}</p> : null}

      <div style={{ display: "grid", gap: "0.65rem" }}>
        {requests.length ? (
          requests.map((request) => (
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
                {request.userName ?? request.userId} · {formatMoney(request.amountCents)} · {request.status}
              </p>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                {request.requestedLevelLabel ?? "Sem nível"} · PIX {request.destinationPixKey ?? "não informado"} ·{" "}
                {new Date(request.createdAt).toLocaleString("pt-BR")}
              </p>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                {request.provider
                  ? `${request.provider} · ${request.providerStatus ?? "sem status"}${request.providerReference ? ` · ref ${request.providerReference}` : ""}`
                  : "Transferência ainda não enviada ao gateway"}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.6rem" }}>
                <button onClick={() => handleStatus(request.id, "approved")} type="button">
                  Aprovar
                </button>
                <button onClick={() => handleStatus(request.id, "paid")} type="button">
                  Pagar automático
                </button>
                <button onClick={() => handleStatus(request.id, "rejected")} type="button">
                  Rejeitar
                </button>
                <button onClick={() => handleStatus(request.id, "canceled")} type="button">
                  Cancelar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#94a3b8" }}>Nenhuma solicitação de saque VIP até agora.</p>
        )}
      </div>
    </section>
  );
}
