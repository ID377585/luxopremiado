import { NextResponse } from "next/server";

import { getSessionUser, isAdminUser } from "@/lib/session";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const BUCKET = "prize-images";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !(await isAdminUser(user.id, user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { fileName, slug } = (await request.json()) as { fileName?: string; slug?: string };

  if (!fileName) {
    return NextResponse.json({ error: "fileName é obrigatório" }, { status: 400 });
  }

  const sanitized = fileName.replace(/[^\w.\-]+/g, "-");
  const safeSlug = (slug ?? "auction").replace(/[^a-zA-Z0-9_-]+/g, "-");
  const objectPath = `auctions/${safeSlug}-${Date.now()}-${sanitized}`;

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
