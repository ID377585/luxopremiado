import type { SupabaseClient } from "@supabase/supabase-js";

import { buildPackageOffersForUnitPrice, fallbackRaffleData } from "@/lib/landing-data";
import { formatBrlFromCents } from "@/lib/format";
import { isDefaultRaffleSlug, normalizeRaffleSlug } from "@/lib/raffle-slug";
import { canUseDemoFallback, hasSupabaseEnv } from "@/lib/env";
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

interface BuyerRankingRow {
  position: number | string | null;
  participant: string | null;
  total_numbers: number | string | null;
  trend_delta?: number | string | null;
}

function deriveRankingTrend(participant: string, position: number, totalNumbers: number): number {
  const seed = `${participant}-${position}-${totalNumbers}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  const magnitude = (Math.abs(hash) % 3) + 1;
  return hash % 2 === 0 ? magnitude : -magnitude;
}

function mergeFaqItems(items: FaqItem[]): FaqItem[] {
  if (items.length >= 12) {
    return items.slice(0, 12);
  }

  const merged = [...items];
  for (const fallbackItem of fallbackRaffleData.faq) {
    if (merged.length >= 12) {
      break;
    }

    const exists = merged.some(
      (item) => item.question.trim().toLowerCase() === fallbackItem.question.trim().toLowerCase(),
    );
    if (!exists) {
      merged.push(fallbackItem);
    }
  }

  return merged;
}

const fallbackAvatarPool = [
  "/images/social/joao.svg",
  "/images/social/rodrigo.svg",
  "/images/social/leila.svg",
  "/images/social/karina.svg",
  "/images/social/bruna.svg",
  "/images/social/eduardo.svg",
  "/images/social/fernanda.svg",
  "/images/social/rafael.svg",
];

const fallbackWinnerMedia = [
  "/images/winners/winner-1.svg",
  "/images/winners/winner-2.svg",
  "/images/winners/winner-3.svg",
];

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

interface RaffleLookupRow {
  id: string;
  slug: string | null;
  status: string | null;
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number, operation: string): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  const sourcePromise = Promise.resolve(promise);

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`${operation} timeout after ${ms}ms`));
    }, ms);
  });

  return Promise.race([sourcePromise, timeoutPromise]).finally(() => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }) as Promise<T>;
}

export async function getRaffleLandingData(
  slug: string,
  options?: GetRaffleLandingDataOptions,
): Promise<RaffleLandingData> {
  const allowFallback = canUseDemoFallback();
  const allowUnavailableFallback = Boolean(options?.allowUnavailableFallback);
  const shouldResolveToAvailableSlug =
    typeof options?.resolveToAvailableSlug === "boolean"
      ? options.resolveToAvailableSlug
      : isDefaultRaffleSlug(slug);
  const timeoutMs = Number.isFinite(options?.timeoutMs) && Number(options?.timeoutMs) > 0
    ? Number(options?.timeoutMs)
    : 8_000;

  if (!hasSupabaseEnv()) {
    if (allowFallback) {
      return createFallback(slug);
    }

    throw new RaffleDataError("UNAVAILABLE", "Supabase não configurado para carregar a rifa.");
  }

  try {
    const supabase = await createSupabaseServerClient();
    let dataClient = supabase as unknown as SupabaseClient;

    const raffleSelect =
      "id, slug, status, title, description, cover_image_url, price_cents, draw_date, max_numbers_per_user, total_numbers";

    const fetchRaffle = async (client: SupabaseClient, targetSlug: string) =>
      withTimeout(
        client
          .from("raffles")
          .select(raffleSelect)
          .eq("slug", targetSlug)
          .maybeSingle(),
        timeoutMs,
        "raffles.lookup",
      );

    const fetchFallbackCandidates = async (client: SupabaseClient) =>
      withTimeout(
        client
          .from("raffles")
          .select(raffleSelect)
          .in("status", ["active", "draft", "closed", "drawn"])
          .order("created_at", { ascending: false })
          .limit(24),
        timeoutMs,
        "raffles.fallback_lookup",
      );

    let { data: raffle } = await fetchRaffle(dataClient, slug);

    if (!raffle && shouldResolveToAvailableSlug) {
      const { data: candidates } = await fetchFallbackCandidates(dataClient);

      const activeMatch = candidates?.find(
        (item: RaffleLookupRow) => item.status === "active" && normalizeRaffleSlug(item.slug),
      );
      const anyMatch = candidates?.find((item: RaffleLookupRow) => normalizeRaffleSlug(item.slug));
      raffle = activeMatch ?? anyMatch ?? null;
    }

    if (!raffle) {
      try {
        const serviceClient = createSupabaseServiceClient();
        dataClient = serviceClient;

        const serviceLookup = await fetchRaffle(dataClient, slug);
        raffle = serviceLookup.data ?? null;

        if (!raffle && shouldResolveToAvailableSlug) {
          const { data: serviceCandidates } = await fetchFallbackCandidates(dataClient);
          const serviceActive = serviceCandidates?.find(
            (item: RaffleLookupRow) => item.status === "active" && normalizeRaffleSlug(item.slug),
          );
          const serviceAny = serviceCandidates?.find((item: RaffleLookupRow) => normalizeRaffleSlug(item.slug));
          raffle = serviceActive ?? serviceAny ?? null;
        }
      } catch {
        // noop: fallback behavior stays the same.
      }
    }

    if (!raffle) {
      if (allowFallback) {
        return createFallback(slug);
      }

      throw new RaffleDataError("NOT_FOUND", `Rifa "${slug}" não encontrada.`);
    }

    const resolvedSlug = normalizeRaffleSlug(raffle.slug) ?? slug;

    const [imagesResult, numbersResult, socialProofResult, faqResult, transparencyResult, rankingResult, soldCountResult, reservedCountResult] =
      await withTimeout(
        Promise.all([
          dataClient
            .from("raffle_images")
            .select("url")
            .eq("raffle_id", raffle.id)
            .order("sort_order", { ascending: true }),
          dataClient
            .from("v_raffle_numbers_public")
            .select("number, status")
            .eq("raffle_id", raffle.id)
            .order("number", { ascending: true })
            .limit(200),
          dataClient.from("social_proof").select("type, title, content, media_url").eq("raffle_id", raffle.id).limit(20),
          dataClient
            .from("faq")
            .select("question, answer")
            .or(`raffle_id.eq.${raffle.id},raffle_id.is.null`)
            .order("sort_order", { ascending: true })
            .limit(8),
          dataClient
            .from("transparency")
            .select("draw_method, organizer_name, organizer_doc, contact, rules")
            .eq("raffle_id", raffle.id)
            .maybeSingle(),
          dataClient.rpc("get_raffle_buyer_ranking", {
            p_raffle_id: raffle.id,
            p_limit: 10,
          }),
          dataClient.from("raffle_numbers").select("id", { count: "exact", head: true }).eq("raffle_id", raffle.id).eq("status", "sold"),
          dataClient
            .from("raffle_numbers")
            .select("id", { count: "exact", head: true })
            .eq("raffle_id", raffle.id)
            .eq("status", "reserved"),
        ]),
        timeoutMs,
        "raffles.aggregate_queries",
      );

    const drawDateText = raffle.draw_date
      ? new Date(raffle.draw_date).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : fallbackRaffleData.hero.drawDateLabel;
    const soldNumbers = Number(soldCountResult.count ?? fallbackRaffleData.stats.soldNumbers);
    const reservedNumbers = Number(reservedCountResult.count ?? fallbackRaffleData.stats.reservedNumbers);
    const totalNumbers = Number(raffle.total_numbers ?? fallbackRaffleData.totalNumbers);
    const unitPriceCents = Number(raffle.price_cents ?? 1990);
    const availableNumbers = Math.max(0, totalNumbers - soldNumbers - reservedNumbers);
    const socialRows = socialProofResult.data ?? [];
    const testimonialRows = socialRows.filter((item) => item.type !== "winner");
    const winnerRows = socialRows.filter((item) => item.type === "winner");

    return {
      ...fallbackRaffleData,
      raffleId: String(raffle.id),
      slug: resolvedSlug,
      totalNumbers,
      maxNumbersPerUser: Number(raffle.max_numbers_per_user ?? fallbackRaffleData.maxNumbersPerUser),
      hero: {
        ...fallbackRaffleData.hero,
        subtitle: fallbackRaffleData.hero.subtitle,
        drawDateLabel: `Sorteio: ${drawDateText}`,
        priceLabel: `${formatBrlFromCents(unitPriceCents)} por número`,
      },
      prize: {
        ...fallbackRaffleData.prize,
        title: raffle.title,
        description: raffle.description ?? fallbackRaffleData.prize.description,
        images:
          imagesResult.data?.length && imagesResult.data.every((item) => Boolean(item.url))
            ? (imagesResult.data.map((item) => item.url) as string[])
            : fallbackRaffleData.prize.images,
      },
      numberTiles:
        numbersResult.data?.map((item) => ({
          number: Number(item.number),
          status: normalizeNumberStatus(typeof item.status === "string" ? item.status : null),
        })) ??
        fallbackRaffleData.numberTiles,
      buyerRanking:
        rankingResult.data?.length
          ? (rankingResult.data as BuyerRankingRow[]).map((item) => ({
              position: Number(item.position ?? 0),
              participant: String(item.participant ?? "Participante"),
              totalNumbers: Number(item.total_numbers ?? 0),
              trendDelta:
                typeof item.trend_delta !== "undefined" && item.trend_delta !== null
                  ? Number(item.trend_delta)
                  : deriveRankingTrend(
                      String(item.participant ?? "Participante"),
                      Number(item.position ?? 0),
                      Number(item.total_numbers ?? 0),
                    ),
            }))
          : fallbackRaffleData.buyerRanking,
      packages: buildPackageOffersForUnitPrice(unitPriceCents),
      stats: {
        availableNumbers,
        reservedNumbers,
        soldNumbers,
        averagePerUser: fallbackRaffleData.stats.averagePerUser,
      },
      socialProof:
        testimonialRows.length
          ? testimonialRows.slice(0, 8).map((item, index) => ({
              title: item.title ?? "Depoimento",
              content: item.content ?? "",
              author: "Participante verificado",
              avatarUrl: fallbackAvatarPool[index % fallbackAvatarPool.length],
            }))
          : fallbackRaffleData.socialProof,
      winnerWall:
        winnerRows.length
          ? winnerRows.slice(0, 6).map((item, index) => {
              const mediaUrl = item.media_url ?? fallbackWinnerMedia[index % fallbackWinnerMedia.length];
              const lowerMedia = String(mediaUrl).toLowerCase();
              const mediaType = lowerMedia.endsWith(".mp4") || lowerMedia.includes("video") ? "video" : "image";

              return {
                name: item.title?.trim() || `Ganhador ${index + 1}`,
                prize: item.content?.trim() || "Prêmio entregue na campanha",
                city: "Brasil",
                mediaUrl,
                mediaType: mediaType as "image" | "video",
                verifiedAtLabel: "Ganhador verificado",
              };
            })
          : fallbackRaffleData.winnerWall,
      retention: fallbackRaffleData.retention,
      faq:
        faqResult.data?.length
          ? mergeFaqItems(faqResult.data.map((item) => ({ question: item.question, answer: item.answer }))).slice(0, 8)
          : fallbackRaffleData.faq,
      transparency: {
        drawMethod: transparencyResult.data?.draw_method ?? fallbackRaffleData.transparency.drawMethod,
        organizer: transparencyResult.data?.organizer_name ?? fallbackRaffleData.transparency.organizer,
        organizerDoc: transparencyResult.data?.organizer_doc ?? fallbackRaffleData.transparency.organizerDoc,
        contact: transparencyResult.data?.contact ?? fallbackRaffleData.transparency.contact,
        rulesSummary: transparencyResult.data?.rules ?? fallbackRaffleData.transparency.rulesSummary,
      },
    };
  } catch (error) {
    if (error instanceof RaffleDataError && error.code === "NOT_FOUND") {
      throw error;
    }

    if (allowUnavailableFallback) {
      return createFallback(slug);
    }

    if (allowFallback) {
      return createFallback(slug);
    }

    const reason = error instanceof Error ? error.message : "erro inesperado";
    throw new RaffleDataError("UNAVAILABLE", `Falha ao carregar rifa "${slug}": ${reason}`);
  }
}
