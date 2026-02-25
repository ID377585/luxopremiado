"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "@/components/auth/auth.module.css";

export function ResetPasswordForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function bootstrapRecoverySession() {
      if (!supabase) {
        if (mounted) {
          setSessionReady(true);
        }
        return;
      }

      try {
        const currentUrl = typeof window !== "undefined" ? new URL(window.location.href) : null;
        const hash = currentUrl?.hash ?? "";
        const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
        const searchParams = currentUrl?.searchParams ?? new URLSearchParams();

        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const queryType = searchParams.get("type");
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const recoveryType = queryType ?? hashParams.get("type");
        let shouldCleanupHash = false;
        let shouldCleanupQuery = false;
        let bootstrapError: string | null = null;

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            bootstrapError = "Link de recuperação inválido ou expirado. Solicite um novo e-mail.";
          } else {
            shouldCleanupQuery = true;
          }
        } else if (tokenHash && recoveryType === "recovery") {
          const { error } = await supabase.auth.verifyOtp({
            type: "recovery",
            token_hash: tokenHash,
          });

          if (error) {
            bootstrapError = "Link de recuperação inválido ou expirado. Solicite um novo e-mail.";
          } else {
            shouldCleanupQuery = true;
          }
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            bootstrapError = "Link de recuperação inválido ou expirado. Solicite um novo e-mail.";
          } else {
            shouldCleanupHash = true;
          }
        } else if (recoveryType === "recovery") {
          bootstrapError = "Sessão de recuperação incompleta. Abra novamente o link mais recente do e-mail.";
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session && !bootstrapError) {
          bootstrapError = "Sessão de recuperação ausente. Solicite um novo link de redefinição.";
        }

        if (mounted && bootstrapError) {
          setStatus({
            type: "error",
            message: bootstrapError,
          });
        }

        if (mounted && currentUrl && (shouldCleanupHash || shouldCleanupQuery)) {
          const cleanUrl = new URL(currentUrl.toString());
          if (shouldCleanupHash) {
            cleanUrl.hash = "";
          }
          if (shouldCleanupQuery) {
            cleanUrl.searchParams.delete("code");
            cleanUrl.searchParams.delete("token_hash");
            cleanUrl.searchParams.delete("type");
          }
          window.history.replaceState({}, document.title, `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
        }
      } finally {
        if (mounted) {
          setSessionReady(true);
        }
      }
    }

    bootstrapRecoverySession();

    return () => {
      mounted = false;
    };
  }, [supabase]);

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

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setStatus({
        type: "error",
        message: "Sessão de recuperação ausente. Abra novamente o link de redefinição enviado por e-mail.",
      });
      setLoading(false);
      return;
    }

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

      <button className={styles.button} disabled={loading || !sessionReady} type="submit">
        {loading ? "Atualizando..." : sessionReady ? "Atualizar senha" : "Preparando link..."}
      </button>
    </form>
  );
}
