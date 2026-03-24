import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AffiliateTracker } from "@/components/raffle/AffiliateTracker";
import { FAQ } from "@/components/raffle/FAQ";
import { Footer } from "@/components/raffle/Footer";
import { Hero } from "@/components/raffle/Hero";
import { HowItWorks } from "@/components/raffle/HowItWorks";
import { StickyMobileCTA } from "@/components/raffle/StickyMobileCTA";
import { TopMenu } from "@/components/raffle/TopMenu";
import { Transparency } from "@/components/raffle/Transparency";
import { LuckyNumberBanner } from "@/components/raffle/lucky-number-banner";
import { ProgressStats } from "@/components/raffle/ProgressStats";
import { LiveActivityPopup } from "@/components/common/LiveActivityPopup";
import { getSiteUrl } from "@/lib/env";
import { getRaffleLandingData, RaffleDataError } from "@/lib/raffles";
import { getSessionUser, isAdminUser } from "@/lib/session";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = getSiteUrl();

  try {
    const raffle = await getRaffleLandingData(slug, {
      timeoutMs: 8000,
      allowUnavailableFallback: true,
      resolveToAvailableSlug: true,
    });

    const canonicalUrl = `${siteUrl}/rifas/${raffle.slug}`;
    const primaryImage = raffle.prize.images[0] ?? "/images/branding/bigode-logo.png";

    return {
      title: `${raffle.prize.title} | Rifas`,
      description: raffle.prize.description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: `${raffle.prize.title} | Rifas`,
        description: raffle.prize.description,
        url: canonicalUrl,
        siteName: "Bigode das Rifas",
        type: "website",
        images: [primaryImage],
      },
    };
  } catch {
    return {
      title: "Rifa | Bigode das Rifas",
      description: "Página individual da campanha de rifa.",
    };
  }
}

export default async function RifaSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getSessionUser();
  const admin = user ? await isAdminUser(user.id, user.email) : false;

  let raffle;
  try {
    raffle = await getRaffleLandingData(slug, {
      timeoutMs: 8000,
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
    redirect(`/rifas/${encodeURIComponent(raffle.slug)}`);
  }

  return (
    <main>
      <AffiliateTracker />
      <LiveActivityPopup scope="landing" />

      <TopMenu
        userAreaHref={admin ? "/app/configuracoes" : "/area-do-usuario"}
        userAreaLabel={admin ? "Configurações" : "Área do Usuário"}
      />

      <Hero data={raffle.hero} />

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 24px" }}>
        <LuckyNumberBanner raffleSlug={raffle.slug} stats={raffle.stats} />
        <ProgressStats
          raffleSlug={raffle.slug}
          stats={raffle.stats}
          totalNumbers={raffle.totalNumbers}
          prizeConfigs={raffle.prize.configs}
        />
      </section>

      <HowItWorks steps={raffle.howItWorks} />

      <FAQ
        items={raffle.faq}
        id="rifa-faq"
        title="Perguntas frequentes da rifa"
        subtitle="Tudo o que o participante precisa entender antes da compra."
      />

      <Transparency data={raffle.transparency} />
      <Footer raffleSlug={raffle.slug} />
      <StickyMobileCTA raffleSlug={raffle.slug} />
    </main>
  );
}