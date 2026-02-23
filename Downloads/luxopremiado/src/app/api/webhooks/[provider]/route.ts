import { NextRequest, NextResponse } from "next/server";

import { extractWebhookIdentifiers } from "@/lib/payments/providers";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

interface WebhookRouteContext {
  params: Promise<{ provider: string }>;
}

function validateWebhookSignature(request: NextRequest): boolean {
  const expectedSecret = process.env.WEBHOOK_SECRET;

  if (!expectedSecret) {
    return true;
  }

  const providedSecret = request.headers.get("x-webhook-secret");
  return providedSecret === expectedSecret;
}

export async function POST(request: NextRequest, context: WebhookRouteContext) {
  if (!validateWebhookSignature(request)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  try {
    const { provider } = await context.params;
    const payload = (await request.json()) as Record<string, unknown>;
    const { providerReference, orderId, paid } = extractWebhookIdentifiers(payload);

    if (!providerReference || !orderId) {
      return NextResponse.json({ error: "Payload sem identificadores obrigatórios" }, { status: 400 });
    }

    const serviceClient = createSupabaseServiceClient();

    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    if (paid) {
      const { error: markError } = await serviceClient.rpc("mark_order_paid", {
        p_order_id: orderId,
        p_provider: provider,
        p_provider_reference: providerReference,
        p_raw: payload,
      });

      if (markError) {
        return NextResponse.json({ error: markError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, paid: true });
    }

    await serviceClient.from("payments").insert({
      order_id: orderId,
      provider,
      provider_reference: providerReference,
      status: "failed",
      raw: payload,
    });

    return NextResponse.json({ success: true, paid: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
