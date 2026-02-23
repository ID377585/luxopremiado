import Link from "next/link";

import styles from "@/app/admin/admin.module.css";
import {
  createRaffleImageAction,
  deleteRaffleAction,
  deleteRaffleImageAction,
  updateRaffleAction,
} from "@/lib/actions/admin";
import {
  getAdminRaffleById,
  getAdminRaffleImages,
  getAdminTransparencyByRaffleId,
} from "@/lib/admin-data";

interface AdminRaffleDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}

function toDatetimeLocal(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function AdminRaffleDetailPage({
  params,
  searchParams,
}: AdminRaffleDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const [raffle, images, transparency] = await Promise.all([
    getAdminRaffleById(id),
    getAdminRaffleImages(id),
    getAdminTransparencyByRaffleId(id),
  ]);

  if (!raffle) {
    return (
      <section className={styles.stack}>
        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Rifa não encontrada</h2>
          <div className={styles.row}>
            <Link className={styles.buttonGhost} href="/admin/rifas">
              Voltar para rifas
            </Link>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className={styles.stack}>
      {query.success ? <p className={`${styles.message} ${styles.success}`}>{query.success}</p> : null}
      {query.error ? <p className={`${styles.message} ${styles.error}`}>{query.error}</p> : null}

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Editar rifa</h2>

        <form action={updateRaffleAction} className={styles.form}>
          <input name="raffle_id" type="hidden" value={raffle.id} />
          <input name="redirect_to" type="hidden" value={`/admin/rifas/${raffle.id}`} />

          <div className={styles.grid3}>
            <label className={styles.label}>
              Título
              <input className={styles.input} defaultValue={raffle.title} name="title" required />
            </label>

            <label className={styles.label}>
              Slug
              <input className={styles.input} defaultValue={raffle.slug} name="slug" required />
            </label>

            <label className={styles.label}>
              Cover URL
              <input className={styles.input} defaultValue={raffle.cover_image_url} name="cover_image_url" />
            </label>
          </div>

          <label className={styles.label}>
            Descrição
            <textarea className={styles.textarea} defaultValue={raffle.description} name="description" />
          </label>

          <div className={styles.grid3}>
            <label className={styles.label}>
              Preço em centavos
              <input
                className={styles.input}
                defaultValue={String(raffle.price_cents)}
                min={1}
                name="price_cents"
                required
                type="number"
              />
            </label>

            <label className={styles.label}>
              Total de números
              <input
                className={styles.input}
                defaultValue={String(raffle.total_numbers)}
                min={1}
                name="total_numbers"
                required
                type="number"
              />
            </label>

            <label className={styles.label}>
              Limite por usuário
              <input
                className={styles.input}
                defaultValue={String(raffle.max_numbers_per_user)}
                min={0}
                name="max_numbers_per_user"
                type="number"
              />
            </label>
          </div>

          <div className={styles.grid3}>
            <label className={styles.label}>
              Data do sorteio
              <input
                className={styles.input}
                defaultValue={toDatetimeLocal(raffle.draw_date)}
                name="draw_date"
                type="datetime-local"
              />
            </label>
          </div>

          <div className={styles.grid3}>
            <label className={styles.label}>
              Método
              <select className={styles.select} defaultValue={raffle.draw_method} name="draw_method">
                <option value="loteria_federal">loteria_federal</option>
                <option value="sorteador">sorteador</option>
                <option value="ao_vivo">ao_vivo</option>
                <option value="outro">outro</option>
              </select>
            </label>

            <label className={styles.label}>
              Status
              <select className={styles.select} defaultValue={raffle.status} name="status">
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="closed">closed</option>
                <option value="drawn">drawn</option>
              </select>
            </label>

            <label className={styles.checkbox}>
              <input name="generate_numbers" type="checkbox" />
              Executar <code>generate_raffle_numbers</code>
            </label>
          </div>

          <div className={styles.row}>
            <button className={styles.button} type="submit">
              Salvar rifa
            </button>

            <Link className={styles.buttonGhost} href={`/admin/rifas/${raffle.id}/numeros`}>
              Ver números
            </Link>

            <Link className={styles.buttonGhost} href={`/admin/transparencia?raffle=${raffle.id}`}>
              Editar transparência
            </Link>
          </div>
        </form>

        <form action={deleteRaffleAction} className={styles.row}>
          <input name="raffle_id" type="hidden" value={raffle.id} />
          <input name="redirect_to" type="hidden" value="/admin/rifas" />
          <button className={styles.buttonDanger} type="submit">
            Excluir rifa
          </button>
        </form>

        <code className={styles.code}>select public.generate_raffle_numbers(&apos;{raffle.id}&apos;);</code>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Imagens da rifa</h2>

        <form action={createRaffleImageAction} className={styles.form}>
          <input name="raffle_id" type="hidden" value={raffle.id} />
          <input name="redirect_to" type="hidden" value={`/admin/rifas/${raffle.id}`} />

          <div className={styles.grid2}>
            <label className={styles.label}>
              URL da imagem
              <input className={styles.input} name="image_url" placeholder="https://..." required />
            </label>

            <label className={styles.label}>
              Ordem
              <input className={styles.input} defaultValue={images.length} name="sort_order" type="number" />
            </label>
          </div>

          <div className={styles.row}>
            <button className={styles.button} type="submit">
              Adicionar imagem
            </button>
          </div>
        </form>

        <div className={styles.list}>
          {images.length === 0 ? (
            <p className={styles.notice}>Nenhuma imagem cadastrada.</p>
          ) : (
            images.map((image) => (
              <div className={styles.listItem} key={image.id}>
                <div className={styles.grow}>
                  <p className={styles.mono}>{image.url}</p>
                  <p className={styles.mono}>ordem: {image.sort_order}</p>
                </div>

                <form action={deleteRaffleImageAction}>
                  <input name="raffle_id" type="hidden" value={raffle.id} />
                  <input name="image_id" type="hidden" value={image.id} />
                  <input name="redirect_to" type="hidden" value={`/admin/rifas/${raffle.id}`} />
                  <button className={styles.buttonDanger} type="submit">
                    Remover
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Resumo da transparência</h2>
        {transparency ? (
          <div className={styles.list}>
            <p>
              <strong>Atualizado em:</strong> {formatDateTime(transparency.updated_at)}
            </p>
            <p>
              <strong>Método:</strong> {transparency.draw_method || "-"}
            </p>
            <p>
              <strong>Organizador:</strong> {transparency.organizer_name || "-"}
            </p>
            <p>
              <strong>Contato:</strong> {transparency.contact || "-"}
            </p>
          </div>
        ) : (
          <p className={styles.notice}>Ainda não existe registro de transparência para esta rifa.</p>
        )}
      </article>
    </section>
  );
}
