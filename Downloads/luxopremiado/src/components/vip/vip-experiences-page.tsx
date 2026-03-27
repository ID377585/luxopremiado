import { redirect } from "next/navigation";
import type { VipUserState } from "@/lib/vip/types";
import { canAccessVipExperience } from "@/lib/vip/utils";
import { VipHero } from "./vip-hero";
import { VipProgressPanel } from "./vip-progress-panel";
import { VipTicketRules } from "./vip-ticket-rules";
import { VipMissions } from "./vip-missions";
import { VipPrizeDetails } from "./vip-prize-details";
import { VipRules } from "./vip-rules";
import { VipFaq } from "./vip-faq";

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
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(242,208,103,0.08), transparent 22%), linear-gradient(180deg, #071632 0%, #061129 48%, #040d1f 100%)",
        color: "#fff",
      }}
    >
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "32px 20px 72px",
          display: "grid",
          gap: 28,
        }}
      >
        <VipHero user={user} />
        <VipProgressPanel user={user} />
        <VipTicketRules />
        <VipMissions />
        <VipPrizeDetails />
        <VipRules />
        <VipFaq />
      </section>
    </main>
  );
}