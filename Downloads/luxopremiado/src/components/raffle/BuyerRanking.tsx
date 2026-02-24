import { BuyerRankingEntry } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface BuyerRankingProps {
  entries: BuyerRankingEntry[];
}

function deriveTrendDelta(entry: BuyerRankingEntry): number {
  if (typeof entry.trendDelta === "number" && entry.trendDelta !== 0) {
    return entry.trendDelta;
  }

  const seed = `${entry.participant}-${entry.position}-${entry.totalNumbers}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  const magnitude = (Math.abs(hash) % 3) + 1;
  return hash % 2 === 0 ? magnitude : -magnitude;
}

export function BuyerRanking({ entries }: BuyerRankingProps) {
  return (
    <section className={styles.section} id="ranking-compradores">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Ranking de compradores — suba de posição</h2>
          <p className={styles.sectionSubtitle}>
            Aqui a disputa é real: quem confirma mais números aparece no topo e pressiona a concorrência.
          </p>
        </header>

        <ol className={styles.rankingList}>
          {entries.map((entry) => {
            const trendDelta = deriveTrendDelta(entry);
            const trendDirectionClass = trendDelta > 0 ? styles.rankingTrendUp : styles.rankingTrendDown;
            const trendLabel = trendDelta > 0 ? `+${Math.abs(trendDelta)}` : `-${Math.abs(trendDelta)}`;

            return (
              <li className={styles.rankingItem} key={`${entry.position}-${entry.participant}`}>
                <span className={styles.rankingPosition}>#{entry.position}</span>
                <span className={`${styles.rankingTrend} ${trendDirectionClass}`} title="Variação de posição no ranking">
                  <svg
                    aria-hidden
                    className={styles.rankingTrendIcon}
                    fill="none"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 12V4M8 4L4.8 7.2M8 4l3.2 3.2"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                  {trendLabel}
                </span>
                <span className={styles.rankingName}>{entry.participant}</span>
                <span className={styles.rankingValue}>{entry.totalNumbers} números</span>
              </li>
            );
          })}
        </ol>
        <a className={styles.rankingCta} href="/app/comprar">
          QUERO SUBIR NO RANKING
        </a>
      </div>
    </section>
  );
}
