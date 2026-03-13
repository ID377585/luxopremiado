import { NextRequest, NextResponse } from "next/server";

import { normalizeAuctionRaffleSlug } from "@/lib/auction";
import { getSessionUser, isAdminUser } from "@/lib/session";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type AuctionAdminAction =
  | "pause"
  | "resume"
  | "close"
  | "reopen"
  | "disqualify_bid"
  | "swap_winner"
  | "mark_contacted"
  | "mark_paid"
  | "mark_delivered"
  | "mark_defaulted";

interface ActionBody {
  raffleSlug?: string;
  slug?: string;
  action?: AuctionAdminAction;
  bidId?: number;
  reason?: string;
  endsAt?: string;
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

async function logAuctionEvent(params: {
  auctionId: string;
  actorUserId: string;
  type: string;
  headline: string;
  description?: string | null;
  amountCents?: number | null;
  payload?: Record<string, unknown>;
}) {
  const supabase = createSupabaseServiceClient();
  await supabase.rpc("log_auction_event", {
    p_auction_id: params.auctionId,
    p_event_type: params.type,
    p_headline: params.headline,
    p_description: params.description ?? null,
    p_amount_cents: params.amountCents ?? null,
    p_payload: params.payload ?? {},
    p_actor_user_id: params.actorUserId,
  });
}

export async function POST(request: NextRequest) {
  const admin = await ensureAdmin();
  if (!admin) return forbidden();

  const body = (await request.json()) as ActionBody;
  const raffleSlug = normalizeAuctionRaffleSlug(body.raffleSlug);
  const slug = body.slug?.trim() || null;
  const action = body.action;

  if (!slug || !action) {
    return NextResponse.json({ error: "Leilão e ação são obrigatórios." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data: auction, error: auctionError } = await supabase
    .from("auctions")
    .select("*")
    .eq("raffle_slug", raffleSlug)
    .eq("slug", slug)
    .maybeSingle();

  if (auctionError || !auction) {
    return NextResponse.json({ error: auctionError?.message ?? "Leilão não encontrado." }, { status: 404 });
  }

  const auctionId = String(auction.id);
  const now = new Date().toISOString();

  if (action === "pause") {
    const { error } = await supabase
      .from("auctions")
      .update({
        paused_at: now,
        pause_reason: body.reason?.trim() || "Lances pausados pela moderação.",
        updated_at: now,
      })
      .eq("id", auctionId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logAuctionEvent({
      auctionId,
      actorUserId: admin.id,
      type: "pause",
      headline: "Leilão pausado pela moderação.",
      description: body.reason?.trim() || null,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "resume") {
    const { error } = await supabase
      .from("auctions")
      .update({
        paused_at: null,
        pause_reason: null,
        status: "open",
        updated_at: now,
      })
      .eq("id", auctionId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logAuctionEvent({
      auctionId,
      actorUserId: admin.id,
      type: "resume",
      headline: "Leilão reaberto para lances.",
      description: body.reason?.trim() || null,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "disqualify_bid") {
    if (!body.bidId) {
      return NextResponse.json({ error: "Selecione o lance que será desclassificado." }, { status: 400 });
    }

    const { data: bid, error: bidError } = await supabase
      .from("auction_bids")
      .select("id, amount_cents, bidder_name, bidder_contact")
      .eq("auction_id", auctionId)
      .eq("id", body.bidId)
      .maybeSingle();

    if (bidError || !bid) {
      return NextResponse.json({ error: bidError?.message ?? "Lance não encontrado." }, { status: 404 });
    }

    const { error } = await supabase
      .from("auction_bids")
      .update({
        disqualified_at: now,
        disqualified_reason: body.reason?.trim() || "Desclassificado pela moderação.",
        disqualified_by_user_id: admin.id,
      })
      .eq("id", body.bidId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.rpc("recalculate_auction_snapshot", {
      p_auction_id: auctionId,
    });

    await logAuctionEvent({
      auctionId,
      actorUserId: admin.id,
      type: "disqualification",
      headline: "Lance removido da disputa.",
      description: body.reason?.trim() || "Lance desclassificado pela moderação.",
      amountCents: Number(bid.amount_cents ?? 0),
    });

    return NextResponse.json({ ok: true });
  }

  if (action === "close") {
    const { data: topBid } = await supabase
      .from("auction_bids")
      .select("bidder_user_id, bidder_name, bidder_contact, amount_cents")
      .eq("auction_id", auctionId)
      .is("disqualified_at", null)
      .order("amount_cents", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const updatePayload = topBid
      ? {
          status: "settled",
          finalized_at: now,
          winner_user_id: topBid.bidder_user_id ?? null,
          winner_name: topBid.bidder_name ?? null,
          winner_contact: topBid.bidder_contact ?? null,
          winner_bid_cents: topBid.amount_cents ?? null,
          winner_status: "pending",
          paused_at: null,
          pause_reason: null,
          updated_at: now,
        }
      : {
          status: "closed",
          finalized_at: now,
          paused_at: null,
          pause_reason: null,
          updated_at: now,
        };

    const { error } = await supabase.from("auctions").update(updatePayload).eq("id", auctionId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAuctionEvent({
      auctionId,
      actorUserId: admin.id,
      type: "manual_close",
      headline: topBid ? "Leilão encerrado com vencedor definido." : "Leilão encerrado sem vencedor.",
      amountCents: topBid?.amount_cents ?? null,
    });

    return NextResponse.json({ ok: true });
  }

  if (action === "reopen") {
    const endsAt =
      body.endsAt?.trim() ||
      new Date(Math.max(Date.parse(String(auction.ends_at ?? now)), Date.now()) + 2 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from("auctions")
      .update({
        status: "open",
        ends_at: endsAt,
        finalized_at: null,
        winner_user_id: null,
        winner_name: null,
        winner_contact: null,
        winner_bid_cents: null,
        winner_status: "pending",
        winner_contacted_at: null,
        winner_paid_at: null,
        winner_delivered_at: null,
        paused_at: null,
        pause_reason: null,
        updated_at: now,
      })
      .eq("id", auctionId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAuctionEvent({
      auctionId,
      actorUserId: admin.id,
      type: "reopen",
      headline: "Leilão reaberto pela moderação.",
      description: `Novo encerramento programado para ${endsAt}.`,
    });

    return NextResponse.json({ ok: true });
  }

  if (action === "swap_winner") {
    if (!body.bidId) {
      return NextResponse.json({ error: "Selecione o lance que será promovido a vencedor." }, { status: 400 });
    }

    const { data: bid, error: bidError } = await supabase
      .from("auction_bids")
      .select("bidder_user_id, bidder_name, bidder_contact, amount_cents, disqualified_at")
      .eq("auction_id", auctionId)
      .eq("id", body.bidId)
      .maybeSingle();

    if (bidError || !bid) {
      return NextResponse.json({ error: bidError?.message ?? "Lance não encontrado." }, { status: 404 });
    }

    if (bid.disqualified_at) {
      return NextResponse.json({ error: "Esse lance está desclassificado e não pode virar vencedor." }, { status: 400 });
    }

    const { error } = await supabase
      .from("auctions")
      .update({
        status: "settled",
        finalized_at: now,
        winner_user_id: bid.bidder_user_id ?? null,
        winner_name: bid.bidder_name ?? null,
        winner_contact: bid.bidder_contact ?? null,
        winner_bid_cents: bid.amount_cents ?? null,
        winner_status: "pending",
        winner_contacted_at: null,
        winner_paid_at: null,
        winner_delivered_at: null,
        updated_at: now,
      })
      .eq("id", auctionId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAuctionEvent({
      auctionId,
      actorUserId: admin.id,
      type: "winner_update",
      headline: "Vencedor do lote foi atualizado manualmente.",
      amountCents: bid.amount_cents ?? null,
    });

    return NextResponse.json({ ok: true });
  }

  const winnerStatusPayload =
    action === "mark_contacted"
      ? {
          winner_status: "contacted",
          winner_contacted_at: now,
          updated_at: now,
        }
      : action === "mark_paid"
        ? {
            winner_status: "paid",
            winner_paid_at: now,
            updated_at: now,
          }
        : action === "mark_delivered"
          ? {
              winner_status: "delivered",
              winner_delivered_at: now,
              updated_at: now,
            }
          : action === "mark_defaulted"
            ? {
                winner_status: "defaulted",
                updated_at: now,
              }
            : null;

  if (!winnerStatusPayload) {
    return NextResponse.json({ error: "Ação administrativa inválida." }, { status: 400 });
  }

  const { error } = await supabase.from("auctions").update(winnerStatusPayload).eq("id", auctionId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAuctionEvent({
    auctionId,
    actorUserId: admin.id,
    type: "winner_update",
    headline:
      action === "mark_contacted"
        ? "Vencedor contatado."
        : action === "mark_paid"
          ? "Pagamento do arremate confirmado."
          : action === "mark_delivered"
            ? "Lote entregue ao vencedor."
            : "Vencedor marcado como inadimplente.",
    description: body.reason?.trim() || null,
  });

  return NextResponse.json({ ok: true });
}
