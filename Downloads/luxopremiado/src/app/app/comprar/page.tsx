import { notFound } from "next/navigation";

import { Checkout } from "@/components/raffle/Checkout";
import { NumberPicker } from "@/components/raffle/NumberPicker";
import { resolveAvailableRaffleSlug } from "@/lib/raffle-slug.server";
import { getRaffleLandingData, RaffleDataError } from "@/lib/raffles";
import { getSessionUser } from "@/lib/session";

interface BuyNumbersPageProps {
  searchParams: Promise<{ slug?: string; pack?: string }>;
}

export default async function BuyNumbersPage({ searchParams }: BuyNumbersPageProps) {
  const params = await searchParams;
  const user = await getSessionUser();
  const slug = await resolveAvailableRaffleSlug(params.slug);
  const pack = Number(params.pack ?? "0");
  const recommendedPackQty = Number.isFinite(pack) && [5, 10, 25, 50].includes(pack) ? pack : null;
  let raffle;

  try {
    raffle = await getRaffleLandingData(slug, {
      resolveToAvailableSlug: true,
    });
  } catch (error) {
    if (error instanceof RaffleDataError && error.code === "NOT_FOUND") {
      notFound();
    }

    throw error;
  }

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
