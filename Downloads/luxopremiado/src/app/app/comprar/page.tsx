import { Checkout } from "@/components/raffle/Checkout";
import { NumberPicker } from "@/components/raffle/NumberPicker";
import { fallbackRaffleData } from "@/lib/landing-data";
import { getRaffleLandingData } from "@/lib/raffles";
import { getSessionUser } from "@/lib/session";

interface BuyNumbersPageProps {
  searchParams: Promise<{ slug?: string; pack?: string }>;
}

export default async function BuyNumbersPage({ searchParams }: BuyNumbersPageProps) {
  const params = await searchParams;
  const user = await getSessionUser();
  const slug = String(params.slug ?? fallbackRaffleData.slug).trim() || fallbackRaffleData.slug;
  const pack = Number(params.pack ?? "0");
  const recommendedPackQty = Number.isFinite(pack) && [5, 10, 25, 50].includes(pack) ? pack : null;
  const raffle = await getRaffleLandingData(slug);

  return (
    <>
      <NumberPicker
        initialStats={raffle.stats}
        isAuthenticated={Boolean(user)}
        maxNumbersPerUser={raffle.maxNumbersPerUser}
        numbers={raffle.numberTiles}
        raffleId={raffle.raffleId}
        raffleSlug={raffle.slug}
        recommendedPackQty={recommendedPackQty}
        totalNumbers={raffle.totalNumbers}
      />
      <Checkout methods={raffle.checkoutMethods} />
    </>
  );
}
