import { FaqItem } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface FAQProps {
  items: FaqItem[];
}

export function FAQ({ items }: FAQProps) {
  return (
    <section className={styles.section} id="faq">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>FAQ</h2>
          <p className={styles.sectionSubtitle}>Perguntas mais comuns sobre compra, sorteio e confirmação.</p>
        </header>

        <ul className={styles.faqList}>
          {items.map((item, index) => (
            <li className={styles.faqItem} key={`${item.question}-${index}`}>
              <details className={styles.faqDisclosure}>
                <summary className={styles.faqQuestion}>
                  <span>{item.question}</span>
                  <span aria-hidden className={styles.faqMarker}>
                    +
                  </span>
                </summary>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
