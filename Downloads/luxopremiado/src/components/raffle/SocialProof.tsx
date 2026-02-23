import { SocialProofEntry } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface SocialProofProps {
  entries: SocialProofEntry[];
}

export function SocialProof({ entries }: SocialProofProps) {
  return (
    <section className={styles.section} id="prova-social">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Prova Social</h2>
          <p className={styles.sectionSubtitle}>Relatos e registros públicos de participantes e ganhadores.</p>
        </header>

        <ul className={styles.proofList}>
          {entries.map((entry) => (
            <li className={styles.proofItem} key={`${entry.title}-${entry.author}`}>
              <strong>{entry.title}</strong>
              <span>{entry.content}</span>
              <span>{entry.author}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
