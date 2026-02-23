import Link from "next/link";
import { redirect } from "next/navigation";

import styles from "@/components/auth/auth.module.css";
import { hasSupabaseEnv } from "@/lib/env";
import { getSessionUser, isAdminUser } from "@/lib/session";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  if (hasSupabaseEnv()) {
    if (!user) {
      redirect("/login?error=Faça login para acessar o admin");
    }

    const isAdmin = await isAdminUser(user.id);

    if (!isAdmin) {
      redirect("/app");
    }
  }

  return (
    <main className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Admin Luxo Premiado</h1>
          <p className={styles.dashboardSubtitle}>Gerencie rifas, transparência e provas sociais.</p>
        </div>
        <nav className={styles.dashboardNav}>
          <Link className={styles.dashboardLink} href="/admin">
            Visão geral
          </Link>
          <Link className={styles.dashboardLink} href="/admin/rifas">
            Rifas
          </Link>
          <Link className={styles.dashboardLink} href="/admin/provas">
            Provas
          </Link>
          <Link className={styles.dashboardLink} href="/admin/transparencia">
            Transparência
          </Link>
          <Link className={styles.dashboardLink} href="/app">
            Área do usuário
          </Link>
        </nav>
      </header>

      {children}
    </main>
  );
}
