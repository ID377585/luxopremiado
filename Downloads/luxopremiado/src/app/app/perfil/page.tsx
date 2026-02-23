import styles from "@/components/auth/auth.module.css";
import { ensureAffiliateCodeAction } from "@/lib/actions/affiliate";
import { formatBrlFromCents } from "@/lib/format";
import { getDefaultAffiliateRaffleSlug, getMyAffiliate, getMyProfile } from "@/lib/dashboard";
import { getSessionUser } from "@/lib/session";

interface ProfilePageProps {
  searchParams: Promise<{ success?: string; error?: string }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const user = await getSessionUser();
  const [profile, affiliate, defaultRaffleSlug] = await Promise.all([
    getMyProfile(user?.id ?? ""),
    getMyAffiliate(user?.id ?? ""),
    getDefaultAffiliateRaffleSlug(),
  ]);

  return (
    <section className={styles.grid} style={{ alignItems: "start" }}>
      {params.success ? (
        <article className={styles.panel} style={{ gridColumn: "1 / -1" }}>
          <strong>Sucesso</strong>
          <span>{params.success}</span>
        </article>
      ) : null}

      {params.error ? (
        <article className={styles.panel} style={{ gridColumn: "1 / -1", borderColor: "rgba(239, 68, 68, 0.45)" }}>
          <strong>Erro</strong>
          <span>{params.error}</span>
        </article>
      ) : null}

      <article className={styles.panel}>
        <strong>Nome</strong>
        <span>{profile.name ?? "Não definido"}</span>
      </article>

      <article className={styles.panel}>
        <strong>E-mail</strong>
        <span>{user?.email ?? "demo@luxopremiado.com.br"}</span>
      </article>

      <article className={styles.panel}>
        <strong>Telefone</strong>
        <span>{profile.phone ?? "Não definido"}</span>
      </article>

      <article className={styles.panel}>
        <strong>Função</strong>
        <span>{profile.role}</span>
      </article>

      <article className={styles.panel}>
        <strong>Afiliado</strong>
        {affiliate ? (
          <>
            <p>Código: {affiliate.code}</p>
            <p>Comissão: {(affiliate.commission_bps / 100).toFixed(2)}%</p>
            <p>Pedidos indicados: {affiliate.total_referred_orders}</p>
            <p>Comissão aprovada: {formatBrlFromCents(affiliate.approved_commission_cents)}</p>
          </>
        ) : (
          <p>Você ainda não possui código de afiliado.</p>
        )}
      </article>

      <article className={styles.panel}>
        <strong>Gerar código de afiliado</strong>
        <form action={ensureAffiliateCodeAction} style={{ display: "grid", gap: "0.6rem", marginTop: "0.6rem" }}>
          <input name="redirect_to" type="hidden" value="/app/perfil" />
          <input
            className={styles.input}
            name="preferred_code"
            placeholder="Código opcional (3-40, letras/números/_/-)"
            type="text"
          />
          <button className={styles.button} type="submit">
            Ativar afiliado
          </button>
        </form>
      </article>

      <article className={styles.panel}>
        <strong>Link de indicação</strong>
        <p>
          {affiliate
            ? `https://luxopremiado.com.br/r/${defaultRaffleSlug}?ref=${affiliate.code}`
            : "Ative seu código para liberar o link de indicação."}
        </p>
      </article>
    </section>
  );
}
