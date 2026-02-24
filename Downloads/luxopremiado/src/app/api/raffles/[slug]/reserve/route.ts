import { NextRequest, NextResponse } from "next/server";

import { attachAffiliateToOrder, getAffiliateCodeFromRequest } from "@/lib/affiliates";
import { hasSupabaseEnv } from "@/lib/env";
import { getRequestId, logStructured, persistPlatformEvent } from "@/lib/observability";
import { enforceAntiBot } from "@/lib/security/anti-bot";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { reserveSchema } from "@/lib/validators/reserve";

interface ReserveRouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: NextRequest, context: ReserveRouteContext) {
  const requestId = getRequestId(request);

  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase não configurado. Defina as variáveis de ambiente." },
      { status: 503 },
    );
  }

  try {
    const { slug } = await context.params;
    const payload = await request.json();
    const parsed = reserveSchema.safeParse(payload);

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
      logStructured("warn", "reserve.unauthorized", { requestId });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const antiBotResult = await enforceAntiBot({
      request,
      action: "reserve",
      userId: user.id,
      botTrap: parsed.data.botTrap,
      turnstileToken: parsed.data.turnstileToken,
    });

    if (!antiBotResult.ok) {
      logStructured("warn", "reserve.antibot_blocked", {
        requestId,
        userId: user.id,
        reason: antiBotResult.error,
      });
      await persistPlatformEvent({
        event_type: "reserve_antibot_blocked",
        level: "warn",
        request_id: requestId,
        user_id: user.id,
        payload: {
          reason: antiBotResult.error ?? "unknown",
        },
      });
      return NextResponse.json({ error: antiBotResult.error }, { status: antiBotResult.status });
    }

    const { data, error } = await supabase.rpc("reserve_raffle_numbers", {
      p_raffle_slug: slug,
      p_numbers: parsed.data.numbers ?? null,
      p_qty: parsed.data.qty ?? null,
      p_reserve_minutes: 15,
    });

    if (error) {
      logStructured("warn", "reserve.rpc_error", {
        requestId,
        userId: user.id,
        slug,
        reason: error.message,
      });
      await persistPlatformEvent({
        event_type: "reserve_failed",
        level: "warn",
        request_id: requestId,
        user_id: user.id,
        payload: {
          slug,
          reason: error.message,
        },
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const reserveRow = Array.isArray(data) ? data[0] : data;
    const orderId = reserveRow?.order_id as string | undefined;
    const affiliateCode = parsed.data.affiliateCode ?? getAffiliateCodeFromRequest(request);

    if (orderId && affiliateCode) {
      await attachAffiliateToOrder(orderId, affiliateCode);
    }

    logStructured("info", "reserve.success", {
      requestId,
      userId: user.id,
      slug,
      orderId: orderId ?? null,
      numbersCount: Array.isArray(reserveRow?.reserved_numbers) ? reserveRow.reserved_numbers.length : 0,
    });
    await persistPlatformEvent({
      event_type: "reserve_success",
      level: "info",
      request_id: requestId,
      user_id: user.id,
      order_id: orderId ?? null,
      raffle_id: (reserveRow?.raffle_id as string | null) ?? null,
      payload: {
        slug,
        numbersCount: Array.isArray(reserveRow?.reserved_numbers) ? reserveRow.reserved_numbers.length : 0,
      },
    });

    return NextResponse.json({
      success: true,
      requestId,
      reservation: reserveRow
        ? {
            orderId: reserveRow.order_id as string,
            raffleId: reserveRow.raffle_id as string,
            reservedNumbers: Array.isArray(reserveRow.reserved_numbers)
              ? reserveRow.reserved_numbers.map((value: unknown) => Number(value))
              : [],
            amountCents: Number(reserveRow.amount_cents ?? 0),
            expiresAt: (reserveRow.expires_at as string | null) ?? null,
          }
        : null,
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    logStructured("error", "reserve.unhandled_error", { requestId, reason: message });
    await persistPlatformEvent({
      event_type: "reserve_unhandled_error",
      level: "error",
      request_id: requestId,
      payload: {
        reason: message,
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
