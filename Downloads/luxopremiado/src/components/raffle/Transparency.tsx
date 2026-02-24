import { TransparencyData } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface TransparencyProps {
  data: TransparencyData;
}

export function Transparency({ data }: TransparencyProps) {
  return (
    <section className={styles.section} id="transparencia">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Transparência de verdade</h2>
          <p className={styles.sectionSubtitle}>
            Método do sorteio, regras e dados do organizador publicados para você participar com tranquilidade.
          </p>
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
        <p className={styles.transparencyFootnote}>Tudo que é combinado fica registrado na página da campanha.</p>
      </div>
    </section>
  );
}
