import { NextResponse } from "next/server";

import { getDefaultRaffleSlug } from "@/lib/raffle-slug";
import { getSessionUser, isAdminUser } from "@/lib/session";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user || !(await isAdminUser(user.id, user.email))) {
    return forbidden();
  }

  const { searchParams } = new URL(request.url);
  const raffleSlug = searchParams.get("raffleSlug") ?? getDefaultRaffleSlug();

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("prize_configurations")
    .select(
      [
        "*",
        "prize_value_label",
        "total_numbers_label",
        "draw_date_label",
        "lucky_number_label",
        "year_model_label",
        "year_model_value",
        "motor_label",
        "motor_value",
        "guarantee_label",
        "guarantee_value",
        "delivery_label",
        "delivery_value",
      ].join(", "),
    )
    .eq("raffle_slug", raffleSlug)
    .order("prize_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ prizes: data ?? [] });
}

interface PrizePayload {
  prizeOrder: number;
  prizeLabel: string;
  prizeValueLabel?: string;
  prizeValueCents: number;
  imageUrl?: string;
  totalNumbersLabel?: string;
  totalNumbers: number;
  drawDateLabel?: string;
  drawDate: string;
  luckyNumberLabel?: string;
  luckyNumber: number;
  yearModelLabel?: string;
  yearModelValue?: string;
  motorLabel?: string;
  motorValue?: string;
  guaranteeLabel?: string;
  guaranteeValue?: string;
  deliveryLabel?: string;
  deliveryValue?: string;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !(await isAdminUser(user.id, user.email))) {
    return forbidden();
  }

  const body = (await request.json()) as { raffleSlug?: string; prizes?: PrizePayload[] };
  const raffleSlug = body.raffleSlug?.trim() || getDefaultRaffleSlug();
  const prizes = body.prizes ?? [];

  if (prizes.length === 0) {
    return NextResponse.json({ error: "Nenhum prêmio enviado." }, { status: 400 });
  }

  const rows = prizes.map((p) => ({
    raffle_slug: raffleSlug,
    prize_order: p.prizeOrder,
    prize_label: p.prizeLabel.trim(),
    prize_value_label: p.prizeValueLabel?.trim() || null,
    prize_value_cents: Math.max(0, Math.round(p.prizeValueCents)),
    image_url: p.imageUrl?.trim() || null,
    total_numbers_label: p.totalNumbersLabel?.trim() || null,
    total_numbers: p.totalNumbers,
    draw_date_label: p.drawDateLabel?.trim() || null,
    draw_date: p.drawDate,
    lucky_number_label: p.luckyNumberLabel?.trim() || null,
    lucky_number: p.luckyNumber,
    year_model_label: p.yearModelLabel?.trim() || null,
    year_model_value: p.yearModelValue?.trim() || null,
    motor_label: p.motorLabel?.trim() || null,
    motor_value: p.motorValue?.trim() || null,
    guarantee_label: p.guaranteeLabel?.trim() || null,
    guarantee_value: p.guaranteeValue?.trim() || null,
    delivery_label: p.deliveryLabel?.trim() || null,
    delivery_value: p.deliveryValue?.trim() || null,
    updated_by: user.email ?? "admin",
  }));

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("prize_configurations").upsert(rows, {
    onConflict: "raffle_slug,prize_order",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
