import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  hasSupabaseEnv: () => true,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/service", () => ({
  createSupabaseServiceClient: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

import { GET } from "@/app/api/orders/[id]/status/route";

describe("GET /api/orders/[id]/status", () => {
  const mockGetUser = vi.fn();
  const mockOrderMaybeSingle = vi.fn();
  const mockPaymentsLimit = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    mockGetUser.mockResolvedValue({
      data: {
        user: { id: "user-1" },
      },
    });

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        getUser: mockGetUser,
      },
    } as never);

    vi.mocked(createSupabaseServiceClient).mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "orders") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: mockOrderMaybeSingle,
                })),
              })),
            })),
          };
        }

        if (table === "payments") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: mockPaymentsLimit,
                })),
              })),
            })),
          };
        }

        throw new Error(`Tabela inesperada no teste: ${table}`);
      }),
    } as never);
  });

  it("retorna pedido e último pagamento", async () => {
    mockOrderMaybeSingle.mockResolvedValue({
      data: {
        id: "order-1",
        status: "pending",
        amount_cents: 1990,
        expires_at: "2026-02-26T23:00:00.000Z",
        created_at: "2026-02-26T22:30:00.000Z",
      },
      error: null,
    });

    mockPaymentsLimit.mockResolvedValue({
      data: [
        {
          id: "pay-1",
          provider: "mercadopago",
          status: "pending",
          provider_reference: "ref-1",
        },
      ],
      error: null,
    });

    const request = new NextRequest("http://localhost/api/orders/order-1/status", {
      method: "GET",
    });

    const response = await GET(request, {
      params: Promise.resolve({ id: "order-1" }),
    });

    const payload = (await response.json()) as {
      success?: boolean;
      order?: { id?: string };
      latestPayment?: { id?: string } | null;
    };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.order?.id).toBe("order-1");
    expect(payload.latestPayment?.id).toBe("pay-1");
  });
});
