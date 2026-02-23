import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret) {
    const providedSecret = request.headers.get("x-cron-secret");
    if (providedSecret !== expectedSecret) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  try {
    const serviceClient = createSupabaseServiceClient();
    const { data, error } = await serviceClient.rpc("expire_reservations");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, released: data ?? 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
