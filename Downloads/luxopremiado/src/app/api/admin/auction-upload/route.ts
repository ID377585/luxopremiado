import { NextResponse } from "next/server";

import { getSessionUser, isAdminUser } from "@/lib/session";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const BUCKET = "prize-images";
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
const MAX_FILENAME_LENGTH = 180;

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .replace(/^\-+|\-+$/g, "");
}

function sanitizeSlug(slug: string) {
  return slug
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\-+|\-+$/g, "");
}

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].toLowerCase();
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !(await isAdminUser(user.id, user.email))) {
    return forbidden();
  }

  const { fileName, slug } = (await request.json()) as { fileName?: string; slug?: string };

  const rawFileName = normalizeText(fileName);
  if (!rawFileName) {
    return badRequest("fileName é obrigatório");
  }

  if (rawFileName.length > MAX_FILENAME_LENGTH) {
    return badRequest("fileName é muito longo");
  }

  const extension = getFileExtension(rawFileName);
  if (!extension || !ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return badRequest("Formato de arquivo não permitido para upload");
  }

  const sanitized = sanitizeFileName(rawFileName);
  if (!sanitized || sanitized === "." || sanitized === "..") {
    return badRequest("fileName inválido");
  }

  const safeSlug = sanitizeSlug(normalizeText(slug) || "auction") || "auction";
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