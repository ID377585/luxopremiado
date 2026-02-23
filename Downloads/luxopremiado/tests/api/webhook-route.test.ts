import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/observability", () => ({
  emitAlert: vi.fn(async () => undefined),
  getRequestId: () => "req-webhook-test",
  logStructured: vi.fn(),
  persistPlatformEvent: vi.fn(async () => undefined),
}));

vi.mock("@/lib/payments/providers", () => ({
  verifyAndParseWebhook: vi.fn(),
}));

vi.mock("@/lib/supabase/service", () => ({
  createSupabaseServiceClient: vi.fn(),
}));

import { verifyAndParseWebhook } from "@/lib/payments/providers";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

import { POST } from "@/app/api/webhooks/[provider]/route";

describe("POST /api/webhooks/[provider]", () => {
  const mockOrdersMaybeSingle = vi.fn();
  const mockPaymentsInsert = vi.fn();
  const mockRpc = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(createSupabaseServiceClient).mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "orders") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: mockOrdersMaybeSingle,
              })),
            })),
          };
        }

        if (table === "payments") {
          return {
            insert: mockPaymentsInsert,
          };
        }

        throw new Error(`Tabela inesperada no teste: ${table}`);
      }),
      rpc: mockRpc,
    } as never);
  });

  it("não reprocesa pedido já pago (idempotência)", async () => {
    vi.mocked(verifyAndParseWebhook).mockResolvedValue({
      providerReference: "evt_1",
      orderId: "order-1",
      paid: true,
      raw: { test: true },
    });

    mockOrdersMaybeSingle.mockResolvedValue({
      data: {
        id: "order-1",
        status: "paid",
      },
      error: null,
    });

    const request = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({ id: "evt_1" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ provider: "stripe" }),
    });

    const payload = (await response.json()) as { success?: boolean; alreadyProcessed?: boolean };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.alreadyProcessed).toBe(true);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("marca pedido pendente como pago quando webhook indica pagamento confirmado", async () => {
    vi.mocked(verifyAndParseWebhook).mockResolvedValue({
      providerReference: "evt_2",
      orderId: "order-2",
      paid: true,
      raw: { test: true },
    });

    mockOrdersMaybeSingle.mockResolvedValue({
      data: {
        id: "order-2",
        status: "pending",
      },
      error: null,
    });

    mockRpc.mockResolvedValue({ error: null });

    const request = new NextRequest("http://localhost/api/webhooks/mercadopago", {
      method: "POST",
      body: JSON.stringify({ id: "evt_2" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ provider: "mercadopago" }),
    });

    const payload = (await response.json()) as { success?: boolean; paid?: boolean };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.paid).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith("mark_order_paid", {
      p_order_id: "order-2",
      p_provider: "mercadopago",
      p_provider_reference: "evt_2",
      p_raw: { test: true },
    });
  });
});
