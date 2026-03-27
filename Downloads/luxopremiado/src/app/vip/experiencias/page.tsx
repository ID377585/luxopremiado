import { VipExperiencesPage } from "@/components/vip/vip-experiences-page";
import { VipUserState } from "@/lib/vip/types";

/**
 * Troque este mock pela sua origem real:
 * - sessão do usuário
 * - banco/Firebase
 * - context
 * - API interna
 */
async function getCurrentUserVipState(): Promise<VipUserState> {
  return {
    isLoggedIn: true,
    tier: "VIP",
    totalPoints: 4650,
    ownPoints: 1180,
    qualifiedAffiliates: 1,
    requiredAffiliates: 3,
    pointsToUnlockVip: 3350,
    currentTickets: 2,
    xpInCampaign: 10000,
    campaignLevelsGained: 1,
    joinedBeforeCampaign: false,
  };
}

export default async function VipExperiencesRoute() {
  const user = await getCurrentUserVipState();

  return <VipExperiencesPage user={user} />;
}