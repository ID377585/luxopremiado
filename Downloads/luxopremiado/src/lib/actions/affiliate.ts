"use server";

import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithMessage(path: string, type: "success" | "error", message: string): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}${type}=${encodeURIComponent(message)}`);
}

export async function ensureAffiliateCodeAction(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "/app/perfil");

  if (!hasSupabaseEnv()) {
    redirectWithMessage(redirectTo, "error", "Supabase não configurado.");
  }

  const preferredCodeRaw = String(formData.get("preferred_code") ?? "").trim();
  const preferredCode = preferredCodeRaw.length > 0 ? preferredCodeRaw : null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirectWithMessage(redirectTo, "error", "Faça login novamente para continuar.");
  }

  const { data, error } = await supabase.rpc("ensure_affiliate_for_user", {
    p_preferred_code: preferredCode,
  });

  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }

  redirectWithMessage(redirectTo, "success", `Código de afiliado ativo: ${data}`);
}
