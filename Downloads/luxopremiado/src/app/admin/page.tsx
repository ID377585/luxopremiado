import styles from "@/components/auth/auth.module.css";

export default function AdminHomePage() {
  return (
    <section className={styles.grid}>
      <article className={styles.panel}>
        <strong>Gestão de campanhas</strong>
        <p>Criação e publicação de rifas com status draft, active, closed e drawn.</p>
      </article>
      <article className={styles.panel}>
        <strong>Geração de números</strong>
        <p>Use a função SQL `generate_raffle_numbers` ao abrir uma campanha para venda.</p>
      </article>
      <article className={styles.panel}>
        <strong>Conciliação</strong>
        <p>Webhook marca pedidos como pagos e converte números reservados em vendidos.</p>
      </article>
    </section>
  );
}
