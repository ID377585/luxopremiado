import Link from "next/link";

import { AuthMessage } from "@/components/auth/AuthMessage";
import styles from "@/components/auth/auth.module.css";
import { forgotPasswordAction } from "@/lib/actions/auth";

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Recuperar senha</h1>
        <p className={styles.subtitle}>Informe seu e-mail para receber o link de redefinição.</p>
        <AuthMessage error={params.error} success={params.success} />

        <form action={forgotPasswordAction} className={styles.form}>
          <input className={styles.input} name="email" placeholder="Seu e-mail" required type="email" />
          <button className={styles.button} type="submit">
            Enviar link
          </button>
        </form>

        <div className={styles.links}>
          <Link className={styles.buttonSecondary} href="/login">
            Voltar ao login
          </Link>
          <Link className={styles.buttonSecondary} href="/r/luxo-premiado">
            Voltar para a rifa
          </Link>
        </div>
      </section>
    </main>
  );
}
