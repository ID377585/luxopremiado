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
          {items.map((item) => (
            <li className={styles.faqItem} key={item.question}>
              <strong>{item.question}</strong>
              <span>{item.answer}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
