import { HeroData } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface HeroProps {
  data: HeroData;
}

export function Hero({ data }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={`${styles.container} ${styles.heroGrid}`}>
        <div className={styles.heroPanel}>
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
          <a className={styles.heroCta} href="#escolher-numeros">
            {data.ctaLabel}
          </a>
        </div>

        <aside className={styles.heroAside}>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>Disponíveis</p>
            <p className={styles.statValue}>8.412 números</p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>Reservados</p>
            <p className={styles.statValue}>1.142 números</p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>Vendidos</p>
            <p className={styles.statValue}>7.846 números</p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>Bilhetes por usuário</p>
            <p className={styles.statValue}>Média 4,8</p>
          </article>
        </aside>
      </div>
    </section>
  );
}
