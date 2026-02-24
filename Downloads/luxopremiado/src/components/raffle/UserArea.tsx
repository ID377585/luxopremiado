import Link from "next/link";

import styles from "@/components/raffle/sections.module.css";

interface UserAreaProps {
  userName?: string | null;
}

export function UserArea({ userName }: UserAreaProps) {
  const isLoggedIn = Boolean(userName);

  return (
    <section className={styles.section} id="area-usuario">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Área do Usuário</h2>
          <p className={styles.sectionSubtitle}>Cadastre-se, acompanhe pedidos e recupere acesso quando necessário.</p>
        </header>

        <div className={styles.userAreaGrid}>
          <article className={styles.userCard}>
            <div>
              <h3 className={styles.userCardTitle}>
                {isLoggedIn ? `Olá, ${userName}` : "Conta do participante"}
              </h3>
              <p className={styles.userCardText}>
                {isLoggedIn
                  ? "Acesse seus números, histórico e dados de pagamento no painel."
                  : "Crie sua conta em poucos segundos para reservar números e finalizar pagamento."}
              </p>
            </div>

            <div className={styles.buttonRow}>
              {isLoggedIn ? (
                <>
                  <Link className={styles.buttonPrimary} href="/app/comprar">
                    Escolher números e pagar
                  </Link>
                  <Link className={styles.buttonSecondary} href="/app">
                    Meu painel
                  </Link>
                </>
              ) : (
                <>
                  <Link className={styles.buttonPrimary} href="/cadastro">
                    Criar conta
                  </Link>
                  <Link className={styles.buttonSecondary} href="/login">
                    Entrar
                  </Link>
                </>
              )}
            </div>
          </article>

          <article className={styles.userCard}>
            <div>
              <h3 className={styles.userCardTitle}>Recuperar senha</h3>
              <p className={styles.userCardText}>
                Enviamos um link seguro por e-mail para redefinição de senha.
              </p>
            </div>
            <Link className={styles.buttonSecondary} href="/recuperar-senha">
              Recuperar acesso
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
