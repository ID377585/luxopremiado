import { NextResponse } from "next/server";

import { getSessionUser, isAdminUser } from "@/lib/session";
import { listVipOperationsAdmin, saveVipOperation } from "@/lib/vip-runtime";

type VipOperationCategory = "host" | "event" | "tournament" | "odds";
type VipOperationStatus = "scheduled" | "active" | "completed" | "canceled";
type VipTargetTier = "none" | "vip" | "elite" | null;

const ALLOWED_CATEGORIES = new Set<VipOperationCategory>(["host", "event", "tournament", "odds"]);
const ALLOWED_STATUSES = new Set<VipOperationStatus>(["scheduled", "active", "completed", "canceled"]);
const ALLOWED_TIERS = new Set<Exclude<VipTargetTier, null>>(["none", "vip", "elite"]);

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalText(value: unknown) {
  const normalized = normalizeText(value);
  return normalized || null;
}

function isValidDatetime(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || !(await isAdminUser(user.id, user.email))) {
    return forbidden();
  }

  const operations = await listVipOperationsAdmin();
  return NextResponse.json({ operations });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !(await isAdminUser(user.id, user.email))) {
    return forbidden();
  }

  const body = (await request.json()) as {
    id?: string;
    category?: "host" | "event" | "tournament" | "odds";
    title?: string;
    description?: string | null;
    status?: "scheduled" | "active" | "completed" | "canceled";
    targetTier?: "none" | "vip" | "elite" | null;
    targetLevelId?: string | null;
    userId?: string | null;
    hostContact?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
  };

  const category = normalizeText(body.category) as VipOperationCategory;
  const title = normalizeText(body.title);
  const description = normalizeOptionalText(body.description);
  const status = normalizeText(body.status) as VipOperationStatus;
  const targetTierRaw = normalizeOptionalText(body.targetTier);
  const targetTier: VipTargetTier =
    targetTierRaw === null
      ? null
      : ALLOWED_TIERS.has(targetTierRaw as Exclude<VipTargetTier, null>)
        ? (targetTierRaw as Exclude<VipTargetTier, null>)
        : null;
  const targetLevelId = normalizeOptionalText(body.targetLevelId);
  const userId = normalizeOptionalText(body.userId);
  const hostContact = normalizeOptionalText(body.hostContact);
  const startsAt = normalizeOptionalText(body.startsAt);
  const endsAt = normalizeOptionalText(body.endsAt);

  if (!category || !title || !status) {
    return badRequest("Informe categoria, título e status.");
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    return badRequest("Categoria da operação VIP inválida.");
  }

  if (!ALLOWED_STATUSES.has(status)) {
    return badRequest("Status da operação VIP inválido.");
  }

  if (title.length < 3) {
    return badRequest("O título da operação VIP deve ter pelo menos 3 caracteres.");
  }

  if (title.length > 120) {
    return badRequest("O título da operação VIP está muito longo.");
  }

  if (description && description.length > 1000) {
    return badRequest("A descrição da operação VIP está muito longa.");
  }

  if (category === "host" && !hostContact) {
    return badRequest("Informe o contato/canal operacional para VIP Host.");
  }

  if (hostContact && hostContact.length > 200) {
    return badRequest("O contato/canal operacional está muito longo.");
  }

  if (startsAt && !isValidDatetime(startsAt)) {
    return badRequest("A data de início da operação VIP é inválida.");
  }

  if (endsAt && !isValidDatetime(endsAt)) {
    return badRequest("A data de término da operação VIP é inválida.");
  }

  if (startsAt && endsAt && Date.parse(endsAt) < Date.parse(startsAt)) {
    return badRequest("A data de término da operação VIP não pode ser anterior à data de início.");
  }

  try {
    await saveVipOperation({
      id: normalizeOptionalText(body.id) ?? undefined,
      category,
      title,
      description,
      status,
      targetTier,
      targetLevelId,
      userId,
      hostContact,
      startsAt,
      endsAt,
    });

    return GET();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}