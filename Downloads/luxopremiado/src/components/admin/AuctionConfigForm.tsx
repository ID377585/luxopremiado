"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { getDefaultAuctionConfig } from "@/lib/auction";
import { formatBrlFromCents } from "@/lib/format";
import { AuctionAdminConfig, AuctionAdminPayload, AuctionBidEntry } from "@/types/auction";

interface AuctionConfigFormProps {
  raffleSlug: string;
}

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

const CONTROL_BUTTON_STYLE = {
  border: "1px solid rgba(56,189,248,0.28)",
  background: "rgba(15,23,42,0.92)",
  color: "#f8fafc",
  borderRadius: 12,
  padding: ".7rem 1rem",
  fontWeight: 700,
  cursor: "pointer",
} as const;

export function AuctionConfigForm({ raffleSlug }: AuctionConfigFormProps) {
  const [auction, setAuction] = useState<AuctionAdminConfig>(() => getDefaultAuctionConfig(raffleSlug));
  const [payload, setPayload] = useState<AuctionAdminPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedBidId, setSelectedBidId] = useState<number | null>(null);
  const [moderationReason, setModerationReason] = useState("");
  const [reopenEndsAt, setReopenEndsAt] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/auction?raffleSlug=${encodeURIComponent(raffleSlug)}`);
      if (!res.ok) return;
      const json = (await res.json()) as AuctionAdminPayload;
      setPayload(json);
      setAuction(json.auction);
      setSelectedBidId((current) => current ?? json.recentBids[0]?.id ?? null);
      setReopenEndsAt((current) => current || json.auction.endsAt);
    } catch {
      // noop
    }
  };

  useEffect(() => {
    void fetchData();
  }, [raffleSlug]);

  const setField = <K extends keyof AuctionAdminConfig>(field: K, value: AuctionAdminConfig[K]) => {
    setAuction((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedBid = useMemo(
    () => payload?.recentBids.find((bid) => bid.id === selectedBidId) ?? null,
    [payload?.recentBids, selectedBidId],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const res = await fetch("/api/admin/auction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(auction),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setStatusMessage(json.error ?? "Erro ao salvar leilão.");
    } else {
      setStatusMessage("Leilão salvo com sucesso.");
      await fetchData();
    }

    setLoading(false);
  };

  const runAction = async (action: string) => {
    setActionLoading(action);
    setStatusMessage(null);

    const res = await fetch("/api/admin/auction/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raffleSlug,
        slug: auction.slug,
        action,
        bidId: selectedBidId,
        reason: moderationReason || undefined,
        endsAt: reopenEndsAt || undefined,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatusMessage(json.error ?? "Falha ao executar ação.");
    } else {
      setStatusMessage("Ação executada com sucesso.");
      setModerationReason("");
      await fetchData();
    }

    setActionLoading(null);
  };

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
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: ".9rem", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ color: "#f8fafc", margin: 0 }}>Configuração do Leilão</h3>
          <p style={{ color: "#94a3b8", margin: ".2rem 0 0" }}>
            Lote premium com moderação operacional, auto-bid, timeline e pós-arremate.
          </p>
        </div>
        <span style={{ color: "#cbd5e1", fontSize: ".9rem" }}>Slug do lote: {auction.slug || "-"}</span>
      </div>

      <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: "1rem" }}>
        <div style={cardStyle()}>
          <strong style={{ color: "#f8fafc", fontSize: "1.1rem" }}>{payload?.performance.visitors ?? 0}</strong>
          <div style={{ color: "#94a3b8", fontSize: ".88rem" }}>visitantes do lote</div>
        </div>
        <div style={cardStyle()}>
          <strong style={{ color: "#f8fafc", fontSize: "1.1rem" }}>{payload?.performance.participant_rate ?? 0}%</strong>
          <div style={{ color: "#94a3b8", fontSize: ".88rem" }}>taxa de participantes</div>
        </div>
        <div style={cardStyle()}>
          <strong style={{ color: "#f8fafc", fontSize: "1.1rem" }}>{formatBrlFromCents(payload?.performance.total_raised_cents ?? 0)}</strong>
          <div style={{ color: "#94a3b8", fontSize: ".88rem" }}>arrecadação atual</div>
        </div>
        <div style={cardStyle()}>
          <strong style={{ color: "#f8fafc", fontSize: "1.1rem" }}>{payload?.performance.auto_bid_count ?? 0}</strong>
          <div style={{ color: "#94a3b8", fontSize: ".88rem" }}>auto-bids ativos</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Slug do leilão
            <input
              value={auction.slug}
              onChange={(e) => setField("slug", e.target.value)}
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Faixa do lote
            <input
              value={auction.lotLabel}
              onChange={(e) => setField("lotLabel", e.target.value)}
              placeholder="Ex: Lote #07"
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Badge de destaque
            <input
              value={auction.highlightBadge}
              onChange={(e) => setField("highlightBadge", e.target.value)}
              placeholder="Ex: Ao vivo"
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Status
            <select
              value={auction.status}
              onChange={(e) => setField("status", e.target.value as AuctionAdminConfig["status"])}
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            >
              <option value="scheduled">Agendado</option>
              <option value="open">Aberto</option>
              <option value="closed">Fechado sem vencedor</option>
              <option value="settled">Liquidado</option>
            </select>
          </label>
        </div>

        <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Título principal
            <input
              value={auction.title}
              onChange={(e) => setField("title", e.target.value)}
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Subtítulo
            <input
              value={auction.subtitle}
              onChange={(e) => setField("subtitle", e.target.value)}
              placeholder="Ex: disputa em tempo real com extensão automática"
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
        </div>

        <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
          Descrição comercial
          <textarea
            value={auction.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
            style={{ padding: ".75rem .85rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc", resize: "vertical" }}
          />
        </label>

        <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Lance inicial (R$)
            <input
              type="number"
              min={0}
              step="0.01"
              value={centsToDisplay(auction.openingBidCents)}
              onChange={(e) => setField("openingBidCents", displayToCents(e.target.value) ?? 0)}
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Incremento mínimo (R$)
            <input
              type="number"
              min={0.01}
              step="0.01"
              value={centsToDisplay(auction.minIncrementCents)}
              onChange={(e) => setField("minIncrementCents", Math.max(1, displayToCents(e.target.value) ?? 0))}
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Preço de reserva (R$)
            <input
              type="number"
              min={0}
              step="0.01"
              value={centsToDisplay(auction.reservePriceCents)}
              onChange={(e) => setField("reservePriceCents", displayToCents(e.target.value))}
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Valor estimado (R$)
            <input
              type="number"
              min={0}
              step="0.01"
              value={centsToDisplay(auction.marketValueCents)}
              onChange={(e) => setField("marketValueCents", displayToCents(e.target.value))}
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Encerramento
            <input
              type="datetime-local"
              value={auction.endsAt}
              onChange={(e) => setField("endsAt", e.target.value)}
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Janela anti-sniping (segundos)
            <input
              type="number"
              min={0}
              step={1}
              value={auction.bidExtensionWindowSeconds}
              onChange={(e) => setField("bidExtensionWindowSeconds", Math.max(0, Number(e.target.value) || 0))}
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Extensão por lance (segundos)
            <input
              type="number"
              min={0}
              step={1}
              value={auction.bidExtensionSeconds}
              onChange={(e) => setField("bidExtensionSeconds", Math.max(0, Number(e.target.value) || 0))}
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Prazo de pagamento do vencedor (h)
            <input
              type="number"
              min={1}
              step={1}
              value={auction.settlementDeadlineHours}
              onChange={(e) => setField("settlementDeadlineHours", Math.max(1, Number(e.target.value) || 24))}
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Imagem principal
            <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
              <input
                value={auction.imageUrl}
                onChange={(e) => setField("imageUrl", e.target.value)}
                placeholder="https://..."
                style={{ flex: 1, padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
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
                  cursor: "pointer",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setStatusMessage(null);
                      const metaRes = await fetch("/api/admin/auction-upload", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ fileName: file.name, slug: auction.slug || "auction" }),
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
                        throw new Error("Falha ao enviar o arquivo.");
                      }
                      setField("imageUrl", metaJson.publicUrl);
                      setStatusMessage("Imagem enviada com sucesso.");
                    } catch (err) {
                      const message = err instanceof Error ? err.message : String(err);
                      setStatusMessage(`Erro ao enviar imagem: ${message}`);
                    }
                  }}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            URL do vídeo
            <input
              value={auction.videoUrl}
              onChange={(e) => setField("videoUrl", e.target.value)}
              placeholder="https://youtube.com/..."
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Critério de desempate
            <input
              value={auction.tieBreakRule}
              onChange={(e) => setField("tieBreakRule", e.target.value)}
              style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Galeria do lote
            <textarea
              value={auction.galleryUrls.join("\n")}
              onChange={(e) => setField("galleryUrls", linesToArray(e.target.value))}
              rows={5}
              placeholder="Uma URL por linha"
              style={{ padding: ".75rem .85rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc", resize: "vertical" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Bullet points / ficha técnica
            <textarea
              value={auction.featureBullets.join("\n")}
              onChange={(e) => setField("featureBullets", linesToArray(e.target.value))}
              rows={5}
              placeholder="Uma vantagem ou especificação por linha"
              style={{ padding: ".75rem .85rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc", resize: "vertical" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Provas de autenticidade (anexos)
            <textarea
              value={auction.authenticityAssets.join("\n")}
              onChange={(e) => setField("authenticityAssets", linesToArray(e.target.value))}
              rows={5}
              placeholder="Uma URL por linha"
              style={{ padding: ".75rem .85rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc", resize: "vertical" }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Estado / condição
            <textarea
              value={auction.conditionSummary}
              onChange={(e) => setField("conditionSummary", e.target.value)}
              rows={3}
              style={{ padding: ".75rem .85rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc", resize: "vertical" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Laudo / estado detalhado
            <textarea
              value={auction.conditionReport}
              onChange={(e) => setField("conditionReport", e.target.value)}
              rows={3}
              style={{ padding: ".75rem .85rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc", resize: "vertical" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Frete / envio
            <textarea
              value={auction.shippingInfo}
              onChange={(e) => setField("shippingInfo", e.target.value)}
              rows={3}
              style={{ padding: ".75rem .85rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc", resize: "vertical" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Retirada / entrega
            <textarea
              value={auction.pickupInfo}
              onChange={(e) => setField("pickupInfo", e.target.value)}
              rows={3}
              style={{ padding: ".75rem .85rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc", resize: "vertical" }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Provas de autenticidade
            <textarea
              value={auction.authenticityInfo}
              onChange={(e) => setField("authenticityInfo", e.target.value)}
              rows={3}
              style={{ padding: ".75rem .85rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc", resize: "vertical" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Nota fiscal / documentação
            <textarea
              value={auction.invoiceInfo}
              onChange={(e) => setField("invoiceInfo", e.target.value)}
              rows={3}
              style={{ padding: ".75rem .85rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc", resize: "vertical" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Por que esse lote vale isso
            <textarea
              value={auction.lotStory}
              onChange={(e) => setField("lotStory", e.target.value)}
              rows={3}
              style={{ padding: ".75rem .85rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc", resize: "vertical" }}
            />
          </label>
          <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
            Observações de avaliação
            <textarea
              value={auction.appraisalNotes}
              onChange={(e) => setField("appraisalNotes", e.target.value)}
              rows={3}
              style={{ padding: ".75rem .85rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc", resize: "vertical" }}
            />
          </label>
        </div>

        {auction.imageUrl ? (
          <div style={{ display: "flex", gap: ".9rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 220, height: 140 }}>
              <Image
                src={auction.imageUrl}
                alt={auction.title || "Prévia do leilão"}
                fill
                sizes="220px"
                style={{ objectFit: "cover", borderRadius: 14, border: "1px solid #334155", background: "#020617" }}
              />
            </div>
            <div style={{ color: "#cbd5e1", fontSize: ".92rem", maxWidth: 420 }}>
              Esta prévia representa a imagem principal do lote. A galeria adiciona closes, acessórios, laudos e provas extras.
            </div>
          </div>
        ) : null}

        <div style={cardStyle()}>
          <h4 style={{ color: "#f8fafc", marginTop: 0 }}>Moderação operacional</h4>
          <div style={{ display: "grid", gap: ".8rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Motivo / observação
              <textarea
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                rows={2}
                style={{ padding: ".75rem .85rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc", resize: "vertical" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Novo encerramento para reabrir
              <input
                type="datetime-local"
                value={reopenEndsAt}
                onChange={(e) => setReopenEndsAt(e.target.value)}
                style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
              />
            </label>
            <label style={{ color: "#e2e8f0", display: "grid", gap: ".3rem" }}>
              Lance selecionado
              <select
                value={selectedBidId ?? ""}
                onChange={(e) => setSelectedBidId(e.target.value ? Number(e.target.value) : null)}
                style={{ padding: ".65rem .8rem", borderRadius: 12, border: "1px solid #334155", background: "#020617", color: "#f8fafc" }}
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

          <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", marginTop: ".9rem" }}>
            <button type="button" style={CONTROL_BUTTON_STYLE} onClick={() => void runAction("pause")} disabled={actionLoading !== null}>
              {actionLoading === "pause" ? "Pausando..." : "Pausar lances"}
            </button>
            <button type="button" style={CONTROL_BUTTON_STYLE} onClick={() => void runAction("resume")} disabled={actionLoading !== null}>
              {actionLoading === "resume" ? "Reabrindo..." : "Retomar lances"}
            </button>
            <button type="button" style={CONTROL_BUTTON_STYLE} onClick={() => void runAction("close")} disabled={actionLoading !== null}>
              {actionLoading === "close" ? "Encerrando..." : "Encerrar manualmente"}
            </button>
            <button type="button" style={CONTROL_BUTTON_STYLE} onClick={() => void runAction("reopen")} disabled={actionLoading !== null}>
              {actionLoading === "reopen" ? "Reabrindo..." : "Reabrir disputa"}
            </button>
            <button type="button" style={CONTROL_BUTTON_STYLE} onClick={() => void runAction("disqualify_bid")} disabled={actionLoading !== null || !selectedBidId}>
              {actionLoading === "disqualify_bid" ? "Removendo..." : "Desclassificar lance"}
            </button>
            <button type="button" style={CONTROL_BUTTON_STYLE} onClick={() => void runAction("swap_winner")} disabled={actionLoading !== null || !selectedBidId}>
              {actionLoading === "swap_winner" ? "Atualizando..." : "Promover a vencedor"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div style={cardStyle()}>
            <h4 style={{ color: "#f8fafc", marginTop: 0 }}>Gestão do vencedor</h4>
            <div style={{ color: "#cbd5e1", display: "grid", gap: ".35rem" }}>
              <span>Nome: {payload?.winner.winnerName || "-"}</span>
              <span>Contato: {payload?.winner.winnerContact || "-"}</span>
              <span>Lance final: {payload?.winner.winnerBidCents != null ? formatBrlFromCents(payload.winner.winnerBidCents) : "-"}</span>
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
              <button type="button" style={CONTROL_BUTTON_STYLE} onClick={() => void runAction("mark_defaulted")} disabled={actionLoading !== null}>
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
            {(payload?.recentBids.length ?? 0) === 0 ? (
              <p style={{ color: "#94a3b8", margin: 0 }}>Nenhum lance registrado.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: ".6rem" }}>
                {payload?.recentBids.map((bid: AuctionBidEntry) => (
                  <li
                    key={bid.id}
                    style={{
                      ...cardStyle(),
                      padding: ".8rem",
                      borderColor: bid.id === selectedBidId ? "rgba(56,189,248,0.45)" : "rgba(148,163,184,0.18)",
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

        <div style={{ display: "flex", gap: ".75rem", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(95deg, #38bdf8, #3b82f6)",
              color: "#020617",
              fontWeight: 800,
              borderRadius: 12,
              padding: "0.85rem 1.2rem",
              border: "none",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Salvando..." : "Salvar leilão"}
          </button>
          {statusMessage ? (
            <p style={{ color: statusMessage.includes("sucesso") ? "#22c55e" : "#f87171", margin: 0 }}>
              {statusMessage}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
