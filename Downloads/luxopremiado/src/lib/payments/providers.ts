import { randomUUID } from "node:crypto";

export interface PaymentProviderInput {
  provider: "asaas" | "mercadopago" | "pagarme" | "stripe" | "manual";
  method: "pix" | "card";
  order: {
    id: string;
    amount_cents: number;
    user_id: string;
  };
}

export interface PaymentProviderResult {
  providerReference: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  checkoutUrl?: string;
  status: "pending" | "initiated";
  raw: Record<string, unknown>;
}

export async function createPaymentProvider(
  input: PaymentProviderInput,
): Promise<PaymentProviderResult> {
  const providerReference = `${input.provider.toUpperCase()}_${randomUUID()}`;

  if (input.method === "pix") {
    return {
      providerReference,
      pixQrCode: "data:image/svg+xml;base64,PHN2Zy8+",
      pixCopyPaste: `00020126580014BR.GOV.BCB.PIX0136${providerReference}`,
      raw: {
        simulated: true,
        provider: input.provider,
        orderId: input.order.id,
      },
      status: "pending",
    };
  }

  return {
    providerReference,
    checkoutUrl: `https://checkout.exemplo.com/${providerReference}`,
    raw: {
      simulated: true,
      provider: input.provider,
      orderId: input.order.id,
    },
    status: "initiated",
  };
}

export function extractWebhookIdentifiers(payload: Record<string, unknown>): {
  providerReference: string | null;
  orderId: string | null;
  paid: boolean;
} {
  const providerReference = typeof payload.id === "string" ? payload.id : null;
  const metadata =
    payload.metadata && typeof payload.metadata === "object"
      ? (payload.metadata as Record<string, unknown>)
      : null;

  const orderId = metadata && typeof metadata.orderId === "string" ? metadata.orderId : null;

  const status = typeof payload.status === "string" ? payload.status.toLowerCase() : "";
  const paid = ["paid", "approved", "confirmed", "succeeded"].includes(status);

  return {
    providerReference,
    orderId,
    paid,
  };
}
