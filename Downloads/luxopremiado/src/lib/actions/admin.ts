"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const raffleStatusSchema = z.enum(["draft", "active", "closed", "drawn"]);
const drawMethodSchema = z.enum(["loteria_federal", "sorteador", "ao_vivo", "outro"]);

const createRaffleSchema = z.object({
  title: z.string().trim().min(3, "Título muito curto."),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  coverImageUrl: z.string().trim().optional(),
  priceCents: z.coerce.number().int().positive("Preço precisa ser maior que zero."),
  totalNumbers: z.coerce.number().int().positive("Total de números precisa ser maior que zero."),
  maxNumbersPerUser: z.coerce.number().int().min(0, "Limite por usuário inválido.").default(0),
  drawDate: z.string().trim().optional(),
  drawMethod: drawMethodSchema.default("loteria_federal"),
  status: raffleStatusSchema.default("draft"),
  generateNumbers: z.boolean().default(false),
});

const updateRaffleSchema = createRaffleSchema.extend({
  raffleId: z.string().uuid(),
});

const deleteRaffleSchema = z.object({
  raffleId: z.string().uuid(),
});

const raffleImageSchema = z.object({
  raffleId: z.string().uuid(),
  imageUrl: z.string().trim().min(1, "Informe a URL da imagem."),
  sortOrder: z.coerce.number().int().default(0),
});

const deleteRaffleImageSchema = z.object({
  raffleId: z.string().uuid(),
  imageId: z.string().uuid(),
});

const transparencySchema = z.object({
  raffleId: z.string().uuid(),
  drawMethod: z.string().trim().optional(),
  rules: z.string().trim().optional(),
  auditText: z.string().trim().optional(),
  organizerName: z.string().trim().optional(),
  organizerDoc: z.string().trim().optional(),
  contact: z.string().trim().optional(),
});

const deleteTransparencySchema = z.object({
  raffleId: z.string().uuid(),
});

function withMessage(path: string, type: "success" | "error", message: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${type}=${encodeURIComponent(message)}`;
}

function normalizeOptional(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseDateTime(value: string | undefined): string | null {
  const normalized = normalizeOptional(value);
  if (!normalized) {
    return null;
  }

  const parsedDate = new Date(normalized);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Data do sorteio inválida.");
  }

  return parsedDate.toISOString();
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 90);
}

async function requireAdminContext() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase não configurado. Defina as variáveis de ambiente.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão inválida. Faça login novamente.");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (profile?.role !== "admin") {
    throw new Error("Apenas administradores podem executar esta ação.");
  }

  return { supabase, userId: user.id };
}

export async function createRaffleAction(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/rifas");

  try {
    const parsed = createRaffleSchema.parse({
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      coverImageUrl: formData.get("cover_image_url"),
      priceCents: formData.get("price_cents"),
      totalNumbers: formData.get("total_numbers"),
      maxNumbersPerUser: formData.get("max_numbers_per_user"),
      drawDate: formData.get("draw_date"),
      drawMethod: formData.get("draw_method"),
      status: formData.get("status"),
      generateNumbers: formData.get("generate_numbers") === "on",
    });

    const { supabase, userId } = await requireAdminContext();

    const slug = slugify(parsed.slug || parsed.title);

    if (!slug) {
      throw new Error("Não foi possível gerar um slug válido.");
    }

    const payload = {
      title: parsed.title,
      slug,
      description: normalizeOptional(parsed.description),
      cover_image_url: normalizeOptional(parsed.coverImageUrl),
      price_cents: parsed.priceCents,
      total_numbers: parsed.totalNumbers,
      max_numbers_per_user: parsed.maxNumbersPerUser,
      draw_date: parseDateTime(parsed.drawDate),
      draw_method: parsed.drawMethod,
      status: parsed.status,
      created_by: userId,
    };

    const { data, error } = await supabase.from("raffles").insert(payload).select("id").single();

    if (error) {
      throw new Error(error.message);
    }

    if (parsed.generateNumbers) {
      const { error: numbersError } = await supabase.rpc("generate_raffle_numbers", {
        p_raffle_id: data.id,
      });

      if (numbersError) {
        throw new Error(numbersError.message);
      }
    }

    revalidatePath("/admin/rifas");
    redirect(withMessage(`/admin/rifas/${data.id}`, "success", "Rifa criada com sucesso."));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar rifa.";
    redirect(withMessage(redirectTo, "error", message));
  }
}

export async function updateRaffleAction(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/rifas");

  try {
    const parsed = updateRaffleSchema.parse({
      raffleId: formData.get("raffle_id"),
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      coverImageUrl: formData.get("cover_image_url"),
      priceCents: formData.get("price_cents"),
      totalNumbers: formData.get("total_numbers"),
      maxNumbersPerUser: formData.get("max_numbers_per_user"),
      drawDate: formData.get("draw_date"),
      drawMethod: formData.get("draw_method"),
      status: formData.get("status"),
      generateNumbers: formData.get("generate_numbers") === "on",
    });

    const { supabase } = await requireAdminContext();
    const slug = slugify(parsed.slug || parsed.title);

    if (!slug) {
      throw new Error("Slug inválido.");
    }

    const { error } = await supabase
      .from("raffles")
      .update({
        title: parsed.title,
        slug,
        description: normalizeOptional(parsed.description),
        cover_image_url: normalizeOptional(parsed.coverImageUrl),
        price_cents: parsed.priceCents,
        total_numbers: parsed.totalNumbers,
        max_numbers_per_user: parsed.maxNumbersPerUser,
        draw_date: parseDateTime(parsed.drawDate),
        draw_method: parsed.drawMethod,
        status: parsed.status,
      })
      .eq("id", parsed.raffleId);

    if (error) {
      throw new Error(error.message);
    }

    if (parsed.generateNumbers) {
      const { error: numbersError } = await supabase.rpc("generate_raffle_numbers", {
        p_raffle_id: parsed.raffleId,
      });

      if (numbersError) {
        throw new Error(numbersError.message);
      }
    }

    revalidatePath("/admin/rifas");
    revalidatePath(`/admin/rifas/${parsed.raffleId}`);

    redirect(withMessage(redirectTo, "success", "Rifa atualizada com sucesso."));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar rifa.";
    redirect(withMessage(redirectTo, "error", message));
  }
}

export async function deleteRaffleAction(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/rifas");

  try {
    const parsed = deleteRaffleSchema.parse({
      raffleId: formData.get("raffle_id"),
    });

    const { supabase } = await requireAdminContext();

    const { error } = await supabase.from("raffles").delete().eq("id", parsed.raffleId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/rifas");
    revalidatePath(`/admin/rifas/${parsed.raffleId}`);

    redirect(withMessage(redirectTo, "success", "Rifa removida com sucesso."));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao remover rifa.";
    redirect(withMessage(redirectTo, "error", message));
  }
}

export async function createRaffleImageAction(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/rifas");

  try {
    const parsed = raffleImageSchema.parse({
      raffleId: formData.get("raffle_id"),
      imageUrl: formData.get("image_url"),
      sortOrder: formData.get("sort_order"),
    });

    const { supabase } = await requireAdminContext();

    const { error } = await supabase.from("raffle_images").insert({
      raffle_id: parsed.raffleId,
      url: parsed.imageUrl,
      sort_order: parsed.sortOrder,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/rifas");
    revalidatePath(`/admin/rifas/${parsed.raffleId}`);

    redirect(withMessage(redirectTo, "success", "Imagem adicionada com sucesso."));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao adicionar imagem.";
    redirect(withMessage(redirectTo, "error", message));
  }
}

export async function deleteRaffleImageAction(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/rifas");

  try {
    const parsed = deleteRaffleImageSchema.parse({
      raffleId: formData.get("raffle_id"),
      imageId: formData.get("image_id"),
    });

    const { supabase } = await requireAdminContext();

    const { error } = await supabase.from("raffle_images").delete().eq("id", parsed.imageId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/rifas");
    revalidatePath(`/admin/rifas/${parsed.raffleId}`);

    redirect(withMessage(redirectTo, "success", "Imagem removida com sucesso."));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao remover imagem.";
    redirect(withMessage(redirectTo, "error", message));
  }
}

export async function upsertTransparencyAction(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/transparencia");

  try {
    const parsed = transparencySchema.parse({
      raffleId: formData.get("raffle_id"),
      drawMethod: formData.get("draw_method"),
      rules: formData.get("rules"),
      auditText: formData.get("audit_text"),
      organizerName: formData.get("organizer_name"),
      organizerDoc: formData.get("organizer_doc"),
      contact: formData.get("contact"),
    });

    const { supabase } = await requireAdminContext();

    const { error } = await supabase.from("transparency").upsert({
      raffle_id: parsed.raffleId,
      draw_method: normalizeOptional(parsed.drawMethod),
      rules: normalizeOptional(parsed.rules),
      audit_text: normalizeOptional(parsed.auditText),
      organizer_name: normalizeOptional(parsed.organizerName),
      organizer_doc: normalizeOptional(parsed.organizerDoc),
      contact: normalizeOptional(parsed.contact),
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/transparencia");

    redirect(withMessage(redirectTo, "success", "Transparência salva com sucesso."));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar transparência.";
    redirect(withMessage(redirectTo, "error", message));
  }
}

export async function deleteTransparencyAction(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/transparencia");

  try {
    const parsed = deleteTransparencySchema.parse({
      raffleId: formData.get("raffle_id"),
    });

    const { supabase } = await requireAdminContext();

    const { error } = await supabase.from("transparency").delete().eq("raffle_id", parsed.raffleId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/transparencia");
    redirect(withMessage(redirectTo, "success", "Registro de transparência removido."));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao remover transparência.";
    redirect(withMessage(redirectTo, "error", message));
  }
}
