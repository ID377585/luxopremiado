import { FaqItem } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface FAQProps {
  items: FaqItem[];
  limit?: number;
  title?: string;
  subtitle?: string;
  id?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function FAQ({
  items,
  limit = 4,
  title = "Dúvidas rápidas",
  subtitle,
  id = "faq",
  ctaLabel = "ESCOLHER NÚMEROS AGORA",
  ctaHref = "/app/comprar",
}: FAQProps) {
  const quickItems = limit > 0 ? items.slice(0, limit) : items;

  return (
    <section className={styles.section} id={id}>
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {subtitle ? <p className={styles.sectionSubtitle}>{subtitle}</p> : null}
        </header>

        <ul className={styles.faqList}>
          {quickItems.map((item, index) => (
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
        {ctaLabel && ctaHref ? (
          <a className={styles.faqCta} href={ctaHref}>
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}
