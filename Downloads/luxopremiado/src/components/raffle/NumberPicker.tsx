import { NumberTile } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";
import { NumberGridLive } from "@/components/raffle/NumberGridLive";

interface NumberPickerProps {
  raffleSlug: string;
  numbers: NumberTile[];
  raffleId: string | null;
  maxNumbersPerUser: number;
}

export function NumberPicker({ raffleSlug, numbers, raffleId, maxNumbersPerUser }: NumberPickerProps) {
  return (
    <section className={styles.section} id="escolher-numeros">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Escolher Números</h2>
          <p className={styles.sectionSubtitle}>Seleção manual ou aleatória com reserva temporária automática.</p>
        </header>

        <div className={styles.numberPickerWrap}>
          <div>
            <NumberGridLive
              initialNumbers={numbers}
              maxNumbersPerUser={maxNumbersPerUser}
              raffleId={raffleId}
              raffleSlug={raffleSlug}
            />
          </div>

          <aside className={styles.card}>
            <h3 className={styles.cardTitle}>Carrinho do participante</h3>
            <p className={styles.cardText}>
              Escolha quantos números quiser. A reserva padrão é de 15 minutos para finalizar o pagamento.
            </p>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <span>Quantidade</span>
                <strong>5 números</strong>
              </li>
              <li className={styles.featureItem}>
                <span>Valor unitário</span>
                <strong>R$ 19,90</strong>
              </li>
              <li className={styles.featureItem}>
                <span>Total</span>
                <strong>R$ 99,50</strong>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
