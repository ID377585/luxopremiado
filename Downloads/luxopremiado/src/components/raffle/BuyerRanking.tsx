import { BuyerRankingEntry } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface BuyerRankingProps {
  entries: BuyerRankingEntry[];
}

export function BuyerRanking({ entries }: BuyerRankingProps) {
  return (
    <section className={styles.section} id="ranking-compradores">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Ranking de Compradores</h2>
          <p className={styles.sectionSubtitle}>
            Top participantes por quantidade de números confirmados nesta campanha.
          </p>
        </header>

        <ol className={styles.rankingList}>
          {entries.map((entry) => (
            <li className={styles.rankingItem} key={`${entry.position}-${entry.participant}`}>
              <span className={styles.rankingPosition}>#{entry.position}</span>
              <span className={styles.rankingName}>{entry.participant}</span>
              <span className={styles.rankingValue}>{entry.totalNumbers} números</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
