import { Checkout } from "@/components/raffle/Checkout";
import { NumberPicker } from "@/components/raffle/NumberPicker";
import { fallbackRaffleData } from "@/lib/landing-data";
import { getRaffleLandingData } from "@/lib/raffles";
import { getSessionUser } from "@/lib/session";

interface BuyNumbersPageProps {
  searchParams: Promise<{ slug?: string }>;
}

export default async function BuyNumbersPage({ searchParams }: BuyNumbersPageProps) {
  const params = await searchParams;
  const user = await getSessionUser();
  const slug = String(params.slug ?? fallbackRaffleData.slug).trim() || fallbackRaffleData.slug;
  const raffle = await getRaffleLandingData(slug);

  return (
    <>
      <NumberPicker
        isAuthenticated={Boolean(user)}
        maxNumbersPerUser={raffle.maxNumbersPerUser}
        numbers={raffle.numberTiles}
        raffleId={raffle.raffleId}
        raffleSlug={raffle.slug}
        totalNumbers={raffle.totalNumbers}
      />
      <Checkout methods={raffle.checkoutMethods} />
    </>
  );
}
