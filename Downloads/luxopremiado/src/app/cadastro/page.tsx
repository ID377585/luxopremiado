import Link from "next/link";

import { AuthMessage } from "@/components/auth/AuthMessage";
import styles from "@/components/auth/auth.module.css";
import { signUpAction } from "@/lib/actions/auth";

interface SignupPageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Criar conta</h1>
        <p className={styles.subtitle}>Cadastre-se para escolher números e pagar com segurança.</p>
        <AuthMessage error={params.error} success={params.success} />

        <form action={signUpAction} className={styles.form}>
          <input className={styles.input} name="name" placeholder="Nome completo" required type="text" />
          <input className={styles.input} name="email" placeholder="Seu e-mail" required type="email" />
          <input
            className={styles.input}
            minLength={6}
            name="password"
            placeholder="Crie sua senha (mín. 6 caracteres)"
            required
            type="password"
          />
          <button className={styles.button} type="submit">
            Criar conta
          </button>
        </form>

        <div className={styles.links}>
          <Link className={styles.buttonSecondary} href="/login">
            Já tenho conta
          </Link>
          <Link className={styles.buttonSecondary} href="/r/luxo-premiado">
            Voltar para a rifa
          </Link>
        </div>
      </section>
    </main>
  );
}
