import { redirect } from "next/navigation";
import { VipUserState } from "@/lib/vip/types";
import { canAccessVipExperience } from "@/lib/vip/utils";
import { VipHero } from "./vip-hero";
import { VipProgressPanel } from "./vip-progress-panel";
import { VipTicketRules } from "./vip-ticket-rules";
import { VipMissions } from "./vip-missions";
import { VipPrizeDetails } from "./vip-prize-details";
import { VipRules } from "./vip-rules";
import { VipFaq } from "./vip-faq";
import { VipWireframeNote } from "./vip-wireframe-note";

interface Props {
  user: VipUserState;
}

export function VipExperiencesPage({ user }: Props) {
  if (!user.isLoggedIn) {
    redirect("/login");
  }

  if (!canAccessVipExperience(user)) {
    redirect("/app/vip");
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">
        <VipHero user={user} />
        <VipProgressPanel user={user} />
        <VipTicketRules user={user} />
        <VipMissions />
        <VipPrizeDetails />
        <VipRules />
        <VipFaq />
        <VipWireframeNote />
      </section>
    </main>
  );
}