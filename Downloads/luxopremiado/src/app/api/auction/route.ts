import { randomUUID } from "crypto";

import { NextRequest, NextResponse } from "next/server";

import { mapAuctionSnapshot, normalizeAuctionRaffleSlug } from "@/lib/auction";
import { enforceAntiBot } from "@/lib/security/anti-bot";
import { getSessionUser } from "@/lib/session";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  AuctionBidEntry,
  AuctionLeaderboardEntry,
  AuctionPerformanceSnapshot,
  AuctionPublicResponse,
  AuctionSnapshot,
  AuctionTimelineEvent,
  AuctionTimelineEventType,
  AuctionViewerState,
} from "@/types/auction";

interface BidRpcResult {
  ok: boolean;
  error_code?: string | null;
  error_message?: string | null;
  auction_id?: string | null;
  current_bid_cents?: number | null;
  next_min_bid_cents?: number | null;
  ends_at?: string | null;
  status?: string | null;
  reserve_met?: boolean | null;
  extended?: boolean | null;
}

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

interface AuctionProxyRow {
  id: string;
  bidder_user_id?: string | null;
  bidder_name?: string | null;
  bidder_contact?: string | null;
  max_amount_cents: number;
  is_active: boolean;
  created_at: string;
}

interface AuctionTimelineRow {
  id: string;
  event_type: AuctionTimelineEventType;
  headline: string;
  description?: string | null;
  amount_cents?: number | null;
  created_at: string;
}

function toCents(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100);
  }

  const normalized = String(value).replace(/[^0-9,.-]/g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed * 100);
}

function identityFromBid(row: Pick<AuctionBidRow, "bidder_user_id" | "bidder_contact" | "id">): string {
  return row.bidder_user_id ?? row.bidder_contact ?? `anon-${row.id}`;
}

function identityFromProxy(row: Pick<AuctionProxyRow, "bidder_user_id" | "bidder_contact" | "id">): string {
  return row.bidder_user_id ?? row.bidder_contact ?? `proxy-${row.id}`;
}

function sortAuctionRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  const priority = new Map([
    ["open", 0],
    ["scheduled", 1],
    ["settled", 2],
    ["closed", 3],
  ]);

  return [...rows].sort((left, right) => {
    const leftStatus = priority.get(String(left.status)) ?? 99;
    const rightStatus = priority.get(String(right.status)) ?? 99;
    if (leftStatus !== rightStatus) {
      return leftStatus - rightStatus;
    }

    const leftEndsAt = Date.parse(String(left.ends_at ?? ""));
    const rightEndsAt = Date.parse(String(right.ends_at ?? ""));

    if (Number.isFinite(leftEndsAt) && Number.isFinite(rightEndsAt) && leftEndsAt !== rightEndsAt) {
      return leftEndsAt - rightEndsAt;
    }

    return Date.parse(String(right.updated_at ?? "")) - Date.parse(String(left.updated_at ?? ""));
  });
}

async function getAuctionTarget(params: { raffleSlug: string; slug?: string | null }) {
  const supabase = createSupabaseServiceClient();
  await supabase.rpc("sync_auction_state", {
    p_raffle_slug: params.raffleSlug,
    p_slug: params.slug?.trim() || null,
  });

  if (params.slug?.trim()) {
    const { data, error } = await supabase
      .from("auctions")
      .select("*")
      .eq("raffle_slug", params.raffleSlug)
      .eq("slug", params.slug.trim())
      .maybeSingle();

    return { supabase, data: data ? [data] : [], error };
  }

  const { data, error } = await supabase
    .from("auctions")
    .select("*")
    .eq("raffle_slug", params.raffleSlug)
    .order("updated_at", { ascending: false })
    .limit(6);

  return { supabase, data: data ?? [], error };
}

async function getActiveAuctionRow(params: { raffleSlug: string; slug?: string | null }) {
  const supabase = createSupabaseServiceClient();

  if (params.slug?.trim()) {
    return supabase
      .from("auctions")
      .select("*")
      .eq("raffle_slug", params.raffleSlug)
      .eq("slug", params.slug.trim())
      .maybeSingle();
  }

  const { data, error } = await supabase
    .from("auctions")
    .select("*")
    .eq("raffle_slug", params.raffleSlug)
    .order("updated_at", { ascending: false })
    .limit(6);

  const row = sortAuctionRows(data ?? [])[0] ?? null;
  return { data: row, error };
}

function decorateRecentBids(
  rows: AuctionBidRow[],
  auction: AuctionSnapshot,
  viewerUserId: string | null,
  viewerEmail: string | null,
): AuctionBidEntry[] {
  return rows.map((row) => {
    const isLeading =
      (auction.leading_bidder_user_id && row.bidder_user_id === auction.leading_bidder_user_id) ||
      (!auction.leading_bidder_user_id &&
        auction.leading_bidder_contact &&
        row.bidder_contact === auction.leading_bidder_contact &&
        row.amount_cents === auction.current_bid_cents);

    const isViewer =
      (viewerUserId && row.bidder_user_id === viewerUserId) ||
      (!viewerUserId && viewerEmail && row.bidder_contact === viewerEmail);

    return {
      ...row,
      is_leading: Boolean(isLeading),
      is_viewer: Boolean(isViewer),
    };
  });
}

function buildLeaderboard(
  bids: AuctionBidRow[],
  viewerUserId: string | null,
  viewerEmail: string | null,
): AuctionLeaderboardEntry[] {
  const rankedSource = [...bids].sort((left, right) => {
    if (right.amount_cents !== left.amount_cents) {
      return right.amount_cents - left.amount_cents;
    }
    return Date.parse(left.created_at) - Date.parse(right.created_at);
  });

  const leaders = new Map<string, AuctionLeaderboardEntry>();
  const streakByIdentity = new Map<string, number>();
  let previousIdentity: string | null = null;

  for (const row of [...bids].sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at))) {
    const identity = identityFromBid(row);
    if (identity === previousIdentity) {
      streakByIdentity.set(identity, (streakByIdentity.get(identity) ?? 0) + 1);
    } else if (!streakByIdentity.has(identity)) {
      streakByIdentity.set(identity, 1);
    }
    previousIdentity = identity;
  }

  for (const row of rankedSource) {
    const identity = identityFromBid(row);
    if (leaders.has(identity)) {
      continue;
    }

    const rank = leaders.size + 1;
    leaders.set(identity, {
      bidder_user_id: row.bidder_user_id ?? null,
      bidder_name: row.bidder_name ?? null,
      bidder_contact: row.bidder_contact ?? null,
      amount_cents: row.amount_cents,
      created_at: row.created_at,
      streak_count: streakByIdentity.get(identity) ?? 1,
      rank,
      is_viewer: Boolean(
        (viewerUserId && row.bidder_user_id === viewerUserId) ||
          (!viewerUserId && viewerEmail && row.bidder_contact === viewerEmail),
      ),
    });
  }

  return [...leaders.values()];
}

function buildViewerState(params: {
  sessionUserId: string | null;
  sessionEmail: string | null;
  auction: AuctionSnapshot;
  leaderboard: AuctionLeaderboardEntry[];
  autoBidRows: AuctionProxyRow[];
}): AuctionViewerState {
  const viewerEntry = params.leaderboard.find((entry) =>
    (params.sessionUserId && entry.bidder_user_id === params.sessionUserId) ||
    (!params.sessionUserId && params.sessionEmail && entry.bidder_contact === params.sessionEmail),
  );
  const viewerRank = viewerEntry?.rank ?? null;
  const gapToLead =
    viewerEntry && params.leaderboard[0]
      ? Math.max(0, params.auction.current_bid_cents + params.auction.min_increment_cents - viewerEntry.amount_cents)
      : null;
  const rival =
    viewerRank === 1
      ? params.leaderboard[1] ?? null
      : viewerRank && viewerRank > 1
        ? params.leaderboard[viewerRank - 2] ?? params.leaderboard[0] ?? null
        : params.leaderboard[0] ?? null;
  const autoBid = params.autoBidRows.find((row) =>
    (params.sessionUserId && row.bidder_user_id === params.sessionUserId) ||
    (!params.sessionUserId && params.sessionEmail && row.bidder_contact === params.sessionEmail),
  );

  return {
    authenticated: Boolean(params.sessionUserId || params.sessionEmail),
    has_bid: Boolean(viewerEntry),
    is_leading: Boolean(
      params.sessionUserId && params.sessionUserId === params.auction.leading_bidder_user_id,
    ) || Boolean(
      !params.sessionUserId &&
        params.sessionEmail &&
        params.sessionEmail === params.auction.leading_bidder_contact,
    ),
    highest_bid_cents: viewerEntry?.amount_cents ?? null,
    rank: viewerRank,
    total_ranked_bidders: params.leaderboard.length,
    gap_to_lead_cents: gapToLead,
    rival_bidder_name: rival?.bidder_name ?? rival?.bidder_contact ?? null,
    rival_amount_cents: rival?.amount_cents ?? null,
    rival_gap_cents:
      viewerEntry && rival ? Math.max(0, rival.amount_cents - viewerEntry.amount_cents) : null,
    streak_count: viewerEntry?.streak_count ?? 0,
    outside_podium: Boolean(viewerRank && viewerRank > 3),
    auto_bid_max_cents: autoBid?.max_amount_cents ?? null,
  };
}

function buildTimeline(
  recentBids: AuctionBidEntry[],
  eventRows: AuctionTimelineRow[],
): AuctionTimelineEvent[] {
  const bidEvents = recentBids.map((bid) => ({
    id: `bid-${bid.id}`,
    type: (bid.source === "proxy" ? "proxy_bid" : "bid") as AuctionTimelineEventType,
    headline: bid.source === "proxy" ? "Auto-bid reagiu na disputa." : "Novo lance entrou no lote.",
    description: bid.bidder_name || bid.bidder_contact || "Participante",
    amount_cents: bid.amount_cents,
    created_at: bid.created_at,
    is_highlight: Boolean(bid.is_leading || bid.is_viewer),
  }));

  const events = eventRows.map((event) => ({
    id: event.id,
    type: event.event_type,
    headline: event.headline,
    description: event.description ?? null,
    amount_cents: event.amount_cents ?? null,
    created_at: event.created_at,
    is_highlight:
      event.event_type === "extension" ||
      event.event_type === "manual_close" ||
      event.event_type === "winner_update",
  }));

  return [...events, ...bidEvents]
    .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at))
    .slice(0, 12);
}

function calculateAverageBidIntervalSeconds(bids: AuctionBidRow[]): number | null {
  if (bids.length < 2) {
    return null;
  }

  let total = 0;
  let samples = 0;
  for (let index = 1; index < bids.length; index += 1) {
    const previous = Date.parse(bids[index - 1].created_at);
    const current = Date.parse(bids[index].created_at);
    if (!Number.isFinite(previous) || !Number.isFinite(current) || current <= previous) {
      continue;
    }

    total += current - previous;
    samples += 1;
  }

  return samples > 0 ? Math.round(total / samples / 1000) : null;
}

function calculateLeaderStreak(bids: AuctionBidRow[], auction: AuctionSnapshot): number {
  let streak = 0;
  for (let index = bids.length - 1; index >= 0; index -= 1) {
    const bid = bids[index];
    const isLeaderIdentity =
      (auction.leading_bidder_user_id && bid.bidder_user_id === auction.leading_bidder_user_id) ||
      (!auction.leading_bidder_user_id &&
        auction.leading_bidder_contact &&
        bid.bidder_contact === auction.leading_bidder_contact);

    if (!isLeaderIdentity) {
      break;
    }
    streak += 1;
  }
  return streak;
}

async function resolveAutoBids(params: {
  raffleSlug: string;
  slug: string | null;
}) {
  const supabase = createSupabaseServiceClient();

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const { data: auctionRow, error: auctionError } = await getActiveAuctionRow(params);

    if (auctionError || !auctionRow) {
      return;
    }

    if (auctionRow.status !== "open" || auctionRow.paused_at) {
      return;
    }

    const nextMin = Math.max(
      Number(auctionRow.current_bid_cents ?? 0) + Math.max(1, Number(auctionRow.min_increment_cents ?? 1)),
      Number(auctionRow.opening_bid_cents ?? 0),
    );

    const { data: proxyRows, error: proxyError } = await supabase
      .from("auction_auto_bids")
      .select("id, bidder_user_id, bidder_name, bidder_contact, max_amount_cents, is_active, created_at")
      .eq("auction_id", auctionRow.id)
      .eq("is_active", true)
      .order("max_amount_cents", { ascending: false })
      .order("created_at", { ascending: true });

    if (proxyError || !proxyRows?.length) {
      return;
    }

    const eligible = (proxyRows as AuctionProxyRow[]).filter((row) => {
      const isCurrentLeader =
        (auctionRow.leading_bidder_user_id && row.bidder_user_id === auctionRow.leading_bidder_user_id) ||
        (!auctionRow.leading_bidder_user_id &&
          auctionRow.leading_bidder_contact &&
          row.bidder_contact === auctionRow.leading_bidder_contact);

      return !isCurrentLeader && row.max_amount_cents >= nextMin;
    });

    if (eligible.length === 0) {
      return;
    }

    const winner = eligible[0];

    const { data, error } = await supabase.rpc("place_auction_bid", {
      p_raffle_slug: params.raffleSlug,
      p_slug: params.slug,
      p_bidder_user_id: winner.bidder_user_id ?? null,
      p_bidder_name: winner.bidder_name ?? "Auto-bid",
      p_bidder_contact: winner.bidder_contact ?? null,
      p_amount_cents: nextMin,
      p_source: "proxy",
    });

    const result = Array.isArray(data) ? ((data[0] as BidRpcResult | undefined) ?? null) : null;
    if (error || !result?.ok) {
      return;
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raffleSlug = normalizeAuctionRaffleSlug(searchParams.get("raffleSlug"));
  const slug = searchParams.get("slug")?.trim() || null;
  const sessionUser = await getSessionUser();

  const { supabase, data: auctionRows, error } = await getAuctionTarget({ raffleSlug, slug });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const auctionRow = sortAuctionRows(auctionRows)[0];
  if (!auctionRow) {
    return NextResponse.json({ error: "Leilão não encontrado." }, { status: 404 });
  }

  const auction = mapAuctionSnapshot(auctionRow);
  const visitorKey = request.cookies.get("auction_visitor")?.value ?? randomUUID();

  await supabase.rpc("register_auction_visit", {
    p_auction_id: auction.id,
    p_visitor_key: visitorKey,
    p_user_id: sessionUser?.id ?? null,
  });

  const bidsPromise = supabase
    .from("auction_bids")
    .select("id, amount_cents, bidder_user_id, bidder_name, bidder_contact, created_at, source, disqualified_at, disqualified_reason")
    .eq("auction_id", auction.id)
    .is("disqualified_at", null)
    .order("created_at", { ascending: true })
    .limit(200);

  const autoBidsPromise = supabase
    .from("auction_auto_bids")
    .select("id, bidder_user_id, bidder_name, bidder_contact, max_amount_cents, is_active, created_at")
    .eq("auction_id", auction.id)
    .eq("is_active", true)
    .order("max_amount_cents", { ascending: false })
    .limit(32);

  const timelinePromise = supabase
    .from("auction_timeline_events")
    .select("id, event_type, headline, description, amount_cents, created_at")
    .eq("auction_id", auction.id)
    .order("created_at", { ascending: false })
    .limit(12);

  const visitCountPromise = supabase
    .from("auction_visit_sessions")
    .select("id", { count: "exact", head: true })
    .eq("auction_id", auction.id);

  const [bidsResult, autoBidsResult, timelineResult, visitCountResult] = await Promise.all([
    bidsPromise,
    autoBidsPromise,
    timelinePromise,
    visitCountPromise,
  ]);

  if (bidsResult.error) {
    return NextResponse.json({ error: bidsResult.error.message }, { status: 500 });
  }

  if (autoBidsResult.error) {
    return NextResponse.json({ error: autoBidsResult.error.message }, { status: 500 });
  }

  if (timelineResult.error) {
    return NextResponse.json({ error: timelineResult.error.message }, { status: 500 });
  }

  const bids = (bidsResult.data ?? []) as AuctionBidRow[];
  const autoBidRows = (autoBidsResult.data ?? []) as AuctionProxyRow[];
  const timelineRows = (timelineResult.data ?? []) as AuctionTimelineRow[];
  const leaderboardFull = buildLeaderboard(
    bids,
    sessionUser?.id ?? null,
    sessionUser?.email ?? null,
  );
  const leaderboard = leaderboardFull.slice(0, 3);
  const recentRows = [...bids].slice(-8).reverse();
  const recentBids = decorateRecentBids(
    recentRows,
    auction,
    sessionUser?.id ?? null,
    sessionUser?.email ?? null,
  );
  const viewer = buildViewerState({
    sessionUserId: sessionUser?.id ?? null,
    sessionEmail: sessionUser?.email ?? null,
    auction,
    leaderboard: leaderboardFull,
    autoBidRows,
  });
  const reserveMet =
    auction.reserve_price_cents == null || auction.current_bid_cents >= auction.reserve_price_cents;
  const nextMinBidCents = Math.max(
    auction.current_bid_cents + Math.max(1, auction.min_increment_cents),
    auction.opening_bid_cents,
  );
  const visitors = visitCountResult.count ?? 0;
  const performance: AuctionPerformanceSnapshot = {
    visitors,
    participant_rate: visitors > 0 ? Number(((auction.unique_bidder_count / visitors) * 100).toFixed(1)) : 0,
    total_raised_cents: auction.current_bid_cents,
    average_bid_interval_seconds: calculateAverageBidIntervalSeconds(bids),
    auto_bid_count: autoBidRows.length,
  };
  const payload: AuctionPublicResponse = {
    auction,
    recentBids,
    leaderboard,
    viewer,
    stats: {
      total_bids: auction.total_bids,
      unique_bidders: auction.unique_bidder_count,
      reserve_met: reserveMet,
      next_min_bid_cents: nextMinBidCents,
      last_bid_at: auction.last_bid_at ?? null,
      leader_streak_count: calculateLeaderStreak(bids, auction),
      visitors: performance.visitors,
      participant_rate: performance.participant_rate,
      average_bid_interval_seconds: performance.average_bid_interval_seconds,
      total_raised_cents: performance.total_raised_cents,
      auto_bid_count: performance.auto_bid_count,
    },
    trust: {
      reserve_price_cents: auction.reserve_price_cents ?? null,
      reserve_met: reserveMet,
      bid_extension_window_seconds: auction.bid_extension_window_seconds,
      bid_extension_seconds: auction.bid_extension_seconds,
      tie_break_rule: auction.tie_break_rule,
      settlement_deadline_hours: auction.settlement_deadline_hours,
    },
    performance,
    timeline: buildTimeline(recentBids, timelineRows),
  };

  const response = NextResponse.json(payload);
  if (!request.cookies.get("auction_visitor")?.value) {
    response.cookies.set("auction_visitor", visitorKey, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export async function POST(request: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Faça login para dar lance." }, { status: 401 });
  }

  const body = (await request.json()) as {
    raffleSlug?: string;
    slug?: string;
    amount?: number | string;
    proxyMaxAmount?: number | string;
    botTrap?: string;
  };

  const antiBotResult = await enforceAntiBot({
    request,
    action: "auction",
    userId: sessionUser.id,
    botTrap: body.botTrap,
  });

  if (!antiBotResult.ok) {
    return NextResponse.json({ error: antiBotResult.error }, { status: antiBotResult.status });
  }

  const raffleSlug = normalizeAuctionRaffleSlug(body.raffleSlug);
  const slug = body.slug?.trim() || null;
  const amountCents = toCents(body.amount);
  const proxyMaxAmountCents = toCents(body.proxyMaxAmount);
  const supabase = createSupabaseServiceClient();

  const { data: auctionRow, error: auctionError } = await getActiveAuctionRow({ raffleSlug, slug });

  if (auctionError || !auctionRow) {
    return NextResponse.json({ error: auctionError?.message ?? "Leilão não encontrado." }, { status: 404 });
  }

  const auction = mapAuctionSnapshot(auctionRow);
  const nextMinBidCents = Math.max(
    auction.current_bid_cents + Math.max(1, auction.min_increment_cents),
    auction.opening_bid_cents,
  );

  const initialBidAmount = amountCents ?? (proxyMaxAmountCents && proxyMaxAmountCents >= nextMinBidCents ? nextMinBidCents : null);
  if (!initialBidAmount || initialBidAmount <= 0) {
    return NextResponse.json({ error: "Informe um valor de lance válido." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("place_auction_bid", {
    p_raffle_slug: raffleSlug,
    p_slug: slug,
    p_bidder_user_id: sessionUser.id,
    p_bidder_name:
      sessionUser.name?.trim() ||
      (sessionUser.email ? sessionUser.email.split("@")[0] : "Participante"),
    p_bidder_contact: sessionUser.email ?? null,
    p_amount_cents: initialBidAmount,
    p_source: "manual",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = Array.isArray(data) ? ((data[0] as BidRpcResult | undefined) ?? null) : null;
  if (!result) {
    return NextResponse.json({ error: "Não foi possível registrar o lance." }, { status: 500 });
  }

  if (!result.ok) {
    const statusByCode: Record<string, number> = {
      auction_not_found: 404,
      bid_too_low: 400,
      auction_closed: 409,
    };

    return NextResponse.json(
      {
        error: result.error_message ?? "Não foi possível registrar o lance.",
        nextMinBidCents: result.next_min_bid_cents ?? null,
      },
      { status: statusByCode[result.error_code ?? ""] ?? 400 },
    );
  }

  if (proxyMaxAmountCents && proxyMaxAmountCents >= initialBidAmount) {
    const existingAutoBidResult = await supabase
      .from("auction_auto_bids")
      .select("id")
      .eq("auction_id", auction.id)
      .eq("bidder_user_id", sessionUser.id)
      .maybeSingle();

    if (existingAutoBidResult.error) {
      return NextResponse.json({ error: existingAutoBidResult.error.message }, { status: 500 });
    }

    const proxyPayload = {
      bidder_name:
        sessionUser.name?.trim() ||
        (sessionUser.email ? sessionUser.email.split("@")[0] : "Participante"),
      bidder_contact: sessionUser.email ?? null,
      max_amount_cents: proxyMaxAmountCents,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const autoBidResult = existingAutoBidResult.data?.id
      ? await supabase
          .from("auction_auto_bids")
          .update(proxyPayload)
          .eq("id", existingAutoBidResult.data.id)
      : await supabase.from("auction_auto_bids").insert({
          auction_id: auction.id,
          bidder_user_id: sessionUser.id,
          created_at: new Date().toISOString(),
          ...proxyPayload,
        });

    if (autoBidResult.error) {
      return NextResponse.json({ error: autoBidResult.error.message }, { status: 500 });
    }
  }

  await resolveAutoBids({ raffleSlug, slug: slug ?? auction.slug });

  const { data: updatedAuction } = await supabase
    .from("auctions")
    .select("*")
    .eq("id", auction.id)
    .maybeSingle();

  const finalAuction = updatedAuction ? mapAuctionSnapshot(updatedAuction) : auction;
  const finalNextMinBid = Math.max(
    finalAuction.current_bid_cents + Math.max(1, finalAuction.min_increment_cents),
    finalAuction.opening_bid_cents,
  );

  return NextResponse.json({
    ok: true,
    currentBidCents: finalAuction.current_bid_cents,
    nextMinBidCents: finalNextMinBid,
    endsAt: finalAuction.ends_at ?? result.ends_at ?? null,
    reserveMet:
      finalAuction.reserve_price_cents == null ||
      finalAuction.current_bid_cents >= finalAuction.reserve_price_cents,
    extended: Boolean(result.extended),
    autoBidEnabled: Boolean(proxyMaxAmountCents && proxyMaxAmountCents >= initialBidAmount),
    autoBidMaxCents: proxyMaxAmountCents ?? null,
  });
}
