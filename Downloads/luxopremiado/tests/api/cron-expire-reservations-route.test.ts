import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/observability", () => ({
  emitAlert: vi.fn(async () => undefined),
  getRequestId: () => "req-cron-test",
  logStructured: vi.fn(),
  persistPlatformEvent: vi.fn(async () => undefined),
}));

vi.mock("@/lib/supabase/service", () => ({
  createSupabaseServiceClient: vi.fn(),
}));

import { createSupabaseServiceClient } from "@/lib/supabase/service";

import { POST } from "@/app/api/cron/expire-reservations/route";

describe("POST /api/cron/expire-reservations", () => {
  const mockRpc = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    process.env.CRON_SECRET = "secret-123";

    vi.mocked(createSupabaseServiceClient).mockReturnValue({
      rpc: mockRpc,
    } as never);
  });

  it("aceita Authorization Bearer e executa expiração", async () => {
    mockRpc.mockResolvedValue({
      data: 7,
      error: null,
    });

    const request = new NextRequest("http://localhost/api/cron/expire-reservations", {
      method: "POST",
      headers: {
        authorization: "Bearer secret-123",
      },
    });

    const response = await POST(request);
    const payload = (await response.json()) as { success?: boolean; released?: number };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.released).toBe(7);
    expect(mockRpc).toHaveBeenCalledWith("expire_reservations");
  });
});
