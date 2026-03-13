import Link from "next/link";

import styles from "@/components/auth/auth.module.css";
import { getDashboardSummary, getMyVipStatus } from "@/lib/dashboard";
import { getSessionUser } from "@/lib/session";

export default async function UserAppHomePage() {
  const user = await getSessionUser();
  const [summary, vip] = await Promise.all([
    getDashboardSummary(user?.id ?? ""),
    getMyVipStatus(user?.id ?? "", user?.email ?? null),
  ]);

  return (
    <section className={styles.grid}>
      <article className={styles.panel}>
        <strong>Pedidos pendentes</strong>
        <span>{summary.pendingOrders}</span>
      </article>
      <article className={styles.panel}>
        <strong>Pedidos pagos</strong>
        <span>{summary.paidOrders}</span>
      </article>
      <article className={styles.panel}>
        <strong>Números confirmados</strong>
        <span>{summary.totalNumbers}</span>
      </article>
      <article className={styles.panel}>
        <strong>Próximos passos</strong>
        <p>Escolha números em &quot;Escolher números&quot;, pague no checkout e acompanhe confirmação aqui no painel.</p>
      </article>
      <article className={styles.panel}>
        <strong>Status da plataforma</strong>
        <p>Reserva por RPC transacional, confirmação por webhook e histórico consolidado no Supabase.</p>
      </article>
      <article className={styles.panel}>
        <strong>Status VIP</strong>
        <span>{vip.effective_label}</span>
        <p>
          {vip.access
            ? `${vip.points.toLocaleString("pt-BR")} pontos. Sua área exclusiva já está liberada.`
            : vip.locked_reason}
        </p>
        <div className={styles.links}>
          <Link className={styles.buttonSecondary} href={vip.access ? "/app/vip" : "/app/perfil"}>
            {vip.access ? "Abrir área VIP" : "Ver progresso VIP"}
          </Link>
        </div>
      </article>
      <article className={styles.panel}>
        <strong>Suporte</strong>
        <p>Em caso de dúvida: suporte@bigodedasrifas.com.</p>
      </article>
    </section>
  );
}
