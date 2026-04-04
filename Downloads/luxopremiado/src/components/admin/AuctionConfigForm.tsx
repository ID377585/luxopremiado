"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { getDefaultAuctionConfig } from "@/lib/auction";
import { formatBrlFromCents } from "@/lib/format";
import { AuctionAdminConfig, AuctionAdminPayload, AuctionBidEntry } from "@/types/auction";

interface AuctionConfigFormProps {
  raffleSlug: string;
}

type FormStatusTone = "success" | "error" | "warning" | "info";

type FormStatus = {
  tone: FormStatusTone;
  message: string;
} | null;

type AuctionErrors = Partial<Record<keyof AuctionAdminConfig | "reopenEndsAt", string>>;

const INPUT_STYLE = {
  padding: ".65rem .8rem",
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#020617",
  color: "#f8fafc",
  width: "100%",
} as const;

const TEXTAREA_STYLE = {
  padding: ".75rem .85rem",
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#020617",
  color: "#f8fafc",
  resize: "vertical" as const,
  width: "100%",
} as const;

const CONTROL_BUTTON_STYLE = {
  border: "1px solid rgba(56,189,248,0.28)",
  background: "rgba(15,23,42,0.92)",
  color: "#f8fafc",
  borderRadius: 12,
  padding: ".7rem 1rem",
  fontWeight: 700,
  cursor: "pointer",
} as const;

const DANGER_BUTTON_STYLE = {
  ...CONTROL_BUTTON_STYLE,
  border: "1px solid rgba(248,113,113,0.4)",
  background: "rgba(69,10,10,0.35)",
} as const;

function centsToDisplay(value: number | null): string {
  if (value == null) return "";
  return (value / 100).toFixed(2);
}

function displayToCents(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100);
}

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cardStyle() {
  return {
    background: "rgba(2,6,23,0.66)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: 16,
    padding: "1rem",
  } as const;
}

function sectionTitleStyle() {
  return {
    color: "#f8fafc",
    margin: 0,
    fontSize: "1rem",
    fontWeight: 800,
  } as const;
}

function sectionHintStyle() {
  return {
    color: "#94a3b8",
    margin: ".2rem 0 0",
    fontSize: ".9rem",
  } as const;
}

function toDatetimeLocalValue(value: string | null | undefined): string {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value).slice(0, 16);
  }

  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

async function readErrorMessage(response: Response, fallback: string) {
  const json = (await response.json().catch(() => ({}))) as { error?: string };
  return json.error ?? fallback;
}

function StatusBanner({ status }: { status: FormStatus }) {
  if (!status) return null;

  const colors: Record<FormStatusTone, { border: string; background: string; color: string }> = {
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span style={{ color: "#fca5a5", fontSize: ".82rem" }}>
      {message}
    </span>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: "#94a3b8", fontSize: ".82rem" }}>
      {children}
    </span>
  );
}

export function AuctionConfigForm({ raffleSlug }: AuctionConfigFormProps) {
  const [auction, setAuction] = useState<AuctionAdminConfig>(() => getDefaultAuctionConfig(raffleSlug));
  const [payload, setPayload] = useState<AuctionAdminPayload | null>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [saveStatus, setSaveStatus] = useState<FormStatus>(null);
  const [actionStatus, setActionStatus] = useState<FormStatus>(null);
  const [uploadStatus, setUploadStatus] = useState<FormStatus>(null);
  const [loadStatus, setLoadStatus] = useState<FormStatus>(null);

  const [errors, setErrors] = useState<AuctionErrors>({});
  const [selectedBidId, setSelectedBidId] = useState<number | null>(null);
  const [moderationReason, setModerationReason] = useState("");
  const [reopenEndsAt, setReopenEndsAt] = useState("");
  const [slugEditable, setSlugEditable] = useState(false);

  const fetchData = async () => {
    try {
      setLoadStatus(null);
      const res = await fetch(`/api/admin/auction?raffleSlug=${encodeURIComponent(raffleSlug)}`);
      if (!res.ok) {
        setLoadStatus({ tone: "error", message: "Não foi possível carregar a configuração do leilão." });
        return;
      }

      const json = (await res.json()) as AuctionAdminPayload;
      const normalizedAuction = {
        ...json.auction,
        endsAt: toDatetimeLocalValue(json.auction.endsAt),
      };

      setPayload(json);
      setAuction(normalizedAuction);
      setSelectedBidId((current) => current ?? json.recentBids[0]?.id ?? null);
      setReopenEndsAt((current) => current || normalizedAuction.endsAt);
      setErrors({});
    } catch {
      setLoadStatus({ tone: "error", message: "Não foi possível carregar a configuração do leilão." });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [raffleSlug]);

  const selectedBid = useMemo(
    () => payload?.recentBids.find((bid) => bid.id === selectedBidId) ?? null,
    [payload?.recentBids, selectedBidId],
  );

  const setField = <K extends keyof AuctionAdminConfig>(field: K, value: AuctionAdminConfig[K]) => {
    setAuction((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  function validateAuctionConfig(): AuctionErrors {
    const nextErrors: AuctionErrors = {};

    const slug = auction.slug.trim();
    if (!slug) {
      nextErrors.slug = "O slug do leilão é obrigatório.";
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      nextErrors.slug = "Use apenas letras minúsculas, números e hífen.";
    }

    if (!auction.title.trim()) {
      nextErrors.title = "O título principal é obrigatório.";
    }

    if (!auction.description.trim()) {
      nextErrors.description = "A descrição comercial é obrigatória.";
    }

    if (auction.openingBidCents < 0) {
      nextErrors.openingBidCents = "O lance inicial não pode ser negativo.";
    }

    if (auction.minIncrementCents < 1) {
      nextErrors.minIncrementCents = "O incremento mínimo deve ser pelo menos R$ 0,01.";
    }

    if (
      auction.reservePriceCents != null &&
      auction.reservePriceCents < auction.openingBidCents
    ) {
      nextErrors.reservePriceCents = "O preço de reserva não pode ser menor que o lance inicial.";
    }

    if (
      auction.marketValueCents != null &&
      auction.reservePriceCents != null &&
      auction.marketValueCents < auction.reservePriceCents
    ) {
      nextErrors.marketValueCents = "O valor de mercado não pode ser menor que o preço de reserva.";
    }

    if (
      auction.marketValueCents != null &&
      auction.marketValueCents < auction.openingBidCents
    ) {
      nextErrors.marketValueCents = "O valor de mercado não pode ser menor que o lance inicial.";
    }

    if (!auction.endsAt) {
      nextErrors.endsAt = "Defina a data de encerramento.";
    } else {
      const date = new Date(auction.endsAt);
      if (Number.isNaN(date.getTime())) {
        nextErrors.endsAt = "Data de encerramento inválida.";
      } else if (auction.status === "scheduled" && date.getTime() <= Date.now()) {
        nextErrors.endsAt = "Para um leilão agendado, o encerramento precisa estar no futuro.";
      }
    }

    if (auction.imageUrl && !/^https?:\/\//i.test(auction.imageUrl.trim())) {
      nextErrors.imageUrl = "Informe uma URL válida para a imagem principal.";
    }

    if (auction.videoUrl && !/^https?:\/\//i.test(auction.videoUrl.trim())) {
      nextErrors.videoUrl = "Informe uma URL válida para o vídeo.";
    }

    if (auction.galleryUrls.some((url) => !/^https?:\/\//i.test(url))) {
      nextErrors.galleryUrls = "Todas as URLs da galeria precisam começar com http:// ou https://.";
    }

    if (auction.authenticityAssets.some((url) => !/^https?:\/\//i.test(url))) {
      nextErrors.authenticityAssets = "Todos os anexos de autenticidade precisam ser URLs válidas.";
    }

    return nextErrors;
  }

  function confirmAction(action: string) {
    const labelByAction: Record<string, string> = {
      pause: "pausar os lances",
      resume: "retomar os lances",
      close: "encerrar manualmente o leilão",
      reopen: "reabrir a disputa",
      disqualify_bid: "desclassificar o lance selecionado",
      swap_winner: "definir o lance selecionado como vencedor",
      mark_contacted: "marcar contato realizado com o vencedor",
      mark_paid: "marcar o pagamento como recebido",
      mark_delivered: "marcar o lote como entregue",
      mark_defaulted: "marcar o vencedor como inadimplente",
    };

    const criticalActions = new Set([
      "close",
      "reopen",
      "disqualify_bid",
      "swap_winner",
      "mark_defaulted",
    ]);

    const message = criticalActions.has(action)
      ? `Confirma a ação: ${labelByAction[action]}? Essa operação exige atenção operacional.`
      : `Confirma a ação: ${labelByAction[action]}?`;

    return window.confirm(message);
  }

  function validateAction(action: string) {
    if (["disqualify_bid", "swap_winner"].includes(action) && !selectedBidId) {
      setActionStatus({ tone: "error", message: "Selecione um lance antes de executar essa ação." });
      return false;
    }

    if (["disqualify_bid", "swap_winner", "mark_defaulted", "close", "reopen"].includes(action) && !moderationReason.trim()) {
      setActionStatus({
        tone: "warning",
        message: "Informe o motivo/observação antes de executar essa ação sensível.",
      });
      return false;
    }

    if (action === "reopen") {
      if (!reopenEndsAt) {
        setErrors((prev) => ({ ...prev, reopenEndsAt: "Informe o novo encerramento para reabrir." }));
        setActionStatus({ tone: "error", message: "Defina o novo encerramento antes de reabrir a disputa." });
        return false;
      }

      const reopenDate = new Date(reopenEndsAt);
      if (Number.isNaN(reopenDate.getTime()) || reopenDate.getTime() <= Date.now()) {
        setErrors((prev) => ({ ...prev, reopenEndsAt: "O novo encerramento precisa ser uma data futura válida." }));
        setActionStatus({
          tone: "error",
          message: "O novo encerramento precisa ser uma data futura válida.",
        });
        return false;
      }
    }

    return true;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setSaveStatus(null);
    setActionStatus(null);
    setUploadStatus(null);

    const validation = validateAuctionConfig();
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      setSaveStatus({
        tone: "error",
        message: "Revise os campos destacados antes de salvar o leilão.",
      });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/admin/auction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auction),
      });

      if (!res.ok) {
        setSaveStatus({ tone: "error", message: await readErrorMessage(res, "Erro ao salvar leilão.") });
        return;
      }

      setSaveStatus({ tone: "success", message: "Leilão salvo com sucesso." });
      await fetchData();
    } catch {
      setSaveStatus({ tone: "error", message: "Falha de rede ao salvar o leilão." });
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action: string) => {
    setActionStatus(null);

    if (!validateAction(action)) return;
    if (!confirmAction(action)) return;

    setActionLoading(action);

    try {
      const res = await fetch("/api/admin/auction/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffleSlug,
          slug: auction.slug,
          action,
          bidId: selectedBidId,
          reason: moderationReason.trim() || undefined,
          endsAt: reopenEndsAt || undefined,
        }),
      });

      if (!res.ok) {
        setActionStatus({ tone: "error", message: await readErrorMessage(res, "Falha ao executar ação.") });
        return;
      }

      setActionStatus({ tone: "success", message: "Ação executada com sucesso." });
      setModerationReason("");
      await fetchData();
    } catch {
      setActionStatus({ tone: "error", message: "Falha de rede ao executar a ação do leilão." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMainImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus(null);

    try {
      if (!file.type.startsWith("image/")) {
        setUploadStatus({ tone: "error", message: "Selecione um arquivo de imagem válido." });
        return;
      }

      if (file.size > 8 * 1024 * 1024) {
        setUploadStatus({ tone: "error", message: "A imagem deve ter no máximo 8 MB." });
        return;
      }

      setUploadLoading(true);

      const metaRes = await fetch("/api/admin/auction-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, slug: auction.slug || "auction" }),
      });

      if (!metaRes.ok) {
        throw new Error(await readErrorMessage(metaRes, "Erro ao preparar upload."));
      }

      const metaJson = (await metaRes.json()) as { signedUrl: string; publicUrl: string };

      const uploadRes = await fetch(metaJson.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Falha ao enviar o arquivo.");
      }

      setField("imageUrl", metaJson.publicUrl);
      setUploadStatus({ tone: "success", message: "Imagem enviada com sucesso." });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setUploadStatus({ tone: "error", message: `Erro ao enviar imagem: ${message}` });
    } finally {
      setUploadLoading(false);
      event.currentTarget.value = "";
    }
  };

  if (initialLoading) {
    return (
      <section
        style={{
          background: "linear-gradient(180deg, rgba(2,6,23,0.94), rgba(15,23,42,0.92))",
          border: "1px solid rgba(148,163,184,0.22)",
          borderRadius: 18,
          padding: "1rem",
        }}
      >
        <p style={{ color: "#cbd5e1", margin: 0 }}>Carregando configuração do leilão...</p>
      </section>
    );
  }

  return (
    <section
      style={{
        background: "linear-gradient(180deg, rgba(2,6,23,0.94), rgba(15,23,42,0.92))",
        border: "1px solid rgba(148,163,184,0.22)",
        borderRadius: 18,
        padding: "1rem",
        boxShadow: "0 14px 34px rgba(2,6,23,0.18)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          marginBottom: ".9rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3 style={{ color: "#f8fafc", margin: 0 }}>Configuração do Leilão</h3>
          <p style={{ color: "#94a3b8", margin: ".2rem 0 0" }}>
            Cadastro do lote, parâmetros financeiros, cronograma, mídia e operação assistida.
          </p>
        </div>
        <span style={{ color: "#cbd5e1", fontSize: ".9rem" }}>Slug do lote: {auction.slug || "-"}</span>
      </div>

      <StatusBanner status={loadStatus} />

      <div
        style={{
          display: "grid",
          gap: ".9rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginTop: loadStatus ? "1rem" : 0,
          marginBottom: "1rem",
        }}
      >
        <div style={cardStyle()}>
          <strong style={{ color: "#f8fafc", fontSize: "1.1rem" }}>{payload?.performance.visitors ?? 0}</strong>
          <div style={{ color: "#94a3b8", fontSize: ".88rem" }}>visitantes do lote</div>
        </div>
        <div style={cardStyle()}>
          <strong style={{ color: "#f8fafc", fontSize: "1.1rem" }}>{payload?.performance.participant_rate ?? 0}%</strong>
          <div style={{ color: "#94a3b8", fontSize: ".88rem" }}>taxa de participantes</div>
        </div>
        <div style={cardStyle()}>
          <strong style={{ color: "#f8fafc", fontSize: "1.1rem" }}>
            {formatBrlFromCents(payload?.performance.total_raised_cents ?? 0)}
          </strong>
          <div style={{ color: "#94a3b8", fontSize: ".88rem" }}>arrecadação atual</div>
        </div>
        <div style={cardStyle()}>
          <strong style={{ color: "#f8fafc", fontSize: "1.1rem" }}>{payload?.performance.auto_bid_count ?? 0}</strong>
          <div style={{ color: "#94a3b8", fontSize: ".88rem" }}>auto-bids ativos</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <div style={cardStyle()}>
          <h4 style={sectionTitleStyle()}>Identificação e status</h4>
          <p style={sectionHintStyle()}>
            Campos estruturais do lote. O slug fica protegido por padrão para evitar alterações acidentais.
          </p>

          <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: ".9rem" }}>
            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Slug do leilão
              <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                <input
                  value={auction.slug}
                  onChange={(e) => setField("slug", e.target.value.trim().toLowerCase())}
                  disabled={!slugEditable}
                  aria-invalid={Boolean(errors.slug)}
                  style={{
                    ...INPUT_STYLE,
                    opacity: slugEditable ? 1 : 0.7,
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!slugEditable) {
                      const confirmed = window.confirm("Deseja liberar a edição do slug? Isso pode afetar URLs e uploads.");
                      if (!confirmed) return;
                    }
                    setSlugEditable((current) => !current);
                  }}
                  style={CONTROL_BUTTON_STYLE}
                >
                  {slugEditable ? "Bloquear slug" : "Editar slug"}
                </button>
              </div>
              <FieldHint>Use apenas letras minúsculas, números e hífen.</FieldHint>
              <FieldError message={errors.slug} />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Rótulo do lote
              <input
                value={auction.lotLabel}
                onChange={(e) => setField("lotLabel", e.target.value)}
                placeholder="Ex: Lote #07"
                style={INPUT_STYLE}
              />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Selo visual
              <input
                value={auction.highlightBadge}
                onChange={(e) => setField("highlightBadge", e.target.value)}
                placeholder="Ex: Ao vivo"
                style={INPUT_STYLE}
              />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Status
              <select
                value={auction.status}
                onChange={(e) => setField("status", e.target.value as AuctionAdminConfig["status"])}
                style={INPUT_STYLE}
              >
                <option value="scheduled">Agendado</option>
                <option value="open">Aberto</option>
                <option value="closed">Fechado sem vencedor</option>
                <option value="settled">Liquidado</option>
              </select>
            </label>
          </div>
        </div>

        <div style={cardStyle()}>
          <h4 style={sectionTitleStyle()}>Apresentação comercial</h4>
          <p style={sectionHintStyle()}>Conteúdo principal exibido no lote para o usuário final.</p>

          <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: ".9rem" }}>
            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Título principal
              <input
                value={auction.title}
                onChange={(e) => setField("title", e.target.value)}
                aria-invalid={Boolean(errors.title)}
                style={INPUT_STYLE}
              />
              <FieldError message={errors.title} />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Subtítulo
              <input
                value={auction.subtitle}
                onChange={(e) => setField("subtitle", e.target.value)}
                placeholder="Ex: disputa em tempo real com extensão automática"
                style={INPUT_STYLE}
              />
            </label>
          </div>

          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem", marginTop: ".9rem" }}>
            Descrição comercial
            <textarea
              value={auction.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
              maxLength={1200}
              aria-invalid={Boolean(errors.description)}
              style={TEXTAREA_STYLE}
            />
            <FieldHint>{auction.description.length}/1200 caracteres</FieldHint>
            <FieldError message={errors.description} />
          </label>
        </div>

        <div style={cardStyle()}>
          <h4 style={sectionTitleStyle()}>Financeiro</h4>
          <p style={sectionHintStyle()}>
            Regras de preço do lote. O formulário agora bloqueia combinações incoerentes.
          </p>

          <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: ".9rem" }}>
            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Lance inicial (R$)
              <input
                type="number"
                min={0}
                step="0.01"
                value={centsToDisplay(auction.openingBidCents)}
                onChange={(e) => setField("openingBidCents", displayToCents(e.target.value) ?? 0)}
                aria-invalid={Boolean(errors.openingBidCents)}
                style={INPUT_STYLE}
              />
              <FieldHint>Valor salvo: {formatBrlFromCents(auction.openingBidCents ?? 0)}</FieldHint>
              <FieldError message={errors.openingBidCents} />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Incremento mínimo (R$)
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={centsToDisplay(auction.minIncrementCents)}
                onChange={(e) => setField("minIncrementCents", Math.max(1, displayToCents(e.target.value) ?? 0))}
                aria-invalid={Boolean(errors.minIncrementCents)}
                style={INPUT_STYLE}
              />
              <FieldHint>Valor salvo: {formatBrlFromCents(auction.minIncrementCents ?? 0)}</FieldHint>
              <FieldError message={errors.minIncrementCents} />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Preço de reserva (R$)
              <input
                type="number"
                min={0}
                step="0.01"
                value={centsToDisplay(auction.reservePriceCents)}
                onChange={(e) => setField("reservePriceCents", displayToCents(e.target.value))}
                aria-invalid={Boolean(errors.reservePriceCents)}
                style={INPUT_STYLE}
              />
              <FieldHint>Opcional. Se informado, não pode ser menor que o lance inicial.</FieldHint>
              <FieldError message={errors.reservePriceCents} />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Valor de mercado estimado (R$)
              <input
                type="number"
                min={0}
                step="0.01"
                value={centsToDisplay(auction.marketValueCents)}
                onChange={(e) => setField("marketValueCents", displayToCents(e.target.value))}
                aria-invalid={Boolean(errors.marketValueCents)}
                style={INPUT_STYLE}
              />
              <FieldHint>Ajuda a justificar o posicionamento do lote.</FieldHint>
              <FieldError message={errors.marketValueCents} />
            </label>
          </div>
        </div>

        <div style={cardStyle()}>
          <h4 style={sectionTitleStyle()}>Cronograma e anti-sniping</h4>
          <p style={sectionHintStyle()}>
            Se um lance entrar nos últimos segundos configurados, o leilão é estendido automaticamente.
          </p>

          <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: ".9rem" }}>
            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Encerramento
              <input
                type="datetime-local"
                value={auction.endsAt}
                onChange={(e) => setField("endsAt", e.target.value)}
                aria-invalid={Boolean(errors.endsAt)}
                style={INPUT_STYLE}
              />
              <FieldHint>Horário local do navegador.</FieldHint>
              <FieldError message={errors.endsAt} />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Janela anti-sniping (segundos)
              <input
                type="number"
                min={0}
                step={1}
                value={auction.bidExtensionWindowSeconds}
                onChange={(e) => setField("bidExtensionWindowSeconds", Math.max(0, Number(e.target.value) || 0))}
                style={INPUT_STYLE}
              />
              <FieldHint>Ex.: 60 = entra nos últimos 60 segundos.</FieldHint>
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Extensão por lance (segundos)
              <input
                type="number"
                min={0}
                step={1}
                value={auction.bidExtensionSeconds}
                onChange={(e) => setField("bidExtensionSeconds", Math.max(0, Number(e.target.value) || 0))}
                style={INPUT_STYLE}
              />
              <FieldHint>Ex.: 60 = adiciona mais 60 segundos ao relógio.</FieldHint>
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Prazo de pagamento do vencedor (h)
              <input
                type="number"
                min={1}
                step={1}
                value={auction.settlementDeadlineHours}
                onChange={(e) => setField("settlementDeadlineHours", Math.max(1, Number(e.target.value) || 24))}
                style={INPUT_STYLE}
              />
            </label>
          </div>
        </div>

        <div style={cardStyle()}>
          <h4 style={sectionTitleStyle()}>Mídia e prova</h4>
          <p style={sectionHintStyle()}>
            Mantenha URLs válidas e objetivas. A imagem principal possui upload assistido.
          </p>

          <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: ".9rem" }}>
            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Imagem principal
              <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                <input
                  value={auction.imageUrl}
                  onChange={(e) => setField("imageUrl", e.target.value)}
                  placeholder="https://..."
                  aria-invalid={Boolean(errors.imageUrl)}
                  style={{ ...INPUT_STYLE, flex: 1 }}
                />
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".35rem",
                    padding: ".6rem .95rem",
                    borderRadius: 12,
                    border: "1px dashed #38bdf8",
                    background: "rgba(56,189,248,0.08)",
                    color: "#f8fafc",
                    cursor: uploadLoading ? "wait" : "pointer",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    opacity: uploadLoading ? 0.7 : 1,
                  }}
                >
                  {uploadLoading ? "Enviando..." : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadLoading}
                    onChange={handleMainImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              <FieldHint>Formatos de imagem válidos. Tamanho máximo sugerido: 8 MB.</FieldHint>
              <FieldError message={errors.imageUrl} />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              URL do vídeo
              <input
                value={auction.videoUrl}
                onChange={(e) => setField("videoUrl", e.target.value)}
                placeholder="https://youtube.com/..."
                aria-invalid={Boolean(errors.videoUrl)}
                style={INPUT_STYLE}
              />
              <FieldError message={errors.videoUrl} />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Critério de desempate
              <input
                value={auction.tieBreakRule}
                onChange={(e) => setField("tieBreakRule", e.target.value)}
                style={INPUT_STYLE}
              />
            </label>
          </div>

          <div style={{ marginTop: ".9rem", display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Galeria do lote
              <textarea
                value={auction.galleryUrls.join("\n")}
                onChange={(e) => setField("galleryUrls", linesToArray(e.target.value))}
                rows={5}
                placeholder="Uma URL por linha"
                aria-invalid={Boolean(errors.galleryUrls)}
                style={TEXTAREA_STYLE}
              />
              <FieldHint>Evite duplicações e use uma URL por linha.</FieldHint>
              <FieldError message={errors.galleryUrls} />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Bullet points / ficha técnica
              <textarea
                value={auction.featureBullets.join("\n")}
                onChange={(e) => setField("featureBullets", linesToArray(e.target.value))}
                rows={5}
                placeholder="Uma vantagem ou especificação por linha"
                style={TEXTAREA_STYLE}
              />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Anexos de autenticidade
              <textarea
                value={auction.authenticityAssets.join("\n")}
                onChange={(e) => setField("authenticityAssets", linesToArray(e.target.value))}
                rows={5}
                placeholder="Uma URL por linha"
                aria-invalid={Boolean(errors.authenticityAssets)}
                style={TEXTAREA_STYLE}
              />
              <FieldError message={errors.authenticityAssets} />
            </label>
          </div>

          <div style={{ marginTop: ".9rem" }}>
            <StatusBanner status={uploadStatus} />
          </div>

          {auction.imageUrl ? (
            <div style={{ display: "flex", gap: ".9rem", alignItems: "center", flexWrap: "wrap", marginTop: ".9rem" }}>
              <div style={{ position: "relative", width: 220, height: 140 }}>
                <Image
                  src={auction.imageUrl}
                  alt={auction.title || "Prévia do leilão"}
                  fill
                  sizes="220px"
                  style={{
                    objectFit: "cover",
                    borderRadius: 14,
                    border: "1px solid #334155",
                    background: "#020617",
                  }}
                />
              </div>
              <div style={{ color: "#cbd5e1", fontSize: ".92rem", maxWidth: 420 }}>
                Esta prévia representa a imagem principal do lote. A galeria adiciona closes, acessórios, laudos e provas extras.
              </div>
            </div>
          ) : null}
        </div>

        <div style={cardStyle()}>
          <h4 style={sectionTitleStyle()}>Conteúdo público e observações operacionais</h4>
          <p style={sectionHintStyle()}>
            Separe textos públicos do lote das anotações de avaliação e documentação interna.
          </p>

          <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: ".9rem" }}>
            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Estado / condição
              <textarea
                value={auction.conditionSummary}
                onChange={(e) => setField("conditionSummary", e.target.value)}
                rows={3}
                style={TEXTAREA_STYLE}
              />
              <FieldHint>Resumo público e objetivo do estado do item.</FieldHint>
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Laudo / estado detalhado
              <textarea
                value={auction.conditionReport}
                onChange={(e) => setField("conditionReport", e.target.value)}
                rows={3}
                style={TEXTAREA_STYLE}
              />
              <FieldHint>Detalhamento técnico mais profundo.</FieldHint>
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Frete / envio
              <textarea
                value={auction.shippingInfo}
                onChange={(e) => setField("shippingInfo", e.target.value)}
                rows={3}
                style={TEXTAREA_STYLE}
              />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Retirada / entrega
              <textarea
                value={auction.pickupInfo}
                onChange={(e) => setField("pickupInfo", e.target.value)}
                rows={3}
                style={TEXTAREA_STYLE}
              />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Provas de autenticidade
              <textarea
                value={auction.authenticityInfo}
                onChange={(e) => setField("authenticityInfo", e.target.value)}
                rows={3}
                style={TEXTAREA_STYLE}
              />
              <FieldHint>Descrição textual das evidências e autenticidade.</FieldHint>
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Nota fiscal / documentação
              <textarea
                value={auction.invoiceInfo}
                onChange={(e) => setField("invoiceInfo", e.target.value)}
                rows={3}
                style={TEXTAREA_STYLE}
              />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Justificativa de valor
              <textarea
                value={auction.lotStory}
                onChange={(e) => setField("lotStory", e.target.value)}
                rows={3}
                style={TEXTAREA_STYLE}
              />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Observações internas de avaliação
              <textarea
                value={auction.appraisalNotes}
                onChange={(e) => setField("appraisalNotes", e.target.value)}
                rows={3}
                style={TEXTAREA_STYLE}
              />
              <FieldHint>Uso interno da equipe.</FieldHint>
            </label>
          </div>
        </div>

        <div style={cardStyle()}>
          <h4 style={{ color: "#f8fafc", marginTop: 0 }}>Moderação operacional</h4>
          <p style={sectionHintStyle()}>
            Ações sensíveis exigem motivo preenchido e confirmação antes do envio.
          </p>

          <div style={{ display: "grid", gap: ".8rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: ".9rem" }}>
            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Motivo / observação
              <textarea
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                rows={2}
                maxLength={500}
                style={TEXTAREA_STYLE}
              />
              <FieldHint>{moderationReason.length}/500 caracteres</FieldHint>
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Novo encerramento para reabrir
              <input
                type="datetime-local"
                value={reopenEndsAt}
                onChange={(e) => {
                  setReopenEndsAt(e.target.value);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.reopenEndsAt;
                    return next;
                  });
                }}
                aria-invalid={Boolean(errors.reopenEndsAt)}
                style={INPUT_STYLE}
              />
              <FieldError message={errors.reopenEndsAt} />
            </label>

            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Lance selecionado
              <select
                value={selectedBidId ?? ""}
                onChange={(e) => setSelectedBidId(e.target.value ? Number(e.target.value) : null)}
                style={INPUT_STYLE}
              >
                <option value="">Selecione um lance</option>
                {(payload?.recentBids ?? []).map((bid) => (
                  <option key={bid.id} value={bid.id}>
                    #{bid.id} • {formatBrlFromCents(bid.amount_cents)} • {bid.bidder_name || bid.bidder_contact || "Participante"}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedBid ? (
            <div
              style={{
                marginTop: ".9rem",
                border: "1px solid rgba(56,189,248,0.2)",
                background: "rgba(8,47,73,0.18)",
                borderRadius: 12,
                padding: ".8rem",
                color: "#cbd5e1",
              }}
            >
              Lance selecionado: <strong style={{ color: "#f8fafc" }}>#{selectedBid.id}</strong> ·{" "}
              <strong style={{ color: "#fde68a" }}>{formatBrlFromCents(selectedBid.amount_cents)}</strong> ·{" "}
              {selectedBid.bidder_name || selectedBid.bidder_contact || "Participante"}
            </div>
          ) : null}

          <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", marginTop: ".9rem" }}>
            <button type="button" style={CONTROL_BUTTON_STYLE} onClick={() => void runAction("pause")} disabled={actionLoading !== null}>
              {actionLoading === "pause" ? "Pausando..." : "Pausar lances"}
            </button>
            <button type="button" style={CONTROL_BUTTON_STYLE} onClick={() => void runAction("resume")} disabled={actionLoading !== null}>
              {actionLoading === "resume" ? "Retomando..." : "Retomar lances"}
            </button>
            <button type="button" style={DANGER_BUTTON_STYLE} onClick={() => void runAction("close")} disabled={actionLoading !== null}>
              {actionLoading === "close" ? "Encerrando..." : "Encerrar manualmente"}
            </button>
            <button type="button" style={DANGER_BUTTON_STYLE} onClick={() => void runAction("reopen")} disabled={actionLoading !== null}>
              {actionLoading === "reopen" ? "Reabrindo..." : "Reabrir disputa"}
            </button>
            <button
              type="button"
              style={DANGER_BUTTON_STYLE}
              onClick={() => void runAction("disqualify_bid")}
              disabled={actionLoading !== null || !selectedBidId}
            >
              {actionLoading === "disqualify_bid" ? "Desclassificando..." : "Desclassificar lance"}
            </button>
            <button
              type="button"
              style={DANGER_BUTTON_STYLE}
              onClick={() => void runAction("swap_winner")}
              disabled={actionLoading !== null || !selectedBidId}
            >
              {actionLoading === "swap_winner" ? "Atualizando..." : "Definir como vencedor"}
            </button>
          </div>

          <div style={{ marginTop: ".9rem" }}>
            <StatusBanner status={actionStatus} />
          </div>
        </div>

        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div style={cardStyle()}>
            <h4 style={{ color: "#f8fafc", marginTop: 0 }}>Gestão do vencedor</h4>
            <div style={{ color: "#cbd5e1", display: "grid", gap: ".35rem" }}>
              <span>Nome: {payload?.winner.winnerName || "-"}</span>
              <span>Contato: {payload?.winner.winnerContact || "-"}</span>
              <span>
                Lance final:{" "}
                {payload?.winner.winnerBidCents != null ? formatBrlFromCents(payload.winner.winnerBidCents) : "-"}
              </span>
              <span>Status: {payload?.winner.winnerStatus || "pending"}</span>
            </div>
            <div style={{ display: "flex", gap: ".65rem", flexWrap: "wrap", marginTop: ".9rem" }}>
              <button type="button" style={CONTROL_BUTTON_STYLE} onClick={() => void runAction("mark_contacted")} disabled={actionLoading !== null}>
                Contato realizado
              </button>
              <button type="button" style={CONTROL_BUTTON_STYLE} onClick={() => void runAction("mark_paid")} disabled={actionLoading !== null}>
                Pagamento recebido
              </button>
              <button type="button" style={CONTROL_BUTTON_STYLE} onClick={() => void runAction("mark_delivered")} disabled={actionLoading !== null}>
                Lote entregue
              </button>
              <button type="button" style={DANGER_BUTTON_STYLE} onClick={() => void runAction("mark_defaulted")} disabled={actionLoading !== null}>
                Marcar inadimplente
              </button>
            </div>
          </div>

          <div style={cardStyle()}>
            <h4 style={{ color: "#f8fafc", marginTop: 0 }}>Auto-bids ativos</h4>
            {(payload?.autoBids.length ?? 0) === 0 ? (
              <p style={{ color: "#94a3b8", margin: 0 }}>Nenhum auto-bid armado no momento.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: ".6rem" }}>
                {payload?.autoBids.map((entry) => (
                  <li key={entry.id} style={{ ...cardStyle(), padding: ".8rem" }}>
                    <strong style={{ color: "#f8fafc" }}>{entry.bidder_name || entry.bidder_contact || "Participante"}</strong>
                    <div style={{ color: "#94a3b8", fontSize: ".88rem" }}>
                      teto {formatBrlFromCents(entry.max_amount_cents)} • {entry.is_active ? "ativo" : "inativo"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div style={cardStyle()}>
            <h4 style={{ color: "#f8fafc", marginTop: 0 }}>Lances recentes</h4>
            <p style={{ color: "#94a3b8", fontSize: ".86rem", marginTop: 0 }}>
              Clique em um lance para selecioná-lo para moderação.
            </p>

            {(payload?.recentBids.length ?? 0) === 0 ? (
              <p style={{ color: "#94a3b8", margin: 0 }}>Nenhum lance registrado.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: ".6rem" }}>
                {payload?.recentBids.map((bid: AuctionBidEntry) => (
                  <li
                    key={bid.id}
                    onClick={() => setSelectedBidId(bid.id)}
                    style={{
                      ...cardStyle(),
                      padding: ".8rem",
                      borderColor: bid.id === selectedBidId ? "rgba(56,189,248,0.45)" : "rgba(148,163,184,0.18)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: ".8rem", alignItems: "baseline" }}>
                      <strong style={{ color: "#f8fafc" }}>
                        #{bid.id} • {bid.bidder_name || bid.bidder_contact || "Participante"}
                      </strong>
                      <span style={{ color: "#fde68a", fontWeight: 700 }}>{formatBrlFromCents(bid.amount_cents)}</span>
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: ".84rem" }}>
                      {new Date(bid.created_at).toLocaleString("pt-BR")}
                      {bid.disqualified_at ? " • desclassificado" : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={cardStyle()}>
            <h4 style={{ color: "#f8fafc", marginTop: 0 }}>Timeline operacional</h4>
            {(payload?.timeline.length ?? 0) === 0 ? (
              <p style={{ color: "#94a3b8", margin: 0 }}>Sem eventos registrados ainda.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: ".6rem" }}>
                {payload?.timeline.map((event) => (
                  <li key={event.id} style={{ ...cardStyle(), padding: ".8rem" }}>
                    <strong style={{ color: "#f8fafc" }}>{event.headline}</strong>
                    {event.description ? <div style={{ color: "#cbd5e1", fontSize: ".88rem" }}>{event.description}</div> : null}
                    <div style={{ color: "#94a3b8", fontSize: ".82rem" }}>{new Date(event.created_at).toLocaleString("pt-BR")}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gap: ".75rem" }}>
          <StatusBanner status={saveStatus} />

          <div style={{ display: "flex", gap: ".75rem", alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: "linear-gradient(95deg, #38bdf8, #3b82f6)",
                color: "#020617",
                fontWeight: 800,
                borderRadius: 12,
                padding: "0.85rem 1.2rem",
                border: "none",
                cursor: saving ? "wait" : "pointer",
              }}
            >
              {saving ? "Salvando..." : "Salvar leilão"}
            </button>

            <span style={{ color: "#94a3b8", fontSize: ".88rem" }}>
              Revise preços, datas e mídia antes de persistir alterações.
            </span>
          </div>
        </div>
      </form>
    </section>
  );
}