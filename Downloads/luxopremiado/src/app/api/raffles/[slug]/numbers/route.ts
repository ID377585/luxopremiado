import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { canUseDemoFallback, hasSupabaseEnv } from "@/lib/env";
import { buildFallbackNumberTiles, fallbackRaffleData, FALLBACK_TOTAL_NUMBERS } from "@/lib/landing-data";
import { isDefaultRaffleSlug } from "@/lib/raffle-slug";
import { getCachedRaffleStats, setCachedRaffleStats } from "@/lib/raffle-stats-cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

interface RaffleNumbersRouteContext {
  params: Promise<{ slug: string }>;
}

interface RaffleLookupRow {
  id: string;
  slug: string | null;
  status: string | null;
  total_numbers: number | null;
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
  const prizeOrderParam = request.nextUrl.searchParams.get("prizeOrder");
  const prizeOrder = prizeOrderParam ? Number(prizeOrderParam) : null;

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

    const supabase = await createSupabaseServerClient();
    let dataClient = supabase as unknown as SupabaseClient;

    const raffleSelect = "id, slug, status, total_numbers";
    let { data: raffle } = await dataClient.from("raffles").select(raffleSelect).eq("slug", slug).maybeSingle();

    if (!raffle && isDefaultRaffleSlug(slug)) {
      const { data: candidates } = await dataClient
        .from("raffles")
        .select(raffleSelect)
        .in("status", ["active", "closed", "drawn"])
        .order("created_at", { ascending: false })
        .limit(24);

      const activeMatch = candidates?.find((item: RaffleLookupRow) => item.status === "active" && item.slug);
      const anyMatch = candidates?.find((item: RaffleLookupRow) => item.slug);
      raffle = activeMatch ?? anyMatch ?? null;
    }

    if (!raffle) {
      try {
        dataClient = createSupabaseServiceClient();
        const serviceLookup = await dataClient.from("raffles").select(raffleSelect).eq("slug", slug).maybeSingle();
        raffle = serviceLookup.data ?? null;

        if (!raffle && isDefaultRaffleSlug(slug)) {
          const { data: serviceCandidates } = await dataClient
            .from("raffles")
            .select(raffleSelect)
            .in("status", ["active", "closed", "drawn"])
            .order("created_at", { ascending: false })
            .limit(24);

          const serviceActive = serviceCandidates?.find(
            (item: RaffleLookupRow) => item.status === "active" && item.slug,
          );
          const serviceAny = serviceCandidates?.find((item: RaffleLookupRow) => item.slug);
          raffle = serviceActive ?? serviceAny ?? null;
        }
      } catch {
        // noop
      }
    }

    if (!raffle) {
      return NextResponse.json({ error: "Rifa não encontrada." }, { status: 404 });
    }

    const totalNumbersAll = Number(raffle.total_numbers ?? 0);
    let rangeStart = 1;
    let rangeEnd = totalNumbersAll;

    if (prizeOrder && Number.isFinite(prizeOrder) && prizeOrder > 0) {
      const { data: prizeConfigs } = await dataClient
        .from("prize_configurations")
        .select("prize_order, total_numbers")
        .eq("raffle_slug", raffle.slug ?? slug)
        .order("prize_order", { ascending: true });

      if (prizeConfigs?.length) {
        let cursor = 1;
        for (const cfg of prizeConfigs) {
          const order = Number(cfg.prize_order ?? 0);
          const size =
            typeof cfg.total_numbers === "number" && cfg.total_numbers > 0
              ? Number(cfg.total_numbers)
              : Math.max(1, Math.floor(totalNumbersAll / prizeConfigs.length));
          const start = cursor;
          const end = Math.min(cursor + size - 1, totalNumbersAll || start + size - 1);
          if (order === prizeOrder) {
            rangeStart = start;
            rangeEnd = end;
            break;
          }
          cursor = end + 1;
        }
      }
    }

    const rangeOffset = (page - 1) * pageSize;

    const rowsPromise = dataClient
      .from("v_raffle_numbers_public")
      .select("number, status")
      .eq("raffle_id", raffle.id)
      .gte("number", rangeStart)
      .lte("number", rangeEnd)
      .order("number", { ascending: true })
      .range(rangeOffset, rangeOffset + pageSize - 1);

    let rowsResult = await rowsPromise;

    if (rowsResult.error && rowsResult.error.message.includes("v_raffle_numbers_public")) {
      rowsResult = await dataClient
        .from("raffle_numbers")
        .select("number, status")
        .eq("raffle_id", raffle.id)
        .gte("number", rangeStart)
        .lte("number", rangeEnd)
        .order("number", { ascending: true })
        .range(rangeOffset, rangeOffset + pageSize - 1);
    }

    if (rowsResult.error) {
      return NextResponse.json({ error: rowsResult.error.message }, { status: 400 });
    }

    const totalCount = rangeEnd - rangeStart + 1;
    const cachedStats = includeStats && !prizeOrder ? getCachedRaffleStats(String(raffle.id)) : null;
    let soldCount = cachedStats?.sold ?? 0;
    let reservedCount = cachedStats?.reserved ?? 0;

    if (includeStats && !cachedStats) {
      const [soldCountResult, reservedCountResult] = await Promise.all([
        dataClient
          .from("raffle_numbers")
          .select("id", { count: "exact", head: true })
          .eq("raffle_id", raffle.id)
          .eq("status", "sold")
          .gte("number", rangeStart)
          .lte("number", rangeEnd),
        dataClient
          .from("raffle_numbers")
          .select("id", { count: "exact", head: true })
          .eq("raffle_id", raffle.id)
          .eq("status", "reserved")
          .gte("number", rangeStart)
          .lte("number", rangeEnd),
      ]);

      if (soldCountResult.error) {
        return NextResponse.json({ error: soldCountResult.error.message }, { status: 400 });
      }

      if (reservedCountResult.error) {
        return NextResponse.json({ error: reservedCountResult.error.message }, { status: 400 });
      }

      soldCount = Number(soldCountResult.count ?? 0);
      reservedCount = Number(reservedCountResult.count ?? 0);
      if (!prizeOrder) {
        setCachedRaffleStats({
          raffleId: String(raffle.id),
          total: totalCount,
          sold: soldCount,
          reserved: reservedCount,
        });
      }
    }

    const availableCount = Math.max(0, totalCount - soldCount - reservedCount);
    let luckyNumber: number | null = null;

    if (soldCount >= totalCount && totalCount > 0) {
      try {
        const serviceClient = createSupabaseServiceClient();
        const { data: prizeConfig } = await serviceClient
          .from("prize_configurations")
          .select("lucky_number")
          .eq("raffle_slug", raffle.slug ?? slug)
          .order("prize_order", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (typeof prizeConfig?.lucky_number === "number") {
          luckyNumber = prizeConfig.lucky_number;
        }
      } catch {
        // ignore: optional
      }
    }

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
            luckyNumber: luckyNumber ?? undefined,
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
