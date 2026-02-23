import styles from "@/components/auth/auth.module.css";

export default function AdminTransparencyPage() {
  return (
    <section className={styles.grid}>
      <article className={styles.panel}>
        <strong>Regulamento</strong>
        <p>Gerencie regras, método de sorteio e dados do organizador na tabela `transparency`.</p>
      </article>
      <article className={styles.panel}>
        <strong>Auditoria</strong>
        <p>Publique explicações e anexos para manter histórico público validável.</p>
      </article>
    </section>
  );
}
