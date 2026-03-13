import Link from "next/link";

import styles from "@/components/raffle/sections.module.css";

export function AffiliatePitch() {
  return (
    <section className={styles.section} id="afiliados">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Seja afiliado VIP</h2>
          <p className={styles.sectionSubtitle}>
            Indique compradores, ganhe comissão em cada pedido e tenha benefícios exclusivos na plataforma.
          </p>
        </header>
        <div className={styles.affiliateGrid}>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Benefícios rápidos</h3>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <span>Comissão automática</span>
                <strong>Receba por pedido confirmado</strong>
              </li>
              <li className={styles.featureItem}>
                <span>Painel de acompanhamento</span>
                <strong>Links, cliques e vendas</strong>
              </li>
              <li className={styles.featureItem}>
                <span>VIP no suporte</span>
                <strong>Fila prioritária</strong>
              </li>
            </ul>
          </article>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Como ativar</h3>
            <ol className={styles.affiliateSteps}>
              <li>Crie ou acesse sua conta</li>
              <li>Ative seu código na área do usuário</li>
              <li>Compartilhe o link com quem quiser comprar</li>
            </ol>
            <Link className={styles.rankingCta} href="/app/perfil">
              ATIVAR MEU CÓDIGO
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
