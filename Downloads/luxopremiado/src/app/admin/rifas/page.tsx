import Link from "next/link";

import styles from "@/app/admin/admin.module.css";
import { createRaffleAction, deleteRaffleAction } from "@/lib/actions/admin";
import { getAdminRaffles } from "@/lib/admin-data";
import { hasSupabaseEnv } from "@/lib/env";
import { formatBrlFromCents } from "@/lib/format";

interface AdminRafflesPageProps {
  searchParams: Promise<{ success?: string; error?: string }>;
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "active":
      return styles.badgeActive;
    case "closed":
      return styles.badgeClosed;
    case "drawn":
      return styles.badgeDrawn;
    default:
      return styles.badgeDraft;
  }
}

function formatDrawDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function AdminRafflesPage({ searchParams }: AdminRafflesPageProps) {
  const params = await searchParams;
  const raffles = await getAdminRaffles();

  return (
    <section className={styles.stack}>
      {!hasSupabaseEnv() ? (
        <p className={styles.notice}>
          Supabase não configurado. O CRUD real será habilitado após preencher variáveis de ambiente.
        </p>
      ) : null}

      {params.success ? <p className={`${styles.message} ${styles.success}`}>{params.success}</p> : null}
      {params.error ? <p className={`${styles.message} ${styles.error}`}>{params.error}</p> : null}

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Criar rifa</h2>

        <form action={createRaffleAction} className={styles.form}>
          <input name="redirect_to" type="hidden" value="/admin/rifas" />

          <div className={styles.grid3}>
            <label className={styles.label}>
              Título
              <input className={styles.input} name="title" placeholder="Ex: Jeep Compass Série S" required />
            </label>

            <label className={styles.label}>
              Slug (opcional)
              <input className={styles.input} name="slug" placeholder="jeep-compass-serie-s" />
            </label>

            <label className={styles.label}>
              Cover URL
              <input className={styles.input} name="cover_image_url" placeholder="https://..." />
            </label>
          </div>

          <label className={styles.label}>
            Descrição
            <textarea className={styles.textarea} name="description" placeholder="Descrição pública da rifa" />
          </label>

          <div className={styles.grid3}>
            <label className={styles.label}>
              Preço em centavos
              <input className={styles.input} min={1} name="price_cents" required type="number" />
            </label>

            <label className={styles.label}>
              Total de números
              <input className={styles.input} min={1} name="total_numbers" required type="number" />
            </label>

            <label className={styles.label}>
              Limite por usuário
              <input className={styles.input} defaultValue={0} min={0} name="max_numbers_per_user" type="number" />
            </label>
          </div>

          <div className={styles.grid3}>

            <label className={styles.label}>
              Data do sorteio
              <input className={styles.input} name="draw_date" type="datetime-local" />
            </label>
          </div>

          <div className={styles.grid3}>
            <label className={styles.label}>
              Método
              <select className={styles.select} defaultValue="loteria_federal" name="draw_method">
                <option value="loteria_federal">loteria_federal</option>
                <option value="sorteador">sorteador</option>
                <option value="ao_vivo">ao_vivo</option>
                <option value="outro">outro</option>
              </select>
            </label>

            <label className={styles.label}>
              Status
              <select className={styles.select} defaultValue="draft" name="status">
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="closed">closed</option>
                <option value="drawn">drawn</option>
              </select>
            </label>

            <label className={styles.checkbox}>
              <input name="generate_numbers" type="checkbox" />
              Gerar números ao salvar
            </label>
          </div>

          <div className={styles.row}>
            <button className={styles.button} type="submit">
              Criar rifa
            </button>
          </div>
        </form>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Rifas cadastradas</h2>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Título</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Preço</th>
                <th>Números</th>
                <th>Limite usuário</th>
                <th>Sorteio</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {raffles.map((raffle) => (
                <tr key={raffle.id}>
                  <td>{raffle.title}</td>
                  <td className={styles.mono}>{raffle.slug}</td>
                  <td>
                    <span className={`${styles.badge} ${statusBadgeClass(raffle.status)}`}>{raffle.status}</span>
                  </td>
                  <td>{formatBrlFromCents(raffle.price_cents)}</td>
                  <td>{raffle.total_numbers}</td>
                  <td>{raffle.max_numbers_per_user || "sem limite"}</td>
                  <td>{formatDrawDate(raffle.draw_date)}</td>
                  <td>
                    <div className={styles.row}>
                      <Link className={styles.buttonGhost} href={`/admin/rifas/${raffle.id}`}>
                        Editar
                      </Link>

                      <form action={deleteRaffleAction}>
                        <input name="raffle_id" type="hidden" value={raffle.id} />
                        <input name="redirect_to" type="hidden" value="/admin/rifas" />
                        <button className={styles.buttonDanger} type="submit">
                          Excluir
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
