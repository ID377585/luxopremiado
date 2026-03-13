import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  getSiteUrl: () => "https://luxopremiado.vercel.app",
  hasSupabaseEnv: () => true,
}));

vi.mock("@/lib/raffle-slug.server", () => ({
  resolveAvailableRaffleSlug: vi.fn(async () => "luxo-premiado"),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { POST as enrollAffiliate } from "@/app/api/affiliates/enroll/route";
import { GET as getMyAffiliate } from "@/app/api/affiliates/me/route";

describe("Affiliates API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("retorna 400 no enroll com payload inválido", async () => {
    const request = new NextRequest("http://localhost/api/affiliates/enroll", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        preferredCode: "!",
      }),
    });

    const response = await enrollAffiliate(request);
    const payload = (await response.json()) as { error?: string };

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Payload inválido");
  });

  it("retorna 401 em /me quando não autenticado", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: null },
        })),
      },
    } as never);

    const response = await getMyAffiliate();
    const payload = (await response.json()) as { error?: string };

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Unauthorized");
  });
});
