import { NextRequest, NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

interface OrderStatusRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, context: OrderStatusRouteContext) {
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
      .select("id, status, amount_cents, expires_at, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const { data: payments } = await serviceClient
      .from("payments")
      .select("id, provider, status, pix_qr_code, pix_copy_paste, provider_reference, raw, created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false })
      .limit(1);

    return NextResponse.json({
      success: true,
      order,
      latestPayment: payments?.[0] ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
