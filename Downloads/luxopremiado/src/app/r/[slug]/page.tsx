import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { FAQ } from "@/components/raffle/FAQ";
import { Footer } from "@/components/raffle/Footer";
import { Hero } from "@/components/raffle/Hero";
import { HowItWorks } from "@/components/raffle/HowItWorks";
import { Packages } from "@/components/raffle/Packages";
import { Prize } from "@/components/raffle/Prize";
import { ProgressStats } from "@/components/raffle/ProgressStats";
import { Auction } from "@/components/raffle/Auction";
import { AffiliatePitch } from "@/components/raffle/AffiliatePitch";
import { RetentionLoop } from "@/components/raffle/RetentionLoop";
import { SocialProof } from "@/components/raffle/SocialProof";
import { StickyMobileCTA } from "@/components/raffle/StickyMobileCTA";
import { Transparency } from "@/components/raffle/Transparency";
import { BuyerRanking } from "@/components/raffle/BuyerRanking";
import { AffiliateTracker } from "@/components/raffle/AffiliateTracker";
import { TopMenu } from "@/components/raffle/TopMenu";
import { LuckyNumberBanner } from "@/components/raffle/lucky-number-banner";
import { LiveActivityPopup } from "@/components/common/LiveActivityPopup";
import { getSiteUrl } from "@/lib/env";
import { getRaffleLandingData, RaffleDataError } from "@/lib/raffles";
import { getSessionUser, isAdminUser } from "@/lib/session";

interface RafflePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RafflePageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = getSiteUrl();

  try {
    const raffle = await getRaffleLandingData(slug, {
      timeoutMs: 8_000,
      allowUnavailableFallback: true,
      resolveToAvailableSlug: true,
    });
    const canonicalUrl = `${siteUrl}/r/${raffle.slug}`;
    const primaryImage = raffle.prize.images[0] ?? "/images/branding/bigode-logo.png";
    const imageUrl = /^https?:\/\//i.test(primaryImage)
      ? primaryImage
      : `${siteUrl}${primaryImage.startsWith("/") ? primaryImage : `/${primaryImage}`}`;
    const title = "Bigode das Rifas";
    const description = "Bigode das Rifas com compra rápida, transparência e acompanhamento completo da campanha.";
    const primaryPrizeLabel =
      raffle.prize.configs?.find((item) => item.prizeOrder === 1)?.prizeLabel?.trim() || raffle.prize.title;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "Bigode das Rifas",
        locale: "pt_BR",
        type: "website",
        images: [
          {
            url: imageUrl,
            alt: primaryPrizeLabel,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    const canonicalUrl = `${siteUrl}/r/${slug}`;

    return {
      title: "Bigode das Rifas",
      description: "Bigode das Rifas com compra rápida, transparência e acompanhamento completo da campanha.",
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: "Bigode das Rifas",
        description: "Bigode das Rifas com compra rápida, transparência e acompanhamento completo da campanha.",
        url: canonicalUrl,
        siteName: "Bigode das Rifas",
        locale: "pt_BR",
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "Bigode das Rifas",
        description: "Bigode das Rifas com compra rápida, transparência e acompanhamento completo da campanha.",
      },
    };
  }
}

export default async function RafflePage({ params }: RafflePageProps) {
  const { slug } = await params;
  const user = await getSessionUser();
  const isAdmin = user ? await isAdminUser(user.id, user.email) : false;
  let raffle;

  try {
    raffle = await getRaffleLandingData(slug, {
      timeoutMs: 8_000,
      allowUnavailableFallback: true,
      resolveToAvailableSlug: true,
    });
  } catch (error) {
    if (error instanceof RaffleDataError && error.code === "NOT_FOUND") {
      notFound();
    }

    throw error;
  }

  if (raffle.slug !== slug) {
    redirect(`/r/${encodeURIComponent(raffle.slug)}#inicio`);
  }

  return (
    <main>
      <AffiliateTracker />
      <LiveActivityPopup scope="landing" />
      <TopMenu
        userAreaHref={isAdmin ? "/app/configuracoes" : "/area-do-usuario"}
        userAreaLabel={isAdmin ? "Configurações" : "Área do Usuário"}
      />
      <Hero data={raffle.hero} />
      <LuckyNumberBanner raffleSlug={raffle.slug} stats={raffle.stats} />
      <Packages packages={raffle.packages} raffleSlug={raffle.slug} />
      <Prize data={raffle.prize} />
      <ProgressStats
        raffleSlug={raffle.slug}
        stats={raffle.stats}
        totalNumbers={raffle.totalNumbers}
        prizeConfigs={raffle.prize.configs}
      />
      <Auction raffleSlug={raffle.slug} />
      <HowItWorks steps={raffle.howItWorks} />
      <BuyerRanking entries={raffle.buyerRanking} />
      <SocialProof entries={raffle.socialProof} winnerWall={raffle.winnerWall} />
      <AffiliatePitch />
      <FAQ items={raffle.faq} />
      <RetentionLoop data={raffle.retention} />
      <Transparency data={raffle.transparency} />
      <Footer raffleSlug={raffle.slug} />
      <StickyMobileCTA raffleSlug={raffle.slug} />
    </main>
  );
}
