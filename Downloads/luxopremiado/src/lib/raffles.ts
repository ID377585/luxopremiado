import { fallbackRaffleData } from "@/lib/landing-data";
import { formatBrlFromCents } from "@/lib/format";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

function buildPackagesForUnitPrice(unitPriceCents: number) {
  return fallbackRaffleData.packages.map((pack) => ({
    ...pack,
    totalCents: unitPriceCents * pack.quantity,
  }));
}

export async function getRaffleLandingData(slug: string): Promise<RaffleLandingData> {
  if (!hasSupabaseEnv()) {
    return createFallback(slug);
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data: raffle } = await supabase
      .from("raffles")
      .select("id, title, description, cover_image_url, price_cents, draw_date, max_numbers_per_user, total_numbers")
      .eq("slug", slug)
      .maybeSingle();

    if (!raffle) {
      return createFallback(slug);
    }

    const [imagesResult, numbersResult, socialProofResult, faqResult, transparencyResult, rankingResult, soldCountResult, reservedCountResult] =
      await Promise.all([
      supabase
        .from("raffle_images")
        .select("url")
        .eq("raffle_id", raffle.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("v_raffle_numbers_public")
        .select("number, status")
        .eq("raffle_id", raffle.id)
        .order("number", { ascending: true })
        .limit(200),
      supabase.from("social_proof").select("title, content").eq("raffle_id", raffle.id).limit(8),
      supabase
        .from("faq")
        .select("question, answer")
        .or(`raffle_id.eq.${raffle.id},raffle_id.is.null`)
        .order("sort_order", { ascending: true })
        .limit(8),
      supabase
        .from("transparency")
        .select("draw_method, organizer_name, organizer_doc, contact, rules")
        .eq("raffle_id", raffle.id)
        .maybeSingle(),
      supabase.rpc("get_raffle_buyer_ranking", {
        p_raffle_id: raffle.id,
        p_limit: 10,
      }),
      supabase.from("raffle_numbers").select("id", { count: "exact", head: true }).eq("raffle_id", raffle.id).eq("status", "sold"),
      supabase
        .from("raffle_numbers")
        .select("id", { count: "exact", head: true })
        .eq("raffle_id", raffle.id)
        .eq("status", "reserved"),
    ]);

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

    return {
      ...fallbackRaffleData,
      raffleId: String(raffle.id),
      slug,
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
      packages: buildPackagesForUnitPrice(unitPriceCents),
      stats: {
        availableNumbers,
        reservedNumbers,
        soldNumbers,
        averagePerUser: fallbackRaffleData.stats.averagePerUser,
      },
      socialProof:
        socialProofResult.data?.length
          ? socialProofResult.data.map((item) => ({
              title: item.title ?? "Depoimento",
              content: item.content ?? "",
              author: "Participante",
            }))
          : fallbackRaffleData.socialProof,
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
  } catch {
    return createFallback(slug);
  }
}
