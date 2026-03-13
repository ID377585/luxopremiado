import { NextRequest, NextResponse } from "next/server";

import { emitAlert, getRequestId, logStructured, persistPlatformEvent } from "@/lib/observability";
import { awardBirthdayBonusesForToday } from "@/lib/vip-runtime";

async function handleBirthdayCron(request: NextRequest) {
  const requestId = getRequestId(request);
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "CRON_SECRET ausente em produção." }, { status: 503 });
  }

  if (expectedSecret) {
    const providedSecret = request.headers.get("x-cron-secret");
    const authorization = request.headers.get("authorization");
    const bearerSecret = authorization?.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : null;

    if (providedSecret !== expectedSecret && bearerSecret !== expectedSecret) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  try {
    const result = await awardBirthdayBonusesForToday();
    logStructured("info", "cron.vip_birthday.success", { requestId, awarded: result.awarded });
    await persistPlatformEvent({
      event_type: "cron_vip_birthday_success",
      request_id: requestId,
      payload: result,
    });
    return NextResponse.json({ success: true, ...result, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    logStructured("error", "cron.vip_birthday.failed", { requestId, reason: message });
    await persistPlatformEvent({
      event_type: "cron_vip_birthday_failed",
      level: "error",
      request_id: requestId,
      payload: { reason: message },
    });
    await emitAlert("Falha cron vip_birthday", { requestId, reason: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handleBirthdayCron(request);
}

export async function POST(request: NextRequest) {
  return handleBirthdayCron(request);
}
