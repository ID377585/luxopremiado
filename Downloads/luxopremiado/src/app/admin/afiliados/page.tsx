import styles from "@/app/admin/admin.module.css";
import {
  updateAffiliateConfigAction,
  updateAffiliateStatusAction,
  updateOrderAffiliateStatusAction,
} from "@/lib/actions/admin";
import { getAdminAffiliateSummary, getAdminOrderAffiliateRows } from "@/lib/admin-data";

interface AdminAffiliatesPageProps {
  searchParams: Promise<{ success?: string; error?: string }>;
}

function formatBrl(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export default async function AdminAffiliatesPage({ searchParams }: AdminAffiliatesPageProps) {
  const params = await searchParams;

  const [affiliates, orderRows] = await Promise.all([
    getAdminAffiliateSummary(),
    getAdminOrderAffiliateRows(),
  ]);

  return (
    <section className={styles.stack}>
      {params.success ? <p className={`${styles.message} ${styles.success}`}>{params.success}</p> : null}
      {params.error ? <p className={`${styles.message} ${styles.error}`}>{params.error}</p> : null}

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Afiliados</h2>

        {affiliates.length === 0 ? (
          <p className={styles.notice}>Nenhum afiliado cadastrado.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Código</th>
                  <th>Comissão %</th>
                  <th>Status</th>
                  <th>Pedidos</th>
                  <th>Comissão aprovada</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((affiliate) => (
                  <tr key={affiliate.affiliate_id}>
                    <td>{affiliate.name}</td>
                    <td className={styles.mono}>{affiliate.code}</td>
                    <td>{(affiliate.commission_bps / 100).toFixed(2)}%</td>
                    <td>{affiliate.is_active ? "ativo" : "bloqueado"}</td>
                    <td>{affiliate.total_orders}</td>
                    <td>{formatBrl(affiliate.approved_commission_cents + affiliate.paid_commission_cents)}</td>
                    <td>
                      <div className={styles.row}>
                        <form action={updateAffiliateStatusAction}>
                          <input name="affiliate_id" type="hidden" value={affiliate.affiliate_id} />
                          <input name="is_active" type="hidden" value={affiliate.is_active ? "false" : "true"} />
                          <input name="redirect_to" type="hidden" value="/admin/afiliados" />
                          <button className={styles.buttonDanger} type="submit">
                            {affiliate.is_active ? "Bloquear" : "Reativar"}
                          </button>
                        </form>
                      </div>

                      <form action={updateAffiliateConfigAction} className={styles.row}>
                        <input name="affiliate_id" type="hidden" value={affiliate.affiliate_id} />
                        <input name="redirect_to" type="hidden" value="/admin/afiliados" />
                        <input
                          className={styles.input}
                          defaultValue={affiliate.name}
                          name="display_name"
                          placeholder="Nome de exibição"
                        />
                        <input
                          className={styles.input}
                          defaultValue={affiliate.commission_bps}
                          min={0}
                          name="commission_bps"
                          type="number"
                        />
                        <button className={styles.buttonGhost} type="submit">
                          Salvar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Comissões por pedido</h2>

        {orderRows.length === 0 ? (
          <p className={styles.notice}>Nenhuma comissão registrada.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Código</th>
                  <th>Comissão</th>
                  <th>Status</th>
                  <th>Criado em</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {orderRows.map((row) => (
                  <tr key={row.id}>
                    <td className={styles.mono}>{row.order_id}</td>
                    <td>{row.code}</td>
                    <td>{formatBrl(row.commission_cents)}</td>
                    <td>{row.status}</td>
                    <td>
                      {new Date(row.created_at).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>
                      <form action={updateOrderAffiliateStatusAction} className={styles.row}>
                        <input name="order_affiliate_id" type="hidden" value={row.id} />
                        <input name="redirect_to" type="hidden" value="/admin/afiliados" />
                        <select className={styles.select} defaultValue={row.status} name="status">
                          <option value="pending">pending</option>
                          <option value="approved">approved</option>
                          <option value="paid">paid</option>
                          <option value="canceled">canceled</option>
                        </select>
                        <button className={styles.buttonGhost} type="submit">
                          Atualizar
                        </button>
                      </form>
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
