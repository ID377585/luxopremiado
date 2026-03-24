import { getVipNetworkMetrics } from "@/lib/dashboard";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  VIP_PRESTIGE_LEVELS,
  VIP_TIER_LABELS,
  calculateVipXpProgress,
  getVipPrestigeBenefit,
  getVipXpLevel,
  normalizeMoneyToXp,
  resolveVipAccess,
  type VipTier,
} from "@/lib/vip";

export interface VipProgramSettings {
  cashbackEnabled: boolean;
  discountsEnabled: boolean;
  levelRewardsEnabled: boolean;
  birthdayBonusEnabled: boolean;
  reloadBonusEnabled: boolean;
  rakebackEnabled: boolean;
  exclusivePerksEnabled: boolean;
  defaultReloadBonusPercent: number;
  defaultBirthdayBonusCents: number;
  vipHostChannel: string | null;
  eventNotes: string | null;
  benefitOverrides: Record<string, unknown>;
}

export interface VipWalletSnapshot {
  cashbackBalanceCents: number;
  bonusBalanceCents: number;
  rakebackBalanceCents: number;
  freeSpinsBalance: number;
  totalEarnedCents: number;
  totalRedeemedCents: number;
  totalXpFromOrders: number;
  lastLevelId: string | null;
  recentEntries: Array<{
    id: string;
    eventType: string;
    sourceKey: string;
    amountCents: number;
    freeSpinsDelta: number;
    xpDelta: number;
    metadata: Record<string, unknown>;
    createdAt: string;
  }>;
}

export interface VipWithdrawalSnapshot {
  availableBalanceCents: number;
  pendingAmountCents: number;
  maxWithdrawalCents: number;
  levelLabel: string;
  requests: Array<{
    id: string;
    amountCents: number;
    status: string;
    destinationPixKey: string | null;
    requestedLevelLabel: string | null;
    provider: string | null;
    providerStatus: string | null;
    createdAt: string;
  }>;
}

export interface VipOperationItem {
  id: string;
  category: "host" | "event" | "tournament" | "odds";
  title: string;
  description: string | null;
  status: "scheduled" | "active" | "completed" | "canceled";
  targetTier: VipTier | null;
  targetLevelId: string | null;
  userId: string | null;
  hostContact: string | null;
  startsAt: string | null;
  endsAt: string | null;
  metadata: Record<string, unknown>;
}

export interface VipOrderBenefitApplication {
  orderId: string;
  originalAmountCents: number;
  amountCents: number;
  discountCents: number;
  cashbackCents: number;
  rakebackCents: number;
  xpEarned: number;
  benefitLevelId: string;
  benefitLabel: string;
}

const DEFAULT_VIP_PROGRAM_SETTINGS: VipProgramSettings = {
  cashbackEnabled: true,
  discountsEnabled: true,
  levelRewardsEnabled: true,
  birthdayBonusEnabled: true,
  reloadBonusEnabled: true,
  rakebackEnabled: true,
  exclusivePerksEnabled: true,
  defaultReloadBonusPercent: 15,
  defaultBirthdayBonusCents: 5000,
  vipHostChannel: "vip@bigodedasrifas.com",
  eventNotes: "Eventos e experiências VIP são liberados pelo admin conforme a evolução do programa.",
  benefitOverrides: {},
};

/* ================================
   SETTINGS
================================ */

function mapSettingsRow(row: Record<string, unknown> | null | undefined): VipProgramSettings {
  return {
    cashbackEnabled: row?.cashback_enabled !== false,
    discountsEnabled: row?.discounts_enabled !== false,
    levelRewardsEnabled: row?.level_rewards_enabled !== false,
    birthdayBonusEnabled: row?.birthday_bonus_enabled !== false,
    reloadBonusEnabled: row?.reload_bonus_enabled !== false,
    rakebackEnabled: row?.rakeback_enabled !== false,
    exclusivePerksEnabled: row?.exclusive_perks_enabled !== false,
    defaultReloadBonusPercent: Math.max(
      0,
      Number(row?.default_reload_bonus_percent ?? DEFAULT_VIP_PROGRAM_SETTINGS.defaultReloadBonusPercent),
    ),
    defaultBirthdayBonusCents: Math.max(
      0,
      Number(row?.default_birthday_bonus_cents ?? DEFAULT_VIP_PROGRAM_SETTINGS.defaultBirthdayBonusCents),
    ),
    vipHostChannel:
      typeof row?.vip_host_channel === "string" && row.vip_host_channel.trim()
        ? row.vip_host_channel.trim()
        : DEFAULT_VIP_PROGRAM_SETTINGS.vipHostChannel,
    eventNotes:
      typeof row?.event_notes === "string" && row.event_notes.trim()
        ? row.event_notes.trim()
        : null,
    benefitOverrides:
      row?.benefit_overrides && typeof row.benefit_overrides === "object"
        ? (row.benefit_overrides as Record<string, unknown>)
        : {},
  };
}

export async function getVipProgramSettings(): Promise<VipProgramSettings> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data } = await supabase
      .from("vip_program_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    return data ? mapSettingsRow(data) : DEFAULT_VIP_PROGRAM_SETTINGS;
  } catch {
    return DEFAULT_VIP_PROGRAM_SETTINGS;
  }
}

/* ================================
   WALLET
================================ */

async function ensureVipWallet(userId: string) {
  const supabase = createSupabaseServiceClient();
  await supabase.from("vip_wallets").upsert(
    { user_id: userId, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
}

export async function getVipWalletSnapshot(userId: string): Promise<VipWalletSnapshot> {
  try {
    await ensureVipWallet(userId);

    const supabase = createSupabaseServiceClient();

    const [{ data: wallet }, { data: entries }] = await Promise.all([
      supabase.from("vip_wallets").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("vip_ledger_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return {
      cashbackBalanceCents: Number(wallet?.cashback_balance_cents ?? 0),
      bonusBalanceCents: Number(wallet?.bonus_balance_cents ?? 0),
      rakebackBalanceCents: Number(wallet?.rakeback_balance_cents ?? 0),
      freeSpinsBalance: Number(wallet?.free_spins_balance ?? 0),
      totalEarnedCents: Number(wallet?.total_earned_cents ?? 0),
      totalRedeemedCents: Number(wallet?.total_redeemed_cents ?? 0),
      totalXpFromOrders: Number(wallet?.total_xp_from_orders ?? 0),
      lastLevelId: wallet?.last_level_id ?? null,
      recentEntries:
        entries?.map((row) => ({
          id: String(row.id),
          eventType: row.event_type,
          sourceKey: row.source_key,
          amountCents: Number(row.amount_cents ?? 0),
          freeSpinsDelta: Number(row.free_spins_delta ?? 0),
          xpDelta: Number(row.xp_delta ?? 0),
          metadata: row.metadata ?? {},
          createdAt: row.created_at,
        })) ?? [],
    };
  } catch {
    return {
      cashbackBalanceCents: 0,
      bonusBalanceCents: 0,
      rakebackBalanceCents: 0,
      freeSpinsBalance: 0,
      totalEarnedCents: 0,
      totalRedeemedCents: 0,
      totalXpFromOrders: 0,
      lastLevelId: null,
      recentEntries: [],
    };
  }
}

/* ================================
   BENEFÍCIOS EM PEDIDO
================================ */

export async function applyVipBenefitsToOrder(params: {
  orderId: string;
  userId: string;
}): Promise<VipOrderBenefitApplication | null> {
  const supabase = createSupabaseServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.orderId)
    .maybeSingle();

  if (!order || order.status !== "pending") return null;

  const state = resolveVipAccess({
    affiliateActive: true,
    manualOverride: false,
    manualTier: "none",
    persistedPoints: 0,
    raffleSpendCents: 0,
    auctionSpendCents: 0,
    approvedCommissionCents: 0,
    referredOrders: 0,
  });

  const original = Number(order.amount_cents ?? 0);
  const discount = Math.round(original * 0.05);
  const finalAmount = original - discount;

  const xp = normalizeMoneyToXp(finalAmount);

  await supabase
    .from("orders")
    .update({
      amount_cents: finalAmount,
      vip_discount_cents: discount,
      vip_xp_earned: xp,
    })
    .eq("id", params.orderId);

  return {
    orderId: params.orderId,
    originalAmountCents: original,
    amountCents: finalAmount,
    discountCents: discount,
    cashbackCents: 0,
    rakebackCents: 0,
    xpEarned: xp,
    benefitLevelId: "basic",
    benefitLabel: "VIP",
  };
}