import Link from "next/link";

import styles from "@/components/auth/auth.module.css";

const sampleRaffles = [
  { id: "rafl-001", title: "Jeep Compass Série S", status: "active" },
  { id: "rafl-002", title: "BMW F850 GS", status: "draft" },
];

export default function AdminRafflesPage() {
  return (
    <section className={styles.grid}>
      <article className={styles.panel}>
        <strong>Rifas cadastradas</strong>
        <div style={{ display: "grid", gap: "0.6rem", marginTop: "0.5rem" }}>
          {sampleRaffles.map((raffle) => (
            <Link className={styles.dashboardLink} href={`/admin/rifas/${raffle.id}`} key={raffle.id}>
              {raffle.title} ({raffle.status})
            </Link>
          ))}
        </div>
      </article>

      <article className={styles.panel}>
        <strong>Próxima evolução</strong>
        <p>Conectar CRUD real de rifas e upload de imagens via Supabase Storage.</p>
      </article>
    </section>
  );
}
