"use client";

import { useEffect, useState } from "react";

type VipTier = "none" | "vip" | "elite";

interface VipSnapshot {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  profile: {
    vip_tier: VipTier;
    vip_points: number;
    vip_manual_override: boolean;
    vip_unlocked_at: string | null;
    vip_notes: string | null;
  };
  affiliate: {
    code: string;
    is_active: boolean;
  } | null;
  metrics: {
    raffle_spend_cents: number;
    auction_spend_cents: number;
    approved_commission_cents: number;
    referred_orders: number;
  };
  vip: {
    access: boolean;
    effectiveTier: VipTier;
    effectiveLabel: string;
    points: number;
    nextTierLabel: string | null;
    remainingPoints: number;
    lockedReason: string | null;
  };
  wallet?: {
    cashbackBalanceCents: number;
    bonusBalanceCents: number;
    rakebackBalanceCents: number;
    freeSpinsBalance: number;
    totalEarnedCents: number;
    totalXpFromOrders: number;
  };
}

interface VipProgramSettings {
  cashbackEnabled: boolean;
  discountsEnabled: boolean;
  levelRewardsEnabled: boolean;
  birthdayBonusEnabled: boolean;
  reloadBonusEnabled: boolean;
  rakebackEnabled: boolean;
  exclusivePerksEnabled: boolean;
  defaultReloadBonusPercent: number;
  defaultBirthdayBonusCents: number;
  vipHostChannel: string | null;
  eventNotes: string | null;
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((cents ?? 0) / 100);
}

export function VipConfigForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<VipSnapshot | null>(null);
  const [form, setForm] = useState({
    vipTier: "none" as VipTier,
    vipPoints: 0,
    vipManualOverride: false,
    vipNotes: "",
  });
  const [settingsForm, setSettingsForm] = useState<VipProgramSettings>({
    cashbackEnabled: true,
    discountsEnabled: true,
    levelRewardsEnabled: true,
    birthdayBonusEnabled: true,
    reloadBonusEnabled: true,
    rakebackEnabled: true,
    exclusivePerksEnabled: true,
    defaultReloadBonusPercent: 15,
    defaultBirthdayBonusCents: 5000,
    vipHostChannel: "vip@bigodedasrifas.com",
    eventNotes: "",
  });

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      const response = await fetch("/api/admin/vip");
      const data = (await response.json().catch(() => ({}))) as { settings?: VipProgramSettings };

      if (!active || !response.ok || !data.settings) {
        return;
      }

      setSettingsForm({
        cashbackEnabled: data.settings.cashbackEnabled,
        discountsEnabled: data.settings.discountsEnabled,
        levelRewardsEnabled: data.settings.levelRewardsEnabled,
        birthdayBonusEnabled: data.settings.birthdayBonusEnabled,
        reloadBonusEnabled: data.settings.reloadBonusEnabled,
        rakebackEnabled: data.settings.rakebackEnabled,
        exclusivePerksEnabled: data.settings.exclusivePerksEnabled,
        defaultReloadBonusPercent: data.settings.defaultReloadBonusPercent,
        defaultBirthdayBonusCents: data.settings.defaultBirthdayBonusCents,
        vipHostChannel: data.settings.vipHostChannel ?? "",
        eventNotes: data.settings.eventNotes ?? "",
      });
    };

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);

  async function handleLookup() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setStatus("Informe o e-mail do usuário.");
      return;
    }

    setLoading(true);
    setStatus(null);

    const response = await fetch(`/api/admin/vip?email=${encodeURIComponent(normalizedEmail)}`);
    const data = (await response.json().catch(() => ({}))) as VipSnapshot & { error?: string };

    if (!response.ok) {
      setSnapshot(null);
      setStatus(data.error ?? "Não foi possível localizar o usuário.");
      setLoading(false);
      return;
    }

    setSnapshot(data);
    setForm({
      vipTier: data.profile.vip_tier,
      vipPoints: data.profile.vip_points,
      vipManualOverride: data.profile.vip_manual_override,
      vipNotes: data.profile.vip_notes ?? "",
    });
    setStatus("Usuário carregado.");
    setLoading(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setStatus("Informe o e-mail do usuário.");
      return;
    }

    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/admin/vip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
        vipTier: form.vipTier,
        vipPoints: form.vipPoints,
        vipManualOverride: form.vipManualOverride,
        vipNotes: form.vipNotes,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as VipSnapshot & { error?: string };

    if (!response.ok) {
      setStatus(data.error ?? "Erro ao salvar o status VIP.");
      setLoading(false);
      return;
    }

    setSnapshot(data);
    setForm({
      vipTier: data.profile.vip_tier,
      vipPoints: data.profile.vip_points,
      vipManualOverride: data.profile.vip_manual_override,
      vipNotes: data.profile.vip_notes ?? "",
    });
    setStatus("Status VIP atualizado com sucesso.");
    setLoading(false);
  }

  async function handleSettingsSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/admin/vip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "settings",
        settings: {
          ...settingsForm,
          vipHostChannel: settingsForm.vipHostChannel?.trim() || null,
          eventNotes: settingsForm.eventNotes?.trim() || null,
        },
      }),
    });

    const data = (await response.json().catch(() => ({}))) as { settings?: VipProgramSettings; error?: string };

    if (!response.ok || !data.settings) {
      setStatus(data.error ?? "Erro ao salvar as configurações operacionais do VIP.");
      setLoading(false);
      return;
    }

    setSettingsForm({
      cashbackEnabled: data.settings.cashbackEnabled,
      discountsEnabled: data.settings.discountsEnabled,
      levelRewardsEnabled: data.settings.levelRewardsEnabled,
      birthdayBonusEnabled: data.settings.birthdayBonusEnabled,
      reloadBonusEnabled: data.settings.reloadBonusEnabled,
      rakebackEnabled: data.settings.rakebackEnabled,
      exclusivePerksEnabled: data.settings.exclusivePerksEnabled,
      defaultReloadBonusPercent: data.settings.defaultReloadBonusPercent,
      defaultBirthdayBonusCents: data.settings.defaultBirthdayBonusCents,
      vipHostChannel: data.settings.vipHostChannel ?? "",
      eventNotes: data.settings.eventNotes ?? "",
    });
    setStatus("Configurações operacionais do VIP atualizadas.");
    setLoading(false);
  }

  return (
    <section
      style={{
        background: "linear-gradient(145deg, rgba(15,23,42,0.94), rgba(17,24,39,0.92))",
        border: "1px solid rgba(125,211,252,0.28)",
        borderRadius: "16px",
        boxShadow: "0 14px 34px rgba(15,23,42,0.32)",
        marginTop: "1rem",
        maxWidth: 840,
        padding: "1rem",
      }}
    >
      <h2 style={{ color: "#f8fafc", fontSize: "1.15rem", fontWeight: 800, marginBottom: "0.35rem" }}>
        Programa VIP
      </h2>
      <p style={{ color: "#cbd5e1", marginBottom: "0.9rem" }}>
        Localize um afiliado por e-mail, veja a pontuação automática e aplique override manual quando necessário.
      </p>

      <div style={{ display: "grid", gap: "0.65rem", gridTemplateColumns: "minmax(0, 1fr) auto", marginBottom: "1rem" }}>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-mail do usuário"
          style={{
            background: "rgba(15,23,42,0.75)",
            border: "1px solid rgba(148,163,184,0.3)",
            borderRadius: "10px",
            color: "#f8fafc",
            padding: "0.78rem 0.9rem",
          }}
          type="email"
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          style={{
            background: "linear-gradient(95deg, #0ea5e9, #0284c7)",
            border: 0,
            borderRadius: "10px",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
            minWidth: 140,
            padding: "0.78rem 1rem",
          }}
          type="button"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {status ? <p style={{ color: "#fde68a", marginBottom: "0.9rem" }}>{status}</p> : null}

      <form onSubmit={handleSettingsSubmit} style={{ display: "grid", gap: "0.9rem", marginBottom: "1.2rem" }}>
        <div style={{ display: "grid", gap: "0.8rem", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          {[
            ["cashbackEnabled", "Cashback automático"],
            ["discountsEnabled", "Desconto no checkout"],
            ["levelRewardsEnabled", "Prêmios de nível"],
            ["birthdayBonusEnabled", "Bônus de aniversário"],
            ["reloadBonusEnabled", "Reload bonus"],
            ["rakebackEnabled", "Rakeback automático"],
            ["exclusivePerksEnabled", "Perks exclusivos"],
          ].map(([key, label]) => (
            <label key={key} style={{ alignItems: "center", color: "#e2e8f0", display: "flex", gap: "0.55rem" }}>
              <input
                checked={Boolean(settingsForm[key as keyof VipProgramSettings])}
                onChange={(event) =>
                  setSettingsForm((current) => ({
                    ...current,
                    [key]: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              {label}
            </label>
          ))}
        </div>

        <div style={{ display: "grid", gap: "0.8rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label style={{ color: "#cbd5e1", display: "grid", gap: "0.35rem" }}>
            Reload bônus padrão (%)
            <input
              min={0}
              type="number"
              value={settingsForm.defaultReloadBonusPercent}
              onChange={(event) =>
                setSettingsForm((current) => ({
                  ...current,
                  defaultReloadBonusPercent: Math.max(0, Number(event.target.value || 0)),
                }))
              }
              style={{
                background: "rgba(15,23,42,0.75)",
                border: "1px solid rgba(148,163,184,0.3)",
                borderRadius: "10px",
                color: "#f8fafc",
                padding: "0.78rem 0.9rem",
              }}
            />
          </label>
          <label style={{ color: "#cbd5e1", display: "grid", gap: "0.35rem" }}>
            Bônus de aniversário (centavos)
            <input
              min={0}
              type="number"
              value={settingsForm.defaultBirthdayBonusCents}
              onChange={(event) =>
                setSettingsForm((current) => ({
                  ...current,
                  defaultBirthdayBonusCents: Math.max(0, Number(event.target.value || 0)),
                }))
              }
              style={{
                background: "rgba(15,23,42,0.75)",
                border: "1px solid rgba(148,163,184,0.3)",
                borderRadius: "10px",
                color: "#f8fafc",
                padding: "0.78rem 0.9rem",
              }}
            />
          </label>
          <label style={{ color: "#cbd5e1", display: "grid", gap: "0.35rem" }}>
            Canal do VIP Host
            <input
              type="text"
              value={settingsForm.vipHostChannel ?? ""}
              onChange={(event) => setSettingsForm((current) => ({ ...current, vipHostChannel: event.target.value }))}
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

        <label style={{ color: "#cbd5e1", display: "grid", gap: "0.35rem" }}>
          Notas operacionais para eventos, torneios e perks premium
          <textarea
            value={settingsForm.eventNotes ?? ""}
            onChange={(event) => setSettingsForm((current) => ({ ...current, eventNotes: event.target.value }))}
            rows={3}
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

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
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
            {loading ? "Salvando..." : "Salvar motor operacional VIP"}
          </button>
        </div>
      </form>

      {snapshot ? (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gap: "0.8rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <article style={{ background: "rgba(15,23,42,0.65)", borderRadius: "12px", padding: "0.8rem" }}>
              <strong style={{ color: "#f8fafc" }}>Usuário</strong>
              <p style={{ color: "#cbd5e1", marginTop: "0.35rem" }}>{snapshot.user.name ?? snapshot.user.email}</p>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{snapshot.user.email}</p>
            </article>
            <article style={{ background: "rgba(15,23,42,0.65)", borderRadius: "12px", padding: "0.8rem" }}>
              <strong style={{ color: "#f8fafc" }}>Status efetivo</strong>
              <p style={{ color: "#cbd5e1", marginTop: "0.35rem" }}>{snapshot.vip.effectiveLabel}</p>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{snapshot.vip.points.toLocaleString("pt-BR")} pontos</p>
            </article>
            <article style={{ background: "rgba(15,23,42,0.65)", borderRadius: "12px", padding: "0.8rem" }}>
              <strong style={{ color: "#f8fafc" }}>Afiliado</strong>
              <p style={{ color: "#cbd5e1", marginTop: "0.35rem" }}>
                {snapshot.affiliate?.is_active ? `Ativo (${snapshot.affiliate.code})` : "Não ativo"}
              </p>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                {snapshot.vip.lockedReason ?? "Programa liberado conforme regra atual."}
              </p>
            </article>
            <article style={{ background: "rgba(15,23,42,0.65)", borderRadius: "12px", padding: "0.8rem" }}>
              <strong style={{ color: "#f8fafc" }}>Carteira VIP</strong>
              <p style={{ color: "#cbd5e1", marginTop: "0.35rem" }}>
                Cashback {formatMoney(snapshot.wallet?.cashbackBalanceCents ?? 0)} · bônus{" "}
                {formatMoney(snapshot.wallet?.bonusBalanceCents ?? 0)}
              </p>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                Rakeback {formatMoney(snapshot.wallet?.rakebackBalanceCents ?? 0)} · free spins{" "}
                {(snapshot.wallet?.freeSpinsBalance ?? 0).toLocaleString("pt-BR")}
              </p>
            </article>
          </div>

          <div style={{ display: "grid", gap: "0.8rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <article style={{ background: "rgba(15,23,42,0.45)", borderRadius: "12px", padding: "0.8rem" }}>
              <strong style={{ color: "#f8fafc" }}>Rifas pagas</strong>
              <p style={{ color: "#cbd5e1", marginTop: "0.35rem" }}>{formatMoney(snapshot.metrics.raffle_spend_cents)}</p>
            </article>
            <article style={{ background: "rgba(15,23,42,0.45)", borderRadius: "12px", padding: "0.8rem" }}>
              <strong style={{ color: "#f8fafc" }}>Leilões vencidos</strong>
              <p style={{ color: "#cbd5e1", marginTop: "0.35rem" }}>{formatMoney(snapshot.metrics.auction_spend_cents)}</p>
            </article>
            <article style={{ background: "rgba(15,23,42,0.45)", borderRadius: "12px", padding: "0.8rem" }}>
              <strong style={{ color: "#f8fafc" }}>Comissão aprovada</strong>
              <p style={{ color: "#cbd5e1", marginTop: "0.35rem" }}>{formatMoney(snapshot.metrics.approved_commission_cents)}</p>
            </article>
            <article style={{ background: "rgba(15,23,42,0.45)", borderRadius: "12px", padding: "0.8rem" }}>
              <strong style={{ color: "#f8fafc" }}>Pedidos indicados</strong>
              <p style={{ color: "#cbd5e1", marginTop: "0.35rem" }}>{snapshot.metrics.referred_orders}</p>
            </article>
          </div>

          <div style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <label style={{ color: "#cbd5e1", display: "grid", gap: "0.35rem" }}>
              Tier manual
              <select
                value={form.vipTier}
                onChange={(event) => setForm((current) => ({ ...current, vipTier: event.target.value as VipTier }))}
                style={{
                  background: "rgba(15,23,42,0.75)",
                  border: "1px solid rgba(148,163,184,0.3)",
                  borderRadius: "10px",
                  color: "#f8fafc",
                  padding: "0.78rem 0.9rem",
                }}
              >
                <option value="none">Sem override VIP</option>
                <option value="vip">VIP</option>
                <option value="elite">VIP Elite</option>
              </select>
            </label>

            <label style={{ color: "#cbd5e1", display: "grid", gap: "0.35rem" }}>
              Pontos persistidos
              <input
                min={0}
                type="number"
                value={form.vipPoints}
                onChange={(event) =>
                  setForm((current) => ({ ...current, vipPoints: Math.max(0, Number(event.target.value || 0)) }))
                }
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

          <label style={{ alignItems: "center", color: "#e2e8f0", display: "flex", gap: "0.65rem" }}>
            <input
              checked={form.vipManualOverride}
              onChange={(event) => setForm((current) => ({ ...current, vipManualOverride: event.target.checked }))}
              type="checkbox"
            />
            Aplicar override manual do tier VIP para este usuário
          </label>

          <label style={{ color: "#cbd5e1", display: "grid", gap: "0.35rem" }}>
            Observações internas
            <textarea
              value={form.vipNotes}
              onChange={(event) => setForm((current) => ({ ...current, vipNotes: event.target.value }))}
              rows={4}
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

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <button
              disabled={loading}
              style={{
                background: "linear-gradient(95deg, #fb923c, #ea580c)",
                border: 0,
                borderRadius: "10px",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 800,
                padding: "0.82rem 1.15rem",
              }}
              type="submit"
            >
              {loading ? "Salvando..." : "Salvar status VIP"}
            </button>
            <span style={{ color: "#94a3b8", fontSize: "0.9rem", alignSelf: "center" }}>
              Próximo nível: {snapshot.vip.nextTierLabel ?? "Topo"}{" "}
              {snapshot.vip.nextTierLabel ? `(${snapshot.vip.remainingPoints.toLocaleString("pt-BR")} pontos restantes)` : ""}
            </span>
          </div>
        </form>
      ) : null}
    </section>
  );
}
