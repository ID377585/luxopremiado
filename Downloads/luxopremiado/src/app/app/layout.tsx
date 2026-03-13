import Link from "next/link";
import { redirect } from "next/navigation";

import styles from "@/components/auth/auth.module.css";
import { signOutAction } from "@/lib/actions/auth";
import { getMyVipStatus } from "@/lib/dashboard";
import { hasSupabaseEnv } from "@/lib/env";
import { getDynamicLandingPath } from "@/lib/raffle-slug.server";
import { getSessionUser, isAdminUser } from "@/lib/session";
import { getVipPrestigeBenefit } from "@/lib/vip";

export default async function UserAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  const landingHref = await getDynamicLandingPath();
  const vip = user ? await getMyVipStatus(user.id, user.email) : null;
  const canAccessAdminSettings = user ? await isAdminUser(user.id, user.email) : false;
  const currentXpBenefit = vip ? getVipPrestigeBenefit(vip.xp.current_level) : null;

  if (hasSupabaseEnv() && !user) {
    redirect(`/login?error=${encodeURIComponent("Faça login para continuar")}&next=${encodeURIComponent("/app/comprar")}`);
  }

  return (
    <main className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Área do Usuário</h1>
          <p className={styles.dashboardSubtitle}>
            {user ? `Conectado como ${user.email}` : "Modo demo sem Supabase configurado."}
          </p>
        </div>

        <nav className={styles.dashboardNav}>
          <Link className={styles.dashboardLink} href="/app/comprar">
            Escolher números
          </Link>
          <Link className={styles.dashboardLink} href="/app">
            Visão geral
          </Link>
          <Link className={styles.dashboardLink} href="/app/minhas-rifas">
            Minhas rifas
          </Link>
          <Link className={styles.dashboardLink} href="/app/pagamentos">
            Pagamentos
          </Link>
          <Link className={styles.dashboardLink} href="/app/perfil">
            Perfil
          </Link>
          {vip?.access ? (
            <Link className={styles.dashboardLink} href="/app/vip">
              VIP
            </Link>
          ) : null}
          {canAccessAdminSettings ? (
            <Link className={styles.dashboardLink} href="/app/configuracoes">
              Configurações
            </Link>
          ) : null}
          <Link className={styles.dashboardLink} href={landingHref}>
            Ver landing
          </Link>
          <form action={signOutAction}>
            <button className={styles.dashboardLink} type="submit">
              Sair
            </button>
          </form>
        </nav>
      </header>

      {vip && currentXpBenefit ? (
        <section className={styles.xpBanner} aria-label="Barra de experiência VIP">
          <div className={styles.xpBannerHeader}>
            <div>
              <p className={styles.xpBannerKicker}>Trilha de experiência</p>
              <h2 className={styles.xpBannerTitle}>
                {vip.xp.current_level.label} com {vip.xp.total_xp.toLocaleString("pt-BR")} XP acumulados
              </h2>
            </div>
            <div className={styles.xpBannerMeta}>
              <span className={styles.xpBadge}>10 XP por R$ 1,00 gasto</span>
              <span className={styles.xpBadge}>
                {vip.xp.next_level
                  ? `Faltam ${vip.xp.remaining_xp.toLocaleString("pt-BR")} XP para ${vip.xp.next_level.label}`
                  : "Topo atual da trilha alcançado"}
              </span>
            </div>
          </div>

          <div className={styles.xpTrack} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(vip.xp.progress_percent)}>
            <span className={styles.xpFill} style={{ width: `${vip.xp.progress_percent}%` }} />
          </div>

          <div className={styles.xpBenefitGrid}>
            <article className={styles.xpBenefitCard}>
              <p className={styles.xpBenefitLabel}>Cashback atual</p>
              <p className={styles.xpBenefitValue}>{currentXpBenefit.cashbackPercent}%</p>
            </article>
            <article className={styles.xpBenefitCard}>
              <p className={styles.xpBenefitLabel}>Desconto em pacotes</p>
              <p className={styles.xpBenefitValue}>{currentXpBenefit.purchaseDiscountPercent}%</p>
            </article>
            <article className={styles.xpBenefitCard}>
              <p className={styles.xpBenefitLabel}>Números extras</p>
              <p className={styles.xpBenefitValue}>+{currentXpBenefit.packageBonusPercent}%</p>
            </article>
            <article className={styles.xpBenefitCard}>
              <p className={styles.xpBenefitLabel}>Bônus de nível</p>
              <p className={styles.xpBenefitText}>{currentXpBenefit.levelUpReward}</p>
            </article>
          </div>
        </section>
      ) : null}

      {children}
    </main>
  );
}
