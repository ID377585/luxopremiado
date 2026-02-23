import styles from "@/components/auth/auth.module.css";

interface AdminRaffleNumbersPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRaffleNumbersPage({ params }: AdminRaffleNumbersPageProps) {
  const { id } = await params;

  return (
    <section className={styles.grid}>
      <article className={styles.panel}>
        <strong>Números da rifa</strong>
        <p>Rifa: {id}</p>
      </article>
      <article className={styles.panel}>
        <strong>Indicadores</strong>
        <p>Monte aqui a visão de números disponíveis, reservados e vendidos.</p>
      </article>
    </section>
  );
}
