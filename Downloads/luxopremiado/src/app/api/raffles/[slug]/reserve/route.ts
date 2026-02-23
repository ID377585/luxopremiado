import { NextRequest, NextResponse } from "next/server";

import { attachAffiliateToOrder, getAffiliateCodeFromRequest } from "@/lib/affiliates";
import { hasSupabaseEnv } from "@/lib/env";
import { enforceAntiBot } from "@/lib/security/anti-bot";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { reserveSchema } from "@/lib/validators/reserve";

interface ReserveRouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: NextRequest, context: ReserveRouteContext) {
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
      return NextResponse.json({ error: antiBotResult.error }, { status: antiBotResult.status });
    }

    const { data, error } = await supabase.rpc("reserve_raffle_numbers", {
      p_raffle_slug: slug,
      p_numbers: parsed.data.numbers ?? null,
      p_qty: parsed.data.qty ?? null,
      p_reserve_minutes: 15,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const reserveRow = Array.isArray(data) ? data[0] : null;
    const orderId = reserveRow?.order_id as string | undefined;
    const affiliateCode = parsed.data.affiliateCode ?? getAffiliateCodeFromRequest(request);

    if (orderId && affiliateCode) {
      await attachAffiliateToOrder(orderId, affiliateCode);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
