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

export interface VipPointBreakdown {
  rafflePoints: number;
  auctionPoints: number;
  networkPoints: number;
  automaticPoints: number;
  manualBonusPoints: number;
}

export interface VipComputationResult {
  access: boolean;
  effectiveTier: VipTier;
  effectiveLabel: string;
  points: number;
  nextTier: Exclude<VipTier, "none"> | null;
  nextTierLabel: string | null;
  nextTierMinPoints: number | null;
  progressPercent: number;
  remainingPoints: number;
  lockedReason: string | null;
}

export interface VipAccessRule {
  tier: Exclude<VipTier, "none">;
  label: string;
  totalPoints: number;
  ownMinPoints: number;
  partnerMinPoints: number;
  partnerCount: number;
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
  hasExclusiveTournaments: boolean;
  hasEventInvites: boolean;
  hasLuxuryExperiences: boolean;
  benefits: string[];
}

export interface VipXpProgress {
  totalXp: number;
  currentLevel: VipPrestigeLevel;
  nextLevel: VipPrestigeLevel | null;
  progressPercent: number;
  remainingXp: number;
}

export const VIP_TIER_LABELS: Record<VipTier, string> = {
  none: "Base",
  vip: "VIP",
  elite: "VIP Elite",
};

export const VIP_ACCESS_RULES: Record<Exclude<VipTier, "none">, VipAccessRule> = {
  vip: {
    tier: "vip",
    label: "VIP",
    totalPoints: 8000,
    ownMinPoints: 2000,
    partnerMinPoints: 2000,
    partnerCount: 3,
  },
  elite: {
    tier: "elite",
    label: "VIP Elite",
    totalPoints: 20000,
    ownMinPoints: 5000,
    partnerMinPoints: 5000,
    partnerCount: 3,
  },
};

export const VIP_THRESHOLDS: Array<{ tier: Exclude<VipTier, "none">; minPoints: number }> = [
  { tier: "vip", minPoints: VIP_ACCESS_RULES.vip.totalPoints },
  { tier: "elite", minPoints: VIP_ACCESS_RULES.elite.totalPoints },
];

export const VIP_PRESTIGE_LEVELS: VipPrestigeLevel[] = [
  { id: "base", label: "Base", minPoints: 0, tier: "none", description: "Entrada oficial na jornada de prestígio." },
  { id: "bronze", label: "Bronze", minPoints: 500, tier: "none", description: "Primeiros movimentos consistentes na plataforma." },
  { id: "cobre", label: "Cobre", minPoints: 1000, tier: "none", description: "Usuário ativo começando a ganhar ritmo." },
  { id: "quartzo", label: "Quartzo", minPoints: 1500, tier: "none", description: "Constância de compras e atenção ao jogo." },
  { id: "onix", label: "Ônix", minPoints: 2200, tier: "none", description: "Presença forte antes da liberação VIP." },
  { id: "jade", label: "Jade", minPoints: 3000, tier: "none", description: "Nível respeitado entre participantes recorrentes." },
  { id: "turmalina", label: "Turmalina", minPoints: 3800, tier: "none", description: "Operação pessoal já acima da média." },
  { id: "safira", label: "Safira", minPoints: 4700, tier: "none", description: "Trilha avançada de base com alto prestígio." },
  { id: "rubi", label: "Rubi", minPoints: 5700, tier: "none", description: "Fase final antes do primeiro desbloqueio VIP." },
  { id: "ouro", label: "Ouro", minPoints: 6800, tier: "none", description: "Elite da base, muito perto da sala VIP." },
  { id: "vip", label: "VIP", minPoints: 8000, tier: "vip", description: "Acesso liberado ao primeiro círculo premium." },
  { id: "topazio", label: "Topázio", minPoints: 9200, tier: "vip", description: "VIP com tração consistente de rede." },
  { id: "ametista", label: "Ametista", minPoints: 10600, tier: "vip", description: "Crescimento sólido com boa recorrência." },
  { id: "esmeralda", label: "Esmeralda", minPoints: 12100, tier: "vip", description: "Nível premium de forte presença operacional." },
  { id: "platina", label: "Platina", minPoints: 13700, tier: "vip", description: "Prestígio alto e rede em expansão contínua." },
  { id: "paladio", label: "Paládio", minPoints: 15400, tier: "vip", description: "Participação premium com consistência rara." },
  { id: "rodio", label: "Ródio", minPoints: 17200, tier: "vip", description: "Um dos patamares mais fortes antes do Elite." },
  { id: "coroa-imperial", label: "Coroa Imperial", minPoints: 19100, tier: "vip", description: "Último degrau VIP antes do topo da hierarquia." },
  { id: "vip-elite", label: "VIP Elite", minPoints: 20000, tier: "elite", description: "Acesso liberado ao nível máximo oficial." },
  { id: "diamante", label: "Diamante", minPoints: 23000, tier: "elite", description: "Elite consolidado com prestígio absoluto." },
  { id: "diamante-negro", label: "Diamante Negro", minPoints: 26500, tier: "elite", description: "Patamar raro, reservado aos mais fortes." },
  { id: "alexandrita", label: "Alexandrita", minPoints: 30500, tier: "elite", description: "Nível lendário de influência e investimento." },
  { id: "paraiba", label: "Paraíba", minPoints: 35000, tier: "elite", description: "Prestígio excepcional com rede extremamente ativa." },
  { id: "obsidiana-real", label: "Obsidiana Real", minPoints: 40000, tier: "elite", description: "Faixa de elite máxima para operadores dominantes." },
  { id: "trono-supremo", label: "Trono Supremo", minPoints: 46000, tier: "elite", description: "Topo da trilha com reconhecimento máximo." },
];

export const VIP_XP_PER_REAL = 10;

const LEVEL_UP_REWARDS = [
  "Boas-vindas ao programa",
  "R$ 10 em saldo promocional",
  "5 free spins para jogos futuros",
  "R$ 15 em bônus de recarga",
  "10 free spins em slots populares",
  "R$ 25 em cashback relâmpago",
  "12 free spins + ticket de sorteio",
  "R$ 35 em crédito bônus",
  "20 free spins na estreia do novo jogo",
  "R$ 50 em saldo promocional",
  "Pacote VIP de cashback reforçado",
  "25 free spins premium",
  "R$ 80 em bônus de nível",
  "Reload bonus turbinado por 7 dias",
  "30 free spins + pack VIP",
  "R$ 120 em bônus premium",
  "Cashback dobrado por uma semana",
  "50 free spins exclusivos",
  "R$ 180 em bônus Elite",
  "Convite para torneio fechado",
  "R$ 250 em crédito personalizado",
  "Experiência VIP em evento parceiro",
  "Pacote luxo com benefícios sob medida",
  "Viagem ou evento premium sob análise",
  "Presente supremo + bônus exclusivo",
] as const;

const WITHDRAWAL_LABELS = [
  "Saque padrão",
  "Saque prioritário até R$ 2 mil",
  "Saque prioritário até R$ 3 mil",
  "Saque prioritário até R$ 4 mil",
  "Saque prioritário até R$ 5 mil",
  "Saque prioritário até R$ 7,5 mil",
  "Saque prioritário até R$ 10 mil",
  "Saque prioritário até R$ 12 mil",
  "Saque prioritário até R$ 15 mil",
  "Saque prioritário até R$ 20 mil",
  "Saque VIP com fila acelerada",
  "Saque VIP até R$ 30 mil",
  "Saque VIP até R$ 40 mil",
  "Saque VIP até R$ 50 mil",
  "Saque VIP até R$ 60 mil",
  "Saque VIP até R$ 80 mil",
  "Saque VIP até R$ 100 mil",
  "Saque VIP com fast lane total",
  "Saque Elite instantâneo",
  "Saque Elite sem fila",
  "Saque Elite prioritário ilimitado",
  "Saque Elite 24/7 sem travas",
  "Saque Elite premium sem teto operacional",
  "Saque Elite absoluto e imediato",
  "Saque máximo com prioridade total",
] as const;

function getLevelIndex(level: VipPrestigeLevel): number {
  return VIP_PRESTIGE_LEVELS.findIndex((item) => item.id === level.id);
}

function createVipPrestigeBenefit(level: VipPrestigeLevel): VipPrestigeBenefit {
  const index = Math.max(0, getLevelIndex(level));
  const isBaseBand = index <= 9;
  const isMidBand = index >= 10 && index <= 17;
  const isHighBand = index >= 18;

  const cashbackPercent = isBaseBand
    ? Math.min(10, index === 0 ? 0 : 4 + index)
    : isMidBand
      ? 10 + (index - 10) * 2
      : 22 + (index - 18) * 2;
  const purchaseDiscountPercent = isBaseBand
    ? Math.min(6, Math.max(0, index - 1))
    : isMidBand
      ? 6 + (index - 10)
      : 14 + (index - 18) * 2;
  const packageBonusPercent = isBaseBand
    ? Math.max(0, index * 2)
    : isMidBand
      ? 18 + (index - 10) * 2
      : 36 + (index - 18) * 3;
  const reloadBonusPercent = isBaseBand
    ? Math.max(0, 5 + index)
    : isMidBand
      ? 18 + (index - 10) * 3
      : 45 + (index - 18) * 5;
  const rakebackPercent = isBaseBand ? 0 : isMidBand ? 2 + (index - 10) : 10 + (index - 18) * 2;
  const boostedOddsPercent = isHighBand ? 4 + (index - 18) * 2 : isMidBand ? 1 + Math.max(0, index - 13) : 0;
  const freeSpins = index === 0 ? 0 : isBaseBand ? 5 + index * 2 : isMidBand ? 30 + (index - 10) * 5 : 80 + (index - 18) * 10;
  const levelUpReward = LEVEL_UP_REWARDS[index] ?? LEVEL_UP_REWARDS[LEVEL_UP_REWARDS.length - 1];
  const levelUpRewardCents = index === 0 ? 0 : isBaseBand ? index * 1000 : isMidBand ? 5000 + (index - 10) * 1500 : 18000 + (index - 18) * 3500;
  const levelUpRewardFreeSpins = index === 0 ? 0 : isBaseBand ? Math.max(0, freeSpins - 2) : isMidBand ? freeSpins : freeSpins + 20;
  const withdrawalLabel = WITHDRAWAL_LABELS[index] ?? WITHDRAWAL_LABELS[WITHDRAWAL_LABELS.length - 1];
  const withdrawalLimitCents = isBaseBand
    ? (index + 1) * 200000
    : isMidBand
      ? 3000000 + (index - 10) * 1000000
      : 12000000 + (index - 18) * 8000000;
  const hasInstantWithdrawal = index >= 18;
  const hostSupportLabel = isHighBand
    ? index >= 22
      ? "VIP Host dedicado 24/7 com atendimento absoluto"
      : "VIP Host com atendimento prioritário 24/7"
    : null;
  const birthdayReward =
    index >= 18
      ? "Presente premium + crédito VIP de aniversário"
      : index >= 10
        ? "Bônus de aniversário com recarga turbinada"
        : index >= 1
          ? "Crédito especial no aniversário"
          : "Bônus de aniversário bloqueado até o próximo nível";
  const birthdayRewardCents = index === 0 ? 0 : isBaseBand ? 2500 + index * 500 : isMidBand ? 8000 + (index - 10) * 1000 : 18000 + (index - 18) * 2500;

  const benefits = [
    cashbackPercent > 0 ? `Cashback progressivo de ${cashbackPercent}% nas perdas qualificadas.` : "Sem cashback ativo neste estágio inicial.",
    purchaseDiscountPercent > 0
      ? `Desconto VIP de ${purchaseDiscountPercent}% em pacotes e combos elegíveis, entregando mais números por menos.`
      : "Combos padrão até o próximo patamar.",
    packageBonusPercent > 0
      ? `Bônus de ${packageBonusPercent}% em números extras nos pacotes promocionais elegíveis.`
      : "Sem bônus de quantidade liberado ainda.",
    reloadBonusPercent > 0
      ? `Reload bonus de ${reloadBonusPercent}% em dias de recarga e eventos especiais.`
      : "Bônus de recarga ainda não liberado.",
    freeSpins > 0
      ? `${freeSpins} free spins reservados para os jogos futuros da plataforma a cada ciclo elegível.`
      : "Free spins serão liberados ao alcançar o próximo nível.",
    rakebackPercent > 0
      ? `Rakeback de ${rakebackPercent}% para o ecossistema de jogos que será habilitado futuramente.`
      : "Rakeback bloqueado até a faixa intermediária.",
    boostedOddsPercent > 0
      ? `Odds turbinadas com bônus de até ${boostedOddsPercent}% em campanhas especiais e jogos futuros.`
      : "Odds especiais desbloqueiam nas faixas mais altas.",
    `Bônus de nível: ${levelUpReward}.`,
    `Bônus de aniversário: ${birthdayReward}.`,
    `Regra de saque: ${withdrawalLabel}.`,
    hostSupportLabel ?? "Atendimento padrão com prioridade crescente conforme a trilha evolui.",
    isMidBand ? "Bônus diários e semanais com maior frequência para manter o loop de retenção ativo." : "Missões e bônus de retenção são liberados gradualmente.",
    isHighBand ? "Convites para torneios exclusivos, eventos privados e ações premium." : "Torneios e eventos exclusivos aparecem nas faixas altas.",
  ];

  return {
    levelId: level.id,
    levelLabel: level.label,
    cashbackPercent,
    purchaseDiscountPercent,
    packageBonusPercent,
    reloadBonusPercent,
    rakebackPercent,
    boostedOddsPercent,
    freeSpins,
    levelUpReward,
    levelUpRewardCents,
    levelUpRewardFreeSpins,
    birthdayReward,
    birthdayRewardCents,
    withdrawalLabel,
    withdrawalLimitCents,
    hasInstantWithdrawal,
    hostSupportLabel,
    hasExclusiveTournaments: index >= 18,
    hasEventInvites: index >= 19,
    hasLuxuryExperiences: index >= 21,
    benefits,
  };
}

export const VIP_BENEFITS: Record<Exclude<VipTier, "none">, string[]> = {
  vip: [
    "Acesso à área VIP com leitura completa da trilha de prestígio",
    "Entrada em campanhas privadas e ofertas antecipadas",
    "Suporte prioritário para pagamentos, compras e ativações",
    "Visibilidade clara das metas para subir até o VIP Elite",
  ],
  elite: [
    "Tudo do VIP com prioridade máxima de atendimento",
    "Condições especiais em campanhas e leilões selecionados",
    "Acesso a ativações estratégicas e ações de maior ticket",
    "Prestígio máximo dentro da hierarquia atual da plataforma",
  ],
};

export function normalizeMoneyToPoints(value: number): number {
  return Math.max(0, Math.floor(value / 100));
}

export function normalizeMoneyToXp(value: number): number {
  return Math.max(0, Math.floor(value / 10));
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function resolveNextTier(tier: VipTier): Exclude<VipTier, "none"> | null {
  if (tier === "none") {
    return "vip";
  }

  if (tier === "vip") {
    return "elite";
  }

  return null;
}

function getTierThreshold(tier: Exclude<VipTier, "none">): number {
  return VIP_ACCESS_RULES[tier].totalPoints;
}

export function getVipPrestigeLevel(points: number): VipPrestigeLevel {
  const normalizedPoints = Math.max(0, points);
  const match = [...VIP_PRESTIGE_LEVELS]
    .reverse()
    .find((level) => normalizedPoints >= level.minPoints);

  return match ?? VIP_PRESTIGE_LEVELS[0];
}

export function getNextVipPrestigeLevel(points: number): VipPrestigeLevel | null {
  const normalizedPoints = Math.max(0, points);
  return VIP_PRESTIGE_LEVELS.find((level) => level.minPoints > normalizedPoints) ?? null;
}

export function getVipPrestigeBenefit(level: VipPrestigeLevel | string | number): VipPrestigeBenefit {
  if (typeof level === "number") {
    return createVipPrestigeBenefit(getVipPrestigeLevel(level));
  }

  if (typeof level === "string") {
    const match = VIP_PRESTIGE_LEVELS.find((item) => item.id === level);
    return createVipPrestigeBenefit(match ?? VIP_PRESTIGE_LEVELS[0]);
  }

  return createVipPrestigeBenefit(level);
}

export function getVipXpLevel(xp: number): VipPrestigeLevel {
  const normalizedXp = Math.max(0, xp);
  const match = [...VIP_PRESTIGE_LEVELS]
    .reverse()
    .find((level) => normalizedXp >= level.minPoints * VIP_XP_PER_REAL);

  return match ?? VIP_PRESTIGE_LEVELS[0];
}

export function getNextVipXpLevel(xp: number): VipPrestigeLevel | null {
  const normalizedXp = Math.max(0, xp);
  return VIP_PRESTIGE_LEVELS.find((level) => level.minPoints * VIP_XP_PER_REAL > normalizedXp) ?? null;
}

export function calculateVipXpProgress(ownSpendCents: number): VipXpProgress {
  const totalXp = normalizeMoneyToXp(ownSpendCents);
  const currentLevel = getVipXpLevel(totalXp);
  const nextLevel = getNextVipXpLevel(totalXp);
  const currentFloor = currentLevel.minPoints * VIP_XP_PER_REAL;
  const nextFloor = nextLevel ? nextLevel.minPoints * VIP_XP_PER_REAL : null;
  const progressPercent =
    nextFloor === null
      ? 100
      : clampPercent(((totalXp - currentFloor) / Math.max(nextFloor - currentFloor, 1)) * 100);

  return {
    totalXp,
    currentLevel,
    nextLevel,
    progressPercent,
    remainingXp: nextFloor ? Math.max(0, nextFloor - totalXp) : 0,
  };
}

export function calculateVipPoints(
  input: Pick<VipComputationInput, "raffleSpendCents" | "auctionSpendCents" | "partnerInvestmentCents">,
): number {
  const breakdown = calculateVipPointBreakdown(input);
  return breakdown.automaticPoints;
}

export function calculateVipPointBreakdown(
  input: Pick<VipComputationInput, "raffleSpendCents" | "auctionSpendCents" | "partnerInvestmentCents">,
): VipPointBreakdown {
  const rafflePoints = normalizeMoneyToPoints(input.raffleSpendCents);
  const auctionPoints = normalizeMoneyToPoints(input.auctionSpendCents);
  const networkPoints = normalizeMoneyToPoints(input.partnerInvestmentCents ?? 0);

  return {
    rafflePoints,
    auctionPoints,
    networkPoints,
    automaticPoints: rafflePoints + auctionPoints + networkPoints,
    manualBonusPoints: 0,
  };
}

export function countQualifiedPartners(spendCents: number[] | undefined, minPoints: number): number {
  const minCents = minPoints * 100;
  return (spendCents ?? []).filter((value) => value >= minCents).length;
}

function buildVipLockedReason(points: number, ownPoints: number, qualifiedPartners: number): string {
  const rule = VIP_ACCESS_RULES.vip;
  const missingPoints = Math.max(0, rule.totalPoints - points);
  const missingOwn = Math.max(0, rule.ownMinPoints - ownPoints);
  const missingPartners = Math.max(0, rule.partnerCount - qualifiedPartners);

  const blockers = [
    missingPoints > 0 ? `${missingPoints.toLocaleString("pt-BR")} pontos totais` : null,
    missingOwn > 0 ? `${missingOwn.toLocaleString("pt-BR")} pontos próprios` : null,
    missingPartners > 0 ? `${missingPartners} afiliados indicados qualificados` : null,
  ].filter(Boolean);

  return blockers.length > 0
    ? `Para liberar o VIP faltam ${blockers.join(", ")}. Meta oficial: 8.000 pontos totais com 2.000 pontos próprios e 3 afiliados indicados com 2.000 pontos cada.`
    : "Sua conta já está perto do VIP. Falta consolidar todos os critérios obrigatórios.";
}

function computeRuleProgress(points: number, ownPoints: number, qualifiedPartners: number, rule: VipAccessRule): number {
  const totalProgress = points / Math.max(rule.totalPoints, 1);
  const ownProgress = ownPoints / Math.max(rule.ownMinPoints, 1);
  const partnerProgress = qualifiedPartners / Math.max(rule.partnerCount, 1);

  return clampPercent(((totalProgress + ownProgress + partnerProgress) / 3) * 100);
}

export function resolveVipAccess(input: VipComputationInput): VipComputationResult {
  const breakdown = calculateVipPointBreakdown({
    raffleSpendCents: input.raffleSpendCents,
    auctionSpendCents: input.auctionSpendCents,
    partnerInvestmentCents: input.partnerInvestmentCents ?? 0,
  });
  const calculatedPoints = breakdown.automaticPoints;
  const points = Math.max(calculatedPoints, Math.max(0, input.persistedPoints));
  const ownPoints = breakdown.rafflePoints + breakdown.auctionPoints;
  const qualifiedVipPartners = countQualifiedPartners(
    input.referredPartnerSpendCents,
    VIP_ACCESS_RULES.vip.partnerMinPoints,
  );
  const qualifiedElitePartners = countQualifiedPartners(
    input.referredPartnerSpendCents,
    VIP_ACCESS_RULES.elite.partnerMinPoints,
  );

  if (input.manualOverride && input.manualTier !== "none") {
    const nextTier = resolveNextTier(input.manualTier);
    const nextThreshold = nextTier ? getTierThreshold(nextTier) : null;
    const previousThreshold = input.manualTier === "elite" ? getTierThreshold("vip") : 0;
    const progressPercent =
      nextThreshold === null
        ? 100
        : clampPercent(((points - previousThreshold) / Math.max(nextThreshold - previousThreshold, 1)) * 100);

    return {
      access: true,
      effectiveTier: input.manualTier,
      effectiveLabel: `${VIP_TIER_LABELS[input.manualTier]} Manual`,
      points,
      nextTier,
      nextTierLabel: nextTier ? VIP_TIER_LABELS[nextTier] : null,
      nextTierMinPoints: nextThreshold,
      progressPercent,
      remainingPoints: nextThreshold ? Math.max(0, nextThreshold - points) : 0,
      lockedReason: null,
    };
  }

  if (!input.affiliateActive) {
    const vipRule = VIP_ACCESS_RULES.vip;
    return {
      access: false,
      effectiveTier: "none",
      effectiveLabel: getVipPrestigeLevel(points).label,
      points,
      nextTier: "vip",
      nextTierLabel: vipRule.label,
      nextTierMinPoints: vipRule.totalPoints,
      progressPercent: computeRuleProgress(points, ownPoints, qualifiedVipPartners, vipRule),
      remainingPoints: Math.max(0, vipRule.totalPoints - points),
      lockedReason: "Ative seu perfil de afiliado para começar a subir na trilha VIP.",
    };
  }

  const eliteRule = VIP_ACCESS_RULES.elite;
  const vipRule = VIP_ACCESS_RULES.vip;
  const eliteUnlocked =
    points >= eliteRule.totalPoints &&
    ownPoints >= eliteRule.ownMinPoints &&
    qualifiedElitePartners >= eliteRule.partnerCount;
  const vipUnlocked =
    points >= vipRule.totalPoints &&
    ownPoints >= vipRule.ownMinPoints &&
    qualifiedVipPartners >= vipRule.partnerCount;

  const effectiveTier: VipTier = eliteUnlocked ? "elite" : vipUnlocked ? "vip" : "none";
  const nextTier = resolveNextTier(effectiveTier);
  const nextThreshold = nextTier ? getTierThreshold(nextTier) : null;
  const progressPercent =
    effectiveTier === "none"
      ? computeRuleProgress(points, ownPoints, qualifiedVipPartners, vipRule)
      : effectiveTier === "vip"
        ? computeRuleProgress(points, ownPoints, qualifiedElitePartners, eliteRule)
        : 100;

  return {
    access: effectiveTier !== "none",
    effectiveTier,
    effectiveLabel: getVipPrestigeLevel(points).label,
    points,
    nextTier,
    nextTierLabel: nextTier ? VIP_TIER_LABELS[nextTier] : null,
    nextTierMinPoints: nextThreshold,
    progressPercent,
    remainingPoints: nextThreshold ? Math.max(0, nextThreshold - points) : 0,
    lockedReason: effectiveTier === "none" ? buildVipLockedReason(points, ownPoints, qualifiedVipPartners) : null,
  };
}
