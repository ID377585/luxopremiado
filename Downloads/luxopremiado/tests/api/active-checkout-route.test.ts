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

import { GET } from "@/app/api/raffles/[slug]/active-checkout/route";

describe("GET /api/raffles/[slug]/active-checkout", () => {
  const mockGetUser = vi.fn();
  const mockRaffleMaybeSingle = vi.fn();
  const mockRaffleFallbackLimit = vi.fn();
  let queriedStatuses: string[] | null = null;

  beforeEach(() => {
    vi.resetAllMocks();
    queriedStatuses = null;

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
        if (table !== "raffles") {
          throw new Error(`Tabela inesperada no teste: ${table}`);
        }

        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: mockRaffleMaybeSingle,
            })),
            in: vi.fn((_: string, statuses: string[]) => {
              queriedStatuses = statuses;
              return {
                order: vi.fn(() => ({
                  limit: mockRaffleFallbackLimit,
                })),
              };
            }),
          })),
        };
      }),
    } as never);
  });

  it("consulta fallback sem incluir draft quando slug padrão não existe", async () => {
    mockRaffleMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockRaffleFallbackLimit.mockResolvedValue({ data: [], error: null });

    const request = new NextRequest("http://localhost/api/raffles/luxo-premiado/active-checkout");
    const response = await GET(request, {
      params: Promise.resolve({ slug: "luxo-premiado" }),
    });
    const payload = (await response.json()) as { success?: boolean; checkout?: unknown };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.checkout).toBeNull();
    expect(queriedStatuses).toEqual(["active", "closed", "drawn"]);
  });
});
