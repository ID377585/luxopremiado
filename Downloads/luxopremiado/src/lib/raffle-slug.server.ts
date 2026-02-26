import type { SupabaseClient } from "@supabase/supabase-js";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
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

async function lookupSlug(
  client: SupabaseClient,
  preferredSlug: string,
): Promise<string | null> {
  const { data: preferred } = await client
    .from("raffles")
    .select("slug, status")
    .eq("slug", preferredSlug)
    .limit(1)
    .maybeSingle();

  if (preferred?.slug && normalizeRaffleSlug(preferred.slug)) {
    return preferred.slug;
  }

  const { data: candidates } = await client
    .from("raffles")
    .select("slug, status")
    .in("status", [...STATUS_PRIORITY])
    .order("created_at", { ascending: false })
    .limit(24);

  return pickPreferredSlug(candidates);
}

export async function resolveAvailableRaffleSlug(preferredSlug?: string | null): Promise<string> {
  const normalizedPreferred = normalizeRaffleSlug(preferredSlug) ?? getDefaultRaffleSlug();

  if (!hasSupabaseEnv()) {
    return normalizedPreferred;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const slugFromServer = await lookupSlug(supabase, normalizedPreferred);
    if (slugFromServer) {
      return slugFromServer;
    }

    try {
      const serviceClient = createSupabaseServiceClient();
      const slugFromService = await lookupSlug(serviceClient, normalizedPreferred);
      if (slugFromService) {
        return slugFromService;
      }
    } catch {
      // noop: fallback handled below
    }

    return normalizedPreferred;
  } catch {
    return normalizedPreferred;
  }
}

export async function getDynamicLandingPath(anchor?: string, preferredSlug?: string | null): Promise<string> {
  const resolvedSlug = await resolveAvailableRaffleSlug(preferredSlug);
  return buildLandingPathForSlug(resolvedSlug, anchor);
}
