import Link from "next/link";

import { AuthMessage } from "@/components/auth/AuthMessage";
import authStyles from "@/components/auth/auth.module.css";
import { forgotPasswordAction } from "@/lib/actions/auth";

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

function mapFriendlyError(error?: string): string | undefined {
  if (!error) {
    return undefined;
  }

  const normalized = error.toLowerCase();
  if (normalized.includes("rate limit") || normalized.includes("security purposes")) {
    return "Muitas tentativas em sequência. Aguarde cerca de 60 segundos e tente novamente.";
  }

  return error;
}

function mapFriendlySuccess(success?: string): string | undefined {
  if (!success) {
    return undefined;
  }

  return "Pronto! Enviamos o link de redefinição para seu e-mail.";
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const friendlyError = mapFriendlyError(params.error);
  const friendlySuccess = mapFriendlySuccess(params.success);

  return (
    <main className={authStyles.page}>
      <section className={authStyles.card}>
        <h1 className={authStyles.title}>Recuperar senha</h1>
        <p className={authStyles.subtitle}>Informe seu e-mail para receber o link de redefinição.</p>

        <AuthMessage error={friendlyError} success={friendlySuccess} />

        <form action={forgotPasswordAction} className={authStyles.form}>
          <input className={authStyles.input} name="email" placeholder="Seu e-mail" required type="email" />
          <button className={authStyles.button} type="submit">
            Enviar link
          </button>
        </form>

        <div className={authStyles.links}>
          <Link className={authStyles.buttonSecondary} href="/login">
            Voltar ao login
          </Link>
          <Link className={authStyles.buttonSecondary} href="/r/luxo-premiado#inicio">
            Voltar para a rifa
          </Link>
        </div>
      </section>
    </main>
  );
}
