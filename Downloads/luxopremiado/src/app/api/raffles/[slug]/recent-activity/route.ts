import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { resolveAvailableRaffleSlug } from "@/lib/raffle-slug.server";

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await context.params;
  try {
    const slug = await resolveAvailableRaffleSlug(rawSlug);
    const supabase = createSupabaseServiceClient();

    const { data: raffle } = await supabase.from("raffles").select("id").eq("slug", slug).maybeSingle();
    if (!raffle?.id) {
      return NextResponse.json({ error: "Rifa não encontrada" }, { status: 404 });
    }

    const { data: orders } = await supabase
      .from("orders")
      .select("id, user_id, amount_cents, updated_at")
      .eq("raffle_id", raffle.id)
      .eq("status", "paid")
      .order("updated_at", { ascending: false })
      .limit(8);

    if (!orders?.length) {
      return NextResponse.json({ activities: [] });
    }

    const orderIds = orders.map((o) => o.id);
    const userIds = orders.map((o) => o.user_id);

    const [{ data: items }, { data: profiles }] = await Promise.all([
      supabase.from("order_items").select("order_id").in("order_id", orderIds),
      supabase.from("profiles").select("id, name").in("id", userIds),
    ]);

    const qtyMap = new Map<string, number>();
    for (const item of items ?? []) {
      const id = item.order_id as string;
      qtyMap.set(id, (qtyMap.get(id) ?? 0) + 1);
    }

    const nameMap = new Map<string, string>();
    for (const profile of profiles ?? []) {
      const name = (profile.name as string | null) ?? "Participante";
      nameMap.set(profile.id as string, name);
    }

    const activities = orders.map((o) => ({
      orderId: o.id,
      buyerName: nameMap.get(o.user_id) ?? "Participante",
      quantity: qtyMap.get(o.id) ?? 1,
      amountCents: Number(o.amount_cents ?? 0),
      updatedAt: o.updated_at as string,
    }));

    return NextResponse.json({ activities });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
