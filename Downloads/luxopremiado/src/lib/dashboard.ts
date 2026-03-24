import { hasSupabaseEnv } from "@/lib/env";
import { resolveAvailableRaffleSlug } from "@/lib/raffle-slug.server";
import { hasAdminEmailAccess } from "@/lib/session";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  VIP_TIER_LABELS,
  calculateVipPointBreakdown,
  calculateVipXpProgress,
  resolveVipAccess,
  type VipPrestigeLevel,
  type VipTier,
} from "@/lib/vip";

export interface DashboardSummary {
  pendingOrders: number;
  paidOrders: number;
  totalNumbers: number;
}

export interface DashboardOrder {
  id: string;
  status: string;
  amount_cents: number;
  created_at: string;
}

export interface DashboardProfile {
  name: string | null;
  phone: string | null;
  role: string;
  avatar_url?: string | null;
  address_line?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_district?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_country?: string | null;
  address_zip?: string | null;
  cpf?: string | null;
  bank_name?: string | null;
  bank_agency?: string | null;
  bank_account?: string | null;
  bank_pix_key?: string | null;
  birth_date?: string | null;
  vip_tier?: VipTier;
  vip_points?: number;
  vip_manual_override?: boolean;
  vip_unlocked_at?: string | null;
  vip_notes?: string | null;
}

export interface DashboardAffiliate {
  code: string;
  commission_bps: number;
  is_active: boolean;
  approved_commission_cents: number;
  total_referred_orders: number;
}

export interface DashboardVipStatus {
  access: boolean;
  effective_tier: VipTier;
  effective_label: string;
  profile_tier: VipTier;
  points: number;
  is_affiliate: boolean;
  affiliate_code: string | null;
  manual_override: boolean;
  unlocked_at: string | null;
  locked_reason: string | null;
  progress_percent: number;
  remaining_points: number;
  next_tier: Exclude<VipTier, "none"> | null;
  next_tier_label: string | null;
  next_tier_min_points: number | null;
  metrics: {
    raffle_spend_cents: number;
    auction_spend_cents: number;
    network_investment_cents: number;
    approved_commission_cents: number;
    referred_orders: number;
    qualified_partners_for_vip: number;
    qualified_partners_for_elite: number;
  };
  point_breakdown: {
    raffle_points: number;
    auction_points: number;
    network_points: number;
    automatic_points: number;
    manual_bonus_points: number;
  };
  xp: {
    total_xp: number;
    current_level: VipPrestigeLevel;
    next_level: VipPrestigeLevel | null;
    progress_percent: number;
    remaining_xp: number;
  };
}

interface VipNetworkMetrics {
  partnerInvestmentCents: number;
  referredPartnerSpendCents: number[];
  approvedCommissionCents: number;
  referredOrders: number;
  qualifiedPartnersForVip: number;
  qualifiedPartnersForElite: number;
}

export async function getVipNetworkMetrics(userId: string): Promise<VipNetworkMetrics> {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      partnerInvestmentCents: 0,
      referredPartnerSpendCents: [],
      approvedCommissionCents: 0,
      referredOrders: 0,
      qualifiedPartnersForVip: 0,
      qualifiedPartnersForElite: 0,
    };
  }

  const supabase = createSupabaseServiceClient();
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!affiliate?.id) {
    return {
      partnerInvestmentCents: 0,
      referredPartnerSpendCents: [],
      approvedCommissionCents: 0,
      referredOrders: 0,
      qualifiedPartnersForVip: 0,
      qualifiedPartnersForElite: 0,
    };
  }

  const { data } = await supabase
    .from("order_affiliates")
    .select("status, commission_cents, order:orders!order_affiliates_order_id_fkey(user_id, amount_cents, status)")
    .eq("affiliate_id", affiliate.id)
    .neq("status", "canceled");

  const rows =
    (data as Array<{
      status: string | null;
      commission_cents: number | null;
      order: { user_id: string | null; amount_cents: number | null; status: string | null } | null;
    }> | null) ?? [];

  const approvedCommissionCents = rows
    .filter((row) => row.status === "approved" || row.status === "paid")
    .reduce((sum, row) => sum + Number(row.commission_cents ?? 0), 0);

  const partnerSpendByUser = new Map<string, number>();

  for (const row of rows) {
    const order = row.order;
    if (!order?.user_id || order.status !== "paid") {
      continue;
    }

    partnerSpendByUser.set(order.user_id, (partnerSpendByUser.get(order.user_id) ?? 0) + Number(order.amount_cents ?? 0));
  }

  const partnerUserIds = [...partnerSpendByUser.keys()];
  if (partnerUserIds.length === 0) {
    return {
      partnerInvestmentCents: 0,
      referredPartnerSpendCents: [],
      approvedCommissionCents,
      referredOrders: rows.filter((row) => row.order?.status === "paid").length,
      qualifiedPartnersForVip: 0,
      qualifiedPartnersForElite: 0,
    };
  }

  const { data: partnerAffiliates } = await supabase
    .from("affiliates")
    .select("user_id, is_active")
    .in("user_id", partnerUserIds);

  const activeAffiliateUsers = new Set(
    (partnerAffiliates ?? [])
      .filter((row) => Boolean(row.is_active) && typeof row.user_id === "string")
      .map((row) => String(row.user_id)),
  );
  const referredPartnerSpendCents = partnerUserIds
    .filter((partnerUserId) => activeAffiliateUsers.has(partnerUserId))
    .map((partnerUserId) => partnerSpendByUser.get(partnerUserId) ?? 0);

  return {
    partnerInvestmentCents: referredPartnerSpendCents.reduce((sum, value) => sum + value, 0),
    referredPartnerSpendCents,
    approvedCommissionCents,
    referredOrders: rows.filter((row) => row.order?.status === "paid").length,
    qualifiedPartnersForVip: referredPartnerSpendCents.filter((value) => value >= 200000).length,
    qualifiedPartnersForElite: referredPartnerSpendCents.filter((value) => value >= 500000).length,
  };
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  if (!hasSupabaseEnv()) {
    return {
      pendingOrders: 1,
      paidOrders: 3,
      totalNumbers: 17,
    };
  }

  const supabase = await createSupabaseServerClient();

  const [pendingResult, paidResult, numberResult] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "paid"),
    supabase
      .from("raffle_numbers")
      .select("id", { count: "exact", head: true })
      .eq("sold_to", userId)
      .eq("status", "sold"),
  ]);

  return {
    pendingOrders: pendingResult.count ?? 0,
    paidOrders: paidResult.count ?? 0,
    totalNumbers: numberResult.count ?? 0,
  };
}

export async function getMyOrders(userId: string): Promise<DashboardOrder[]> {
  if (!hasSupabaseEnv()) {
    return [
      {
        id: "pedido-demo-001",
        status: "paid",
        amount_cents: 9950,
        created_at: new Date().toISOString(),
      },
      {
        id: "pedido-demo-002",
        status: "pending",
        amount_cents: 3980,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("orders")
    .select("id, status, amount_cents, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

export async function getMyPayments(userId: string): Promise<
  {
    id: string;
    provider: string;
    status: string;
    created_at: string;
    order_id: string;
    order: { amount_cents: number } | null;
  }[]
> {
  if (!hasSupabaseEnv()) {
    return [
      {
        id: "pay-demo-001",
        provider: "mercadopago",
        status: "paid",
        created_at: new Date().toISOString(),
        order_id: "order-demo-001",
        order: { amount_cents: 9950 },
      },
    ];
  }

  const supabase = await createSupabaseServerClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id, provider, status, created_at, order_id")
    .order("created_at", { ascending: false })
    .limit(20);

  if (!payments?.length) {
    return [];
  }

  const orderIds = payments.map((payment) => payment.order_id).filter((value): value is string => Boolean(value));

  const { data: orders } = await supabase
    .from("orders")
    .select("id, amount_cents")
    .eq("user_id", userId)
    .in("id", orderIds);

  const orderMap = new Map(orders?.map((order) => [order.id, order.amount_cents]) ?? []);

  return (
    payments.map((payment) => ({
      id: payment.id,
      provider: payment.provider,
      status: payment.status,
      created_at: payment.created_at,
      order_id: payment.order_id,
      order: orderMap.has(payment.order_id) ? { amount_cents: orderMap.get(payment.order_id)! } : null,
    }))
  );
}

export async function getMyProfile(userId: string): Promise<DashboardProfile> {
  if (!hasSupabaseEnv()) {
    return {
      name: "Usuário demo",
      phone: "(11) 99999-9999",
      role: "user",
      avatar_url: null,
      vip_tier: "none",
      vip_points: 0,
      vip_manual_override: false,
      vip_unlocked_at: null,
      vip_notes: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "name, phone, role, avatar_url, address_line, address_number, address_complement, address_district, address_city, address_state, address_country, address_zip, cpf, bank_name, bank_agency, bank_account, bank_pix_key, birth_date, vip_tier, vip_points, vip_manual_override, vip_unlocked_at, vip_notes",
    )
    .eq("id", userId)
    .maybeSingle();

  return {
    name: data?.name ?? null,
    phone: data?.phone ?? null,
    role: data?.role ?? "user",
    avatar_url: data?.avatar_url ?? null,
    address_line: data?.address_line ?? null,
    address_number: data?.address_number ?? null,
    address_complement: data?.address_complement ?? null,
    address_district: data?.address_district ?? null,
    address_city: data?.address_city ?? null,
    address_state: data?.address_state ?? null,
    address_country: data?.address_country ?? null,
    address_zip: data?.address_zip ?? null,
    cpf: data?.cpf ?? null,
    bank_name: data?.bank_name ?? null,
    bank_agency: data?.bank_agency ?? null,
    bank_account: data?.bank_account ?? null,
    bank_pix_key: data?.bank_pix_key ?? null,
    birth_date: data?.birth_date ?? null,
    vip_tier: (data?.vip_tier as VipTier | null) ?? "none",
    vip_points: Number(data?.vip_points ?? 0),
    vip_manual_override: Boolean(data?.vip_manual_override),
    vip_unlocked_at: data?.vip_unlocked_at ?? null,
    vip_notes: data?.vip_notes ?? null,
  };
}

export async function getMySoldNumbers(
  userId: string,
  raffleSlug?: string | null,
): Promise<Array<{ number: number; prizeOrder: number | null; prizeLabel: string }>> {
  if (!hasSupabaseEnv()) {
    return [
      { number: 10, prizeOrder: 1, prizeLabel: "1º Prêmio" },
      { number: 25, prizeOrder: 1, prizeLabel: "1º Prêmio" },
      { number: 30, prizeOrder: 2, prizeLabel: "2º Prêmio" },
    ];
  }

  const supabase = await createSupabaseServerClient();
  const effectiveSlug = raffleSlug ?? (await resolveAvailableRaffleSlug(null));

  const { data: raffleRow } = await supabase
    .from("raffles")
    .select("id")
    .eq("slug", effectiveSlug)
    .maybeSingle();

  const raffleId = raffleRow?.id as string | undefined;

  const { data: prizeConfigs } = await supabase
    .from("prize_configurations")
    .select("prize_order, prize_label, total_numbers")
    .eq("raffle_slug", effectiveSlug)
    .order("prize_order", { ascending: true });

  const ranges = (() => {
    if (!prizeConfigs?.length) return [];
    const totalPool = prizeConfigs.reduce(
      (sum, p) => (typeof p.total_numbers === "number" ? sum + Number(p.total_numbers) : sum),
      0,
    );
    let cursor = 1;
    return prizeConfigs.map((p) => {
      const size =
        typeof p.total_numbers === "number" && p.total_numbers > 0
          ? Number(p.total_numbers)
          : Math.max(Math.floor(totalPool / prizeConfigs.length), 1);
      const start = cursor;
      const end = cursor + size - 1;
      cursor = end + 1;
      return { order: Number(p.prize_order ?? 0), label: p.prize_label as string, start, end };
    });
  })();

  const { data } = await supabase
    .from("raffle_numbers")
    .select("number, raffle_id")
    .eq("sold_to", userId)
    .eq("status", "sold")
    .order("number", { ascending: true })
    .limit(500);

  const filteredData = raffleId ? (data ?? []).filter((row) => row.raffle_id === raffleId) : data ?? [];

  const results: Array<{ number: number; prizeOrder: number | null; prizeLabel: string }> = [];

  for (const item of filteredData) {
    const num = Number(item.number ?? 0);
    let prizeOrder: number | null = null;
    let prizeLabel = "Prêmio";

    if (!prizeOrder && ranges.length) {
      const range = ranges.find((r) => num >= r.start && num <= r.end);
      if (range) {
        prizeOrder = range.order;
        prizeLabel = range.label ?? `Prêmio ${range.order}`;
      }
    } else if (prizeOrder) {
      const match = prizeConfigs?.find((p) => p.prize_order === prizeOrder);
      prizeLabel = (match?.prize_label as string) ?? `Prêmio ${prizeOrder}`;
    }

    results.push({
      number: num,
      prizeOrder,
      prizeLabel,
    });
  }

  return results;
}

export async function getMyAffiliate(userId: string): Promise<DashboardAffiliate | null> {
  if (!hasSupabaseEnv()) {
    return {
      code: "lpdemo123",
      commission_bps: 500,
      is_active: true,
      approved_commission_cents: 2490,
      total_referred_orders: 3,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, code, commission_bps, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (!affiliate) {
    return null;
  }

  const { data: referrals } = await supabase
    .from("order_affiliates")
    .select("commission_cents, status")
    .eq("affiliate_id", affiliate.id);

  const approvedCommissionCents =
    referrals
      ?.filter((row) => row.status === "approved" || row.status === "paid")
      .reduce((acc, row) => acc + Number(row.commission_cents ?? 0), 0) ?? 0;

  return {
    code: String(affiliate.code),
    commission_bps: Number(affiliate.commission_bps ?? 0),
    is_active: Boolean(affiliate.is_active),
    approved_commission_cents: approvedCommissionCents,
    total_referred_orders: referrals?.length ?? 0,
  };
}

export async function getMyVipStatus(userId: string, email?: string | null): Promise<DashboardVipStatus> {
  if (!hasSupabaseEnv()) {
    const ownSpendCents = 250000 + 200000;
    const xp = calculateVipXpProgress(ownSpendCents);

    return {
      access: false,
      effective_tier: "none",
      effective_label: "Quartzo",
      profile_tier: "none",
      points: 4500,
      is_affiliate: false,
      affiliate_code: null,
      manual_override: false,
      unlocked_at: null,
      locked_reason: "Ative seu perfil de afiliado para começar a subir na trilha VIP.",
      progress_percent: 56.25,
      remaining_points: 3500,
      next_tier: "vip",
      next_tier_label: "VIP",
      next_tier_min_points: 8000,
      metrics: {
        raffle_spend_cents: 250000,
        auction_spend_cents: 200000,
        network_investment_cents: 400000,
        approved_commission_cents: 0,
        referred_orders: 3,
        qualified_partners_for_vip: 2,
        qualified_partners_for_elite: 0,
      },
      point_breakdown: {
        raffle_points: 2500,
        auction_points: 2000,
        network_points: 4000,
        automatic_points: 8500,
        manual_bonus_points: 0,
      },
      xp: {
        total_xp: xp.totalXp,
        current_level: xp.currentLevel,
        next_level: xp.nextLevel,
        progress_percent: xp.progressPercent,
        remaining_xp: xp.remainingXp,
      },
    };
  }

  const supabase = await createSupabaseServerClient();

  const [profileResult, affiliate, ordersResult, auctionWinsResult, networkMetrics] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, vip_tier, vip_points, vip_manual_override, vip_unlocked_at")
      .eq("id", userId)
      .maybeSingle(),
    getMyAffiliate(userId),
    supabase.from("orders").select("amount_cents").eq("user_id", userId).eq("status", "paid"),
    supabase
      .from("auctions")
      .select("winner_bid_cents")
      .eq("winner_user_id", userId)
      .not("winner_bid_cents", "is", null),
    getVipNetworkMetrics(userId),
  ]);

  const raffleSpendCents =
    ordersResult.data?.reduce((sum, row) => sum + Number(row.amount_cents ?? 0), 0) ?? 0;
  const auctionSpendCents =
    auctionWinsResult.data?.reduce((sum, row) => sum + Number(row.winner_bid_cents ?? 0), 0) ?? 0;
  const profileTier = (profileResult.data?.vip_tier as VipTier | null) ?? "none";
  const isAdmin = hasAdminEmailAccess(email) || profileResult.data?.role === "admin";
  const manualOverride = Boolean(profileResult.data?.vip_manual_override);
  const unlockedAt = profileResult.data?.vip_unlocked_at ?? null;
  const ownSpendCents = raffleSpendCents + auctionSpendCents;
  const pointBreakdown = calculateVipPointBreakdown({
    raffleSpendCents,
    auctionSpendCents,
    partnerInvestmentCents: networkMetrics.partnerInvestmentCents,
  });
  const xp = calculateVipXpProgress(ownSpendCents);

  if (isAdmin) {
    const points = Math.max(Number(profileResult.data?.vip_points ?? 0), pointBreakdown.automaticPoints);

    return {
      access: true,
      effective_tier: "elite",
      effective_label: `${VIP_TIER_LABELS.elite} Admin`,
      profile_tier: profileTier === "none" ? "elite" : profileTier,
      points,
      is_affiliate: true,
      affiliate_code: affiliate?.code ?? "admin",
      manual_override: true,
      unlocked_at: unlockedAt,
      locked_reason: null,
      progress_percent: 100,
      remaining_points: 0,
      next_tier: null,
      next_tier_label: null,
      next_tier_min_points: null,
      metrics: {
        raffle_spend_cents: raffleSpendCents,
        auction_spend_cents: auctionSpendCents,
        network_investment_cents: networkMetrics.partnerInvestmentCents,
        approved_commission_cents: networkMetrics.approvedCommissionCents,
        referred_orders: networkMetrics.referredOrders,
        qualified_partners_for_vip: networkMetrics.qualifiedPartnersForVip,
        qualified_partners_for_elite: networkMetrics.qualifiedPartnersForElite,
      },
      point_breakdown: {
        raffle_points: pointBreakdown.rafflePoints,
        auction_points: pointBreakdown.auctionPoints,
        network_points: pointBreakdown.networkPoints,
        automatic_points: pointBreakdown.automaticPoints,
        manual_bonus_points: Math.max(0, points - pointBreakdown.automaticPoints),
      },
      xp: {
        total_xp: xp.totalXp,
        current_level: xp.currentLevel,
        next_level: xp.nextLevel,
        progress_percent: xp.progressPercent,
        remaining_xp: xp.remainingXp,
      },
    };
  }

  const resolved = resolveVipAccess({
    affiliateActive: Boolean(affiliate?.is_active),
    manualOverride,
    manualTier: profileTier,
    persistedPoints: Number(profileResult.data?.vip_points ?? 0),
    raffleSpendCents,
    auctionSpendCents,
    partnerInvestmentCents: networkMetrics.partnerInvestmentCents,
    referredPartnerSpendCents: networkMetrics.referredPartnerSpendCents,
    approvedCommissionCents: networkMetrics.approvedCommissionCents,
    referredOrders: networkMetrics.referredOrders,
  });
  const manualBonusPoints = Math.max(0, resolved.points - pointBreakdown.automaticPoints);

  return {
    access: resolved.access,
    effective_tier: resolved.effectiveTier,
    effective_label: resolved.effectiveLabel,
    profile_tier: profileTier,
    points: resolved.points,
    is_affiliate: Boolean(affiliate?.is_active),
    affiliate_code: affiliate?.code ?? null,
    manual_override: manualOverride,
    unlocked_at: unlockedAt,
    locked_reason: resolved.lockedReason,
    progress_percent: resolved.progressPercent,
    remaining_points: resolved.remainingPoints,
    next_tier: resolved.nextTier,
    next_tier_label: resolved.nextTierLabel,
    next_tier_min_points: resolved.nextTierMinPoints,
    metrics: {
      raffle_spend_cents: raffleSpendCents,
      auction_spend_cents: auctionSpendCents,
      network_investment_cents: networkMetrics.partnerInvestmentCents,
      approved_commission_cents: networkMetrics.approvedCommissionCents,
      referred_orders: networkMetrics.referredOrders,
      qualified_partners_for_vip: networkMetrics.qualifiedPartnersForVip,
      qualified_partners_for_elite: networkMetrics.qualifiedPartnersForElite,
    },
    point_breakdown: {
      raffle_points: pointBreakdown.rafflePoints,
      auction_points: pointBreakdown.auctionPoints,
      network_points: pointBreakdown.networkPoints,
      automatic_points: pointBreakdown.automaticPoints,
      manual_bonus_points: manualBonusPoints,
    },
    xp: {
      total_xp: xp.totalXp,
      current_level: xp.currentLevel,
      next_level: xp.nextLevel,
      progress_percent: xp.progressPercent,
      remaining_xp: xp.remainingXp,
    },
  };
}

export async function getDefaultAffiliateRaffleSlug(): Promise<string> {
  if (!hasSupabaseEnv()) {
    return "bigode-das-rifas";
  }

  return resolveAvailableRaffleSlug();
}
