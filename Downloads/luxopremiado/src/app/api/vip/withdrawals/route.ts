import { NextRequest, NextResponse } from "next/server";

import { getVipWithdrawalSnapshot, createVipWithdrawalRequest } from "@/lib/vip-runtime";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function toCents(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100);
  }

  if (typeof value === "string") {
    const normalized = value.replace(/\./g, "").replace(",", ".").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
  }

  return 0;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getVipWithdrawalSnapshot(user.id);
  return NextResponse.json(snapshot);
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { amount?: string | number; destinationPixKey?: string | null };

  try {
    const created = await createVipWithdrawalRequest({
      userId: user.id,
      amountCents: toCents(body.amount),
      destinationPixKey: body.destinationPixKey ?? null,
    });

    const snapshot = await getVipWithdrawalSnapshot(user.id);
    return NextResponse.json({ success: true, request: created, snapshot });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
