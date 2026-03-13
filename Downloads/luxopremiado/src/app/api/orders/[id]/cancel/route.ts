import { NextRequest, NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { getRequestId, logStructured, persistPlatformEvent } from "@/lib/observability";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

interface CancelOrderRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: CancelOrderRouteContext) {
  const requestId = getRequestId(request);

  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase não configurado. Defina as variáveis de ambiente." },
      { status: 503 },
    );
  }

  try {
    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();
    const serviceClient = createSupabaseServiceClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .select("id, status, user_id")
      .eq("id", id)
      .maybeSingle();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    if (!order || order.user_id !== user.id) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ error: "Pedido já pago, não é possível cancelar." }, { status: 400 });
    }

    const { error: updateError } = await serviceClient
      .from("orders")
      .update({ status: "canceled", expires_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .not("status", "eq", "paid");

    if (updateError) {
      logStructured("warn", "order.cancel.update_failed", { requestId, reason: updateError.message, orderId: id });
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    const { error: releaseError, data: releasedRows } = await serviceClient
      .from("raffle_numbers")
      .update({ status: "available", reserved_by: null, reserved_until: null, order_id: null })
      .eq("order_id", id)
      .eq("status", "reserved")
      .select("id");

    const releasedCount = releasedRows?.length ?? 0;

    if (releaseError) {
      logStructured("warn", "order.cancel.release_failed", { requestId, reason: releaseError.message, orderId: id });
      return NextResponse.json({ error: releaseError.message }, { status: 400 });
    }

    logStructured("info", "order.cancel.success", { requestId, orderId: id, released: releasedCount });
    await persistPlatformEvent({
      event_type: "order_cancelled",
      level: "info",
      request_id: requestId,
      order_id: id,
      payload: {
        released: releasedCount,
      },
    });

    return NextResponse.json({ success: true, released: releasedCount, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    logStructured("error", "order.cancel.unhandled_error", { requestId, reason: message });
    await persistPlatformEvent({
      event_type: "order_cancel_unhandled",
      level: "error",
      request_id: requestId,
      payload: { reason: message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
