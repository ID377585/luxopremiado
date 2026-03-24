import type { SupabaseClient } from "@supabase/supabase-js";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type AuctionStatus = "scheduled" | "active" | "ended" | "canceled";

export interface Auction {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  initialPriceCents: number;
  currentBidCents: number;
  minIncrementCents: number;
  endsAt: string;
  status: AuctionStatus;
  winnerUserId: string | null;
}

export interface AuctionBid {
  id: string;
  auctionId: string;
  userId: string;
  amountCents: number;
  createdAt: string;
}

export class AuctionError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "INVALID_BID" | "UNAVAILABLE",
    message: string,
  ) {
    super(message);
    this.name = "AuctionError";
  }
}

function mapAuction(row: Record<string, unknown>): Auction {
  return {
    id: String(row.id),
    title: String(row.title ?? "Leilão"),
    description: typeof row.description === "string" ? row.description : null,
    imageUrl: typeof row.image_url === "string" ? row.image_url : null,
    initialPriceCents: Number(row.initial_price_cents ?? 0),
    currentBidCents: Number(row.current_bid_cents ?? 0),
    minIncrementCents: Number(row.min_increment_cents ?? 100),
    endsAt: String(row.ends_at),
    status: (row.status as AuctionStatus) ?? "scheduled",
    winnerUserId: typeof row.winner_user_id === "string" ? row.winner_user_id : null,
  };
}

function mapBid(row: Record<string, unknown>): AuctionBid {
  return {
    id: String(row.id),
    auctionId: String(row.auction_id),
    userId: String(row.user_id),
    amountCents: Number(row.amount_cents ?? 0),
    createdAt: String(row.created_at),
  };
}

async function getClient(): Promise<SupabaseClient> {
  if (!hasSupabaseEnv()) {
    throw new AuctionError("UNAVAILABLE", "Supabase não configurado.");
  }

  try {
    return await createSupabaseServerClient();
  } catch {
    return createSupabaseServiceClient();
  }
}

export async function listActiveAuctions(): Promise<Auction[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const client = await getClient();

  const { data, error } = await client
    .from("auctions")
    .select("*")
    .eq("status", "active")
    .order("ends_at", { ascending: true })
    .limit(20);

  if (error || !data) {
    return [];
  }

  return data.map(mapAuction);
}

export async function getAuctionById(id: string): Promise<Auction> {
  const client = await getClient();

  const { data, error } = await client
    .from("auctions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    throw new AuctionError("NOT_FOUND", "Leilão não encontrado.");
  }

  return mapAuction(data);
}

export async function listAuctionBids(auctionId: string): Promise<AuctionBid[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const client = await getClient();

  const { data, error } = await client
    .from("auction_bids")
    .select("*")
    .eq("auction_id", auctionId)
    .order("amount_cents", { ascending: false })
    .limit(50);

  if (error || !data) {
    return [];
  }

  return data.map(mapBid);
}

export async function placeBid(params: {
  auctionId: string;
  userId: string;
  amountCents: number;
}): Promise<AuctionBid> {
  const client = await getClient();

  const auction = await getAuctionById(params.auctionId);

  if (auction.status !== "active") {
    throw new AuctionError("INVALID_BID", "Leilão não está ativo.");
  }

  const minRequired =
    Math.max(auction.currentBidCents, auction.initialPriceCents) +
    auction.minIncrementCents;

  if (params.amountCents < minRequired) {
    throw new AuctionError(
      "INVALID_BID",
      `O lance mínimo é ${(minRequired / 100).toFixed(2)}.`,
    );
  }

  const { data, error } = await client
    .from("auction_bids")
    .insert({
      auction_id: params.auctionId,
      user_id: params.userId,
      amount_cents: params.amountCents,
    })
    .select("*")
    .maybeSingle();

  if (error || !data) {
    throw new AuctionError("UNAVAILABLE", "Erro ao registrar lance.");
  }

  // Atualiza o valor atual do leilão
  await client
    .from("auctions")
    .update({
      current_bid_cents: params.amountCents,
    })
    .eq("id", params.auctionId);

  return mapBid(data);
}