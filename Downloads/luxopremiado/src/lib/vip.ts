export type VipTier = "none" | "vip" | "elite";

export interface VipComputationInput {
  affiliateActive: boolean;
  manualOverride: boolean;
  manualTier: VipTier;
  persistedPoints: number;
  raffleSpendCents: number;
  auctionSpendCents: number;
  partnerInvestmentCents?: number;
  referredPartnerSpendCents?: number[];
  approvedCommissionCents: number;
  referredOrders: number;
}

export interface VipPrestigeLevel {
  id: string;
  label: string;
  minPoints: number;
  tier: VipTier;
  description: string;
}

export interface VipPrestigeBenefit {
  levelId: string;
  levelLabel: string;
  cashbackPercent: number;
  purchaseDiscountPercent: number;
  packageBonusPercent: number;
  reloadBonusPercent: number;
  rakebackPercent: number;
  boostedOddsPercent: number;
  freeSpins: number;
  levelUpReward: string;
  levelUpRewardCents: number;
  levelUpRewardFreeSpins: number;
  birthdayReward: string;
  birthdayRewardCents: number;
  withdrawalLabel: string;
  withdrawalLimitCents: number;
  hasInstantWithdrawal: boolean;
  hostSupportLabel: string | null;
  benefits: string[];
}

export const VIP_TIER_LABELS: Record<VipTier, string> = {
  none: "Base",
  vip: "VIP",
  elite: "VIP Elite",
};

export const VIP_PRESTIGE_LEVELS: VipPrestigeLevel[] = [
  { id: "base", label: "Base", minPoints: 0, tier: "none", description: "Entrada no sistema VIP." },
  { id: "bronze", label: "Bronze", minPoints: 500, tier: "none", description: "Primeiro nível." },
  { id: "prata", label: "Prata", minPoints: 2000, tier: "none", description: "Usuário recorrente." },
  { id: "ouro", label: "Ouro", minPoints: 5000, tier: "none", description: "Alta atividade." },
  { id: "vip", label: "VIP", minPoints: 8000, tier: "vip", description: "Acesso VIP liberado." },
  { id: "elite", label: "VIP Elite", minPoints: 20000, tier: "elite", description: "Topo da hierarquia." },
];

export const VIP_XP_PER_REAL = 10;

/* =========================
   CONVERSÕES
========================= */

export function normalizeMoneyToPoints(value: number): number {
  return Math.max(0, Math.floor(value / 100));
}

export function normalizeMoneyToXp(value: number): number {
  return Math.max(0, Math.floor(value / 10));
}

/* =========================
   LEVEL
========================= */

export function getVipPrestigeLevel(points: number): VipPrestigeLevel {
  const normalized = Math.max(0, points);

  const match = [...VIP_PRESTIGE_LEVELS]
    .reverse()
    .find((lvl) => normalized >= lvl.minPoints);

  return match ?? VIP_PRESTIGE_LEVELS[0];
}

export function getVipXpLevel(xp: number): VipPrestigeLevel {
  const normalized = Math.max(0, xp);

  const match = [...VIP_PRESTIGE_LEVELS]
    .reverse()
    .find((lvl) => normalized >= lvl.minPoints * VIP_XP_PER_REAL);

  return match ?? VIP_PRESTIGE_LEVELS[0];
}

/* =========================
   BENEFÍCIOS
========================= */

function createVipPrestigeBenefit(level: VipPrestigeLevel): VipPrestigeBenefit {
  const index = VIP_PRESTIGE_LEVELS.findIndex((l) => l.id === level.id);

  const cashback = index * 2;
  const discount = index;
  const freeSpins = index * 5;

  return {
    levelId: level.id,
    levelLabel: level.label,
    cashbackPercent: cashback,
    purchaseDiscountPercent: discount,
    packageBonusPercent: cashback,
    reloadBonusPercent: cashback,
    rakebackPercent: index > 2 ? index : 0,
    boostedOddsPercent: index > 3 ? index : 0,
    freeSpins,
    levelUpReward: `Bônus nível ${level.label}`,
    levelUpRewardCents: index * 1000,
    levelUpRewardFreeSpins: freeSpins,
    birthdayReward: "Bônus de aniversário",
    birthdayRewardCents: 2000 + index * 500,
    withdrawalLabel: "Saque padrão",
    withdrawalLimitCents: 200000 * (index + 1),
    hasInstantWithdrawal: index >= 4,
    hostSupportLabel: index >= 5 ? "VIP Host dedicado" : null,
    benefits: [
      `${cashback}% de cashback`,
      `${discount}% de desconto`,
      `${freeSpins} free spins`,
    ],
  };
}

export function getVipPrestigeBenefit(
  level: VipPrestigeLevel | string | number,
): VipPrestigeBenefit {
  if (typeof level === "number") {
    return createVipPrestigeBenefit(getVipPrestigeLevel(level));
  }

  if (typeof level === "string") {
    const found = VIP_PRESTIGE_LEVELS.find((l) => l.id === level);
    return createVipPrestigeBenefit(found ?? VIP_PRESTIGE_LEVELS[0]);
  }

  return createVipPrestigeBenefit(level);
}

/* =========================
   PROGRESSO
========================= */

export function calculateVipXpProgress(ownSpendCents: number) {
  const xp = normalizeMoneyToXp(ownSpendCents);
  const current = getVipXpLevel(xp);

  const next =
    VIP_PRESTIGE_LEVELS.find((l) => l.minPoints * VIP_XP_PER_REAL > xp) ?? null;

  const currentFloor = current.minPoints * VIP_XP_PER_REAL;
  const nextFloor = next ? next.minPoints * VIP_XP_PER_REAL : null;

  const percent =
    nextFloor === null
      ? 100
      : ((xp - currentFloor) / Math.max(nextFloor - currentFloor, 1)) * 100;

  return {
    totalXp: xp,
    currentLevel: current,
    nextLevel: next,
    progressPercent: Math.max(0, Math.min(100, percent)),
    remainingXp: nextFloor ? Math.max(0, nextFloor - xp) : 0,
  };
}

/* =========================
   ACESSO VIP
========================= */

export function resolveVipAccess(input: VipComputationInput) {
  const points =
    normalizeMoneyToPoints(input.raffleSpendCents) +
    normalizeMoneyToPoints(input.auctionSpendCents);

  const level = getVipPrestigeLevel(points);

  const tier: VipTier =
    points >= 20000 ? "elite" : points >= 8000 ? "vip" : "none";

  return {
    access: tier !== "none",
    effectiveTier: tier,
    effectiveLabel: level.label,
    points,
    nextTier: tier === "none" ? "vip" : tier === "vip" ? "elite" : null,
    progressPercent: Math.min(100, (points / 20000) * 100),
    remainingPoints: Math.max(0, 20000 - points),
    lockedReason: tier === "none" ? "Continue comprando para liberar VIP." : null,
  };
}