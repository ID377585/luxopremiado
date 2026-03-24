import { getDefaultRaffleSlug, normalizeRaffleSlug } from "@/lib/raffle-slug";
import { AuctionAdminConfig, AuctionSnapshot } from "@/types/auction";

const DEFAULT_AUCTION_SLUG = "leilao-principal";

export function getDefaultAuctionConfig(raffleSlug: string = getDefaultRaffleSlug()): AuctionAdminConfig {
  return {
    raffleSlug,
    slug: DEFAULT_AUCTION_SLUG,
    lotLabel: "Lote premium",
    title: "Leilão em destaque",
    subtitle: "Disputa ao vivo com extensão automática nos minutos finais.",
    description: "Configure um lote exclusivo para aumentar desejo, recorrência e percepção premium da campanha.",
    highlightBadge: "Ao vivo",
    imageUrl: "",
    galleryUrls: [],
    featureBullets: [],
    videoUrl: "",
    conditionSummary: "Item novo, revisado e pronto para entrega.",
    shippingInfo: "Envio com seguro ou retirada combinada após confirmação do vencedor.",
    pickupInfo: "Retirada mediante agendamento com documentação do arrematante.",
    authenticityInfo: "Comprovantes e registros exibidos na finalização do leilão.",
    invoiceInfo: "Documentação e comprovantes informados no fechamento.",
    lotStory: "Explique por que este lote chama atenção, qual a raridade e o motivo de gerar disputa.",
    conditionReport: "Descreva estado, quilometragem, revisões, acessórios e qualquer laudo relevante.",
    authenticityAssets: [],
    appraisalNotes: "Inclua avaliação de mercado, histórico de valorização e observações do especialista.",
    tieBreakRule: "Em empate de valor, vence o lance registrado primeiro.",
    settlementDeadlineHours: 24,
    openingBidCents: 0,
    minIncrementCents: 500,
    reservePriceCents: null,
    marketValueCents: null,
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    bidExtensionWindowSeconds: 120,
    bidExtensionSeconds: 120,
    status: "open",
  };
}

export function normalizeAuctionRaffleSlug(value: string | null | undefined): string {
  return normalizeRaffleSlug(value) ?? getDefaultRaffleSlug();
}

export function coerceStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      return coerceStringArray(JSON.parse(value));
    } catch {
      return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

export function coerceOptionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function coerceCents(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  const normalized = String(value).replace(/\s+/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed);
}

export function mapAuctionRowToAdminConfig(row: Record<string, unknown> | null, raffleSlug: string): AuctionAdminConfig {
  if (!row) {
    return getDefaultAuctionConfig(raffleSlug);
  }

  return {
    raffleSlug: normalizeAuctionRaffleSlug((row.raffle_slug as string | null | undefined) ?? raffleSlug),
    slug: typeof row.slug === "string" && row.slug.trim() ? row.slug : DEFAULT_AUCTION_SLUG,
    lotLabel: typeof row.lot_label === "string" ? row.lot_label : "",
    title: typeof row.title === "string" ? row.title : "",
    subtitle: typeof row.subtitle === "string" ? row.subtitle : "",
    description: typeof row.description === "string" ? row.description : "",
    highlightBadge: typeof row.highlight_badge === "string" ? row.highlight_badge : "",
    imageUrl: typeof row.image_url === "string" ? row.image_url : "",
    galleryUrls: coerceStringArray(row.gallery_urls),
    featureBullets: coerceStringArray(row.feature_bullets),
    videoUrl: typeof row.video_url === "string" ? row.video_url : "",
    conditionSummary: typeof row.condition_summary === "string" ? row.condition_summary : "",
    shippingInfo: typeof row.shipping_info === "string" ? row.shipping_info : "",
    pickupInfo: typeof row.pickup_info === "string" ? row.pickup_info : "",
    authenticityInfo: typeof row.authenticity_info === "string" ? row.authenticity_info : "",
    invoiceInfo: typeof row.invoice_info === "string" ? row.invoice_info : "",
    lotStory: typeof row.lot_story === "string" ? row.lot_story : "",
    conditionReport: typeof row.condition_report === "string" ? row.condition_report : "",
    authenticityAssets: coerceStringArray(row.authenticity_assets),
    appraisalNotes: typeof row.appraisal_notes === "string" ? row.appraisal_notes : "",
    tieBreakRule:
      typeof row.tie_break_rule === "string" && row.tie_break_rule.trim()
        ? row.tie_break_rule
        : getDefaultAuctionConfig(raffleSlug).tieBreakRule,
    settlementDeadlineHours: Math.max(
      1,
      Number(row.settlement_deadline_hours ?? getDefaultAuctionConfig(raffleSlug).settlementDeadlineHours),
    ),
    openingBidCents: Number(row.opening_bid_cents ?? 0),
    minIncrementCents: Number(row.min_increment_cents ?? 500),
    reservePriceCents: row.reserve_price_cents === null || row.reserve_price_cents === undefined ? null : Number(row.reserve_price_cents),
    marketValueCents: row.market_value_cents === null || row.market_value_cents === undefined ? null : Number(row.market_value_cents),
    endsAt: row.ends_at ? String(row.ends_at).slice(0, 16) : getDefaultAuctionConfig(raffleSlug).endsAt,
    bidExtensionWindowSeconds: Number(row.bid_extension_window_seconds ?? 120),
    bidExtensionSeconds: Number(row.bid_extension_seconds ?? 120),
    status: row.status === "scheduled" || row.status === "closed" || row.status === "settled" ? row.status : "open",
  };
}

export function mapAuctionSnapshot(row: Record<string, unknown>): AuctionSnapshot {
  return {
    id: String(row.id),
    raffle_slug: normalizeAuctionRaffleSlug(row.raffle_slug as string | null | undefined),
    slug: String(row.slug),
    lot_label: coerceOptionalText(row.lot_label),
    title: String(row.title ?? ""),
    subtitle: coerceOptionalText(row.subtitle),
    description: coerceOptionalText(row.description),
    highlight_badge: coerceOptionalText(row.highlight_badge),
    image_url: coerceOptionalText(row.image_url),
    gallery_urls: coerceStringArray(row.gallery_urls),
    feature_bullets: coerceStringArray(row.feature_bullets),
    video_url: coerceOptionalText(row.video_url),
    condition_summary: coerceOptionalText(row.condition_summary),
    shipping_info: coerceOptionalText(row.shipping_info),
    pickup_info: coerceOptionalText(row.pickup_info),
    authenticity_info: coerceOptionalText(row.authenticity_info),
    invoice_info: coerceOptionalText(row.invoice_info),
    lot_story: coerceOptionalText(row.lot_story),
    condition_report: coerceOptionalText(row.condition_report),
    authenticity_assets: coerceStringArray(row.authenticity_assets),
    appraisal_notes: coerceOptionalText(row.appraisal_notes),
    tie_break_rule: typeof row.tie_break_rule === "string" && row.tie_break_rule.trim()
      ? row.tie_break_rule
      : getDefaultAuctionConfig().tieBreakRule,
    settlement_deadline_hours: Math.max(1, Number(row.settlement_deadline_hours ?? 24)),
    pause_reason: coerceOptionalText(row.pause_reason),
    paused_at: coerceOptionalText(row.paused_at),
    opening_bid_cents: Number(row.opening_bid_cents ?? 0),
    current_bid_cents: Number(row.current_bid_cents ?? 0),
    min_increment_cents: Number(row.min_increment_cents ?? 1),
    reserve_price_cents: row.reserve_price_cents === null || row.reserve_price_cents === undefined ? null : Number(row.reserve_price_cents),
    market_value_cents: row.market_value_cents === null || row.market_value_cents === undefined ? null : Number(row.market_value_cents),
    bid_extension_window_seconds: Number(row.bid_extension_window_seconds ?? 120),
    bid_extension_seconds: Number(row.bid_extension_seconds ?? 120),
    total_bids: Number(row.total_bids ?? 0),
    unique_bidder_count: Number(row.unique_bidder_count ?? 0),
    last_bid_at: coerceOptionalText(row.last_bid_at),
    ends_at: String(row.ends_at),
    status: row.status === "scheduled" || row.status === "closed" || row.status === "settled" ? row.status : "open",
    leading_bidder_user_id: coerceOptionalText(row.leading_bidder_user_id),
    leading_bidder_name: coerceOptionalText(row.leading_bidder_name),
    leading_bidder_contact: coerceOptionalText(row.leading_bidder_contact),
    winner_user_id: coerceOptionalText(row.winner_user_id),
    winner_name: coerceOptionalText(row.winner_name),
    winner_contact: coerceOptionalText(row.winner_contact),
    winner_bid_cents: row.winner_bid_cents === null || row.winner_bid_cents === undefined ? null : Number(row.winner_bid_cents),
    winner_status:
      row.winner_status === "contacted" ||
      row.winner_status === "paid" ||
      row.winner_status === "delivered" ||
      row.winner_status === "defaulted"
        ? row.winner_status
        : "pending",
    winner_contacted_at: coerceOptionalText(row.winner_contacted_at),
    winner_paid_at: coerceOptionalText(row.winner_paid_at),
    winner_delivered_at: coerceOptionalText(row.winner_delivered_at),
    finalized_at: coerceOptionalText(row.finalized_at),
  };
}
