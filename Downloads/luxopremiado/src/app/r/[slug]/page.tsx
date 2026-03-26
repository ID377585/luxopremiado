import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RedirectRaffle({ params }: PageProps) {
  const { slug } = await params;

  // redireciona para a página real
  redirect(`/rifas/${encodeURIComponent(slug)}`);
}