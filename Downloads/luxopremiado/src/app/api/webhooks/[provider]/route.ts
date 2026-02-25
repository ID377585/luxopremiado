import { NextRequest, NextResponse } from "next/server";

import { emitAlert, getRequestId, logStructured, persistPlatformEvent } from "@/lib/observability";
import { PaymentProviderName, verifyAndParseWebhook } from "@/lib/payments/providers";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

interface WebhookRouteContext {
  params: Promise<{ provider: string }>;
}

function isKnownProvider(value: string): value is PaymentProviderName {
  return ["asaas", "mercadopago", "pagarme", "stripe"].includes(value);
}

export async function POST(request: NextRequest, context: WebhookRouteContext) {
  const requestId = getRequestId(request);

  try {
    const { provider } = await context.params;
    if (!isKnownProvider(provider)) {
      logStructured("warn", "webhook.provider_invalid", { requestId, provider });
      return NextResponse.json({ error: "Provider inválido." }, { status: 400 });
    }

    const rawBody = await request.text();

    const parsed = await verifyAndParseWebhook({
      provider,
      rawBody,
      headers: request.headers,
      query: request.nextUrl.searchParams,
    });

    const serviceClient = createSupabaseServiceClient();

    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .select("id, status")
      .eq("id", parsed.orderId)
      .maybeSingle();

    if (orderError) {
      logStructured("warn", "webhook.order_lookup_error", {
        requestId,
        provider,
        orderId: parsed.orderId,
        reason: orderError.message,
      });
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    if (!order) {
      logStructured("warn", "webhook.order_not_found", {
        requestId,
        provider,
        orderId: parsed.orderId,
      });
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.status === "paid") {
      logStructured("info", "webhook.idempotent_skip", {
        requestId,
        provider,
        orderId: parsed.orderId,
        providerReference: parsed.providerReference,
      });
      await persistPlatformEvent({
        event_type: "webhook_idempotent_skip",
        request_id: requestId,
        order_id: parsed.orderId,
        provider,
        payload: {
          providerReference: parsed.providerReference,
        },
      });
      return NextResponse.json({ success: true, alreadyProcessed: true, requestId });
    }

    if (parsed.paid) {
      const { error: markError } = await serviceClient.rpc("mark_order_paid", {
        p_order_id: parsed.orderId,
        p_provider: provider,
        p_provider_reference: parsed.providerReference,
        p_raw: parsed.raw,
      });

      if (markError) {
        logStructured("error", "webhook.mark_order_paid_failed", {
          requestId,
          provider,
          orderId: parsed.orderId,
          reason: markError.message,
        });
        await persistPlatformEvent({
          event_type: "webhook_mark_order_paid_failed",
          level: "error",
          request_id: requestId,
          order_id: parsed.orderId,
          provider,
          payload: {
            reason: markError.message,
            providerReference: parsed.providerReference,
          },
        });
        await emitAlert("Falha mark_order_paid", {
          requestId,
          provider,
          orderId: parsed.orderId,
          reason: markError.message,
        });
        return NextResponse.json({ error: markError.message }, { status: 400 });
      }

      logStructured("info", "webhook.payment_confirmed", {
        requestId,
        provider,
        orderId: parsed.orderId,
        providerReference: parsed.providerReference,
      });
      await persistPlatformEvent({
        event_type: "webhook_payment_confirmed",
        request_id: requestId,
        order_id: parsed.orderId,
        provider,
        payload: {
          providerReference: parsed.providerReference,
        },
      });
      return NextResponse.json({ success: true, paid: true, requestId });
    }

    await serviceClient.from("payments").insert({
      order_id: parsed.orderId,
      provider,
      provider_reference: parsed.providerReference,
      status: "failed",
      raw: parsed.raw,
    });

    logStructured("info", "webhook.payment_not_paid", {
      requestId,
      provider,
      orderId: parsed.orderId,
      providerReference: parsed.providerReference,
    });
    await persistPlatformEvent({
      event_type: "webhook_payment_not_paid",
      level: "warn",
      request_id: requestId,
      order_id: parsed.orderId,
      provider,
      payload: {
        providerReference: parsed.providerReference,
      },
    });
    return NextResponse.json({ success: true, paid: false, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    logStructured("error", "webhook.unhandled_error", { requestId, reason: message });
    await persistPlatformEvent({
      event_type: "webhook_unhandled_error",
      level: "error",
      request_id: requestId,
      payload: {
        reason: message,
      },
    });
    await emitAlert("Falha webhook", {
      requestId,
      reason: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
