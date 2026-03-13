"use client";

import { useEffect, useState } from "react";

type VipOperation = {
  id: string;
  category: "host" | "event" | "tournament" | "odds";
  title: string;
  description: string | null;
  status: "scheduled" | "active" | "completed" | "canceled";
  targetTier: "none" | "vip" | "elite" | null;
  hostContact: string | null;
};

export function VipOperationsForm() {
  const [operations, setOperations] = useState<VipOperation[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
      const response = await fetch("/api/admin/vip/operations");
      const data = (await response.json().catch(() => ({}))) as { operations?: VipOperation[] };
      if (active && response.ok) {
        setOperations(data.operations ?? []);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/admin/vip/operations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: form.category,
        title: form.title,
        description: form.description,
        status: form.status,
        targetTier: form.targetTier,
        hostContact: form.hostContact || null,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as { operations?: VipOperation[]; error?: string };
    if (!response.ok) {
      setStatus(data.error ?? "Erro ao salvar operação VIP.");
      setLoading(false);
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
    setStatus("Operação VIP salva.");
    setLoading(false);
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
        Gerencie VIP Host, eventos exclusivos, torneios fechados e odds personalizadas em execução.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.8rem" }}>
        <div style={{ display: "grid", gap: "0.8rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <select value={form.category} onChange={(e) => setForm((c) => ({ ...c, category: e.target.value as VipOperation["category"] }))}>
            <option value="host">VIP Host</option>
            <option value="event">Evento</option>
            <option value="tournament">Torneio</option>
            <option value="odds">Odds personalizadas</option>
          </select>
          <select value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value as VipOperation["status"] }))}>
            <option value="scheduled">Agendado</option>
            <option value="active">Ativo</option>
            <option value="completed">Concluído</option>
            <option value="canceled">Cancelado</option>
          </select>
          <select value={form.targetTier} onChange={(e) => setForm((c) => ({ ...c, targetTier: e.target.value as "none" | "vip" | "elite" }))}>
            <option value="none">Base</option>
            <option value="vip">VIP</option>
            <option value="elite">VIP Elite</option>
          </select>
        </div>
        <input value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} placeholder="Título da operação" />
        <textarea value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} placeholder="Descrição" rows={3} />
        <input value={form.hostContact} onChange={(e) => setForm((c) => ({ ...c, hostContact: e.target.value }))} placeholder="Contato do host ou canal operacional" />
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

      {status ? <p style={{ color: "#fde68a", marginTop: "0.75rem" }}>{status}</p> : null}

      <div style={{ display: "grid", gap: "0.65rem", marginTop: "1rem" }}>
        {operations.map((item) => (
          <div key={item.id} style={{ background: "rgba(2,6,23,0.38)", borderRadius: "12px", padding: "0.8rem" }}>
            <p style={{ color: "#f8fafc" }}>
              {item.category} · {item.title}
            </p>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              {item.status} · alvo {item.targetTier ?? "todos"}
              {item.hostContact ? ` · contato ${item.hostContact}` : ""}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
