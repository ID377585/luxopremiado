"use server";

import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithMessage(key: "error" | "success", value: string): never {
  redirect(`/app/perfil?${key}=${encodeURIComponent(value)}`);
}

export async function updateProfileAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirectWithMessage("error", "Configurar o Supabase antes de editar o perfil.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirectWithMessage("error", "Faça login para editar o perfil.");
  }

  const payload = {
    name: (formData.get("name") ?? "").toString().trim() || null,
    phone: (formData.get("phone") ?? "").toString().trim() || null,
    avatar_url: (formData.get("avatar_url") ?? "").toString().trim() || null,
    address_line: (formData.get("address_line") ?? "").toString().trim() || null,
    address_number: (formData.get("address_number") ?? "").toString().trim() || null,
    address_complement: (formData.get("address_complement") ?? "").toString().trim() || null,
    address_district: (formData.get("address_district") ?? "").toString().trim() || null,
    address_city: (formData.get("address_city") ?? "").toString().trim() || null,
    address_state: (formData.get("address_state") ?? "").toString().trim() || null,
    address_country: (formData.get("address_country") ?? "").toString().trim() || null,
    address_zip: (formData.get("address_zip") ?? "").toString().trim() || null,
    cpf: (formData.get("cpf") ?? "").toString().trim() || null,
    bank_name: (formData.get("bank_name") ?? "").toString().trim() || null,
    bank_agency: (formData.get("bank_agency") ?? "").toString().trim() || null,
    bank_account: (formData.get("bank_account") ?? "").toString().trim() || null,
    bank_pix_key: (formData.get("bank_pix_key") ?? "").toString().trim() || null,
    birth_date: (formData.get("birth_date") ?? "").toString().trim() || null,
  };

  const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);

  if (error) {
    redirectWithMessage("error", `Não foi possível salvar: ${error.message}`);
  }

  redirectWithMessage("success", "Perfil atualizado com sucesso.");
}
