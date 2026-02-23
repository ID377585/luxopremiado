import { Metadata } from "next";

import { FAQ } from "@/components/raffle/FAQ";
import { Footer } from "@/components/raffle/Footer";
import { Hero } from "@/components/raffle/Hero";
import { HowItWorks } from "@/components/raffle/HowItWorks";
import { NumberPicker } from "@/components/raffle/NumberPicker";
import { Prize } from "@/components/raffle/Prize";
import { SocialProof } from "@/components/raffle/SocialProof";
import { Transparency } from "@/components/raffle/Transparency";
import { UserArea } from "@/components/raffle/UserArea";
import { Checkout } from "@/components/raffle/Checkout";
import { BuyerRanking } from "@/components/raffle/BuyerRanking";
import { AffiliateTracker } from "@/components/raffle/AffiliateTracker";
import { getRaffleLandingData } from "@/lib/raffles";
import { getSessionUser } from "@/lib/session";

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
  const [raffle, user] = await Promise.all([getRaffleLandingData(slug), getSessionUser()]);

  return (
    <main>
      <AffiliateTracker />
      <Hero data={raffle.hero} />
      <Prize data={raffle.prize} />
      <HowItWorks steps={raffle.howItWorks} />
      <UserArea userName={user?.name ?? user?.email} />
      <NumberPicker
        maxNumbersPerUser={raffle.maxNumbersPerUser}
        numbers={raffle.numberTiles}
        raffleId={raffle.raffleId}
        raffleSlug={raffle.slug}
      />
      <Checkout methods={raffle.checkoutMethods} />
      <Transparency data={raffle.transparency} />
      <BuyerRanking entries={raffle.buyerRanking} />
      <SocialProof entries={raffle.socialProof} />
      <FAQ items={raffle.faq} />
      <Footer />
    </main>
  );
}
