import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const normalizedSiteUrl = rawSiteUrl ? rawSiteUrl.replace(/\/+$/, "") : "";
  const canonicalFallback = "https://luxopremiado.vercel.app";
  const canonicalBase = normalizedSiteUrl || canonicalFallback;

  redirect(`${canonicalBase}/r/luxo-premiado#inicio`);
}
