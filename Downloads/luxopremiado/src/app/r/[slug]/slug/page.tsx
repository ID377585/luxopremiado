import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LegacyRaffleRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/rifas/${encodeURIComponent(slug)}`);
}