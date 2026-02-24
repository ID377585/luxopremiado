import Link from "next/link";

import { RetentionData } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface RetentionLoopProps {
  data: RetentionData;
}

function getChannelLabel(channel: RetentionData["features"][number]["channel"]) {
  if (channel === "email") {
    return "E-mail";
  }
  if (channel === "whatsapp") {
    return "WhatsApp";
  }
  return "Painel";
}

export function RetentionLoop({ data }: RetentionLoopProps) {
  return (
    <section className={styles.section} id="alertas">
      <div className={styles.container}>
        <article className={styles.retentionCard}>
          <header className={styles.retentionHeader}>
            <h2 className={styles.sectionTitle}>{data.title}</h2>
            <p className={styles.sectionSubtitle}>{data.subtitle}</p>
          </header>

          <ul className={styles.retentionGrid}>
            {data.features.map((feature) => (
              <li className={styles.retentionItem} key={`${feature.channel}-${feature.title}`}>
                <p className={styles.retentionChannel}>{getChannelLabel(feature.channel)}</p>
                <p className={styles.retentionItemTitle}>{feature.title}</p>
                <p className={styles.retentionItemDescription}>{feature.description}</p>
              </li>
            ))}
          </ul>

          <div className={styles.retentionActions}>
            <Link className={styles.retentionPrimaryCta} href={data.ctaPrimaryHref}>
              {data.ctaPrimaryLabel}
            </Link>
            <Link className={styles.retentionSecondaryCta} href={data.ctaSecondaryHref}>
              {data.ctaSecondaryLabel}
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
