import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  hasSupabaseEnv: () => true,
}));

vi.mock("@/lib/observability", () => ({
  getRequestId: () => "req-payment-test",
  logStructured: vi.fn(),
  persistPlatformEvent: vi.fn(async () => undefined),
}));

vi.mock("@/lib/security/anti-bot", () => ({
  enforceAntiBot: vi.fn(),
}));

vi.mock("@/lib/payments/providers", () => ({
  createPaymentProvider: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/service", () => ({
  createSupabaseServiceClient: vi.fn(),
}));

import { createPaymentProvider } from "@/lib/payments/providers";
import { enforceAntiBot } from "@/lib/security/anti-bot";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

import { POST } from "@/app/api/payments/create/route";

describe("POST /api/payments/create", () => {
  const mockAuthGetUser = vi.fn();
  const mockOrderMaybeSingle = vi.fn();
  const mockProfileMaybeSingle = vi.fn();
  const mockOpenPaymentsLimit = vi.fn();
  const mockCloseOpenPayments = vi.fn();
  const mockInsertPayment = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(enforceAntiBot).mockResolvedValue({
      ok: true,
      status: 200,
    });

    mockAuthGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
    });

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        getUser: mockAuthGetUser,
      },
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

        if (table === "profiles") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: mockProfileMaybeSingle,
              })),
            })),
          };
        }

        throw new Error(`Tabela inesperada no teste: ${table}`);
      }),
    } as never);

    vi.mocked(createSupabaseServiceClient).mockReturnValue({
      from: vi.fn((table: string) => {
        if (table !== "payments") {
          throw new Error(`Tabela inesperada no teste: ${table}`);
        }

        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                in: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: mockOpenPaymentsLimit,
                  })),
                })),
              })),
            })),
          })),
          update: vi.fn(() => ({
            in: vi.fn(() => ({
              in: mockCloseOpenPayments,
            })),
          })),
          insert: mockInsertPayment,
        };
      }),
    } as never);

    mockProfileMaybeSingle.mockResolvedValue({
      data: { name: "User Test", phone: null },
      error: null,
    });

    mockInsertPayment.mockResolvedValue({ error: null });
  });

  it("reusa cobrança pendente quando o método é o mesmo", async () => {
    mockOrderMaybeSingle.mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        user_id: "user-1",
        raffle_id: "raffle-1",
        amount_cents: 1990,
        status: "pending",
        expires_at: new Date(Date.now() + 300_000).toISOString(),
      },
      error: null,
    });

    mockOpenPaymentsLimit.mockResolvedValue({
      data: [
        {
          id: "pay-open-1",
          provider_reference: "ref-1",
          status: "pending",
          pix_qr_code: null,
          pix_copy_paste: "pix-code",
          raw: { method: "pix" },
        },
      ],
      error: null,
    });

    const request = new NextRequest("http://localhost/api/payments/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderId: "11111111-1111-4111-8111-111111111111",
        provider: "mercadopago",
        method: "pix",
        botTrap: "",
      }),
    });

    const response = await POST(request);
    const payload = (await response.json()) as { success?: boolean; reused?: boolean };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.reused).toBe(true);
    expect(createPaymentProvider).not.toHaveBeenCalled();
    expect(mockCloseOpenPayments).not.toHaveBeenCalled();
  });

  it("fecha cobrança antiga quando método mudou e cria nova cobrança", async () => {
    mockOrderMaybeSingle.mockResolvedValue({
      data: {
        id: "22222222-2222-4222-8222-222222222222",
        user_id: "user-1",
        raffle_id: "raffle-2",
        amount_cents: 3980,
        status: "pending",
        expires_at: new Date(Date.now() + 300_000).toISOString(),
      },
      error: null,
    });

    mockOpenPaymentsLimit.mockResolvedValue({
      data: [
        {
          id: "pay-open-2",
          provider_reference: "ref-card",
          status: "pending",
          pix_qr_code: null,
          pix_copy_paste: null,
          raw: { method: "card" },
        },
      ],
      error: null,
    });

    mockCloseOpenPayments.mockResolvedValue({ error: null });
    vi.mocked(createPaymentProvider).mockResolvedValue({
      providerReference: "new-ref-pix",
      status: "pending",
      pixCopyPaste: "pix-copia-cola",
      raw: { provider: "mercadopago", method: "pix" },
    });

    const request = new NextRequest("http://localhost/api/payments/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderId: "22222222-2222-4222-8222-222222222222",
        provider: "mercadopago",
        method: "pix",
        botTrap: "",
      }),
    });

    const response = await POST(request);
    const payload = (await response.json()) as {
      success?: boolean;
      payment?: { providerReference?: string };
    };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.payment?.providerReference).toBe("new-ref-pix");
    expect(mockCloseOpenPayments).toHaveBeenCalled();
    expect(createPaymentProvider).toHaveBeenCalled();
  });
});
