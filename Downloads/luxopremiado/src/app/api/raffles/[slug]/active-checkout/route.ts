import { NextRequest, NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { isDefaultRaffleSlug } from "@/lib/raffle-slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

interface ActiveCheckoutRouteContext {
  params: Promise<{ slug: string }>;
}

function parseIsoDate(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapPaymentStatus(status: string | null | undefined): "pending" | "initiated" {
  return status === "initiated" ? "initiated" : "pending";
}

function getString(raw: Record<string, unknown> | null | undefined, key: string): string | undefined {
  const value = raw?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export async function GET(_: NextRequest, context: ActiveCheckoutRouteContext) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase não configurado. Defina as variáveis de ambiente." },
      { status: 503 },
    );
  }

  try {
    const { slug } = await context.params;
    const supabase = await createSupabaseServerClient();
    const serviceClient = createSupabaseServiceClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raffleSelect = "id, slug, status";
    let { data: raffle } = await serviceClient.from("raffles").select(raffleSelect).eq("slug", slug).maybeSingle();

    if (!raffle && isDefaultRaffleSlug(slug)) {
      const { data: candidates } = await serviceClient
        .from("raffles")
        .select(raffleSelect)
        .in("status", ["active", "draft", "closed", "drawn"])
        .order("created_at", { ascending: false })
        .limit(24);

      const activeMatch = candidates?.find((item) => item.status === "active" && item.slug);
      const anyMatch = candidates?.find((item) => item.slug);
      raffle = activeMatch ?? anyMatch ?? null;
    }

    if (!raffle) {
      return NextResponse.json({ success: true, checkout: null });
    }

    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .select("id, raffle_id, status, amount_cents, expires_at, created_at")
      .eq("user_id", user.id)
      .eq("raffle_id", raffle.id)
      .in("status", ["pending", "paid"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    if (!order) {
      return NextResponse.json({ success: true, checkout: null });
    }

    const { data: linkedNumbers } = await serviceClient
      .from("raffle_numbers")
      .select("number")
      .eq("order_id", order.id)
      .in("status", ["reserved", "sold"])
      .order("number", { ascending: true })
      .limit(500);

    const { data: latestPayment } = await serviceClient
      .from("payments")
      .select("provider_reference, status, pix_qr_code, pix_copy_paste, raw")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const expiresAtMs = parseIsoDate(order.expires_at as string | null | undefined);
    const computedStatus =
      order.status === "pending" && expiresAtMs !== null && expiresAtMs <= Date.now() ? "expired" : order.status;

    return NextResponse.json({
      success: true,
      checkout: {
        reservation: {
          orderId: order.id,
          raffleId: String(order.raffle_id),
          reservedNumbers: (linkedNumbers ?? []).map((item) => Number(item.number)),
          amountCents: Number(order.amount_cents ?? 0),
          expiresAt: (order.expires_at as string | null) ?? null,
        },
        orderStatus: computedStatus,
        latestPayment: latestPayment?.provider_reference
          ? {
              providerReference: latestPayment.provider_reference,
              status: mapPaymentStatus(latestPayment.status),
              pixQrCode: latestPayment.pix_qr_code ?? undefined,
              pixCopyPaste: latestPayment.pix_copy_paste ?? undefined,
              checkoutUrl:
                getString(latestPayment.raw as Record<string, unknown> | null, "checkoutUrl") ??
                getString(latestPayment.raw as Record<string, unknown> | null, "checkout_url"),
              expiresAt: getString(latestPayment.raw as Record<string, unknown> | null, "expiresAt"),
            }
          : null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
