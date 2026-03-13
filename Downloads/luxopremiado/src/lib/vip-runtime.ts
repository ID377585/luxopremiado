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

function mapSettingsRow(row: Record<string, unknown> | null | undefined): VipProgramSettings {
  return {
    cashbackEnabled: row?.cashback_enabled !== false,
    discountsEnabled: row?.discounts_enabled !== false,
    levelRewardsEnabled: row?.level_rewards_enabled !== false,
    birthdayBonusEnabled: row?.birthday_bonus_enabled !== false,
    reloadBonusEnabled: row?.reload_bonus_enabled !== false,
    rakebackEnabled: row?.rakeback_enabled !== false,
    exclusivePerksEnabled: row?.exclusive_perks_enabled !== false,
    defaultReloadBonusPercent: Math.max(0, Number(row?.default_reload_bonus_percent ?? DEFAULT_VIP_PROGRAM_SETTINGS.defaultReloadBonusPercent)),
    defaultBirthdayBonusCents: Math.max(0, Number(row?.default_birthday_bonus_cents ?? DEFAULT_VIP_PROGRAM_SETTINGS.defaultBirthdayBonusCents)),
    vipHostChannel:
      typeof row?.vip_host_channel === "string" && row.vip_host_channel.trim().length > 0
        ? row.vip_host_channel.trim()
        : DEFAULT_VIP_PROGRAM_SETTINGS.vipHostChannel,
    eventNotes:
      typeof row?.event_notes === "string" && row.event_notes.trim().length > 0 ? row.event_notes.trim() : null,
    benefitOverrides:
      row?.benefit_overrides && typeof row.benefit_overrides === "object"
        ? (row.benefit_overrides as Record<string, unknown>)
        : {},
  };
}

function hasAsaasTransfersEnabled() {
  return Boolean(process.env.ASAAS_API_KEY);
}

function getAsaasApiUrl() {
  return process.env.ASAAS_API_URL ?? "https://api.asaas.com";
}

function normalizePixKeyType(value: string): "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP" {
  const normalized = value.trim();
  const digits = normalized.replace(/\D/g, "");
  if (/^[0-9a-fA-F-]{36}$/.test(normalized)) {
    return "EVP";
  }
  if (normalized.includes("@")) {
    return "EMAIL";
  }
  if (digits.length === 11) {
    return "CPF";
  }
  if (digits.length === 14) {
    return "CNPJ";
  }
  return "PHONE";
}

async function asaasTransferRequest<T>(path: string, init: RequestInit): Promise<T> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    throw new Error("ASAAS_API_KEY ausente para transferências VIP.");
  }

  const response = await fetch(`${getAsaasApiUrl()}${path}`, {
    ...init,
    headers: {
      access_token: apiKey,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = (await response.json()) as T & { errors?: Array<{ description?: string }> };
  if (!response.ok) {
    const reason = data?.errors?.map((item) => item.description).join(", ") || JSON.stringify(data);
    throw new Error(`Asaas transferência: ${reason}`);
  }

  return data;
}

async function createAsaasWithdrawalTransfer(input: {
  requestId: string;
  amountCents: number;
  pixKey: string;
}): Promise<{
  providerReference: string;
  providerStatus: string | null;
  raw: Record<string, unknown>;
}> {
  const pixKeyType = normalizePixKeyType(input.pixKey);
  const transfer = await asaasTransferRequest<{
    id: string;
    status?: string;
    value?: number;
  }>("/v3/transfers", {
    method: "POST",
    body: JSON.stringify({
      operationType: "PIX",
      value: Number((input.amountCents / 100).toFixed(2)),
      pixAddressKey: input.pixKey,
      pixAddressKeyType: pixKeyType,
      description: `Saque VIP ${input.requestId}`,
    }),
  });

  return {
    providerReference: String(transfer.id),
    providerStatus: typeof transfer.status === "string" ? transfer.status : null,
    raw: transfer as unknown as Record<string, unknown>,
  };
}

export async function getVipProgramSettings(): Promise<VipProgramSettings> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("vip_program_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_VIP_PROGRAM_SETTINGS;
    }

    return mapSettingsRow(data as Record<string, unknown>);
  } catch {
    return DEFAULT_VIP_PROGRAM_SETTINGS;
  }
}

export async function updateVipProgramSettings(input: Partial<VipProgramSettings>): Promise<VipProgramSettings> {
  const current = await getVipProgramSettings();
  const next: VipProgramSettings = {
    ...current,
    ...input,
    benefitOverrides: input.benefitOverrides ?? current.benefitOverrides,
  };

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("vip_program_settings").upsert({
    id: "default",
    cashback_enabled: next.cashbackEnabled,
    discounts_enabled: next.discountsEnabled,
    level_rewards_enabled: next.levelRewardsEnabled,
    birthday_bonus_enabled: next.birthdayBonusEnabled,
    reload_bonus_enabled: next.reloadBonusEnabled,
    rakeback_enabled: next.rakebackEnabled,
    exclusive_perks_enabled: next.exclusivePerksEnabled,
    default_reload_bonus_percent: next.defaultReloadBonusPercent,
    default_birthday_bonus_cents: next.defaultBirthdayBonusCents,
    vip_host_channel: next.vipHostChannel,
    event_notes: next.eventNotes,
    benefit_overrides: next.benefitOverrides,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  return next;
}

async function ensureVipWallet(userId: string) {
  const supabase = createSupabaseServiceClient();
  await supabase.from("vip_wallets").upsert(
    {
      user_id: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id", ignoreDuplicates: false },
  );
}

async function incrementVipWallet(
  userId: string,
  delta: {
    cashbackBalanceCents?: number;
    bonusBalanceCents?: number;
    rakebackBalanceCents?: number;
    freeSpinsBalance?: number;
    totalEarnedCents?: number;
    totalRedeemedCents?: number;
    totalXpFromOrders?: number;
    lastLevelId?: string | null;
  },
) {
  const supabase = createSupabaseServiceClient();
  const { data: current } = await supabase
    .from("vip_wallets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const nextRow = {
    user_id: userId,
    cashback_balance_cents: Math.max(0, Number(current?.cashback_balance_cents ?? 0) + Number(delta.cashbackBalanceCents ?? 0)),
    bonus_balance_cents: Math.max(0, Number(current?.bonus_balance_cents ?? 0) + Number(delta.bonusBalanceCents ?? 0)),
    rakeback_balance_cents: Math.max(0, Number(current?.rakeback_balance_cents ?? 0) + Number(delta.rakebackBalanceCents ?? 0)),
    free_spins_balance: Math.max(0, Number(current?.free_spins_balance ?? 0) + Number(delta.freeSpinsBalance ?? 0)),
    total_earned_cents: Math.max(0, Number(current?.total_earned_cents ?? 0) + Number(delta.totalEarnedCents ?? 0)),
    total_redeemed_cents: Math.max(0, Number(current?.total_redeemed_cents ?? 0) + Number(delta.totalRedeemedCents ?? 0)),
    total_xp_from_orders: Math.max(0, Number(current?.total_xp_from_orders ?? 0) + Number(delta.totalXpFromOrders ?? 0)),
    last_level_id: delta.lastLevelId ?? current?.last_level_id ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("vip_wallets").upsert(nextRow, { onConflict: "user_id" });
  if (error) {
    throw error;
  }
}

async function ledgerEntryExists(userId: string, eventType: string, sourceKey: string) {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("vip_ledger_entries")
    .select("id")
    .eq("user_id", userId)
    .eq("event_type", eventType)
    .eq("source_key", sourceKey)
    .maybeSingle();

  return Boolean(data?.id);
}

async function createLedgerEntry(
  userId: string,
  payload: {
    eventType: string;
    sourceKey: string;
    amountCents?: number;
    freeSpinsDelta?: number;
    xpDelta?: number;
    metadata?: Record<string, unknown>;
  },
) {
  const alreadyExists = await ledgerEntryExists(userId, payload.eventType, payload.sourceKey);
  if (alreadyExists) {
    return false;
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("vip_ledger_entries").insert({
    user_id: userId,
    event_type: payload.eventType,
    source_key: payload.sourceKey,
    amount_cents: Math.round(Number(payload.amountCents ?? 0)),
    free_spins_delta: Math.round(Number(payload.freeSpinsDelta ?? 0)),
    xp_delta: Math.round(Number(payload.xpDelta ?? 0)),
    metadata: payload.metadata ?? {},
  });

  if (error) {
    throw error;
  }

  return true;
}

export async function getVipWalletSnapshot(userId: string, limit = 10): Promise<VipWalletSnapshot> {
  try {
    await ensureVipWallet(userId);
    const supabase = createSupabaseServiceClient();
    const [{ data: wallet }, { data: entries }] = await Promise.all([
      supabase.from("vip_wallets").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("vip_ledger_entries")
        .select("id, event_type, source_key, amount_cents, free_spins_delta, xp_delta, metadata, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    return {
      cashbackBalanceCents: Number(wallet?.cashback_balance_cents ?? 0),
      bonusBalanceCents: Number(wallet?.bonus_balance_cents ?? 0),
      rakebackBalanceCents: Number(wallet?.rakeback_balance_cents ?? 0),
      freeSpinsBalance: Number(wallet?.free_spins_balance ?? 0),
      totalEarnedCents: Number(wallet?.total_earned_cents ?? 0),
      totalRedeemedCents: Number(wallet?.total_redeemed_cents ?? 0),
      totalXpFromOrders: Number(wallet?.total_xp_from_orders ?? 0),
      lastLevelId: typeof wallet?.last_level_id === "string" ? wallet.last_level_id : null,
      recentEntries:
        entries?.map((row) => ({
          id: String(row.id),
          eventType: String(row.event_type),
          sourceKey: String(row.source_key),
          amountCents: Number(row.amount_cents ?? 0),
          freeSpinsDelta: Number(row.free_spins_delta ?? 0),
          xpDelta: Number(row.xp_delta ?? 0),
          metadata:
            row.metadata && typeof row.metadata === "object" ? (row.metadata as Record<string, unknown>) : {},
          createdAt: String(row.created_at),
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

async function getVipOperationalState(userId: string) {
  const supabase = createSupabaseServiceClient();
  const [settings, profileResult, affiliateResult, ordersResult, auctionWinsResult, networkMetrics] = await Promise.all([
    getVipProgramSettings(),
    supabase
      .from("profiles")
      .select("vip_tier, vip_points, vip_manual_override")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("affiliates").select("id, is_active, code").eq("user_id", userId).maybeSingle(),
    supabase.from("orders").select("amount_cents").eq("user_id", userId).eq("status", "paid"),
    supabase.from("auctions").select("winner_bid_cents").eq("winner_user_id", userId).not("winner_bid_cents", "is", null),
    getVipNetworkMetrics(userId),
  ]);

  const raffleSpendCents = ordersResult.data?.reduce((sum, row) => sum + Number(row.amount_cents ?? 0), 0) ?? 0;
  const auctionSpendCents = auctionWinsResult.data?.reduce((sum, row) => sum + Number(row.winner_bid_cents ?? 0), 0) ?? 0;
  const vip = resolveVipAccess({
    affiliateActive: Boolean(affiliateResult.data?.is_active),
    manualOverride: Boolean(profileResult.data?.vip_manual_override),
    manualTier: ((profileResult.data?.vip_tier as VipTier | null) ?? "none"),
    persistedPoints: Number(profileResult.data?.vip_points ?? 0),
    raffleSpendCents,
    auctionSpendCents,
    partnerInvestmentCents: networkMetrics.partnerInvestmentCents,
    referredPartnerSpendCents: networkMetrics.referredPartnerSpendCents,
    approvedCommissionCents: networkMetrics.approvedCommissionCents,
    referredOrders: networkMetrics.referredOrders,
  });
  const ownSpendCents = raffleSpendCents + auctionSpendCents;
  const xp = calculateVipXpProgress(ownSpendCents);
  const benefit = getVipPrestigeBenefit(xp.currentLevel);

  return {
    settings,
    vip,
    xp,
    benefit,
    currentLevel: xp.currentLevel,
    raffleSpendCents,
    auctionSpendCents,
    ownSpendCents,
    affiliateCode: affiliateResult.data?.code ?? null,
  };
}

export async function applyVipBenefitsToOrder(params: {
  orderId: string;
  userId: string;
}): Promise<VipOrderBenefitApplication | null> {
  const supabase = createSupabaseServiceClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, amount_cents, vip_original_amount_cents, vip_discount_cents, vip_cashback_cents, vip_rakeback_cents, vip_xp_earned, vip_benefit_level_id, vip_benefits_applied_at",
    )
    .eq("id", params.orderId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (error || !order || order.status !== "pending") {
    return null;
  }

  const state = await getVipOperationalState(params.userId);
  const originalAmountCents = Math.max(Number(order.vip_original_amount_cents ?? 0), Number(order.amount_cents ?? 0));
  const discountPercent = state.settings.discountsEnabled ? state.benefit.purchaseDiscountPercent : 0;
  const cashbackPercent = state.settings.cashbackEnabled ? state.benefit.cashbackPercent : 0;
  const rakebackPercent = state.settings.rakebackEnabled ? state.benefit.rakebackPercent : 0;
  const discountCents = Math.round((originalAmountCents * discountPercent) / 100);
  const amountCents = Math.max(0, originalAmountCents - discountCents);
  const cashbackCents = Math.round((amountCents * cashbackPercent) / 100);
  const rakebackCents = Math.round((amountCents * rakebackPercent) / 100);
  const xpEarned = normalizeMoneyToXp(amountCents);
  const snapshot = {
    tierLabel: state.vip.effectiveLabel,
    levelId: state.benefit.levelId,
    levelLabel: state.benefit.levelLabel,
    cashbackPercent,
    discountPercent,
    packageBonusPercent: state.benefit.packageBonusPercent,
    reloadBonusPercent: state.settings.reloadBonusEnabled
      ? Math.max(state.settings.defaultReloadBonusPercent, state.benefit.reloadBonusPercent)
      : 0,
    rakebackPercent,
    boostedOddsPercent: state.benefit.boostedOddsPercent,
    freeSpins: state.benefit.freeSpins,
    levelUpReward: state.benefit.levelUpReward,
    levelUpRewardCents: state.benefit.levelUpRewardCents,
    levelUpRewardFreeSpins: state.benefit.levelUpRewardFreeSpins,
    birthdayReward: state.benefit.birthdayReward,
    birthdayRewardCents: state.settings.birthdayBonusEnabled
      ? Math.max(state.settings.defaultBirthdayBonusCents, state.benefit.birthdayRewardCents)
      : 0,
    hostSupportLabel: state.benefit.hostSupportLabel,
    exclusivePerksEnabled: state.settings.exclusivePerksEnabled,
  };

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      amount_cents: amountCents,
      vip_original_amount_cents: originalAmountCents,
      vip_discount_cents: discountCents,
      vip_cashback_cents: cashbackCents,
      vip_rakeback_cents: rakebackCents,
      vip_xp_earned: xpEarned,
      vip_benefit_level_id: state.benefit.levelId,
      vip_benefit_snapshot: snapshot,
      vip_benefits_applied_at: new Date().toISOString(),
    })
    .eq("id", params.orderId)
    .eq("status", "pending");

  if (updateError) {
    throw updateError;
  }

  return {
    orderId: params.orderId,
    originalAmountCents,
    amountCents,
    discountCents,
    cashbackCents,
    rakebackCents,
    xpEarned,
    benefitLevelId: state.benefit.levelId,
    benefitLabel: state.benefit.levelLabel,
  };
}

export async function processVipRewardsForPaidOrder(orderId: string) {
  const supabase = createSupabaseServiceClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, amount_cents, vip_cashback_cents, vip_rakeback_cents, vip_xp_earned, vip_original_amount_cents, vip_benefit_level_id, vip_benefit_snapshot",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order || order.status !== "paid" || !order.user_id) {
    return null;
  }

  const userId = String(order.user_id);
  await ensureVipWallet(userId);

  const cashbackCents = Math.max(0, Number(order.vip_cashback_cents ?? 0));
  const rakebackCents = Math.max(0, Number(order.vip_rakeback_cents ?? 0));
  const xpEarned = Math.max(0, Number(order.vip_xp_earned ?? normalizeMoneyToXp(Number(order.amount_cents ?? 0))));

  if (cashbackCents > 0) {
    const created = await createLedgerEntry(userId, {
      eventType: "cashback_credit",
      sourceKey: `order:${order.id}`,
      amountCents: cashbackCents,
      metadata: { orderId: order.id },
    });

    if (created) {
      await incrementVipWallet(userId, {
        cashbackBalanceCents: cashbackCents,
        totalEarnedCents: cashbackCents,
      });
    }
  }

  if (rakebackCents > 0) {
    const created = await createLedgerEntry(userId, {
      eventType: "rakeback_credit",
      sourceKey: `order:${order.id}`,
      amountCents: rakebackCents,
      metadata: { orderId: order.id },
    });

    if (created) {
      await incrementVipWallet(userId, {
        rakebackBalanceCents: rakebackCents,
        totalEarnedCents: rakebackCents,
      });
    }
  }

  const xpCreated = await createLedgerEntry(userId, {
    eventType: "xp_order",
    sourceKey: `order:${order.id}`,
    xpDelta: xpEarned,
    metadata: {
      orderId: order.id,
      amountCents: Number(order.amount_cents ?? 0),
    },
  });

  if (xpCreated) {
    await incrementVipWallet(userId, {
      totalXpFromOrders: xpEarned,
    });
  }

  const [{ data: paidOrders }, { data: auctionWins }] = await Promise.all([
    supabase.from("orders").select("id, amount_cents").eq("user_id", userId).eq("status", "paid"),
    supabase.from("auctions").select("winner_bid_cents").eq("winner_user_id", userId).not("winner_bid_cents", "is", null),
  ]);

  const totalPaidOrderCents = paidOrders?.reduce((sum, row) => sum + Number(row.amount_cents ?? 0), 0) ?? 0;
  const totalAuctionCents = auctionWins?.reduce((sum, row) => sum + Number(row.winner_bid_cents ?? 0), 0) ?? 0;
  const currentOwnSpendCents = totalPaidOrderCents + totalAuctionCents;
  const previousOwnSpendCents = Math.max(0, currentOwnSpendCents - Number(order.amount_cents ?? 0));
  const previousLevel = getVipXpLevel(normalizeMoneyToXp(previousOwnSpendCents));
  const currentLevel = getVipXpLevel(normalizeMoneyToXp(currentOwnSpendCents));
  const previousIndex = VIP_PRESTIGE_LEVELS.findIndex((level) => level.id === previousLevel.id);
  const currentIndex = VIP_PRESTIGE_LEVELS.findIndex((level) => level.id === currentLevel.id);

  for (let index = Math.max(0, previousIndex + 1); index <= currentIndex; index += 1) {
    const level = VIP_PRESTIGE_LEVELS[index];
    if (!level) {
      continue;
    }

    const benefit = getVipPrestigeBenefit(level);
    const rewardCents = Math.max(0, benefit.levelUpRewardCents);
    const rewardFreeSpins = Math.max(0, benefit.levelUpRewardFreeSpins);
    const created = await createLedgerEntry(userId, {
      eventType: "level_up_reward",
      sourceKey: `level:${level.id}`,
      amountCents: rewardCents,
      freeSpinsDelta: rewardFreeSpins,
      metadata: {
        levelId: level.id,
        levelLabel: level.label,
        rewardLabel: benefit.levelUpReward,
      },
    });

    if (created) {
      await incrementVipWallet(userId, {
        bonusBalanceCents: rewardCents,
        freeSpinsBalance: rewardFreeSpins,
        totalEarnedCents: rewardCents,
        lastLevelId: level.id,
      });
    }
  }

  return {
    userId,
    tierLabel: VIP_TIER_LABELS[currentLevel.tier],
    currentLevelId: currentLevel.id,
    cashbackCents,
    rakebackCents,
    xpEarned,
  };
}

function getAvailableWalletBalance(wallet: VipWalletSnapshot) {
  return wallet.cashbackBalanceCents + wallet.bonusBalanceCents + wallet.rakebackBalanceCents;
}

async function getPendingWithdrawalAmount(userId: string) {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("vip_withdrawal_requests")
    .select("amount_cents")
    .eq("user_id", userId)
    .in("status", ["pending", "approved"]);

  return data?.reduce((sum, row) => sum + Number(row.amount_cents ?? 0), 0) ?? 0;
}

export async function getVipWithdrawalSnapshot(userId: string): Promise<VipWithdrawalSnapshot> {
  const [wallet, state, pendingAmountCents] = await Promise.all([
    getVipWalletSnapshot(userId, 8),
    getVipOperationalState(userId),
    getPendingWithdrawalAmount(userId),
  ]);
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("vip_withdrawal_requests")
    .select("id, amount_cents, status, destination_pix_key, requested_level_label, provider, provider_status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(12);

  return {
    availableBalanceCents: Math.max(0, getAvailableWalletBalance(wallet) - pendingAmountCents),
    pendingAmountCents,
    maxWithdrawalCents: state.benefit.withdrawalLimitCents,
    levelLabel: state.benefit.levelLabel,
    requests:
      data?.map((row) => ({
        id: String(row.id),
        amountCents: Number(row.amount_cents ?? 0),
        status: String(row.status),
        destinationPixKey: typeof row.destination_pix_key === "string" ? row.destination_pix_key : null,
        requestedLevelLabel: typeof row.requested_level_label === "string" ? row.requested_level_label : null,
        provider: typeof row.provider === "string" ? row.provider : null,
        providerStatus: typeof row.provider_status === "string" ? row.provider_status : null,
        createdAt: String(row.created_at),
      })) ?? [],
  };
}

export async function createVipWithdrawalRequest(params: {
  userId: string;
  amountCents: number;
  destinationPixKey?: string | null;
}) {
  const [wallet, state, pendingAmountCents] = await Promise.all([
    getVipWalletSnapshot(params.userId, 8),
    getVipOperationalState(params.userId),
    getPendingWithdrawalAmount(params.userId),
  ]);
  const supabase = createSupabaseServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("bank_pix_key")
    .eq("id", params.userId)
    .maybeSingle();

  const requestedAmount = Math.max(0, Math.round(params.amountCents));
  const availableBalanceCents = Math.max(0, getAvailableWalletBalance(wallet) - pendingAmountCents);
  if (!requestedAmount) {
    throw new Error("Informe um valor de saque válido.");
  }
  if (requestedAmount > state.benefit.withdrawalLimitCents) {
    throw new Error(`Seu nível atual permite saque de até ${(state.benefit.withdrawalLimitCents / 100).toFixed(2)}.`);
  }
  if (requestedAmount > availableBalanceCents) {
    throw new Error("Saldo VIP insuficiente para este saque.");
  }

  const destinationPixKey = params.destinationPixKey?.trim() || profile?.bank_pix_key || null;
  if (!destinationPixKey) {
    throw new Error("Cadastre uma chave PIX no perfil para solicitar saque VIP.");
  }

  const { data, error } = await supabase
    .from("vip_withdrawal_requests")
    .insert({
      user_id: params.userId,
      amount_cents: requestedAmount,
      status: "pending",
      requested_level_id: state.benefit.levelId,
      requested_level_label: state.benefit.levelLabel,
      withdrawal_limit_cents: state.benefit.withdrawalLimitCents,
      destination_pix_key: destinationPixKey,
    })
    .select("id, amount_cents, status")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

function distributeWithdrawalDebit(
  wallet: VipWalletSnapshot,
  amountCents: number,
): {
  cashback: number;
  bonus: number;
  rakeback: number;
} {
  let remaining = amountCents;
  const cashback = Math.min(wallet.cashbackBalanceCents, remaining);
  remaining -= cashback;
  const bonus = Math.min(wallet.bonusBalanceCents, remaining);
  remaining -= bonus;
  const rakeback = Math.min(wallet.rakebackBalanceCents, remaining);

  return { cashback, bonus, rakeback };
}

export async function updateVipWithdrawalRequestStatus(params: {
  requestId: string;
  status: "approved" | "paid" | "rejected" | "canceled";
  adminNotes?: string | null;
}) {
  const supabase = createSupabaseServiceClient();
  const { data: request, error } = await supabase
    .from("vip_withdrawal_requests")
    .select("*")
    .eq("id", params.requestId)
    .maybeSingle();

  if (error || !request) {
    throw error ?? new Error("Solicitação de saque não encontrada.");
  }

  const nextStatus = params.status;
  let payoutPatch:
    | {
        provider?: string;
        provider_reference?: string;
        provider_status?: string | null;
        payout_raw?: Record<string, unknown>;
        paid_at?: string | null;
      }
    | undefined;

  if (
    params.status === "paid" &&
    hasAsaasTransfersEnabled() &&
    !request.provider_reference &&
    request.destination_pix_key
  ) {
    const transfer = await createAsaasWithdrawalTransfer({
      requestId: String(request.id),
      amountCents: Number(request.amount_cents ?? 0),
      pixKey: String(request.destination_pix_key),
    });
    payoutPatch = {
      provider: "asaas",
      provider_reference: transfer.providerReference,
      provider_status: transfer.providerStatus,
      payout_raw: transfer.raw,
      paid_at: new Date().toISOString(),
    };
  } else if (params.status === "paid" && !request.destination_pix_key) {
    throw new Error("A solicitação não possui chave PIX para transferência automática.");
  }

  if (params.status === "paid" && !hasAsaasTransfersEnabled()) {
    throw new Error("Transferência automática indisponível: configure ASAAS_API_KEY no ambiente de produção.");
  }

  const { error: updateError } = await supabase
    .from("vip_withdrawal_requests")
    .update({
      status: nextStatus,
      admin_notes: params.adminNotes?.trim() || null,
      ...(payoutPatch ?? {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.requestId);

  if (updateError) {
    throw updateError;
  }

  if (nextStatus === "paid") {
    const wallet = await getVipWalletSnapshot(String(request.user_id), 8);
    const debit = distributeWithdrawalDebit(wallet, Number(request.amount_cents ?? 0));
    const created = await createLedgerEntry(String(request.user_id), {
      eventType: "withdrawal_paid",
      sourceKey: `withdrawal:${request.id}`,
      amountCents: -Math.max(0, Number(request.amount_cents ?? 0)),
        metadata: {
          requestId: request.id,
          destinationPixKey: request.destination_pix_key ?? null,
          providerReference: payoutPatch?.provider_reference ?? request.provider_reference ?? null,
        },
      });

    if (created) {
      await incrementVipWallet(String(request.user_id), {
        cashbackBalanceCents: -debit.cashback,
        bonusBalanceCents: -debit.bonus,
        rakebackBalanceCents: -debit.rakeback,
        totalRedeemedCents: Number(request.amount_cents ?? 0),
      });
    }
  }

  return nextStatus;
}

function matchesVipOperationTarget(
  item: VipOperationItem,
  currentTier: VipTier,
  currentLevelId: string,
  userId: string,
) {
  if (item.userId && item.userId !== userId) {
    return false;
  }

  if (item.targetTier && item.targetTier !== "none") {
    if (item.targetTier === "elite" && currentTier !== "elite") {
      return false;
    }
    if (item.targetTier === "vip" && currentTier === "none") {
      return false;
    }
  }

  if (item.targetLevelId && item.targetLevelId !== currentLevelId) {
    return false;
  }

  return true;
}

export async function listVipOperationsForUser(userId: string): Promise<VipOperationItem[]> {
  const [state, supabase] = await Promise.all([getVipOperationalState(userId), Promise.resolve(createSupabaseServiceClient())]);
  const { data } = await supabase
    .from("vip_operations")
    .select("*")
    .in("status", ["scheduled", "active"])
    .order("created_at", { ascending: false })
    .limit(24);

  return (
    data?.map((row) => ({
      id: String(row.id),
      category: row.category as VipOperationItem["category"],
      title: String(row.title),
      description: typeof row.description === "string" ? row.description : null,
      status: row.status as VipOperationItem["status"],
      targetTier: (row.target_tier as VipTier | null) ?? null,
      targetLevelId: typeof row.target_level_id === "string" ? row.target_level_id : null,
      userId: typeof row.user_id === "string" ? row.user_id : null,
      hostContact: typeof row.host_contact === "string" ? row.host_contact : null,
      startsAt: typeof row.starts_at === "string" ? row.starts_at : null,
      endsAt: typeof row.ends_at === "string" ? row.ends_at : null,
      metadata: row.metadata && typeof row.metadata === "object" ? (row.metadata as Record<string, unknown>) : {},
    })) ?? []
  ).filter((item) => matchesVipOperationTarget(item, state.vip.effectiveTier, state.currentLevel.id, userId));
}

export async function listVipOperationsAdmin(): Promise<VipOperationItem[]> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("vip_operations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    data?.map((row) => ({
      id: String(row.id),
      category: row.category as VipOperationItem["category"],
      title: String(row.title),
      description: typeof row.description === "string" ? row.description : null,
      status: row.status as VipOperationItem["status"],
      targetTier: (row.target_tier as VipTier | null) ?? null,
      targetLevelId: typeof row.target_level_id === "string" ? row.target_level_id : null,
      userId: typeof row.user_id === "string" ? row.user_id : null,
      hostContact: typeof row.host_contact === "string" ? row.host_contact : null,
      startsAt: typeof row.starts_at === "string" ? row.starts_at : null,
      endsAt: typeof row.ends_at === "string" ? row.ends_at : null,
      metadata: row.metadata && typeof row.metadata === "object" ? (row.metadata as Record<string, unknown>) : {},
    })) ?? []
  );
}

export async function saveVipOperation(input: {
  id?: string;
  category: VipOperationItem["category"];
  title: string;
  description?: string | null;
  status: VipOperationItem["status"];
  targetTier?: VipTier | null;
  targetLevelId?: string | null;
  userId?: string | null;
  hostContact?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseServiceClient();
  const payload = {
    id: input.id,
    category: input.category,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    status: input.status,
    target_tier: input.targetTier ?? null,
    target_level_id: input.targetLevelId ?? null,
    user_id: input.userId ?? null,
    host_contact: input.hostContact?.trim() || null,
    starts_at: input.startsAt || null,
    ends_at: input.endsAt || null,
    metadata: input.metadata ?? {},
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("vip_operations").upsert(payload);
  if (error) {
    throw error;
  }
}

export async function awardBirthdayBonusesForToday(referenceDate = new Date()) {
  const settings = await getVipProgramSettings();
  if (!settings.birthdayBonusEnabled) {
    return { awarded: 0 };
  }

  const supabase = createSupabaseServiceClient();
  const month = String(referenceDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(referenceDate.getUTCDate()).padStart(2, "0");
  const year = String(referenceDate.getUTCFullYear());
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, birth_date")
    .not("birth_date", "is", null);

  let awarded = 0;
  for (const profile of profiles ?? []) {
    const birthDate = typeof profile.birth_date === "string" ? profile.birth_date : null;
    if (!birthDate || birthDate.slice(5, 10) !== `${month}-${day}`) {
      continue;
    }

    const state = await getVipOperationalState(String(profile.id));
    const amountCents = Math.max(settings.defaultBirthdayBonusCents, state.benefit.birthdayRewardCents);
    const created = await createLedgerEntry(String(profile.id), {
      eventType: "birthday_bonus",
      sourceKey: `birthday:${year}`,
      amountCents,
      metadata: {
        year,
        levelId: state.benefit.levelId,
        levelLabel: state.benefit.levelLabel,
      },
    });

    if (created) {
      awarded += 1;
      await incrementVipWallet(String(profile.id), {
        bonusBalanceCents: amountCents,
        totalEarnedCents: amountCents,
      });
    }
  }

  return { awarded };
}
