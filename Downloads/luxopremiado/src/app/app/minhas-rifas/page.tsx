import styles from "@/components/auth/auth.module.css";
import { formatBrlFromCents } from "@/lib/format";
import { getMyOrders, getMySoldNumbers } from "@/lib/dashboard";
import { getSessionUser } from "@/lib/session";

export default async function MyRafflesPage() {
  const user = await getSessionUser();
  const [orders, numbers] = await Promise.all([getMyOrders(user?.id ?? ""), getMySoldNumbers(user?.id ?? "")]);

  return (
    <section className={styles.grid}>
      <article className={styles.panel}>
        <strong>Números adquiridos</strong>
        <p>{numbers.length > 0 ? numbers.join(", ") : "Nenhum número confirmado no momento."}</p>
      </article>

      <article className={styles.panel}>
        <strong>Últimos pedidos</strong>
        {orders.length === 0 ? (
          <p>Você ainda não criou pedidos.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {orders.map((order) => (
              <div key={order.id}>
                <span>
                  {order.id} | {order.status} | {formatBrlFromCents(order.amount_cents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className={styles.panel}>
        <strong>Regra de expiração</strong>
        <p>Reservas pendentes expiram automaticamente para liberar os números no grid público.</p>
      </article>
    </section>
  );
}
