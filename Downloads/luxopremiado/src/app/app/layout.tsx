import Link from "next/link";
import { redirect } from "next/navigation";

import styles from "@/components/auth/auth.module.css";
import { signOutAction } from "@/lib/actions/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { getSessionUser } from "@/lib/session";

export default async function UserAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

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
          <Link className={styles.dashboardLink} href="/r/luxo-premiado">
            Ver landing
          </Link>
          <form action={signOutAction}>
            <button className={styles.dashboardLink} type="submit">
              Sair
            </button>
          </form>
        </nav>
      </header>

      {children}
    </main>
  );
}
