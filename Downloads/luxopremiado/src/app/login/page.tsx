import Link from "next/link";

import { AuthMessage } from "@/components/auth/AuthMessage";
import styles from "@/components/auth/auth.module.css";
import { signInAction } from "@/lib/actions/auth";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Entrar</h1>
        <p className={styles.subtitle}>Acesse sua conta para reservar números e acompanhar seus pedidos.</p>
        <AuthMessage error={params.error} success={params.success} />

        <form action={signInAction} className={styles.form}>
          <input className={styles.input} name="email" placeholder="Seu e-mail" required type="email" />
          <input className={styles.input} name="password" placeholder="Sua senha" required type="password" />
          <button className={styles.button} type="submit">
            Entrar
          </button>
        </form>

        <div className={styles.links}>
          <Link className={styles.buttonSecondary} href="/cadastro">
            Criar conta
          </Link>
          <Link className={styles.buttonSecondary} href="/recuperar-senha">
            Recuperar senha
          </Link>
          <Link className={styles.buttonSecondary} href="/r/luxo-premiado">
            Voltar para a rifa
          </Link>
        </div>
      </section>
    </main>
  );
}
