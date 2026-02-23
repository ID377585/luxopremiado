import { NextRequest, NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { getRequestId, logStructured, persistPlatformEvent } from "@/lib/observability";
import { createPaymentProvider } from "@/lib/payments/providers";
import { enforceAntiBot } from "@/lib/security/anti-bot";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { paymentSchema } from "@/lib/validators/payment";

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);

  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase não configurado. Defina as variáveis de ambiente." },
      { status: 503 },
    );
  }

  try {
    const payload = await request.json();
    const parsed = paymentSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Payload inválido",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logStructured("warn", "payment.create.unauthorized", { requestId });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const antiBotResult = await enforceAntiBot({
      request,
      action: "payment",
      userId: user.id,
      botTrap: parsed.data.botTrap,
      turnstileToken: parsed.data.turnstileToken,
    });

    if (!antiBotResult.ok) {
      logStructured("warn", "payment.create.antibot_blocked", {
        requestId,
        userId: user.id,
        reason: antiBotResult.error,
      });
      await persistPlatformEvent({
        event_type: "payment_create_antibot_blocked",
        level: "warn",
        request_id: requestId,
        user_id: user.id,
        payload: {
          reason: antiBotResult.error ?? "unknown",
        },
      });
      return NextResponse.json({ error: antiBotResult.error }, { status: antiBotResult.status });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, amount_cents, status, raffle_id")
      .eq("id", parsed.data.orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Status inválido para pagamento" }, { status: 400 });
    }

    const [profileResult, authResult] = await Promise.all([
      supabase.from("profiles").select("name, phone").eq("id", user.id).maybeSingle(),
      supabase.auth.getUser(),
    ]);

    const paymentResponse = await createPaymentProvider({
      provider: parsed.data.provider,
      method: parsed.data.method,
      order,
      customer: {
        email: authResult.data.user?.email ?? user.email ?? null,
        name: profileResult.data?.name ?? null,
        phone: profileResult.data?.phone ?? null,
      },
    });

    const serviceClient = createSupabaseServiceClient();

    const { error: paymentError } = await serviceClient.from("payments").insert({
      order_id: order.id,
      provider: parsed.data.provider,
      provider_reference: paymentResponse.providerReference,
      status: paymentResponse.status,
      pix_qr_code: paymentResponse.pixQrCode ?? null,
      pix_copy_paste: paymentResponse.pixCopyPaste ?? null,
      raw: paymentResponse.raw,
    });

    if (paymentError) {
      logStructured("warn", "payment.create.insert_failed", {
        requestId,
        userId: user.id,
        orderId: order.id,
        reason: paymentError.message,
      });
      return NextResponse.json({ error: paymentError.message }, { status: 400 });
    }

    logStructured("info", "payment.create.success", {
      requestId,
      userId: user.id,
      orderId: order.id,
      provider: parsed.data.provider,
      method: parsed.data.method,
      providerReference: paymentResponse.providerReference,
    });
    await persistPlatformEvent({
      event_type: "payment_create_success",
      request_id: requestId,
      user_id: user.id,
      order_id: order.id,
      raffle_id: (order.raffle_id as string | null) ?? null,
      provider: parsed.data.provider,
      payload: {
        method: parsed.data.method,
        providerReference: paymentResponse.providerReference,
        status: paymentResponse.status,
      },
    });

    return NextResponse.json({
      success: true,
      requestId,
      payment: paymentResponse,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    logStructured("error", "payment.create.unhandled_error", { requestId, reason: message });
    await persistPlatformEvent({
      event_type: "payment_create_unhandled_error",
      level: "error",
      request_id: requestId,
      payload: {
        reason: message,
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
