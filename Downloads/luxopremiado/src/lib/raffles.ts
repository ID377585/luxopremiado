import type { SupabaseClient } from "@supabase/supabase-js";

import { buildPackageOffersForUnitPrice, fallbackRaffleData } from "@/lib/landing-data";
import { formatBrlFromCents } from "@/lib/format";
import { isDefaultRaffleSlug, normalizeRaffleSlug } from "@/lib/raffle-slug";
import { canUseDemoFallback, hasSupabaseEnv } from "@/lib/env";
import { getCachedRaffleStats, setCachedRaffleStats } from "@/lib/raffle-stats-cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { FaqItem, NumberStatus, RaffleLandingData } from "@/types/raffle";

function createFallback(slug: string): RaffleLandingData {
  return {
    ...fallbackRaffleData,
    slug,
  };
}

function normalizeNumberStatus(status: string | null): NumberStatus {
  if (status === "reserved" || status === "sold") {
    return status;
  }
  return "available";
}

export class RaffleDataError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "UNAVAILABLE",
    message: string,
  ) {
    super(message);
    this.name = "RaffleDataError";
  }
}

interface GetRaffleLandingDataOptions {
  timeoutMs?: number;
  allowUnavailableFallback?: boolean;
  resolveToAvailableSlug?: boolean;
}

function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  operation: string,
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`${operation} timeout after ${ms}ms`));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }) as Promise<T>;
}

export async function getRaffleLandingData(
  slug: string,
  options?: GetRaffleLandingDataOptions,
): Promise<RaffleLandingData> {
  const allowFallback = canUseDemoFallback();
  const timeoutMs = options?.timeoutMs ?? 8000;

  if (!hasSupabaseEnv()) {
    if (allowFallback) return createFallback(slug);
    throw new RaffleDataError("UNAVAILABLE", "Supabase não configurado.");
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data: raffle } = await supabase
      .from("raffles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!raffle) {
      if (allowFallback) return createFallback(slug);
      throw new RaffleDataError("NOT_FOUND", "Rifa não encontrada.");
    }

    const totalNumbers = Number(raffle.total_numbers ?? fallbackRaffleData.totalNumbers);

    const cachedStats = getCachedRaffleStats(String(raffle.id));

    let soldNumbers = cachedStats?.sold ?? 0;
    let reservedNumbers = cachedStats?.reserved ?? 0;

    if (!cachedStats) {
      const [{ count: sold }, { count: reserved }] = await Promise.all([
        supabase
          .from("raffle_numbers")
          .select("id", { count: "exact", head: true })
          .eq("raffle_id", raffle.id)
          .eq("status", "sold"),
        supabase
          .from("raffle_numbers")
          .select("id", { count: "exact", head: true })
          .eq("raffle_id", raffle.id)
          .eq("status", "reserved"),
      ]);

      soldNumbers = Number(sold ?? 0);
      reservedNumbers = Number(reserved ?? 0);

      setCachedRaffleStats({
        raffleId: String(raffle.id),
        total: totalNumbers,
        sold: soldNumbers,
        reserved: reservedNumbers,
      });
    }

    const availableNumbers = Math.max(0, totalNumbers - soldNumbers - reservedNumbers);

    const unitPriceCents = Number(raffle.price_cents ?? 1990);

    return {
      ...fallbackRaffleData,
      raffleId: String(raffle.id),
      slug: normalizeRaffleSlug(raffle.slug) ?? slug,
      totalNumbers,
      hero: {
        ...fallbackRaffleData.hero,
        drawDateLabel: raffle.draw_date
          ? `Sorteio: ${new Date(raffle.draw_date).toLocaleString("pt-BR")}`
          : fallbackRaffleData.hero.drawDateLabel,
        priceLabel: `${formatBrlFromCents(unitPriceCents)} por número`,
      },
      packages: buildPackageOffersForUnitPrice(unitPriceCents),
      stats: {
        availableNumbers,
        reservedNumbers,
        soldNumbers,
        averagePerUser: 0,
      },
    };
  } catch (error) {
    if (allowFallback) return createFallback(slug);

    throw new RaffleDataError(
      "UNAVAILABLE",
      error instanceof Error ? error.message : "Erro inesperado",
    );
  }
}