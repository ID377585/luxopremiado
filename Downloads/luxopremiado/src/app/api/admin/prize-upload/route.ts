import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/session";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const ADMIN_EMAIL = "recovery.contas.mail@gmail.com";
const BUCKET = "prize-images";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { fileName, prizeOrder } = (await request.json()) as {
    fileName?: string;
    prizeOrder?: number;
  };

  if (!fileName) {
    return NextResponse.json({ error: "fileName é obrigatório" }, { status: 400 });
  }

  const safeOrder = Number(prizeOrder) || 0;
  const sanitized = fileName.replace(/[^\w.\-]+/g, "-");
  const objectPath = `prizes/${safeOrder}-${Date.now()}-${sanitized}`;

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(objectPath);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Falha ao criar URL de upload" }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);

  return NextResponse.json({
    signedUrl: data.signedUrl,
    path: objectPath,
    publicUrl: publicUrlData.publicUrl,
  });
}
