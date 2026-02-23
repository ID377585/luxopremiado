import styles from "@/components/auth/auth.module.css";
import { getDashboardSummary } from "@/lib/dashboard";
import { getSessionUser } from "@/lib/session";

export default async function UserAppHomePage() {
  const user = await getSessionUser();
  const summary = await getDashboardSummary(user?.id ?? "");

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
        <p>Escolha novos números na landing, pague no checkout e acompanhe confirmação aqui no painel.</p>
      </article>
      <article className={styles.panel}>
        <strong>Status da plataforma</strong>
        <p>Reserva por RPC transacional, confirmação por webhook e histórico consolidado no Supabase.</p>
      </article>
      <article className={styles.panel}>
        <strong>Suporte</strong>
        <p>Em caso de dúvida: suporte@luxopremiado.com.br.</p>
      </article>
    </section>
  );
}
