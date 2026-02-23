import styles from "@/components/auth/auth.module.css";
import Link from "next/link";

interface AdminRaffleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRaffleDetailPage({ params }: AdminRaffleDetailPageProps) {
  const { id } = await params;

  return (
    <section className={styles.grid}>
      <article className={styles.panel}>
        <strong>Detalhes da rifa</strong>
        <p>ID: {id}</p>
      </article>
      <article className={styles.panel}>
        <strong>Operações</strong>
        <p>Visualizar números vendidos, reservas ativas e pedidos pendentes.</p>
        <div style={{ marginTop: "0.6rem" }}>
          <Link className={styles.dashboardLink} href={`/admin/rifas/${id}/numeros`}>
            Abrir números da rifa
          </Link>
        </div>
      </article>
      <article className={styles.panel}>
        <strong>SQL útil</strong>
        <p>`select public.generate_raffle_numbers(&apos;{id}&apos;);`</p>
      </article>
    </section>
  );
}
