import { redirect } from "next/navigation";

import { getDynamicLandingPath } from "@/lib/raffle-slug.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  redirect(await getDynamicLandingPath("inicio"));
}
