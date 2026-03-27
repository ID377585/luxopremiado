import { VipTier, VipUserState } from "./types";

export function canViewVipMenu(user: VipUserState): boolean {
  return user.isLoggedIn && (user.tier === "VIP" || user.tier === "VIP_ELITE");
}

export function canAccessVipExperience(user: VipUserState): boolean {
  return user.isLoggedIn && (user.tier === "VIP" || user.tier === "VIP_ELITE");
}

export function isVipEligibleForCampaign(user: VipUserState): boolean {
  return user.tier === "VIP" || user.tier === "VIP_ELITE";
}

export function getTierLabel(tier: VipTier): string {
  switch (tier) {
    case "VIP":
      return "VIP";
    case "VIP_ELITE":
      return "VIP Elite";
    default:
      return "Base";
  }
}

export function getProgressPercentage(user: VipUserState): number {
  const totalRequired = user.totalPoints + user.pointsToUnlockVip;
  if (totalRequired <= 0) return 0;
  return Math.max(0, Math.min(100, (user.totalPoints / totalRequired) * 100));
}

export function getCampaignStatusMessage(user: VipUserState): string {
  if (user.tier === "VIP_ELITE") {
    return "Você está na faixa de vantagem máxima da campanha.";
  }

  if (user.tier === "VIP") {
    return "Sua participação oficial está liberada.";
  }

  return "Você precisa desbloquear o nível VIP para ativar sua participação oficial.";
}

export function getTicketBonusSummary(user: VipUserState): string {
  if (user.tier === "VIP_ELITE") {
    return "Seu perfil recebe vantagens ampliadas, tickets extras e acesso a benefícios exclusivos da campanha.";
  }

  if (user.tier === "VIP") {
    return "Você já participa oficialmente e pode subir de nível para acumular mais tickets.";
  }

  return "Ao entrar no VIP, você recebe seu primeiro ticket oficial da experiência.";
}