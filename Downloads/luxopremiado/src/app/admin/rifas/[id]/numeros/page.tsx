import styles from "@/app/admin/admin.module.css";
import { getRaffleNumberStats } from "@/lib/admin-data";

interface AdminRaffleNumbersPageProps {
  params: Promise<{ id: string }>;
}

function statusColor(status: string): string {
  switch (status) {
    case "sold":
      return "#fca5a5";
    case "reserved":
      return "#fcd34d";
    default:
      return "#86efac";
  }
}

export default async function AdminRaffleNumbersPage({ params }: AdminRaffleNumbersPageProps) {
  const { id } = await params;
  const stats = await getRaffleNumberStats(id);

  return (
    <section className={styles.stack}>
      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Números da rifa</h2>

        <div className={styles.grid3}>
          <p>
            <strong>Disponíveis:</strong> {stats.available}
          </p>
          <p>
            <strong>Reservados:</strong> {stats.reserved}
          </p>
          <p>
            <strong>Vendidos:</strong> {stats.sold}
          </p>
        </div>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Amostra dos números</h2>

        {stats.sample.length === 0 ? (
          <p className={styles.notice}>Nenhum número foi gerado ainda para esta rifa.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.4rem", gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}>
            {stats.sample.map((item) => (
              <span
                key={item.number}
                style={{
                  background: "rgba(2, 6, 23, 0.6)",
                  border: `1px solid ${statusColor(item.status)}`,
                  borderRadius: "0.5rem",
                  color: "#f8fafc",
                  fontSize: "0.78rem",
                  padding: "0.35rem 0.25rem",
                  textAlign: "center",
                }}
              >
                {item.number}
              </span>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
