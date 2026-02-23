import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const {
    data: profile,
  } = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    name: profile?.name ?? (user.user_metadata?.name as string | undefined) ?? null,
  };
}

export async function isAdminUser(userId: string): Promise<boolean> {
  if (!hasSupabaseEnv()) {
    return false;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();

  return data?.role === "admin";
}
