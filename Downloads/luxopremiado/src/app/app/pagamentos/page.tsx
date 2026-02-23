import styles from "@/components/auth/auth.module.css";
import { getMyPayments } from "@/lib/dashboard";
import { formatBrlFromCents } from "@/lib/format";
import { getSessionUser } from "@/lib/session";

export default async function PaymentsPage() {
  const user = await getSessionUser();
  const payments = await getMyPayments(user?.id ?? "");

  return (
    <section className={styles.grid}>
      <article className={styles.panel}>
        <strong>Histórico de pagamentos</strong>
        {payments.length === 0 ? (
          <p>Nenhum pagamento registrado.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {payments.map((payment) => (
              <div key={payment.id}>
                <span>
                  {payment.provider} | {payment.status} |{" "}
                  {payment.order ? formatBrlFromCents(payment.order.amount_cents) : "Sem pedido"}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className={styles.panel}>
        <strong>Webhook e idempotência</strong>
        <p>Confirmações repetidas não duplicam venda de números graças à validação de status no backend.</p>
      </article>
    </section>
  );
}
