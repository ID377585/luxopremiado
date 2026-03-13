import { redirect } from "next/navigation";

import { PrizeConfigForm } from "@/components/admin/PrizeConfigForm";
import { AuctionConfigForm } from "@/components/admin/AuctionConfigForm";
import { VipConfigForm } from "@/components/admin/VipConfigForm";
import { VipOperationsForm } from "@/components/admin/VipOperationsForm";
import { VipWithdrawalsAdminForm } from "@/components/admin/VipWithdrawalsAdminForm";
import { getDefaultRaffleSlug } from "@/lib/raffle-slug";
import { getSessionUser, isAdminUser } from "@/lib/session";

export default async function ConfiguracoesPage() {
  const user = await getSessionUser();

  if (!user || !(await isAdminUser(user.id, user.email))) {
    redirect("/area-do-usuario");
  }

  const raffleSlug = getDefaultRaffleSlug();

  return (
    <main style={{ padding: "1.2rem" }}>
      <h1 style={{ color: "#f8fafc", marginBottom: "0.25rem", fontSize: "1.4rem", fontWeight: 800 }}>Configurações da Plataforma</h1>
      <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
        Apenas o administrador autorizado pode editar. Os dados são salvos no Supabase para a campanha principal da Bigode das Rifas.
      </p>
      <PrizeConfigForm raffleSlug={raffleSlug} />
      <div style={{ height: "1rem" }} />
      <AuctionConfigForm raffleSlug={raffleSlug} />
      <VipConfigForm />
      <VipWithdrawalsAdminForm />
      <VipOperationsForm />
    </main>
  );
}
