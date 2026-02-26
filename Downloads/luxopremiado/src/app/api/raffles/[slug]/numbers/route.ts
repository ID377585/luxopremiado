import { NextRequest, NextResponse } from "next/server";

import { canUseDemoFallback, hasSupabaseEnv } from "@/lib/env";
import { buildFallbackNumberTiles, fallbackRaffleData, FALLBACK_TOTAL_NUMBERS } from "@/lib/landing-data";
import { isDefaultRaffleSlug } from "@/lib/raffle-slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface RaffleNumbersRouteContext {
  params: Promise<{ slug: string }>;
}

function normalizeStatus(status: string | null): "available" | "reserved" | "sold" {
  if (status === "reserved" || status === "sold") {
    return status;
  }

  return "available";
}

export async function GET(request: NextRequest, context: RaffleNumbersRouteContext) {
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
  const pageSize = Math.min(500, Math.max(20, Number(request.nextUrl.searchParams.get("pageSize") ?? 200)));
  const includeStatsParam = request.nextUrl.searchParams.get("includeStats");
  const includeStats = includeStatsParam === "1" || includeStatsParam === "true" || page === 1;

  if (!hasSupabaseEnv()) {
    if (!canUseDemoFallback()) {
      return NextResponse.json(
        {
          error: "Supabase não configurado para carregar os números desta rifa.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      page,
      pageSize,
      total: FALLBACK_TOTAL_NUMBERS,
      stats: {
        available: fallbackRaffleData.stats.availableNumbers,
        reserved: fallbackRaffleData.stats.reservedNumbers,
        sold: fallbackRaffleData.stats.soldNumbers,
      },
      numbers: buildFallbackNumberTiles({
        page,
        pageSize,
        totalNumbers: FALLBACK_TOTAL_NUMBERS,
      }),
      fallback: true,
    });
  }

  try {
    const { slug } = await context.params;
    const offset = (page - 1) * pageSize;

    const supabase = await createSupabaseServerClient();

    const raffleSelect = "id, slug, status, total_numbers";
    let { data: raffle } = await supabase.from("raffles").select(raffleSelect).eq("slug", slug).maybeSingle();

    if (!raffle && isDefaultRaffleSlug(slug)) {
      const { data: candidates } = await supabase
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
      return NextResponse.json({ error: "Rifa não encontrada." }, { status: 404 });
    }

    const rowsPromise = supabase
      .from("v_raffle_numbers_public")
      .select("number, status")
      .eq("raffle_id", raffle.id)
      .order("number", { ascending: true })
      .range(offset, offset + pageSize - 1);

    const soldCountPromise = includeStats
      ? supabase.from("raffle_numbers").select("id", { count: "exact", head: true }).eq("raffle_id", raffle.id).eq("status", "sold")
      : Promise.resolve({ count: null, error: null });

    const reservedCountPromise = includeStats
      ? supabase
          .from("raffle_numbers")
          .select("id", { count: "exact", head: true })
          .eq("raffle_id", raffle.id)
          .eq("status", "reserved")
      : Promise.resolve({ count: null, error: null });

    const [rowsResult, soldCountResult, reservedCountResult] = await Promise.all([
      rowsPromise,
      soldCountPromise,
      reservedCountPromise,
    ]);

    if (rowsResult.error) {
      return NextResponse.json({ error: rowsResult.error.message }, { status: 400 });
    }

    if (includeStats && soldCountResult.error) {
      return NextResponse.json({ error: soldCountResult.error.message }, { status: 400 });
    }

    if (includeStats && reservedCountResult.error) {
      return NextResponse.json({ error: reservedCountResult.error.message }, { status: 400 });
    }

    const soldCount = Number(soldCountResult.count ?? 0);
    const reservedCount = Number(reservedCountResult.count ?? 0);
    const totalCount = Number(raffle.total_numbers ?? 0);
    const availableCount = Math.max(0, totalCount - soldCount - reservedCount);

    return NextResponse.json({
      success: true,
      page,
      pageSize,
      resolvedSlug: raffle.slug ?? slug,
      total: totalCount,
      stats: includeStats
        ? {
            available: availableCount,
            reserved: reservedCount,
            sold: soldCount,
          }
        : undefined,
      numbers:
        rowsResult.data?.map((item) => ({
          number: Number(item.number),
          status: normalizeStatus(typeof item.status === "string" ? item.status : null),
        })) ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
