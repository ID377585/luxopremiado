import { NextResponse } from "next/server";

import { getSessionUser, isAdminUser } from "@/lib/session";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { updateVipWithdrawalRequestStatus } from "@/lib/vip-runtime";

const ALLOWED_WITHDRAWAL_STATUSES = new Set(["approved", "paid", "rejected", "canceled"]);

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function normalizeAdminNotes(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || !(await isAdminUser(user.id, user.email))) {
    return forbidden();
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("vip_withdrawal_requests")
    .select("id, user_id, amount_cents, status, requested_level_label, destination_pix_key, provider, provider_reference, provider_status, created_at, admin_notes")
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = [...new Set((data ?? []).map((row) => String(row.user_id)).filter(Boolean))];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, name").in("id", userIds)
    : { data: [] as Array<{ id: string; name: string | null }> };
  const profileMap = new Map((profiles ?? []).map((row) => [String(row.id), row.name ?? null]));

  return NextResponse.json({
    requests: (data ?? []).map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      userName: profileMap.get(String(row.user_id)) ?? null,
      amountCents: Number(row.amount_cents ?? 0),
      status: String(row.status),
      requestedLevelLabel: typeof row.requested_level_label === "string" ? row.requested_level_label : null,
      destinationPixKey: typeof row.destination_pix_key === "string" ? row.destination_pix_key : null,
      provider: typeof row.provider === "string" ? row.provider : null,
      providerReference: typeof row.provider_reference === "string" ? row.provider_reference : null,
      providerStatus: typeof row.provider_status === "string" ? row.provider_status : null,
      adminNotes: typeof row.admin_notes === "string" ? row.admin_notes : null,
      createdAt: String(row.created_at),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !(await isAdminUser(user.id, user.email))) {
    return forbidden();
  }

  const body = (await request.json()) as {
    requestId?: string;
    status?: "approved" | "paid" | "rejected" | "canceled";
    adminNotes?: string | null;
  };

  if (!body.requestId || !body.status) {
    return badRequest("Informe requestId e status.");
  }

  if (!ALLOWED_WITHDRAWAL_STATUSES.has(body.status)) {
    return badRequest("Status de saque VIP inválido.");
  }

  const adminNotes = normalizeAdminNotes(body.adminNotes);

  if ((body.status === "rejected" || body.status === "canceled") && !adminNotes) {
    return badRequest("Observação administrativa obrigatória para rejeitar ou cancelar o saque.");
  }

  if (adminNotes.length > 2000) {
    return badRequest("A observação administrativa do saque é muito longa.");
  }

  try {
    await updateVipWithdrawalRequestStatus({
      requestId: body.requestId,
      status: body.status,
      adminNotes: adminNotes || null,
    });

    return GET();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 