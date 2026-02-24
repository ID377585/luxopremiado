import Link from "next/link";

import { CampaignStats, HeroData } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface HeroProps {
  data: HeroData;
  prizeTitle: string;
  stats: CampaignStats;
}

export function Hero({ data, prizeTitle, stats }: HeroProps) {
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

        <aside className={styles.heroAside}>
          <article className={`${styles.statCard} ${styles.heroPrizeCard}`}>
            <p className={styles.heroPrizeTitle}>Prêmio principal: {prizeTitle}</p>
            <div className={styles.heroPrizeMeta}>
              <span>{data.drawDateLabel}</span>
              <span>{data.priceLabel}</span>
            </div>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>Disponíveis</p>
            <p className={styles.statValue}>{stats.availableNumbers.toLocaleString("pt-BR")}</p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>Reservados</p>
            <p className={styles.statValue}>{stats.reservedNumbers.toLocaleString("pt-BR")}</p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>Vendidos</p>
            <p className={styles.statValue}>{stats.soldNumbers.toLocaleString("pt-BR")}</p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>Média por usuário</p>
            <p className={styles.statValue}>{stats.averagePerUser.toLocaleString("pt-BR")}</p>
          </article>
        </aside>
      </div>
    </section>
  );
}
