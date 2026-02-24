import Link from "next/link";

import { CampaignStats } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface ProgressStatsProps {
  stats: CampaignStats;
  totalNumbers: number;
  raffleSlug: string;
}

export function ProgressStats({ stats, totalNumbers, raffleSlug }: ProgressStatsProps) {
  const safeTotal = Math.max(totalNumbers, 1);
  const soldPercent = Math.min(100, Math.max(0, (stats.soldNumbers / safeTotal) * 100));

  return (
    <section className={styles.section} id="escassez">
      <div className={styles.container}>
        <article className={styles.progressCard}>
          <header className={styles.progressHeader}>
            <h2 className={styles.sectionTitle}>Números acabando: garanta o seu agora</h2>
            <p className={styles.sectionSubtitle}>
              Quanto mais números você compra, maiores suas chances. Quem acelera a compra sobe mais rápido no ranking.
            </p>
          </header>

          <div className={styles.progressBarTrack} aria-label="Progresso de números vendidos">
            <div className={styles.progressBarFill} style={{ width: `${soldPercent}%` }} />
          </div>

          <p className={styles.progressPercent}>Vendidos: {soldPercent.toFixed(1)}%</p>

          <ul className={styles.progressStatsGrid}>
            <li className={styles.statCard}>
              <p className={styles.statLabel}>Disponíveis</p>
              <p className={styles.statValue}>{stats.availableNumbers.toLocaleString("pt-BR")}</p>
            </li>
            <li className={styles.statCard}>
              <p className={styles.statLabel}>Reservados</p>
              <p className={styles.statValue}>{stats.reservedNumbers.toLocaleString("pt-BR")}</p>
            </li>
            <li className={styles.statCard}>
              <p className={styles.statLabel}>Vendidos</p>
              <p className={styles.statValue}>{stats.soldNumbers.toLocaleString("pt-BR")}</p>
            </li>
            <li className={styles.statCard}>
              <p className={styles.statLabel}>Média por usuário</p>
              <p className={styles.statValue}>{stats.averagePerUser.toLocaleString("pt-BR")}</p>
            </li>
          </ul>

          <p className={styles.progressUrgency}>Hoje já saíram vários números. Não deixa para a última hora.</p>

          <Link className={styles.progressCta} href={`/app/comprar?slug=${encodeURIComponent(raffleSlug)}`}>
            QUERO ESCOLHER MEUS NÚMEROS AGORA
          </Link>
        </article>
      </div>
    </section>
  );
}
