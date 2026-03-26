import { NextResponse } from "next/server";

import { getVipNetworkMetrics } from "@/lib/dashboard";
import { getSessionUser, isAdminUser } from "@/lib/session";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { resolveVipAccess, type VipTier } from "@/lib/vip";
import { getVipProgramSettings, getVipWalletSnapshot, updateVipProgramSettings } from "@/lib/vip-runtime";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function normalizeVipTier(value: unknown): VipTier {
  return value === "vip" || value === "elite" ? value : "none";
}

async function findAuthUserByEmail(email: string) {
  const supabase = createSupabaseServiceClient();
  const normalized = email.trim().toLowerCase();
  const perPage = 200;
  const maxPages = 1000;

  for (let page = 1; page <= maxPages; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw error;
    }

    const found = data.users.find((user) => user.email?.toLowerCase() === normalized);
    if (found) {
      return found;
    }

    if (data.users.length < perPage) {
      break;
    }
  }

  return null;
}

async function loadVipSnapshot(userId: string, email: string) {
  const supabase = createSupabaseServiceClient();
  const [profileResult, affiliateResult, ordersResult, auctionWinsResult, networkMetrics] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name, vip_tier, vip_points, vip_manual_override, vip_unlocked_at, vip_notes")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("affiliates")
      .select("id, code, is_active")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("orders").select("amount_cents").eq("user_id", userId).eq("status", "paid"),
    supabase
      .from("auctions")
      .select("winner_bid_cents")
      .eq("winner_user_id", userId)
      .not("winner_bid_cents", "is", null),
    getVipNetworkMetrics(userId),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (affiliateResult.error) {
    throw affiliateResult.error;
  }

  if (ordersResult.error) {
    throw ordersResult.error;
  }

  if (auctionWinsResult.error) {
    throw auctionWinsResult.error;
  }

  const raffleSpendCents =
    ordersResult.data?.reduce((sum, row) => sum + Number(row.amount_cents ?? 0), 0) ?? 0;
  const auctionSpendCents =
    auctionWinsResult.data?.reduce((sum, row) => sum + Number(row.winner_bid_cents ?? 0), 0) ?? 0;
  const affiliate = affiliateResult.data;
  const profile = profileResult.data;

  const vip = resolveVipAccess({
    affiliateActive: Boolean(affiliate?.is_active),
    manualOverride: Boolean(profile?.vip_manual_override),
    manualTier: normalizeVipTier(profile?.vip_tier),
    persistedPoints: Number(profile?.vip_points ?? 0),
    raffleSpendCents,
    auctionSpendCents,
    partnerInvestmentCents: networkMetrics.partnerInvestmentCents,
    referredPartnerSpendCents: networkMetrics.referredPartnerSpendCents,
    approvedCommissionCents: networkMetrics.approvedCommissionCents,
    referredOrders: networkMetrics.referredOrders,
  });

  return {
    user: {
      id: userId,
      email,
      name: profile?.name ?? null,
    },
    profile: {
      vip_tier: normalizeVipTier(profile?.vip_tier),
      vip_points: Number(profile?.vip_points ?? 0),
      vip_manual_override: Boolean(profile?.vip_manual_override),
      vip_unlocked_at: profile?.vip_unlocked_at ?? null,
      vip_notes: profile?.vip_notes ?? null,
    },
    affiliate: affiliate
      ? {
          code: affiliate.code,
          is_active: Boolean(affiliate.is_active),
        }
      : null,
    metrics: {
      raffle_spend_cents: raffleSpendCents,
      auction_spend_cents: auctionSpendCents,
      network_investment_cents: networkMetrics.partnerInvestmentCents,
      approved_commission_cents: networkMetrics.approvedCommissionCents,
      referred_orders: networkMetrics.referredOrders,
      qualified_partners_for_vip: networkMetrics.qualifiedPartnersForVip,
      qualified_partners_for_elite: networkMetrics.qualifiedPartnersForElite,
    },
    vip,
    wallet: await getVipWalletSnapshot(userId, 8),
  };
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user || !(await isAdminUser(user.id, user.email))) {
    return forbidden();
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    try {
      const settings = await getVipProgramSettings();
      return NextResponse.json({ settings });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  try {
    const authUser = await findAuthUserByEmail(email);

    if (!authUser?.id || !authUser.email) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const snapshot = await loadVipSnapshot(authUser.id, authUser.email);
    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !(await isAdminUser(user.id, user.email))) {
    return forbidden();
  }

  const body = (await request.json()) as {
    mode?: "profile" | "settings";
    email?: string;
    vipTier?: VipTier;
    vipPoints?: number;
    vipManualOverride?: boolean;
    vipNotes?: string;
    settings?: {
      cashbackEnabled?: boolean;
      discountsEnabled?: boolean;
      levelRewardsEnabled?: boolean;
      birthdayBonusEnabled?: boolean;
      reloadBonusEnabled?: boolean;
      rakebackEnabled?: boolean;
      exclusivePerksEnabled?: boolean;
      defaultReloadBonusPercent?: number;
      defaultBirthdayBonusCents?: number;
      vipHostChannel?: string | null;
      eventNotes?: string | null;
      benefitOverrides?: Record<string, unknown>;
    };
  };

  if (body.mode === "settings") {
    try {
      const settings = await updateVipProgramSettings(body.settings ?? {});
      return NextResponse.json({ settings });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Informe o e-mail do usuário." }, { status: 400 });
  }

  try {
    const authUser = await findAuthUserByEmail(email);

    if (!authUser?.id || !authUser.email) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const supabase = createSupabaseServiceClient();
    const normalizedTier = normalizeVipTier(body.vipTier);
    const manualOverride = Boolean(body.vipManualOverride);
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, vip_unlocked_at")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const storedTier = manualOverride ? normalizedTier : "none";
    const unlockedAt =
      storedTier !== "none" ? existingProfile?.vip_unlocked_at ?? new Date().toISOString() : null;

    const { error } = await supabase.from("profiles").upsert({
      id: authUser.id,
      vip_tier: storedTier,
      vip_points: Math.max(0, Math.round(Number(body.vipPoints ?? 0))),
      vip_manual_override: manualOverride,
      vip_unlocked_at: unlockedAt,
      vip_notes: body.vipNotes?.trim() || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const snapshot = await loadVipSnapshot(authUser.id, authUser.email);
    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}