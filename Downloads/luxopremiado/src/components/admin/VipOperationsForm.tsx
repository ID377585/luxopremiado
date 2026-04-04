"use client";

import { useEffect, useMemo, useState } from "react";

type VipOperation = {
  id: string;
  category: "host" | "event" | "tournament" | "odds";
  title: string;
  description: string | null;
  status: "scheduled" | "active" | "completed" | "canceled";
  targetTier: "none" | "vip" | "elite" | null;
  hostContact: string | null;
};

type StatusTone = "success" | "error" | "warning" | "info";

type StatusState = {
  tone: StatusTone;
  message: string;
} | null;

const INPUT_STYLE = {
  background: "rgba(15,23,42,0.75)",
  border: "1px solid rgba(148,163,184,0.3)",
  borderRadius: "10px",
  color: "#f8fafc",
  padding: "0.78rem 0.9rem",
  width: "100%",
} as const;

function getCategoryLabel(category: VipOperation["category"]) {
  const labels: Record<VipOperation["category"], string> = {
    host: "VIP Host",
    event: "Evento",
    tournament: "Torneio",
    odds: "Odds personalizadas",
  };

  return labels[category];
}

function getStatusLabel(status: VipOperation["status"]) {
  const labels: Record<VipOperation["status"], string> = {
    scheduled: "Agendado",
    active: "Ativo",
    completed: "Concluído",
    canceled: "Cancelado",
  };

  return labels[status];
}

function getTierLabel(tier: "none" | "vip" | "elite" | null) {
  if (tier === "vip") return "VIP";
  if (tier === "elite") return "VIP Elite";
  return "Base / todos";
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

function FieldHint({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#94a3b8", fontSize: ".82rem" }}>{children}</span>;
}

export function VipOperationsForm() {
  const [operations, setOperations] = useState<VipOperation[]>([]);
  const [status, setStatus] = useState<StatusState>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const [filterStatus, setFilterStatus] = useState<"all" | VipOperation["status"]>("all");
  const [filterCategory, setFilterCategory] = useState<"all" | VipOperation["category"]>("all");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    category: "host" as VipOperation["category"],
    title: "",
    description: "",
    status: "scheduled" as VipOperation["status"],
    targetTier: "vip" as "none" | "vip" | "elite",
    hostContact: "",
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/api/admin/vip/operations");
        const data = (await response.json().catch(() => ({}))) as { operations?: VipOperation[]; error?: string };

        if (!active) return;

        if (!response.ok) {
          setStatus({ tone: "error", message: data.error ?? "Não foi possível carregar as operações VIP." });
          return;
        }

        setOperations(data.operations ?? []);
      } catch {
        if (active) {
          setStatus({ tone: "error", message: "Falha de rede ao carregar as operações VIP." });
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

  const filteredOperations = useMemo(() => {
    return operations.filter((item) => {
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      const matchesSearch =
        !search.trim() ||
        [item.title, item.description ?? "", item.hostContact ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(search.trim().toLowerCase());

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [operations, filterStatus, filterCategory, search]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);

    if (!form.title.trim()) {
      setStatus({ tone: "warning", message: "Informe o título da operação VIP." });
      return;
    }

    if (form.title.trim().length < 3) {
      setStatus({ tone: "warning", message: "O título precisa ter pelo menos 3 caracteres." });
      return;
    }

    if (form.category === "host" && !form.hostContact.trim()) {
      setStatus({ tone: "warning", message: "Para VIP Host, informe o contato/canal operacional." });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/vip/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          title: form.title.trim(),
          description: form.description.trim() || null,
          status: form.status,
          targetTier: form.targetTier,
          hostContact: form.hostContact.trim() || null,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { operations?: VipOperation[]; error?: string };

      if (!response.ok) {
        setStatus({ tone: "error", message: data.error ?? "Erro ao salvar operação VIP." });
        return;
      }

      setOperations(data.operations ?? []);
      setForm({
        category: "host",
        title: "",
        description: "",
        status: "scheduled",
        targetTier: "vip",
        hostContact: "",
      });
      setStatus({ tone: "success", message: "Operação VIP salva com sucesso." });
    } catch {
      setStatus({ tone: "error", message: "Falha de rede ao salvar operação VIP." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        background: "linear-gradient(145deg, rgba(15,23,42,0.94), rgba(17,24,39,0.92))",
        border: "1px solid rgba(196,181,253,0.28)",
        borderRadius: "16px",
        boxShadow: "0 14px 34px rgba(15,23,42,0.32)",
        marginTop: "1rem",
        maxWidth: 840,
        padding: "1rem",
      }}
    >
      <h2 style={{ color: "#f8fafc", fontSize: "1.15rem", fontWeight: 800, marginBottom: "0.35rem" }}>
        Operações VIP
      </h2>
      <p style={{ color: "#cbd5e1", marginBottom: "0.9rem" }}>
        Cadastre e acompanhe VIP Host, eventos exclusivos, torneios fechados e odds personalizadas.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.8rem" }}>
        <div style={{ display: "grid", gap: "0.8rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <label style={{ color: "#cbd5e1", display: "grid", gap: ".35rem" }}>
            Categoria
            <select
              value={form.category}
              onChange={(e) => setForm((c) => ({ ...c, category: e.target.value as VipOperation["category"] }))}
              style={INPUT_STYLE}
            >
              <option value="host">VIP Host</option>
              <option value="event">Evento</option>
              <option value="tournament">Torneio</option>
              <option value="odds">Odds personalizadas</option>
            </select>
          </label>

          <label style={{ color: "#cbd5e1", display: "grid", gap: ".35rem" }}>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm((c) => ({ ...c, status: e.target.value as VipOperation["status"] }))}
              style={INPUT_STYLE}
            >
              <option value="scheduled">Agendado</option>
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
              <option value="canceled">Cancelado</option>
            </select>
          </label>

          <label style={{ color: "#cbd5e1", display: "grid", gap: ".35rem" }}>
            Público-alvo
            <select
              value={form.targetTier}
              onChange={(e) => setForm((c) => ({ ...c, targetTier: e.target.value as "none" | "vip" | "elite" }))}
              style={INPUT_STYLE}
            >
              <option value="none">Base</option>
              <option value="vip">VIP</option>
              <option value="elite">VIP Elite</option>
            </select>
          </label>
        </div>

        <label style={{ color: "#cbd5e1", display: "grid", gap: ".35rem" }}>
          Título da operação
          <input
            value={form.title}
            onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
            placeholder="Ex: Torneio fechado de sábado"
            maxLength={120}
            style={INPUT_STYLE}
          />
          <FieldHint>{form.title.length}/120 caracteres</FieldHint>
        </label>

        <label style={{ color: "#cbd5e1", display: "grid", gap: ".35rem" }}>
          Descrição
          <textarea
            value={form.description}
            onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
            placeholder="Descreva a mecânica, janela de execução e detalhes relevantes."
            rows={3}
            maxLength={400}
            style={{ ...INPUT_STYLE, resize: "vertical" }}
          />
          <FieldHint>{form.description.length}/400 caracteres</FieldHint>
        </label>

        <label style={{ color: "#cbd5e1", display: "grid", gap: ".35rem" }}>
          Contato do host ou canal operacional
          <input
            value={form.hostContact}
            onChange={(e) => setForm((c) => ({ ...c, hostContact: e.target.value }))}
            placeholder="Ex: vip@bigodedasrifas.com ou @canal-operacional"
            style={INPUT_STYLE}
          />
          <FieldHint>Obrigatório para a categoria VIP Host.</FieldHint>
        </label>

        <StatusBanner status={status} />

        <button
          disabled={loading}
          style={{
            background: "linear-gradient(95deg, #8b5cf6, #7c3aed)",
            border: 0,
            borderRadius: "10px",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 800,
            padding: "0.82rem 1.15rem",
          }}
          type="submit"
        >
          {loading ? "Salvando..." : "Salvar operação VIP"}
        </button>
      </form>

      <div
        style={{
          marginTop: "1rem",
          display: "grid",
          gap: ".75rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        <label style={{ color: "#cbd5e1", display: "grid", gap: ".35rem" }}>
          Filtrar por status
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | VipOperation["status"])}
            style={INPUT_STYLE}
          >
            <option value="all">Todos</option>
            <option value="scheduled">Agendado</option>
            <option value="active">Ativo</option>
            <option value="completed">Concluído</option>
            <option value="canceled">Cancelado</option>
          </select>
        </label>

        <label style={{ color: "#cbd5e1", display: "grid", gap: ".35rem" }}>
          Filtrar por categoria
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as "all" | VipOperation["category"])}
            style={INPUT_STYLE}
          >
            <option value="all">Todas</option>
            <option value="host">VIP Host</option>
            <option value="event">Evento</option>
            <option value="tournament">Torneio</option>
            <option value="odds">Odds personalizadas</option>
          </select>
        </label>

        <label style={{ color: "#cbd5e1", display: "grid", gap: ".35rem" }}>
          Buscar
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Título, descrição ou contato"
            style={INPUT_STYLE}
          />
        </label>
      </div>

      <div style={{ display: "grid", gap: "0.65rem", marginTop: "1rem" }}>
        {loadingList ? (
          <p style={{ color: "#94a3b8" }}>Carregando operações VIP...</p>
        ) : filteredOperations.length ? (
          filteredOperations.map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(2,6,23,0.38)",
                border: "1px solid rgba(148,163,184,0.16)",
                borderRadius: "12px",
                padding: "0.8rem",
              }}
            >
              <p style={{ color: "#f8fafc", margin: 0 }}>
                {getCategoryLabel(item.category)} · {item.title}
              </p>
              {item.description ? (
                <p style={{ color: "#cbd5e1", fontSize: ".92rem", margin: ".45rem 0 0" }}>{item.description}</p>
              ) : null}
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: ".45rem 0 0" }}>
                {getStatusLabel(item.status)} · alvo {getTierLabel(item.targetTier)}
                {item.hostContact ? ` · contato ${item.hostContact}` : ""}
              </p>
            </div>
          ))
        ) : (
          <p style={{ color: "#94a3b8" }}>Nenhuma operação VIP encontrada para os filtros atuais.</p>
        )}
      </div>
    </section>
  );
}