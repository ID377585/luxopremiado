import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSiteUrl, hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const enrollSchema = z.object({
  preferredCode: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_-]{3,40}$/)
    .optional(),
  raffleSlug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{2,90}$/)
    .optional(),
});

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase não configurado. Defina as variáveis de ambiente." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = enrollSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Payload inválido", details: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase.rpc("ensure_affiliate_for_user", {
      p_preferred_code: parsed.data.preferredCode ?? null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const site = getSiteUrl();
    let raffleSlug = parsed.data.raffleSlug ?? null;

    if (!raffleSlug) {
      const { data: raffle } = await supabase
        .from("raffles")
        .select("slug")
        .in("status", ["active", "draft"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      raffleSlug = (raffle?.slug as string | undefined) ?? "luxo-premiado";
    }

    return NextResponse.json({
      success: true,
      code: data,
      referralUrl: `${site}/r/${raffleSlug}?ref=${encodeURIComponent(String(data))}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
