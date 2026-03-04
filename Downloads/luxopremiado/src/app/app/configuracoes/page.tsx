import { redirect } from "next/navigation";

import { PrizeConfigForm } from "@/components/admin/PrizeConfigForm";
import { getDefaultRaffleSlug } from "@/lib/raffle-slug";
import { getSessionUser } from "@/lib/session";

const ADMIN_EMAIL = "recovery.contas.mail@gmail.com";

export default async function ConfiguracoesPage() {
  const user = await getSessionUser();

  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/area-do-usuario");
  }

  const raffleSlug = getDefaultRaffleSlug();

  return (
    <main style={{ padding: "1.2rem" }}>
      <h1 style={{ color: "#f8fafc", marginBottom: "0.25rem", fontSize: "1.4rem", fontWeight: 800 }}>Configurações de Prêmios</h1>
      <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
        Apenas o administrador autorizado pode editar. Os dados são salvos no Supabase para o raffle <strong>{raffleSlug}</strong>.
      </p>
      <PrizeConfigForm raffleSlug={raffleSlug} />
    </main>
  );
}
