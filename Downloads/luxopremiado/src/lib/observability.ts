import { randomUUID } from "node:crypto";

import { NextRequest } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type LogLevel = "debug" | "info" | "warn" | "error";

export function getRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id") ?? randomUUID();
}

export function logStructured(level: LogLevel, event: string, context: Record<string, unknown>) {
  const log = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...context,
  };

  const serialized = JSON.stringify(log);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
}

export async function persistPlatformEvent(input: {
  event_type: string;
  level?: LogLevel;
  request_id?: string;
  user_id?: string | null;
  order_id?: string | null;
  raffle_id?: string | null;
  provider?: string | null;
  payload?: Record<string, unknown>;
}) {
  if (!hasSupabaseEnv()) {
    return;
  }

  try {
    const serviceClient = createSupabaseServiceClient();
    await serviceClient.from("platform_events").insert({
      event_type: input.event_type,
      level: input.level ?? "info",
      request_id: input.request_id ?? null,
      user_id: input.user_id ?? null,
      order_id: input.order_id ?? null,
      raffle_id: input.raffle_id ?? null,
      provider: input.provider ?? null,
      payload: input.payload ?? {},
    });
  } catch (error) {
    logStructured("warn", "observability.persist_failed", {
      reason: error instanceof Error ? error.message : "unknown",
      event_type: input.event_type,
    });
  }
}

export async function emitAlert(title: string, detail: Record<string, unknown>) {
  const webhook = process.env.ALERT_WEBHOOK_URL;
  if (!webhook) {
    return;
  }

  try {
    await fetch(webhook, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title,
        detail,
        source: "luxopremiado",
        timestamp: new Date().toISOString(),
      }),
      cache: "no-store",
    });
  } catch (error) {
    logStructured("warn", "observability.alert_failed", {
      title,
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}
