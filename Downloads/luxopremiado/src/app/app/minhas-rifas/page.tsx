import styles from "@/components/auth/auth.module.css";
import { formatBrlFromCents, formatRaffleNumber } from "@/lib/format";
import { getMyOrders, getMySoldNumbers } from "@/lib/dashboard";
import { getDefaultRaffleSlug } from "@/lib/raffle-slug";
import { getSessionUser } from "@/lib/session";

export default async function MyRafflesPage() {
  const user = await getSessionUser();
  const raffleSlug = getDefaultRaffleSlug();
  const [orders, numbers] = await Promise.all([
    getMyOrders(user?.id ?? ""),
    getMySoldNumbers(user?.id ?? "", raffleSlug),
  ]);

  const numbersByPrize = numbers.reduce<Record<string, number[]>>((acc, item) => {
    const key = item.prizeLabel ?? "Prêmio";
    acc[key] = acc[key] ? [...acc[key], item.number] : [item.number];
    return acc;
  }, {});

  return (
    <section className={styles.grid}>
      <article className={styles.panel}>
        <strong>Números adquiridos</strong>
        {numbers.length > 0 ? (
          <div style={{ display: "grid", gap: ".5rem" }}>
            {Object.entries(numbersByPrize).map(([prizeLabel, nums]) => (
              <div key={prizeLabel}>
                <p style={{ margin: 0, fontWeight: 700 }}>{prizeLabel}</p>
                <p style={{ margin: 0, color: "#cbd5e1" }}>
                  {nums.map((n) => formatRaffleNumber(n)).join(", ")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhum número confirmado no momento.</p>
        )}
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
