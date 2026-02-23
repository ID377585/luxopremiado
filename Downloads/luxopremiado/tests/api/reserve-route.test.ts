import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  hasSupabaseEnv: () => true,
}));

vi.mock("@/lib/observability", () => ({
  getRequestId: () => "req-test",
  logStructured: vi.fn(),
  persistPlatformEvent: vi.fn(async () => undefined),
}));

vi.mock("@/lib/security/anti-bot", () => ({
  enforceAntiBot: vi.fn(),
}));

vi.mock("@/lib/affiliates", () => ({
  attachAffiliateToOrder: vi.fn(async () => true),
  getAffiliateCodeFromRequest: vi.fn(() => null),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

import { attachAffiliateToOrder } from "@/lib/affiliates";
import { enforceAntiBot } from "@/lib/security/anti-bot";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { POST } from "@/app/api/raffles/[slug]/reserve/route";

describe("POST /api/raffles/[slug]/reserve", () => {
  const mockGetUser = vi.fn();
  const mockRpc = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        getUser: mockGetUser,
      },
      rpc: mockRpc,
    } as never);

    vi.mocked(enforceAntiBot).mockResolvedValue({
      ok: true,
      status: 200,
    });

    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("retorna erro de concorrência quando os números já foram reservados", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "one or more numbers not available" },
    });

    const request = new NextRequest("http://localhost/api/raffles/luxo-premiado/reserve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ qty: 2, botTrap: "" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ slug: "luxo-premiado" }),
    });

    const payload = (await response.json()) as { error?: string };

    expect(response.status).toBe(400);
    expect(payload.error).toBe("one or more numbers not available");
  });

  it("retorna erro quando limite por usuário é excedido", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "purchase limit exceeded for this raffle" },
    });

    const request = new NextRequest("http://localhost/api/raffles/luxo-premiado/reserve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ numbers: [1, 2, 3], botTrap: "" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ slug: "luxo-premiado" }),
    });

    const payload = (await response.json()) as { error?: string };

    expect(response.status).toBe(400);
    expect(payload.error).toBe("purchase limit exceeded for this raffle");
  });

  it("retorna reserva normalizada e anexa afiliado ao pedido", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          order_id: "order-1",
          raffle_id: "raffle-1",
          reserved_numbers: [7, 8],
          amount_cents: 3980,
          expires_at: "2026-02-23T23:00:00.000Z",
        },
      ],
      error: null,
    });

    const request = new NextRequest("http://localhost/api/raffles/luxo-premiado/reserve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ numbers: [7, 8], affiliateCode: "afiliado1", botTrap: "" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ slug: "luxo-premiado" }),
    });

    const payload = (await response.json()) as {
      success?: boolean;
      reservation?: {
        orderId: string;
        reservedNumbers: number[];
      } | null;
    };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.reservation?.orderId).toBe("order-1");
    expect(payload.reservation?.reservedNumbers).toEqual([7, 8]);
    expect(attachAffiliateToOrder).toHaveBeenCalledWith("order-1", "afiliado1");
  });
});
