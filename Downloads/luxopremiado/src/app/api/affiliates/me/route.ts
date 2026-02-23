import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase não configurado. Defina as variáveis de ambiente." },
      { status: 503 },
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: affiliate, error } = await supabase
      .from("affiliates")
      .select("id, code, commission_bps, is_active")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!affiliate) {
      return NextResponse.json({ success: true, affiliate: null });
    }

    const { data: referrals } = await supabase
      .from("order_affiliates")
      .select("commission_cents, status")
      .eq("affiliate_id", affiliate.id);

    const approvedCommissionCents =
      referrals
        ?.filter((row) => row.status === "approved" || row.status === "paid")
        .reduce((acc, row) => acc + Number(row.commission_cents ?? 0), 0) ?? 0;

    return NextResponse.json({
      success: true,
      affiliate: {
        code: affiliate.code,
        commission_bps: affiliate.commission_bps,
        is_active: affiliate.is_active,
        total_referred_orders: referrals?.length ?? 0,
        approved_commission_cents: approvedCommissionCents,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
