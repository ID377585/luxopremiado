import { NextRequest, NextResponse } from "next/server";

import { resolveAvailableRaffleSlug } from "@/lib/raffle-slug.server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await context.params;
  const slug = await resolveAvailableRaffleSlug(rawSlug?.trim() || null);
  const supabase = createSupabaseServiceClient();

  // Resolve raffle id
  const { data: raffle } = await supabase.from("raffles").select("id, total_numbers").eq("slug", slug).maybeSingle();
  if (!raffle?.id) {
    return NextResponse.json({ error: "Rifa não encontrada" }, { status: 404 });
  }

  const totalNumbers = Number(raffle.total_numbers ?? 0);

  const { data: prizeConfigs } = await supabase
    .from("prize_configurations")
    .select("prize_order, total_numbers")
    .eq("raffle_slug", slug)
    .order("prize_order", { ascending: true });

  // Build ranges
  const ranges: Array<{ order: number; start: number; end: number; total: number }> = [];
  if (prizeConfigs?.length) {
    let cursor = 1;
    for (let i = 0; i < prizeConfigs.length; i += 1) {
      const p = prizeConfigs[i];
      const size =
        typeof p.total_numbers === "number" && p.total_numbers > 0
          ? Number(p.total_numbers)
          : i === prizeConfigs.length - 1
            ? Math.max(totalNumbers - cursor + 1, 0)
            : Math.max(Math.floor(totalNumbers / prizeConfigs.length), 1);
      const start = cursor;
      const end = Math.max(start, cursor + size - 1);
      ranges.push({ order: Number(p.prize_order ?? i + 1), start, end, total: size });
      cursor = end + 1;
    }
  }

  const countsByPrize = await Promise.all(
    ranges.map(async (range) => {
      const { count: soldCountRaw } = await supabase
        .from("raffle_numbers")
        .select("id", { count: "exact", head: true })
        .eq("raffle_id", raffle.id)
        .eq("status", "sold")
        .gte("number", range.start)
        .lte("number", range.end);
      const soldCount = Number(soldCountRaw ?? 0);
      const reservedCount = 0; // não contar reservas
      const available = Math.max(0, range.total - soldCount);
      return {
        prizeOrder: range.order,
        total: range.total,
        sold: soldCount,
        reserved: reservedCount,
        available,
      };
    }),
  );

  // Global stats
  const { count: soldGlobal } = await supabase
    .from("raffle_numbers")
    .select("id", { count: "exact", head: true })
    .eq("raffle_id", raffle.id)
    .eq("status", "sold");
  const sold = Number(soldGlobal ?? 0);
  const reserved = 0; // não contar reservas
  const available = Math.max(0, totalNumbers - sold);

  return NextResponse.json({
    totals: {
      sold,
      reserved,
      available,
      totalNumbers,
    },
    prizes: countsByPrize,
  });
}
