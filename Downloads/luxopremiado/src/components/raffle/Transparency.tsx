import { TransparencyData } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface TransparencyProps {
  data: TransparencyData;
}

export function Transparency({ data }: TransparencyProps) {
  return (
    <section className={`${styles.section} ${styles.transparencySection}`} id="transparencia">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Transparência de verdade</h2>
        </header>

        <ul className={styles.transparencyList}>
          <li className={styles.transparencyItem}>
            <strong>Método do sorteio</strong>
            <span>{data.drawMethod}</span>
          </li>
          <li className={styles.transparencyItem}>
            <strong>Organizador</strong>
            <span>{data.organizer}</span>
          </li>
          <li className={styles.transparencyItem}>
            <strong>Documento</strong>
            <span>{data.organizerDoc}</span>
          </li>
          <li className={styles.transparencyItem}>
            <strong>Contato</strong>
            <span>{data.contact}</span>
          </li>
          <li className={styles.transparencyItem}>
            <strong>Resumo das regras</strong>
            <span>{data.rulesSummary}</span>
          </li>
        </ul>
        <div className={styles.transparencyBadges} aria-label="Garantias rápidas e auditáveis">
          <div className={styles.transparencyBadge}>
            <svg
              aria-hidden
              className={styles.transparencyIcon}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
            >
              <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
            </svg>
            <span>PIX imediato</span>
          </div>
          <div className={styles.transparencyBadge}>
            <svg
              aria-hidden
              className={styles.transparencyIcon}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
            >
              <path d="M12 3 4.5 6v5.6c0 4.2 3.2 8 7.5 9.4 4.3-1.4 7.5-5.2 7.5-9.4V6L12 3z" />
              <path d="m9.5 12 1.8 1.8 3.2-3.6" />
            </svg>
            <span>Sorteio auditável</span>
          </div>
        </div>
        <p className={styles.transparencyFootnote}>Tudo que é combinado fica registrado na página da campanha.</p>
      </div>
    </section>
  );
}
