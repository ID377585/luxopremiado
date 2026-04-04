"use client";

import { useEffect, useMemo, useState } from "react";

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

type ApiError = {
  error?: string;
};

type StatusTone = "success" | "error" | "warning" | "info";

type StatusState = {
  tone: StatusTone;
  message: string;
} | null;

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((cents ?? 0) / 100);
}

function centsToBrlInput(value: number) {
  return (value / 100).toFixed(2);
}

function brlInputToCents(value: string) {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

function getErrorMessage(value: unknown, fallback: string): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiError).error === "string" &&
    (value as ApiError).error!.trim().length > 0
  ) {
    return (value as ApiError).error as string;
  }

  return fallback;
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

export function VipConfigForm() {
  const [email, setEmail] = useState("");
  const [snapshot, setSnapshot] = useState<VipSnapshot | null>(null);

  const [lookupLoading, setLookupLoading] = useState(false);
  const [userSaveLoading, setUserSaveLoading] = useState(false);
  const [settingsSaveLoading, setSettingsSaveLoading] = useState(false);

  const [lookupStatus, setLookupStatus] = useState<StatusState>(null);
  const [userStatus, setUserStatus] = useState<StatusState>(null);
  const [settingsStatus, setSettingsStatus] = useState<StatusState>(null);

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

  const birthdayBonusDisplay = useMemo(
    () => centsToBrlInput(settingsForm.defaultBirthdayBonusCents),
    [settingsForm.defaultBirthdayBonusCents],
  );

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/vip");
        const data = await readJson<{ settings?: VipProgramSettings }>(response);

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
      } catch {
        if (active) {
          setSettingsStatus({
            tone: "error",
            message: "Não foi possível carregar as configurações operacionais do VIP.",
          });
        }
      }
    };

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);

  async function handleLookup() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setLookupStatus({ tone: "warning", message: "Informe o e-mail do usuário." });
      return;
    }

    setLookupLoading(true);
    setLookupStatus(null);
    setUserStatus(null);

    try {
      const response = await fetch(`/api/admin/vip?email=${encodeURIComponent(normalizedEmail)}`);
      const data = await readJson<VipSnapshot | ApiError>(response);

      if (!response.ok) {
        setSnapshot(null);
        setLookupStatus({
          tone: "error",
          message: getErrorMessage(data, "Não foi possível localizar o usuário."),
        });
        return;
      }

      const snapshotData = data as VipSnapshot;

      setSnapshot(snapshotData);
      setForm({
        vipTier: snapshotData.profile.vip_tier,
        vipPoints: snapshotData.profile.vip_points,
        vipManualOverride: snapshotData.profile.vip_manual_override,
        vipNotes: snapshotData.profile.vip_notes ?? "",
      });
      setLookupStatus({ tone: "success", message: "Usuário carregado com sucesso." });
    } catch {
      setSnapshot(null);
      setLookupStatus({ tone: "error", message: "Falha de rede ao buscar o usuário VIP." });
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setUserStatus({ tone: "warning", message: "Informe o e-mail do usuário." });
      return;
    }

    if (form.vipPoints < 0) {
      setUserStatus({ tone: "error", message: "Os pontos persistidos não podem ser negativos." });
      return;
    }

    if (form.vipManualOverride && form.vipTier === "none") {
      setUserStatus({
        tone: "warning",
        message: "Com o override manual ligado, selecione um tier VIP diferente de 'sem override'.",
      });
      return;
    }

    setUserSaveLoading(true);
    setUserStatus(null);

    try {
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

      const data = await readJson<VipSnapshot | ApiError>(response);

      if (!response.ok) {
        setUserStatus({
          tone: "error",
          message: getErrorMessage(data, "Erro ao salvar o status VIP."),
        });
        return;
      }

      const snapshotData = data as VipSnapshot;

      setSnapshot(snapshotData);
      setForm({
        vipTier: snapshotData.profile.vip_tier,
        vipPoints: snapshotData.profile.vip_points,
        vipManualOverride: snapshotData.profile.vip_manual_override,
        vipNotes: snapshotData.profile.vip_notes ?? "",
      });
      setUserStatus({ tone: "success", message: "Status VIP atualizado com sucesso." });
    } catch {
      setUserStatus({ tone: "error", message: "Falha de rede ao salvar o status VIP." });
    } finally {
      setUserSaveLoading(false);
    }
  }

  async function handleSettingsSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (settingsForm.defaultReloadBonusPercent < 0) {
      setSettingsStatus({ tone: "error", message: "O reload bônus não pode ser negativo." });
      return;
    }

    setSettingsSaveLoading(true);
    setSettingsStatus(null);

    try {
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

      const data = await readJson<{ settings?: VipProgramSettings; error?: string }>(response);

      if (!response.ok || !data.settings) {
        setSettingsStatus({
          tone: "error",
          message: data.error ?? "Erro ao salvar as configurações operacionais do VIP.",
        });
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
      setSettingsStatus({
        tone: "success",
        message: "Configurações operacionais do VIP atualizadas.",
      });
    } catch {
      setSettingsStatus({
        tone: "error",
        message: "Falha de rede ao salvar as configurações operacionais do VIP.",
      });
    } finally {
      setSettingsSaveLoading(false);
    }
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
        Gestão global do motor VIP e override manual por usuário com feedback separado por contexto.
      </p>

      <div
        style={{
          background: "rgba(15,23,42,0.55)",
          border: "1px solid rgba(148,163,184,0.16)",
          borderRadius: 14,
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ color: "#f8fafc", marginTop: 0, marginBottom: ".35rem", fontSize: "1rem" }}>
          Buscar usuário VIP
        </h3>
        <p style={{ color: "#94a3b8", marginTop: 0, fontSize: ".9rem" }}>
          Localize o usuário por e-mail para revisar pontuação, status efetivo e aplicar override manual quando necessário.
        </p>

        <div style={{ display: "grid", gap: "0.65rem", gridTemplateColumns: "minmax(0, 1fr) auto", marginBottom: ".8rem" }}>
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
            disabled={lookupLoading}
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
            {lookupLoading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        <StatusBanner status={lookupStatus} />
      </div>

      <div
        style={{
          background: "rgba(15,23,42,0.55)",
          border: "1px solid rgba(148,163,184,0.16)",
          borderRadius: 14,
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ color: "#f8fafc", marginTop: 0, marginBottom: ".35rem", fontSize: "1rem" }}>
          Configurações globais do programa VIP
        </h3>
        <p style={{ color: "#94a3b8", marginTop: 0, fontSize: ".9rem" }}>
          Controles operacionais do programa. Cada opção afeta a concessão automática do benefício correspondente.
        </p>

        <form onSubmit={handleSettingsSubmit} style={{ display: "grid", gap: "0.9rem" }}>
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
              <FieldHint>Percentual padrão aplicado em campanhas de recarga.</FieldHint>
            </label>

            <label style={{ color: "#cbd5e1", display: "grid", gap: "0.35rem" }}>
              Bônus de aniversário (R$)
              <input
                min={0}
                step="0.01"
                type="number"
                value={birthdayBonusDisplay}
                onChange={(event) =>
                  setSettingsForm((current) => ({
                    ...current,
                    defaultBirthdayBonusCents: brlInputToCents(event.target.value),
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
              <FieldHint>Valor salvo: {formatMoney(settingsForm.defaultBirthdayBonusCents)}</FieldHint>
            </label>

            <label style={{ color: "#cbd5e1", display: "grid", gap: "0.35rem" }}>
              Canal/e-mail do VIP Host
              <input
                type="text"
                value={settingsForm.vipHostChannel ?? ""}
                onChange={(event) => setSettingsForm((current) => ({ ...current, vipHostChannel: event.target.value }))}
                placeholder="Ex: vip@bigodedasrifas.com"
                style={{
                  background: "rgba(15,23,42,0.75)",
                  border: "1px solid rgba(148,163,184,0.3)",
                  borderRadius: "10px",
                  color: "#f8fafc",
                  padding: "0.78rem 0.9rem",
                }}
              />
              <FieldHint>Contato operacional principal do programa VIP.</FieldHint>
            </label>
          </div>

          <label style={{ color: "#cbd5e1", display: "grid", gap: "0.35rem" }}>
            Notas operacionais para eventos, torneios e perks premium
            <textarea
              value={settingsForm.eventNotes ?? ""}
              onChange={(event) => setSettingsForm((current) => ({ ...current, eventNotes: event.target.value }))}
              rows={3}
              maxLength={800}
              style={{
                background: "rgba(15,23,42,0.75)",
                border: "1px solid rgba(148,163,184,0.3)",
                borderRadius: "10px",
                color: "#f8fafc",
                padding: "0.78rem 0.9rem",
                resize: "vertical",
              }}
            />
            <FieldHint>{(settingsForm.eventNotes ?? "").length}/800 caracteres</FieldHint>
          </label>

          <StatusBanner status={settingsStatus} />

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <button
              disabled={settingsSaveLoading}
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
              {settingsSaveLoading ? "Salvando..." : "Salvar motor operacional VIP"}
            </button>
          </div>
        </form>
      </div>

      {snapshot ? (
        <div
          style={{
            background: "rgba(15,23,42,0.55)",
            border: "1px solid rgba(148,163,184,0.16)",
            borderRadius: 14,
            padding: "1rem",
          }}
        >
          <h3 style={{ color: "#f8fafc", marginTop: 0, marginBottom: ".35rem", fontSize: "1rem" }}>
            Gestão manual do usuário
          </h3>
          <p style={{ color: "#94a3b8", marginTop: 0, fontSize: ".9rem" }}>
            Use override apenas quando houver necessidade operacional real. O tier manual só é aplicado quando o override estiver ativo.
          </p>

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
                  disabled={!form.vipManualOverride}
                  onChange={(event) => setForm((current) => ({ ...current, vipTier: event.target.value as VipTier }))}
                  style={{
                    background: "rgba(15,23,42,0.75)",
                    border: "1px solid rgba(148,163,184,0.3)",
                    borderRadius: "10px",
                    color: "#f8fafc",
                    padding: "0.78rem 0.9rem",
                    opacity: form.vipManualOverride ? 1 : 0.65,
                  }}
                >
                  <option value="none">Sem override VIP</option>
                  <option value="vip">VIP</option>
                  <option value="elite">VIP Elite</option>
                </select>
                <FieldHint>Disponível somente quando o override manual estiver ativo.</FieldHint>
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
                <FieldHint>Valor persistido no perfil. Use com cuidado para correções administrativas.</FieldHint>
              </label>
            </div>

            <label style={{ alignItems: "center", color: "#e2e8f0", display: "flex", gap: "0.65rem" }}>
              <input
                checked={form.vipManualOverride}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    vipManualOverride: event.target.checked,
                    vipTier: event.target.checked ? current.vipTier : "none",
                  }))
                }
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
                maxLength={600}
                style={{
                  background: "rgba(15,23,42,0.75)",
                  border: "1px solid rgba(148,163,184,0.3)",
                  borderRadius: "10px",
                  color: "#f8fafc",
                  padding: "0.78rem 0.9rem",
                  resize: "vertical",
                }}
              />
              <FieldHint>{form.vipNotes.length}/600 caracteres</FieldHint>
            </label>

            <StatusBanner status={userStatus} />

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <button
                disabled={userSaveLoading}
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
                {userSaveLoading ? "Salvando..." : "Salvar status VIP"}
              </button>
              <span style={{ color: "#94a3b8", fontSize: "0.9rem", alignSelf: "center" }}>
                Próximo nível: {snapshot.vip.nextTierLabel ?? "Topo"}{" "}
                {snapshot.vip.nextTierLabel
                  ? `(${snapshot.vip.remainingPoints.toLocaleString("pt-BR")} pontos restantes)`
                  : ""}
              </span>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}