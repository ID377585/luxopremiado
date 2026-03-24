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

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

async function ensureAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  const allowed = await isAdminUser(user.id, user.email);
  return allowed ? user : null;
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
    is_leading: row.amount_cents === currentBidCents && !row.disqualified_at,
    is_viewer: false,
  };
}

function normalizeTimelineEventType(value: unknown): AuctionTimelineEventType {
  const normalized = typeof value === "string" ? value.trim() : "";
  return (normalized || "bid") as AuctionTimelineEventType;
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
  let error: { message: string } | null = null;

  if (slug) {
    const result = await auctionQuery.eq("slug", slug).maybeSingle();
    auctionRow = (result.data as Record<string, unknown> | null) ?? null;
    error = result.error ? { message: result.error.message } : null;
  } else {
    const result = await auctionQuery.order("updated_at", { ascending: false }).limit(1);
    auctionRow = (result.data?.[0] as Record<string, unknown> | undefined) ?? null;
    error = result.error ? { message: result.error.message } : null;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const auction = mapAuctionRowToAdminConfig((auctionRow as Record<string, unknown> | null) ?? null, raffleSlug);

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

  const auctionId = String((auctionRow as Record<string, unknown>).id);

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

  if (bidsResult.error) return NextResponse.json({ error: bidsResult.error.message }, { status: 500 });
  if (autoBidsResult.error) return NextResponse.json({ error: autoBidsResult.error.message }, { status: 500 });
  if (timelineResult.error) return NextResponse.json({ error: timelineResult.error.message }, { status: 500 });

  const bidRows = ((bidsResult.data ?? []) as AuctionBidRow[]).reverse();
  const autoBidRows = (autoBidsResult.data ?? []) as AuctionAutoBidRow[];
  const timelineRows = (timelineResult.data ?? []) as AuctionTimelineRow[];
  const visitors = visitCountResult.count ?? 0;
  const currentBidCents = Number((auctionRow as Record<string, unknown>).current_bid_cents ?? 0);

  return NextResponse.json({
    auction,
    winner: {
      winnerName:
        typeof (auctionRow as Record<string, unknown>).winner_name === "string"
          ? ((auctionRow as Record<string, unknown>).winner_name as string)
          : null,
      winnerContact:
        typeof (auctionRow as Record<string, unknown>).winner_contact === "string"
          ? ((auctionRow as Record<string, unknown>).winner_contact as string)
          : null,
      winnerBidCents:
        (auctionRow as Record<string, unknown>).winner_bid_cents === null ||
        (auctionRow as Record<string, unknown>).winner_bid_cents === undefined
          ? null
          : Number((auctionRow as Record<string, unknown>).winner_bid_cents),
      winnerStatus:
        (auctionRow as Record<string, unknown>).winner_status === "contacted" ||
        (auctionRow as Record<string, unknown>).winner_status === "paid" ||
        (auctionRow as Record<string, unknown>).winner_status === "delivered" ||
        (auctionRow as Record<string, unknown>).winner_status === "defaulted"
          ? ((auctionRow as Record<string, unknown>).winner_status as
              | "contacted"
              | "paid"
              | "delivered"
              | "defaulted")
          : "pending",
      winnerContactedAt:
        typeof (auctionRow as Record<string, unknown>).winner_contacted_at === "string"
          ? ((auctionRow as Record<string, unknown>).winner_contacted_at as string)
          : null,
      winnerPaidAt:
        typeof (auctionRow as Record<string, unknown>).winner_paid_at === "string"
          ? ((auctionRow as Record<string, unknown>).winner_paid_at as string)
          : null,
      winnerDeliveredAt:
        typeof (auctionRow as Record<string, unknown>).winner_delivered_at === "string"
          ? ((auctionRow as Record<string, unknown>).winner_delivered_at as string)
          : null,
    },
    performance: {
      visitors,
      participant_rate:
        visitors > 0
          ? Number(
              (
                (Number((auctionRow as Record<string, unknown>).unique_bidder_count ?? 0) / visitors) *
                100
              ).toFixed(1),
            )
          : 0,
      total_raised_cents: currentBidCents,
      average_bid_interval_seconds: averageBidIntervalSeconds(
        bidRows.filter((row) => !row.disqualified_at),
      ),
      auto_bid_count: autoBidRows.filter((row) => row.is_active).length,
      total_bids: Number((auctionRow as Record<string, unknown>).total_bids ?? 0),
      unique_bidders: Number((auctionRow as Record<string, unknown>).unique_bidder_count ?? 0),
    },
    recentBids: bidRows
      .slice()
      .reverse()
      .map((row) => toAdminBidEntry(row, currentBidCents))
      .reverse(),
    autoBids: autoBidRows.map((row) => ({
      id: String(row.id),
      bidder_user_id: row.bidder_user_id ?? null,
      bidder_name: row.bidder_name ?? null,
      bidder_contact: row.bidder_contact ?? null,
      max_amount_cents:
        row.max_amount_cents === null || row.max_amount_cents === undefined
          ? 0
          : Number(row.max_amount_cents),
      is_active: Boolean(row.is_active),
      created_at: String(row.created_at),
    })),
    timeline: timelineRows.map((row) => ({
      id: String(row.id),
      type: normalizeTimelineEventType(row.event_type),
      headline: typeof row.headline === "string" ? row.headline : "",
      description: typeof row.description === "string" ? row.description : null,
      amount_cents:
        row.amount_cents === null || row.amount_cents === undefined ? null : Number(row.amount_cents),
      created_at: String(row.created_at),
    })),
  } satisfies AuctionAdminPayload);
}

export async function POST(request: NextRequest) {
  const user = await ensureAdmin();
  if (!user) return forbidden();

  const body = (await request.json()) as AuctionAdminConfig;
  const raffleSlug = normalizeAuctionRaffleSlug(body.raffleSlug);
  const slug = body.slug?.trim();

  if (!slug) {
    return NextResponse.json({ error: "Slug do leilão é obrigatório." }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Título do leilão é obrigatório." }, { status: 400 });
  }

  const endsAt = body.endsAt?.trim();
  if (!endsAt) {
    return NextResponse.json({ error: "Data de encerramento obrigatória." }, { status: 400 });
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, raffleSlug, slug });
}