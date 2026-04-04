"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

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

type StatusTone = "success" | "error" | "warning" | "info";

type StatusState = {
  tone: StatusTone;
  message: string;
} | null;

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents ?? 0) / 100);
}

function StatusBanner({ status }: { status: StatusState }) {
  if (!status) return null;

  const colors: Record<StatusTone, { border: string; background: string; color: string }> = {
    success: {
      border: "1px solid rgba(34,197,94,0.35)",
      background: "rgba(20,83,45,0.18)",
      color: "#86efac",
    },
    error: {
      border: "1px solid rgba(248,113,113,0.35)",
      background: "rgba(127,29,29,0.18)",
      color: "#fca5a5",
    },
    warning: {
      border: "1px solid rgba(250,204,21,0.35)",
      background: "rgba(113,63,18,0.18)",
      color: "#fde68a",
    },
    info: {
      border: "1px solid rgba(56,189,248,0.35)",
      background: "rgba(12,74,110,0.18)",
      color: "#7dd3fc",
    },
  };

  const tone = colors[status.tone];

  return (
    <div
      aria-live="polite"
      style={{
        ...tone,
        borderRadius: 12,
        padding: ".8rem .95rem",
        fontSize: ".92rem",
      }}
    >
      {status.message}
    </div>
  );
}

export function VipWithdrawalsAdminForm() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [status, setStatus] = useState<StatusState>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/api/admin/vip/withdrawals");
        const data = (await response.json().catch(() => ({}))) as { requests?: WithdrawalRequest[]; error?: string };

        if (!active) {
          return;
        }

        if (!response.ok) {
          startTransition(() =>
            setStatus({ tone: "error", message: data.error ?? "Erro ao carregar saques VIP." }),
          );
          return;
        }

        startTransition(() => {
          setRequests(data.requests ?? []);
          setNotesById(
            Object.fromEntries((data.requests ?? []).map((request) => [request.id, request.adminNotes ?? ""])),
          );
        });
      } catch {
        if (active) {
          startTransition(() =>
            setStatus({ tone: "error", message: "Falha de rede ao carregar saques VIP." }),
          );
        }
      } finally {
        if (active) {
          setLoadingList(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesStatus = filterStatus === "all" || request.status === filterStatus;
      const haystack = [
        request.userName ?? "",
        request.userId,
        request.destinationPixKey ?? "",
        request.providerReference ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [requests, filterStatus, search]);

  async function handleStatus(
    request: WithdrawalRequest,
    nextStatus: "approved" | "paid" | "rejected" | "canceled",
  ) {
    const note = notesById[request.id]?.trim() ?? "";
    const needsNote = nextStatus === "rejected" || nextStatus === "canceled";

    if (needsNote && !note) {
      setStatus({
        tone: "warning",
        message: `Informe uma observação administrativa antes de ${nextStatus === "rejected" ? "rejeitar" : "cancelar"} o saque.`,
      });
      return;
    }

    const actionLabel: Record<typeof nextStatus, string> = {
      approved: "aprovar",
      paid: "marcar como pago",
      rejected: "rejeitar",
      canceled: "cancelar",
    };

    const confirmed = window.confirm(
      `Confirma ${actionLabel[nextStatus]} esta solicitação?\n\n` +
        `Usuário: ${request.userName ?? request.userId}\n` +
        `Valor: ${formatMoney(request.amountCents)}\n` +
        `PIX: ${request.destinationPixKey ?? "não informado"}`,
    );

    if (!confirmed) return;

    setActionLoadingId(request.id);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/vip/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          status: nextStatus,
          adminNotes: note || null,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { requests?: WithdrawalRequest[]; error?: string };
      if (!response.ok) {
        setStatus({ tone: "error", message: data.error ?? "Erro ao atualizar saque VIP." });
        return;
      }

      setRequests(data.requests ?? []);
      setStatus({
        tone: "success",
        message: `Solicitação de ${formatMoney(request.amountCents)} atualizada para "${nextStatus}".`,
      });
    } catch {
      setStatus({ tone: "error", message: "Falha de rede ao atualizar saque VIP." });
    } finally {
      setActionLoadingId(null);
    }
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
        Aprove, pague, rejeite ou cancele solicitações de retirada com confirmação e observação administrativa.
      </p>

      <StatusBanner status={status} />

      <div
        style={{
          display: "grid",
          gap: ".75rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginTop: ".9rem",
          marginBottom: ".9rem",
        }}
      >
        <label style={{ color: "#cbd5e1", display: "grid", gap: ".35rem" }}>
          Filtrar por status
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              background: "rgba(15,23,42,0.75)",
              border: "1px solid rgba(148,163,184,0.3)",
              borderRadius: "10px",
              color: "#f8fafc",
              padding: "0.78rem 0.9rem",
            }}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="paid">Pagos</option>
            <option value="rejected">Rejeitados</option>
            <option value="canceled">Cancelados</option>
          </select>
        </label>

        <label style={{ color: "#cbd5e1", display: "grid", gap: ".35rem" }}>
          Buscar usuário/PIX/ref
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome, userId, PIX ou referência"
            style={{
              background: "rgba(15,23,42,0.75)",
              border: "1px solid rgba(148,163,184,0.3)",
              borderRadius: "10px",
              color: "#f8fafc",
              padding: "0.78rem 0.9rem",
            }}
          />
        </label>
      </div>

      <div style={{ display: "grid", gap: "0.65rem" }}>
        {loadingList ? (
          <p style={{ color: "#94a3b8" }}>Carregando solicitações de saque VIP...</p>
        ) : filteredRequests.length ? (
          filteredRequests.map((request) => {
            const currentActionLoading = actionLoadingId === request.id;

            return (
              <div
                key={request.id}
                style={{
                  background: "rgba(2,6,23,0.38)",
                  border: "1px solid rgba(148,163,184,0.16)",
                  borderRadius: "12px",
                  padding: "0.8rem",
                }}
              >
                <p style={{ color: "#f8fafc", margin: 0 }}>
                  {request.userName ?? request.userId} · {formatMoney(request.amountCents)} · {request.status}
                </p>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: ".45rem 0 0" }}>
                  {request.requestedLevelLabel ?? "Sem nível"} · PIX {request.destinationPixKey ?? "não informado"} ·{" "}
                  {new Date(request.createdAt).toLocaleString("pt-BR")}
                </p>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: ".45rem 0 0" }}>
                  {request.provider
                    ? `${request.provider} · ${request.providerStatus ?? "sem status"}${
                        request.providerReference ? ` · ref ${request.providerReference}` : ""
                      }`
                    : "Transferência ainda não enviada ao gateway"}
                </p>

                <label style={{ color: "#cbd5e1", display: "grid", gap: ".35rem", marginTop: ".7rem" }}>
                  Observação administrativa
                  <textarea
                    value={notesById[request.id] ?? ""}
                    onChange={(e) =>
                      setNotesById((current) => ({
                        ...current,
                        [request.id]: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Obrigatório para rejeitar/cancelar. Opcional para aprovar/pagar."
                    style={{
                      background: "rgba(15,23,42,0.75)",
                      border: "1px solid rgba(148,163,184,0.3)",
                      borderRadius: "10px",
                      color: "#f8fafc",
                      padding: "0.78rem 0.9rem",
                      resize: "vertical",
                    }}
                  />
                </label>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.7rem" }}>
                  <button
                    onClick={() => handleStatus(request, "approved")}
                    type="button"
                    disabled={currentActionLoading}
                    style={{
                      background: "linear-gradient(95deg, #22c55e, #16a34a)",
                      border: 0,
                      borderRadius: "10px",
                      color: "#fff",
                      cursor: currentActionLoading ? "wait" : "pointer",
                      fontWeight: 700,
                      padding: ".68rem .95rem",
                    }}
                  >
                    {currentActionLoading ? "Processando..." : "Aprovar"}
                  </button>

                  <button
                    onClick={() => handleStatus(request, "paid")}
                    type="button"
                    disabled={currentActionLoading}
                    style={{
                      background: "linear-gradient(95deg, #0ea5e9, #0284c7)",
                      border: 0,
                      borderRadius: "10px",
                      color: "#fff",
                      cursor: currentActionLoading ? "wait" : "pointer",
                      fontWeight: 700,
                      padding: ".68rem .95rem",
                    }}
                  >
                    {currentActionLoading ? "Processando..." : "Marcar como pago"}
                  </button>

                  <button
                    onClick={() => handleStatus(request, "rejected")}
                    type="button"
                    disabled={currentActionLoading}
                    style={{
                      background: "linear-gradient(95deg, #ef4444, #dc2626)",
                      border: 0,
                      borderRadius: "10px",
                      color: "#fff",
                      cursor: currentActionLoading ? "wait" : "pointer",
                      fontWeight: 700,
                      padding: ".68rem .95rem",
                    }}
                  >
                    {currentActionLoading ? "Processando..." : "Rejeitar"}
                  </button>

                  <button
                    onClick={() => handleStatus(request, "canceled")}
                    type="button"
                    disabled={currentActionLoading}
                    style={{
                      background: "linear-gradient(95deg, #f59e0b, #d97706)",
                      border: 0,
                      borderRadius: "10px",
                      color: "#fff",
                      cursor: currentActionLoading ? "wait" : "pointer",
                      fontWeight: 700,
                      padding: ".68rem .95rem",
                    }}
                  >
                    {currentActionLoading ? "Processando..." : "Cancelar"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: "#94a3b8" }}>Nenhuma solicitação de saque VIP encontrada.</p>
        )}
      </div>
    </section>
  );
}