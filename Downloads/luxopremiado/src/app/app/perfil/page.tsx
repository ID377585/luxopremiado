import Link from "next/link";

import styles from "@/components/auth/auth.module.css";
import { ensureAffiliateCodeAction } from "@/lib/actions/affiliate";
import { updateProfileAction } from "@/lib/actions/profile";
import { getSiteUrl } from "@/lib/env";
import { formatBrlFromCents } from "@/lib/format";
import { getDefaultAffiliateRaffleSlug, getMyAffiliate, getMyProfile, getMyVipStatus } from "@/lib/dashboard";
import { getSessionUser } from "@/lib/session";
import { VIP_ACCESS_RULES, normalizeMoneyToPoints } from "@/lib/vip";

interface ProfilePageProps {
  searchParams: Promise<{ success?: string; error?: string }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const user = await getSessionUser();
  const siteUrl = getSiteUrl();
  const [profile, affiliate, defaultRaffleSlug, vip] = await Promise.all([
    getMyProfile(user?.id ?? ""),
    getMyAffiliate(user?.id ?? ""),
    getDefaultAffiliateRaffleSlug(),
    getMyVipStatus(user?.id ?? "", user?.email ?? null),
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

      <article className={styles.panel} style={{ gridColumn: "1 / -1" }}>
        <strong>Dados do usuário</strong>
        <form action={updateProfileAction} className={styles.profileForm}>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Nome
              <input className={styles.input} name="name" defaultValue={profile.name ?? ""} />
            </label>
            <label className={styles.label}>
              E-mail
              <input className={styles.input} value={user?.email ?? ""} readOnly />
            </label>
            <label className={styles.label}>
              Telefone
              <input className={styles.input} name="phone" defaultValue={profile.phone ?? ""} />
            </label>
            <label className={styles.label}>
              Foto (URL)
              <input className={styles.input} name="avatar_url" defaultValue={profile.avatar_url ?? ""} />
            </label>
            <label className={styles.label}>
              CPF
              <input className={styles.input} name="cpf" defaultValue={profile.cpf ?? ""} />
            </label>
            <label className={styles.label}>
              Data de nascimento
              <input className={styles.input} name="birth_date" defaultValue={profile.birth_date ?? ""} type="date" />
            </label>
            <label className={styles.label}>
              Rua / Avenida
              <input className={styles.input} name="address_line" defaultValue={profile.address_line ?? ""} />
            </label>
            <label className={styles.label}>
              Número
              <input className={styles.input} name="address_number" defaultValue={profile.address_number ?? ""} />
            </label>
            <label className={styles.label}>
              Complemento
              <input className={styles.input} name="address_complement" defaultValue={profile.address_complement ?? ""} />
            </label>
            <label className={styles.label}>
              Bairro
              <input className={styles.input} name="address_district" defaultValue={profile.address_district ?? ""} />
            </label>
            <label className={styles.label}>
              Cidade
              <input className={styles.input} name="address_city" defaultValue={profile.address_city ?? ""} />
            </label>
            <label className={styles.label}>
              Estado/UF
              <input className={styles.input} name="address_state" defaultValue={profile.address_state ?? ""} />
            </label>
            <label className={styles.label}>
              País
              <input className={styles.input} name="address_country" defaultValue={profile.address_country ?? ""} />
            </label>
            <label className={styles.label}>
              CEP
              <input className={styles.input} name="address_zip" defaultValue={profile.address_zip ?? ""} />
            </label>
            <label className={styles.label}>
              Banco
              <input className={styles.input} name="bank_name" defaultValue={profile.bank_name ?? ""} />
            </label>
            <label className={styles.label}>
              Agência
              <input className={styles.input} name="bank_agency" defaultValue={profile.bank_agency ?? ""} />
            </label>
            <label className={styles.label}>
              Conta corrente
              <input className={styles.input} name="bank_account" defaultValue={profile.bank_account ?? ""} />
            </label>
            <label className={styles.label}>
              Chave PIX
              <input className={styles.input} name="bank_pix_key" defaultValue={profile.bank_pix_key ?? ""} />
            </label>
          </div>
          <button className={styles.button} type="submit">
            Salvar perfil
          </button>
        </form>
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
        <strong>Status VIP</strong>
        <p>Nível atual: {vip.effective_label}</p>
        <p>Pontos acumulados: {vip.points.toLocaleString("pt-BR")}</p>
        <p>
          Pontos próprios: {(vip.point_breakdown.raffle_points + vip.point_breakdown.auction_points).toLocaleString("pt-BR")} | Rede:{" "}
          {vip.point_breakdown.network_points.toLocaleString("pt-BR")}
        </p>
        <p>
          {vip.access
            ? "Sua área VIP já está liberada."
            : vip.locked_reason ?? "Continue acumulando atividade para liberar o acesso."}
        </p>
        {vip.next_tier_label ? (
          <p>
            Próximo nível: {vip.next_tier_label} com {vip.next_tier_min_points?.toLocaleString("pt-BR")} pontos.
          </p>
        ) : null}
        <div className={styles.links}>
          {vip.access ? (
            <Link className={styles.buttonSecondary} href="/app/vip">
              Entrar na área VIP
            </Link>
          ) : null}
          {!affiliate ? (
            <p>Primeiro passo: ativar seu código de afiliado.</p>
          ) : null}
        </div>
      </article>

      <article className={styles.panel}>
        <strong>Como funciona o programa VIP</strong>
        <p>
          Somente afiliados ativos entram na trilha VIP automática.
        </p>
        <p>
          VIP: {VIP_ACCESS_RULES.vip.totalPoints.toLocaleString("pt-BR")} pontos totais com{" "}
          {VIP_ACCESS_RULES.vip.ownMinPoints.toLocaleString("pt-BR")} pontos próprios e{" "}
          {VIP_ACCESS_RULES.vip.partnerCount} afiliados indicados com{" "}
          {VIP_ACCESS_RULES.vip.partnerMinPoints.toLocaleString("pt-BR")} pontos cada.
        </p>
        <p>
          VIP Elite: {VIP_ACCESS_RULES.elite.totalPoints.toLocaleString("pt-BR")} pontos totais com{" "}
          {VIP_ACCESS_RULES.elite.ownMinPoints.toLocaleString("pt-BR")} pontos próprios e{" "}
          {VIP_ACCESS_RULES.elite.partnerCount} afiliados indicados com{" "}
          {VIP_ACCESS_RULES.elite.partnerMinPoints.toLocaleString("pt-BR")} pontos cada.
        </p>
        <p>
          Seu código já movimentou {normalizeMoneyToPoints(vip.metrics.network_investment_cents).toLocaleString("pt-BR")} pontos
          em rede validada.
        </p>
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
            ? `${siteUrl}/r/${defaultRaffleSlug}?ref=${affiliate.code}`
            : "Ative seu código para liberar o link de indicação."}
        </p>
      </article>
    </section>
  );
}
