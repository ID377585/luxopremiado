import { redirect } from "next/navigation";

import { getSiteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  const canonicalFallback = "https://luxopremiado.vercel.app";
  const siteUrl = getSiteUrl();
  const canonicalBase = siteUrl.includes("localhost") ? canonicalFallback : siteUrl;

  redirect(`${canonicalBase}/r/luxo-premiado#inicio`);
}
