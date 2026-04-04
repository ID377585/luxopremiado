export type VipTier = "BASE" | "VIP" | "VIP_ELITE";

export interface VipUserState {
  isLoggedIn: boolean;
  tier: VipTier;
  totalPoints: number;
  ownPoints: number;
  qualifiedAffiliates: number;
  requiredAffiliates: number;
  pointsToUnlockVip: number;
  currentTickets: number;
  xpInCampaign: number;
  campaignLevelsGained: number;
  joinedBeforeCampaign: boolean;
}

export interface CampaignMission {
  id: string;
  title: string;
  description: string;
  reward: string;
}

export interface CampaignRuleItem {
  id: string;
  label: string;
}