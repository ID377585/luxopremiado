"use server";

import { redirect } from "next/navigation";

import { getSiteUrl, hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithMessage(path: string, key: "error" | "success", value: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(value)}`);
}

export async function signInAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirectWithMessage("/login", "error", "Configure as variáveis do Supabase para autenticação.");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    redirectWithMessage("/login", "error", "E-mail e senha são obrigatórios.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirectWithMessage("/login", "error", error.message);
  }

  redirect("/app/comprar");
}

export async function signInWithGoogleAction() {
  if (!hasSupabaseEnv()) {
    redirectWithMessage("/login", "error", "Configure as variáveis do Supabase para autenticação.");
  }

  const supabase = await createSupabaseServerClient();
  const callbackUrl = `${getSiteUrl()}/auth/callback?next=/app/comprar`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    redirectWithMessage("/login", "error", "Não foi possível iniciar o login com Google agora.");
  }

  redirect(data.url);
}

export async function signUpAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirectWithMessage("/cadastro", "error", "Configure as variáveis do Supabase para autenticação.");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!name || !email || password.length < 6) {
    redirectWithMessage(
      "/cadastro",
      "error",
      "Preencha nome, e-mail e uma senha com no mínimo 6 caracteres.",
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${getSiteUrl()}/app/comprar`,
    },
  });

  if (error) {
    redirectWithMessage("/cadastro", "error", error.message);
  }

  if (data.user?.id) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      name,
      role: "user",
    });
  }

  redirectWithMessage("/login", "success", "Conta criada. Confira seu e-mail para confirmar acesso.");
}

export async function forgotPasswordAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirectWithMessage(
      "/recuperar-senha",
      "error",
      "Configure as variáveis do Supabase para autenticação.",
    );
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    redirectWithMessage("/recuperar-senha", "error", "Informe um e-mail válido.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/reset-senha`,
  });

  if (error) {
    redirectWithMessage("/recuperar-senha", "error", error.message);
  }

  redirectWithMessage(
    "/recuperar-senha",
    "success",
    "Se o e-mail existir, você receberá um link de redefinição.",
  );
}

export async function signOutAction() {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
