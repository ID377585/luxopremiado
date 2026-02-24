import { Metadata } from "next";

import { FAQ } from "@/components/raffle/FAQ";
import { Footer } from "@/components/raffle/Footer";
import { Hero } from "@/components/raffle/Hero";
import { HowItWorks } from "@/components/raffle/HowItWorks";
import { Packages } from "@/components/raffle/Packages";
import { Prize } from "@/components/raffle/Prize";
import { ProgressStats } from "@/components/raffle/ProgressStats";
import { SocialProof } from "@/components/raffle/SocialProof";
import { StickyMobileCTA } from "@/components/raffle/StickyMobileCTA";
import { Transparency } from "@/components/raffle/Transparency";
import { BuyerRanking } from "@/components/raffle/BuyerRanking";
import { AffiliateTracker } from "@/components/raffle/AffiliateTracker";
import { TopMenu } from "@/components/raffle/TopMenu";
import { getRaffleLandingData } from "@/lib/raffles";

interface RafflePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RafflePageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Luxo Premiado | ${slug}`,
    description: "Escolha seus números, pague online e acompanhe o sorteio com transparência.",
  };
}

export default async function RafflePage({ params }: RafflePageProps) {
  const { slug } = await params;
  const raffle = await getRaffleLandingData(slug);

  return (
    <main>
      <AffiliateTracker />
      <TopMenu />
      <Hero data={raffle.hero} prizeTitle={raffle.prize.title} stats={raffle.stats} />
      <ProgressStats raffleSlug={raffle.slug} stats={raffle.stats} totalNumbers={raffle.totalNumbers} />
      <Packages packages={raffle.packages} raffleSlug={raffle.slug} />
      <Prize data={raffle.prize} />
      <HowItWorks steps={raffle.howItWorks} />
      <BuyerRanking entries={raffle.buyerRanking} />
      <SocialProof entries={raffle.socialProof} />
      <Transparency data={raffle.transparency} />
      <FAQ items={raffle.faq} />
      <Footer />
      <StickyMobileCTA raffleSlug={raffle.slug} />
    </main>
  );
}
