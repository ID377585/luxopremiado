import { CheckoutMethod } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface CheckoutProps {
  methods: CheckoutMethod[];
}

export function Checkout({ methods }: CheckoutProps) {
  return (
    <section className={styles.section} id="pagamento">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Pagamento</h2>
          <p className={styles.sectionSubtitle}>Checkout preparado para PIX e cartão com retorno por webhook.</p>
        </header>

        <ul className={styles.checkoutList}>
          {methods.map((method) => (
            <li className={styles.checkoutItem} key={method.name}>
              <strong>{method.name}</strong>
              <span>{method.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
