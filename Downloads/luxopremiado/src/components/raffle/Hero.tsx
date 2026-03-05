import Link from "next/link";

import { HeroData } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface HeroProps {
  data: HeroData;
  prizeTitle: string;
}

export function Hero({ data, prizeTitle }: HeroProps) {
  return (
    <section className={styles.hero} id="inicio">
      <div className={`${styles.container} ${styles.heroGrid}`}>
        <div className={styles.heroPanel}>
          <p className={styles.heroKicker}>Luxo Premiado</p>
          <ul className={styles.heroBadgeList}>
            {data.badges.map((badge) => (
              <li className={styles.heroBadge} key={badge}>
                {badge}
              </li>
            ))}
          </ul>
          <h1 className={styles.heroTitle}>{data.title}</h1>
          <p className={styles.heroSubtitle}>{data.subtitle}</p>
          <div className={styles.heroMeta}>
            <span className={styles.heroMetaItem}>{data.drawDateLabel}</span>
            <span className={styles.heroMetaItem}>{data.priceLabel}</span>
          </div>
          <Link className={styles.heroCta} href="/app/comprar">
            {data.ctaLabel}
          </Link>
          <p className={styles.heroMicrotext}>
            Sem taxas escondidas. Você acompanha o status dos seus números pelo painel depois do pagamento.
          </p>
        </div>
      </div>
    </section>
  );
}
