import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/security/anti-bot", () => ({
  enforceAntiBot: vi.fn(),
}));

vi.mock("@/lib/supabase/service", () => ({
  createSupabaseServiceClient: vi.fn(),
}));

import { enforceAntiBot } from "@/lib/security/anti-bot";
import { getSessionUser } from "@/lib/session";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

import { GET, POST } from "@/app/api/auction/route";

describe("/api/auction", () => {
  const mockRpc = vi.fn();
  const mockAuctionMaybeSingle = vi.fn();
  const mockAuctionLimit = vi.fn();
  const mockRecentBidsLimit = vi.fn();
  const mockLeaderboardLimit = vi.fn();
  const mockViewerHighestMaybeSingle = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(getSessionUser).mockResolvedValue({
      id: "user-1",
      email: "lider@example.com",
      name: "Lider",
    });

    vi.mocked(enforceAntiBot).mockResolvedValue({
      ok: true,
      status: 200,
    });

    vi.mocked(createSupabaseServiceClient).mockReturnValue({
      rpc: mockRpc,
      from: vi.fn((table: string) => {
        if (table === "auctions") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: mockAuctionMaybeSingle,
                })),
                order: vi.fn(() => ({
                  limit: mockAuctionLimit,
                })),
              })),
            })),
          };
        }

        if (table === "auction_bids") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn((field: string) => {
                  if (field === "created_at") {
                    return {
                      limit: mockRecentBidsLimit,
                    };
                  }

                  return {
                    order: vi.fn(() => ({
                      limit: mockLeaderboardLimit,
                    })),
                  };
                }),
                eq: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn(() => ({
                      maybeSingle: mockViewerHighestMaybeSingle,
                    })),
                  })),
                })),
              })),
            })),
          };
        }

        throw new Error(`Tabela inesperada no teste: ${table}`);
      }),
    } as never);

    mockRpc.mockResolvedValue({ data: [], error: null });
  });

  it("retorna payload público do leilão com viewer e ranking", async () => {
    mockAuctionLimit.mockResolvedValue({
      data: [
        {
          id: "auction-1",
          raffle_slug: "luxo-premiado",
          slug: "leilao-principal",
          title: "PS5 Edição Especial",
          description: "Leilão de teste",
          image_url: "https://example.com/ps5.jpg",
          gallery_urls: ["https://example.com/ps5-2.jpg"],
          feature_bullets: ["Lacrado", "Entrega nacional"],
          opening_bid_cents: 10000,
          current_bid_cents: 15500,
          min_increment_cents: 500,
          reserve_price_cents: 15000,
          market_value_cents: 350000,
          bid_extension_window_seconds: 120,
          bid_extension_seconds: 120,
          total_bids: 4,
          unique_bidder_count: 2,
          last_bid_at: "2026-03-12T12:00:00.000Z",
          ends_at: "2099-03-12T13:00:00.000Z",
          status: "open",
          leading_bidder_user_id: "user-1",
          leading_bidder_name: "Lider",
          leading_bidder_contact: "lider@example.com",
          winner_user_id: null,
          winner_name: null,
          winner_contact: null,
          winner_bid_cents: null,
          finalized_at: null,
          lot_label: "Lote #1",
          subtitle: "Ao vivo",
          highlight_badge: "Premium",
          video_url: null,
          condition_summary: "Novo",
          shipping_info: "Envia",
          pickup_info: "Retira",
          authenticity_info: "NF",
          invoice_info: "NF emitida",
          updated_at: "2026-03-12T12:00:00.000Z",
        },
      ],
      error: null,
    });

    mockRecentBidsLimit.mockResolvedValue({
      data: [
        {
          id: 10,
          amount_cents: 15500,
          bidder_user_id: "user-1",
          bidder_name: "Lider",
          bidder_contact: "lider@example.com",
          created_at: "2026-03-12T12:00:00.000Z",
        },
      ],
      error: null,
    });

    mockLeaderboardLimit.mockResolvedValue({
      data: [
        {
          id: 10,
          amount_cents: 15500,
          bidder_user_id: "user-1",
          bidder_name: "Lider",
          bidder_contact: "lider@example.com",
          created_at: "2026-03-12T12:00:00.000Z",
        },
        {
          id: 9,
          amount_cents: 15000,
          bidder_user_id: "user-2",
          bidder_name: "Vice",
          bidder_contact: "vice@example.com",
          created_at: "2026-03-12T11:59:00.000Z",
        },
      ],
      error: null,
    });

    mockViewerHighestMaybeSingle.mockResolvedValue({
      data: { amount_cents: 15500 },
      error: null,
    });

    const response = await GET(new NextRequest("http://localhost/api/auction?raffleSlug=luxo-premiado"));
    const payload = (await response.json()) as {
      auction: { title: string };
      viewer: { authenticated: boolean; is_leading: boolean; highest_bid_cents: number | null };
      stats: { reserve_met: boolean; next_min_bid_cents: number };
      leaderboard: Array<{ amount_cents: number }>;
    };

    expect(response.status).toBe(200);
    expect(payload.auction.title).toBe("PS5 Edição Especial");
    expect(payload.viewer.authenticated).toBe(true);
    expect(payload.viewer.is_leading).toBe(true);
    expect(payload.viewer.highest_bid_cents).toBe(15500);
    expect(payload.stats.reserve_met).toBe(true);
    expect(payload.stats.next_min_bid_cents).toBe(16000);
    expect(payload.leaderboard).toHaveLength(2);
  });

  it("bloqueia POST quando anti-bot reprova", async () => {
    vi.mocked(enforceAntiBot).mockResolvedValue({
      ok: false,
      status: 429,
      error: "Muitas tentativas. Aguarde e tente novamente.",
    });

    const request = new NextRequest("http://localhost/api/auction", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        raffleSlug: "luxo-premiado",
        slug: "leilao-principal",
        amount: 199,
        botTrap: "",
      }),
    });

    const response = await POST(request);
    const payload = (await response.json()) as { error?: string };

    expect(response.status).toBe(429);
    expect(payload.error).toContain("Muitas tentativas");
    expect(mockRpc).not.toHaveBeenCalledWith("place_auction_bid", expect.anything());
  });

  it("registra lance via RPC e devolve novo mínimo", async () => {
    mockRpc.mockResolvedValueOnce({
      data: [
        {
          ok: true,
          current_bid_cents: 20000,
          next_min_bid_cents: 20500,
          ends_at: "2099-03-12T13:10:00.000Z",
          reserve_met: true,
          extended: true,
        },
      ],
      error: null,
    });

    const request = new NextRequest("http://localhost/api/auction", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        raffleSlug: "luxo-premiado",
        slug: "leilao-principal",
        amount: 200,
        botTrap: "",
      }),
    });

    const response = await POST(request);
    const payload = (await response.json()) as { ok?: boolean; nextMinBidCents?: number; extended?: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.nextMinBidCents).toBe(20500);
    expect(payload.extended).toBe(true);
    expect(mockRpc).toHaveBeenLastCalledWith("place_auction_bid", expect.objectContaining({
      p_raffle_slug: "luxo-premiado",
      p_slug: "leilao-principal",
      p_bidder_user_id: "user-1",
      p_amount_cents: 20000,
    }));
  });
});
