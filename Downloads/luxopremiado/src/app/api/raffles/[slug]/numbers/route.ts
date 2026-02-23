import { NextRequest, NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface RaffleNumbersRouteContext {
  params: Promise<{ slug: string }>;
}

function normalizeStatus(status: string | null): "available" | "reserved" | "sold" {
  if (status === "reserved" || status === "sold") {
    return status;
  }

  return "available";
}

export async function GET(request: NextRequest, context: RaffleNumbersRouteContext) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase não configurado. Defina as variáveis de ambiente." },
      { status: 503 },
    );
  }

  try {
    const { slug } = await context.params;
    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
    const pageSize = Math.min(500, Math.max(20, Number(request.nextUrl.searchParams.get("pageSize") ?? 200)));

    const offset = (page - 1) * pageSize;

    const supabase = await createSupabaseServerClient();

    const { data: raffle } = await supabase.from("raffles").select("id, total_numbers").eq("slug", slug).maybeSingle();

    if (!raffle) {
      return NextResponse.json({ error: "Rifa não encontrada." }, { status: 404 });
    }

    const { data: rows, error } = await supabase
      .from("v_raffle_numbers_public")
      .select("number, status")
      .eq("raffle_id", raffle.id)
      .order("number", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      page,
      pageSize,
      total: Number(raffle.total_numbers ?? 0),
      numbers:
        rows?.map((item) => ({
          number: Number(item.number),
          status: normalizeStatus(typeof item.status === "string" ? item.status : null),
        })) ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
