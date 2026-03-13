import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  canUseDemoFallback: () => false,
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

import { GET } from "@/app/api/raffles/[slug]/numbers/route";

describe("GET /api/raffles/[slug]/numbers", () => {
  const mockRaffleMaybeSingle = vi.fn();
  const mockNumbersRange = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "raffles") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: mockRaffleMaybeSingle,
              })),
            })),
          };
        }

        if (table === "v_raffle_numbers_public") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                gte: vi.fn(() => ({
                  lte: vi.fn(() => ({
                    order: vi.fn(() => ({
                      range: mockNumbersRange,
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

    vi.mocked(createSupabaseServiceClient).mockReturnValue({
      from: vi.fn(() => {
        throw new Error("Service client não deveria ser usado neste cenário.");
      }),
    } as never);
  });

  it("não retorna stats quando paginação > 1 e includeStats não é solicitado", async () => {
    mockRaffleMaybeSingle.mockResolvedValue({
      data: {
        id: "raffle-1",
        slug: "luxo-premiado",
        status: "active",
        total_numbers: 10000,
      },
      error: null,
    });

    mockNumbersRange.mockResolvedValue({
      data: [
        { number: 201, status: "available" },
        { number: 202, status: "sold" },
      ],
      error: null,
    });

    const request = new NextRequest("http://localhost/api/raffles/luxo-premiado/numbers?page=2&pageSize=200");
    const response = await GET(request, {
      params: Promise.resolve({ slug: "luxo-premiado" }),
    });
    const payload = (await response.json()) as {
      success?: boolean;
      page?: number;
      stats?: unknown;
      numbers?: Array<{ number: number; status: string }>;
    };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.page).toBe(2);
    expect(payload.stats).toBeUndefined();
    expect(payload.numbers).toEqual([
      { number: 201, status: "available" },
      { number: 202, status: "sold" },
    ]);
  });
});
