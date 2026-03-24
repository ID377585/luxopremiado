import { NextRequest, NextResponse } from "next/server";

import {
  coerceOptionalText,
  coerceStringArray,
  mapAuctionRowToAdminConfig,
  normalizeAuctionRaffleSlug,
} from "@/lib/auction";
import { getSessionUser, isAdminUser } from "@/lib/session";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  AuctionAdminConfig,
  AuctionAdminPayload,
  AuctionBidEntry,
  type AuctionTimelineEventType,
} from "@/types/auction";

interface AuctionBidRow {
  id: number;
  amount_cents: number;
  bidder_user_id?: string | null;
  bidder_name?: string | null;
  bidder_contact?: string | null;
  created_at: string;
  source?: "manual" | "proxy" | "admin";
  disqualified_at?: string | null;
  disqualified_reason?: string | null;
}

interface AuctionAutoBidRow {
  id: number | string;
  bidder_user_id?: string | null;
  bidder_name?: string | null;
  bidder_contact?: string | null;
  max_amount_cents?: number | null;
  is_active?: boolean | null;
  created_at: string;
}

interface AuctionTimelineRow {
  id: number | string;
  event_type?: string | null;
  headline?: string | null;
  description?: string | null;
  amount_cents?: number | null;
  created_at: string;
}

type WinnerStatus = "pending" | "contacted" | "paid" | "delivered" | "defaulted";

const ALLOWED_TIMELINE_EVENT_TYPES = new Set<string>([
  "bid",
  "proxy_bid",
  "auto_bid",
  "opening",
  "extended",
  "paused",
  "resumed",
  "closed",
  "settled",
  "winner_contacted",
  "winner_paid",
  "winner_delivered",
  "manual_update",
]);

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

async function ensureAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  const allowed = await isAdminUser(user.id, user.email);
  return allowed ? user : null;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toTrimmedStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeWinnerStatus(value: unknown): WinnerStatus {
  return value === "contacted" ||
    value === "paid" ||
    value === "delivered" ||
    value === "defaulted"
    ? value
    : "pending";
}

function averageBidIntervalSeconds(rows: AuctionBidRow[]): number | null {
  if (rows.length < 2) {
    return null;
  }

  let total = 0;
  let count = 0;

  for (let index = 1; index < rows.length; index += 1) {
    const previous = Date.parse(rows[index - 1].created_at);
    const current = Date.parse(rows[index].created_at);

    if (!Number.isFinite(previous) || !Number.isFinite(current) || current <= previous) {
      continue;
    }

    total += current - previous;
    count += 1;
  }

  return count > 0 ? Math.round(total / count / 1000) : null;
}

function toAdminBidEntry(row: AuctionBidRow, currentBidCents: number): AuctionBidEntry {
  return {
    ...row,
    bidder_user_id: row.bidder_user_id ?? null,
    bidder_name: row.bidder_name ?? null,
    bidder_contact: row.bidder_contact ?? null,
    disqualified_at: row.disqualified_at ?? null,
    disqualified_reason: row.disqualified_reason ?? null,
    is_leading: row.amount_cents === currentBidCents && !row.disqualified_at,
    is_viewer: false,
  };
}

function normalizeTimelineEventType(value: unknown): AuctionTimelineEventType {
  const normalized = typeof value === "string" ? value.trim() : "";
  const safeValue = normalized || "bid";
  return (ALLOWED_TIMELINE_EVENT_TYPES.has(safeValue) ? safeValue : "bid") as AuctionTimelineEventType;
}

function mapAutoBidRow(row: AuctionAutoBidRow) {
  return {
    id: String(row.id),
    bidder_user_id: row.bidder_user_id ?? null,
    bidder_name: row.bidder_name ?? null,
    bidder_contact: row.bidder_contact ?? null,
    max_amount_cents: toNumber(row.max_amount_cents, 0),
    is_active: Boolean(row.is_active),
    created_at: String(row.created_at),
  };
}

function mapTimelineRow(row: AuctionTimelineRow) {
  return {
    id: String(row.id),
    type: normalizeTimelineEventType(row.event_type),
    headline: typeof row.headline === "string" ? row.headline : "",
    description: typeof row.description === "string" ? row.description : null,
    amount_cents: toNumberOrNull(row.amount_cents),
    created_at: String(row.created_at),
  };
}

export async function GET(request: NextRequest) {
  const user = await ensureAdmin();
  if (!user) return forbidden();

  const { searchParams } = new URL(request.url);
  const raffleSlug = normalizeAuctionRaffleSlug(searchParams.get("raffleSlug"));
  const slug = searchParams.get("slug")?.trim() || null;
  const supabase = createSupabaseServiceClient();

  const auctionQuery = supabase.from("auctions").select("*").eq("raffle_slug", raffleSlug);

  let auctionRow: Record<string, unknown> | null = null;
  let auctionError: { message: string } | null = null;

  if (slug) {
    const result = await auctionQuery.eq("slug", slug).maybeSingle();
    auctionRow = (result.data as Record<string, unknown> | null) ?? null;
    auctionError = result.error ? { message: result.error.message } : null;
  } else {
    const result = await auctionQuery.order("updated_at", { ascending: false }).limit(1);
    auctionRow = (result.data?.[0] as Record<string, unknown> | undefined) ?? null;
    auctionError = result.error ? { message: result.error.message } : null;
  }

  if (auctionError) {
    return serverError(auctionError.message);
  }

  const auction = mapAuctionRowToAdminConfig(auctionRow, raffleSlug);

  if (!auctionRow) {
    return NextResponse.json({
      auction,
      winner: {
        winnerName: null,
        winnerContact: null,
        winnerBidCents: null,
        winnerStatus: "pending",
        winnerContactedAt: null,
        winnerPaidAt: null,
        winnerDeliveredAt: null,
      },
      performance: {
        visitors: 0,
        participant_rate: 0,
        total_raised_cents: 0,
        average_bid_interval_seconds: null,
        auto_bid_count: 0,
        total_bids: 0,
        unique_bidders: 0,
      },
      recentBids: [],
      autoBids: [],
      timeline: [],
    } satisfies AuctionAdminPayload);
  }

  const auctionId = String(auctionRow.id);

  const [bidsResult, autoBidsResult, timelineResult, visitCountResult] = await Promise.all([
    supabase
      .from("auction_bids")
      .select(
        "id, amount_cents, bidder_user_id, bidder_name, bidder_contact, created_at, source, disqualified_at, disqualified_reason",
      )
      .eq("auction_id", auctionId)
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("auction_auto_bids")
      .select("id, bidder_user_id, bidder_name, bidder_contact, max_amount_cents, is_active, created_at")
      .eq("auction_id", auctionId)
      .order("max_amount_cents", { ascending: false })
      .limit(25),
    supabase
      .from("auction_timeline_events")
      .select("id, event_type, headline, description, amount_cents, created_at")
      .eq("auction_id", auctionId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("auction_visit_sessions")
      .select("id", { count: "exact", head: true })
      .eq("auction_id", auctionId),
  ]);

  if (bidsResult.error) {
    return serverError(bidsResult.error.message);
  }
  if (autoBidsResult.error) {
    return serverError(autoBidsResult.error.message);
  }
  if (timelineResult.error) {
    return serverError(timelineResult.error.message);
  }

  const bidRows = ((bidsResult.data ?? []) as AuctionBidRow[]).reverse();
  const autoBidRows = (autoBidsResult.data ?? []) as AuctionAutoBidRow[];
  const timelineRows = (timelineResult.data ?? []) as AuctionTimelineRow[];
  const visitors = visitCountResult.count ?? 0;
  const currentBidCents = toNumber(auctionRow.current_bid_cents, 0);
  const uniqueBidders = toNumber(auctionRow.unique_bidder_count, 0);

  return NextResponse.json({
    auction,
    winner: {
      winnerName: toStringOrNull(auctionRow.winner_name),
      winnerContact: toStringOrNull(auctionRow.winner_contact),
      winnerBidCents: toNumberOrNull(auctionRow.winner_bid_cents),
      winnerStatus: normalizeWinnerStatus(auctionRow.winner_status),
      winnerContactedAt: toStringOrNull(auctionRow.winner_contacted_at),
      winnerPaidAt: toStringOrNull(auctionRow.winner_paid_at),
      winnerDeliveredAt: toStringOrNull(auctionRow.winner_delivered_at),
    },
    performance: {
      visitors,
      participant_rate: visitors > 0 ? Number(((uniqueBidders / visitors) * 100).toFixed(1)) : 0,
      total_raised_cents: currentBidCents,
      average_bid_interval_seconds: averageBidIntervalSeconds(
        bidRows.filter((row) => !row.disqualified_at),
      ),
      auto_bid_count: autoBidRows.filter((row) => row.is_active).length,
      total_bids: toNumber(auctionRow.total_bids, 0),
      unique_bidders: uniqueBidders,
    },
    recentBids: bidRows
      .slice()
      .reverse()
      .map((row) => toAdminBidEntry(row, currentBidCents))
      .reverse(),
    autoBids: autoBidRows.map(mapAutoBidRow),
    timeline: timelineRows.map(mapTimelineRow),
  } satisfies AuctionAdminPayload);
}

export async function POST(request: NextRequest) {
  const user = await ensureAdmin();
  if (!user) return forbidden();

  const body = (await request.json()) as AuctionAdminConfig;
  const raffleSlug = normalizeAuctionRaffleSlug(body.raffleSlug);
  const slug = body.slug?.trim();

  if (!slug) {
    return badRequest("Slug do leilão é obrigatório.");
  }

  if (!body.title?.trim()) {
    return badRequest("Título do leilão é obrigatório.");
  }

  const endsAt = body.endsAt?.trim();
  if (!endsAt) {
    return badRequest("Data de encerramento obrigatória.");
  }

  const status =
    body.status === "scheduled" || body.status === "closed" || body.status === "settled"
      ? body.status
      : "open";

  const minIncrementCents = Math.max(1, Math.round(body.minIncrementCents));
  const openingBidCents = Math.max(0, Math.round(body.openingBidCents));

  const reservePriceCents =
    body.reservePriceCents === null || body.reservePriceCents === undefined
      ? null
      : Math.max(openingBidCents, Math.round(body.reservePriceCents));

  const marketValueCents =
    body.marketValueCents === null || body.marketValueCents === undefined
      ? null
      : Math.max(0, Math.round(body.marketValueCents));

  const supabase = createSupabaseServiceClient();

  const upsertPayload = {
    raffle_slug: raffleSlug,
    slug,
    lot_label: coerceOptionalText(body.lotLabel),
    title: body.title.trim(),
    subtitle: coerceOptionalText(body.subtitle),
    description: coerceOptionalText(body.description),
    highlight_badge: coerceOptionalText(body.highlightBadge),
    image_url: coerceOptionalText(body.imageUrl),
    gallery_urls: coerceStringArray(body.galleryUrls),
    feature_bullets: coerceStringArray(body.featureBullets),
    video_url: coerceOptionalText(body.videoUrl),
    condition_summary: coerceOptionalText(body.conditionSummary),
    shipping_info: coerceOptionalText(body.shippingInfo),
    pickup_info: coerceOptionalText(body.pickupInfo),
    authenticity_info: coerceOptionalText(body.authenticityInfo),
    invoice_info: coerceOptionalText(body.invoiceInfo),
    lot_story: coerceOptionalText(body.lotStory),
    condition_report: coerceOptionalText(body.conditionReport),
    authenticity_assets: coerceStringArray(body.authenticityAssets),
    appraisal_notes: coerceOptionalText(body.appraisalNotes),
    tie_break_rule:
      coerceOptionalText(body.tieBreakRule) ?? "Em empate de valor, vence o lance registrado primeiro.",
    settlement_deadline_hours: Math.max(1, Math.round(body.settlementDeadlineHours ?? 24)),
    opening_bid_cents: openingBidCents,
    min_increment_cents: minIncrementCents,
    reserve_price_cents: reservePriceCents,
    market_value_cents: marketValueCents,
    ends_at: endsAt,
    bid_extension_window_seconds: Math.max(0, Math.round(body.bidExtensionWindowSeconds ?? 120)),
    bid_extension_seconds: Math.max(0, Math.round(body.bidExtensionSeconds ?? 120)),
    status,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("auctions").upsert(upsertPayload, {
    onConflict: "raffle_slug,slug",
  });

  if (error) {
    return serverError(error.message);
  }

  return NextResponse.json({ ok: true, raffleSlug, slug });
}