import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildLandingPathForSlug, getDefaultRaffleSlug, normalizeRaffleSlug } from "@/lib/raffle-slug";

const STATUS_PRIORITY = ["active", "draft", "closed", "drawn"] as const;

interface RaffleSlugRow {
  slug: string | null;
  status: string | null;
}

function pickPreferredSlug(rows: RaffleSlugRow[] | null | undefined): string | null {
  if (!rows?.length) {
    return null;
  }

  for (const status of STATUS_PRIORITY) {
    const match = rows.find((row) => row.status === status && normalizeRaffleSlug(row.slug));
    if (match?.slug) {
      return match.slug;
    }
  }

  const firstValid = rows.find((row) => normalizeRaffleSlug(row.slug));
  return firstValid?.slug ?? null;
}

export async function resolveAvailableRaffleSlug(preferredSlug?: string | null): Promise<string> {
  const normalizedPreferred = normalizeRaffleSlug(preferredSlug) ?? getDefaultRaffleSlug();

  if (!hasSupabaseEnv()) {
    return normalizedPreferred;
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data: preferred } = await supabase
      .from("raffles")
      .select("slug, status")
      .eq("slug", normalizedPreferred)
      .limit(1)
      .maybeSingle();

    if (preferred?.slug && normalizeRaffleSlug(preferred.slug)) {
      return preferred.slug;
    }

    const { data: candidates } = await supabase
      .from("raffles")
      .select("slug, status")
      .in("status", [...STATUS_PRIORITY])
      .order("created_at", { ascending: false })
      .limit(24);

    return pickPreferredSlug(candidates) ?? normalizedPreferred;
  } catch {
    return normalizedPreferred;
  }
}

export async function getDynamicLandingPath(anchor?: string, preferredSlug?: string | null): Promise<string> {
  const resolvedSlug = await resolveAvailableRaffleSlug(preferredSlug);
  return buildLandingPathForSlug(resolvedSlug, anchor);
}
