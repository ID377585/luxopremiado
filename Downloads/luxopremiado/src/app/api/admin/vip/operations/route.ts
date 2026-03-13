import { NextResponse } from "next/server";

import { getSessionUser, isAdminUser } from "@/lib/session";
import { listVipOperationsAdmin, saveVipOperation } from "@/lib/vip-runtime";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

  if (!body.category || !body.title || !body.status) {
    return NextResponse.json({ error: "Informe categoria, título e status." }, { status: 400 });
  }

  try {
    await saveVipOperation({
      id: body.id,
      category: body.category,
      title: body.title,
      description: body.description ?? null,
      status: body.status,
      targetTier: body.targetTier ?? null,
      targetLevelId: body.targetLevelId ?? null,
      userId: body.userId ?? null,
      hostContact: body.hostContact ?? null,
      startsAt: body.startsAt ?? null,
      endsAt: body.endsAt ?? null,
    });

    return GET();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
