import Link from "next/link";

import styles from "@/app/admin/admin.module.css";
import { deleteTransparencyAction, upsertTransparencyAction } from "@/lib/actions/admin";
import {
  getAdminRaffles,
  getAdminTransparencyByRaffleId,
  getAllAdminTransparency,
} from "@/lib/admin-data";
import { hasSupabaseEnv } from "@/lib/env";

interface AdminTransparencyPageProps {
  searchParams: Promise<{ raffle?: string; success?: string; error?: string }>;
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function AdminTransparencyPage({ searchParams }: AdminTransparencyPageProps) {
  const params = await searchParams;
  const [raffles, allTransparency] = await Promise.all([getAdminRaffles(), getAllAdminTransparency()]);

  const selectedRaffleId = params.raffle && raffles.some((item) => item.id === params.raffle)
    ? params.raffle
    : (raffles[0]?.id ?? "");

  const selectedTransparency = selectedRaffleId
    ? await getAdminTransparencyByRaffleId(selectedRaffleId)
    : null;

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
        <h2 className={styles.cardTitle}>Selecionar rifa</h2>

        <form className={styles.row}>
          <label className={styles.label}>
            Rifa
            <select className={styles.select} defaultValue={selectedRaffleId} name="raffle">
              {raffles.map((raffle) => (
                <option key={raffle.id} value={raffle.id}>
                  {raffle.title}
                </option>
              ))}
            </select>
          </label>

          <button className={styles.buttonGhost} type="submit">
            Carregar
          </button>
        </form>
      </article>

      {selectedRaffleId ? (
        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Editar transparência</h2>

          <form action={upsertTransparencyAction} className={styles.form}>
            <input name="raffle_id" type="hidden" value={selectedRaffleId} />
            <input name="redirect_to" type="hidden" value={`/admin/transparencia?raffle=${selectedRaffleId}`} />

            <label className={styles.label}>
              Método do sorteio
              <input
                className={styles.input}
                defaultValue={selectedTransparency?.draw_method ?? ""}
                name="draw_method"
                placeholder="Ex: Resultado da Loteria Federal"
              />
            </label>

            <label className={styles.label}>
              Regras
              <textarea
                className={styles.textarea}
                defaultValue={selectedTransparency?.rules ?? ""}
                name="rules"
                placeholder="Texto completo das regras"
              />
            </label>

            <label className={styles.label}>
              Texto de auditoria
              <textarea
                className={styles.textarea}
                defaultValue={selectedTransparency?.audit_text ?? ""}
                name="audit_text"
                placeholder="Como auditar o sorteio"
              />
            </label>

            <div className={styles.grid3}>
              <label className={styles.label}>
                Nome do organizador
                <input
                  className={styles.input}
                  defaultValue={selectedTransparency?.organizer_name ?? ""}
                  name="organizer_name"
                  placeholder="Razão social / nome"
                />
              </label>

              <label className={styles.label}>
                Documento do organizador
                <input
                  className={styles.input}
                  defaultValue={selectedTransparency?.organizer_doc ?? ""}
                  name="organizer_doc"
                  placeholder="CNPJ/CPF"
                />
              </label>

              <label className={styles.label}>
                Contato
                <input
                  className={styles.input}
                  defaultValue={selectedTransparency?.contact ?? ""}
                  name="contact"
                  placeholder="Email, WhatsApp, telefone"
                />
              </label>
            </div>

            <div className={styles.row}>
              <button className={styles.button} type="submit">
                Salvar transparência
              </button>

              <Link className={styles.buttonGhost} href={`/admin/rifas/${selectedRaffleId}`}>
                Voltar para rifa
              </Link>
            </div>
          </form>

          {selectedTransparency ? (
            <form action={deleteTransparencyAction} className={styles.row}>
              <input name="raffle_id" type="hidden" value={selectedRaffleId} />
              <input name="redirect_to" type="hidden" value="/admin/transparencia" />
              <button className={styles.buttonDanger} type="submit">
                Excluir registro
              </button>
            </form>
          ) : null}
        </article>
      ) : (
        <p className={styles.notice}>Nenhuma rifa cadastrada para editar transparência.</p>
      )}

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Registros existentes</h2>

        {allTransparency.length === 0 ? (
          <p className={styles.notice}>Nenhum registro de transparência cadastrado.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rifa</th>
                  <th>Método</th>
                  <th>Organizador</th>
                  <th>Atualizado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {allTransparency.map((item) => (
                  <tr key={item.raffle_id}>
                    <td className={styles.mono}>{item.raffle_id}</td>
                    <td>{item.draw_method || "-"}</td>
                    <td>{item.organizer_name || "-"}</td>
                    <td>{formatDateTime(item.updated_at)}</td>
                    <td>
                      <div className={styles.row}>
                        <Link className={styles.buttonGhost} href={`/admin/transparencia?raffle=${item.raffle_id}`}>
                          Editar
                        </Link>
                        <Link className={styles.buttonGhost} href={`/admin/rifas/${item.raffle_id}`}>
                          Abrir rifa
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}
