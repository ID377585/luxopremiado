"use client";

import { FormEvent, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "@/components/auth/auth.module.css";

export function ResetPasswordForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setStatus({
        type: "error",
        message: "Supabase não configurado. Defina as variáveis de ambiente.",
      });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: "error", message: "A senha precisa ter no mínimo 6 caracteres." });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "As senhas não conferem." });
      return;
    }

    setLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus({ type: "error", message: error.message });
      setLoading(false);
      return;
    }

    setStatus({ type: "success", message: "Senha atualizada. Você já pode acessar sua conta." });
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {status ? (
        <p className={`${styles.message} ${status.type === "error" ? styles.error : styles.success}`}>
          {status.message}
        </p>
      ) : null}

      <input
        autoComplete="new-password"
        className={styles.input}
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Nova senha"
        required
        type="password"
        value={password}
      />
      <input
        autoComplete="new-password"
        className={styles.input}
        name="confirmPassword"
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="Confirmar nova senha"
        required
        type="password"
        value={confirmPassword}
      />

      <button className={styles.button} disabled={loading} type="submit">
        {loading ? "Atualizando..." : "Atualizar senha"}
      </button>
    </form>
  );
}
