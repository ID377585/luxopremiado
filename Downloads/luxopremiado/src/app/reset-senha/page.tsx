import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import styles from "@/components/auth/auth.module.css";

export default function ResetPasswordPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Redefinir senha</h1>
        <p className={styles.subtitle}>
          Depois de abrir o link enviado por e-mail, defina sua nova senha abaixo.
        </p>

        <ResetPasswordForm />

        <div className={styles.links}>
          <Link className={styles.buttonSecondary} href="/login">
            Ir para login
          </Link>
        </div>
      </section>
    </main>
  );
}
