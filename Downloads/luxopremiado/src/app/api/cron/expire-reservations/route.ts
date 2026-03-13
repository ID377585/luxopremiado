import { NextRequest, NextResponse } from "next/server";

import { emitAlert, getRequestId, logStructured, persistPlatformEvent } from "@/lib/observability";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

async function handleExpireReservations(request: NextRequest) {
  const requestId = getRequestId(request);
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret && process.env.NODE_ENV === "production") {
    logStructured("error", "cron.expire_reservations.missing_secret", { requestId });
    return NextResponse.json(
      { error: "CRON_SECRET ausente em produção." },
      { status: 503 },
    );
  }

  if (expectedSecret) {
    const providedSecret = request.headers.get("x-cron-secret");
    const authorization = request.headers.get("authorization");
    const bearerSecret = authorization?.toLowerCase().startsWith("bearer ")
      ? authorization.slice(7).trim()
      : null;

    if (providedSecret !== expectedSecret && bearerSecret !== expectedSecret) {
      logStructured("warn", "cron.expire_reservations.unauthorized", { requestId });
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  try {
    const serviceClient = createSupabaseServiceClient();
    const { data, error } = await serviceClient.rpc("expire_reservations");

    if (error) {
      logStructured("error", "cron.expire_reservations.failed", {
        requestId,
        reason: error.message,
      });
      await persistPlatformEvent({
        event_type: "cron_expire_reservations_failed",
        level: "error",
        request_id: requestId,
        payload: {
          reason: error.message,
        },
      });
      await emitAlert("Falha expire_reservations", {
        requestId,
        reason: error.message,
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    logStructured("info", "cron.expire_reservations.success", {
      requestId,
      released: data ?? 0,
    });
    await persistPlatformEvent({
      event_type: "cron_expire_reservations_success",
      request_id: requestId,
      payload: {
        released: data ?? 0,
      },
    });

    return NextResponse.json({ success: true, released: data ?? 0, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    logStructured("error", "cron.expire_reservations.unhandled_error", { requestId, reason: message });
    await persistPlatformEvent({
      event_type: "cron_expire_reservations_unhandled_error",
      level: "error",
      request_id: requestId,
      payload: {
        reason: message,
      },
    });
    await emitAlert("Falha cron expire_reservations", {
      requestId,
      reason: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleExpireReservations(request);
}

export async function GET(request: NextRequest) {
  return handleExpireReservations(request);
}
