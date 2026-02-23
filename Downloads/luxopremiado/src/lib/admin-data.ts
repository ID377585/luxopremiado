import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RaffleStatus = "draft" | "active" | "closed" | "drawn";
export type DrawMethod = "loteria_federal" | "sorteador" | "ao_vivo" | "outro";

export interface AdminRaffle {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image_url: string;
  price_cents: number;
  total_numbers: number;
  max_numbers_per_user: number;
  draw_date: string | null;
  draw_method: DrawMethod;
  status: RaffleStatus;
  created_at: string;
}

export interface AdminRaffleImage {
  id: string;
  raffle_id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface AdminTransparency {
  raffle_id: string;
  draw_method: string;
  rules: string;
  audit_text: string;
  organizer_name: string;
  organizer_doc: string;
  contact: string;
  updated_at: string;
}

export interface AdminAffiliateSummary {
  affiliate_id: string;
  user_id: string;
  name: string;
  code: string;
  commission_bps: number;
  is_active: boolean;
  total_orders: number;
  approved_orders: number;
  paid_orders: number;
  pending_orders: number;
  total_commission_cents: number;
  approved_commission_cents: number;
  paid_commission_cents: number;
}

export interface AdminOrderAffiliateRow {
  id: string;
  order_id: string;
  affiliate_id: string;
  code: string;
  commission_cents: number;
  status: "pending" | "approved" | "paid" | "canceled";
  created_at: string;
}

function fallbackRaffles(): AdminRaffle[] {
  return [
    {
      id: "demo-raffle-001",
      slug: "luxo-premiado",
      title: "Luxo Premiado - Jeep Compass Série S",
      description: "Rifa de demonstração enquanto o Supabase não está configurado.",
      cover_image_url: "/images/prize/compass-1.svg",
      price_cents: 1990,
      total_numbers: 10000,
      max_numbers_per_user: 50,
      draw_date: null,
      draw_method: "loteria_federal",
      status: "draft",
      created_at: new Date().toISOString(),
    },
  ];
}

export async function getAdminRaffles(): Promise<AdminRaffle[]> {
  if (!hasSupabaseEnv()) {
    return fallbackRaffles();
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("raffles")
    .select(
      "id, slug, title, description, cover_image_url, price_cents, total_numbers, max_numbers_per_user, draw_date, draw_method, status, created_at",
    )
    .order("created_at", { ascending: false });

  if (!data) {
    return [];
  }

  return data.map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: (row.description as string | null) ?? "",
    cover_image_url: (row.cover_image_url as string | null) ?? "",
    price_cents: Number(row.price_cents ?? 0),
    total_numbers: Number(row.total_numbers ?? 0),
    max_numbers_per_user: Number(row.max_numbers_per_user ?? 0),
    draw_date: (row.draw_date as string | null) ?? null,
    draw_method: (row.draw_method as DrawMethod | null) ?? "loteria_federal",
    status: (row.status as RaffleStatus | null) ?? "draft",
    created_at: String(row.created_at ?? new Date().toISOString()),
  }));
}

export async function getAdminRaffleById(id: string): Promise<AdminRaffle | null> {
  if (!hasSupabaseEnv()) {
    return fallbackRaffles().find((raffle) => raffle.id === id) ?? null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("raffles")
    .select(
      "id, slug, title, description, cover_image_url, price_cents, total_numbers, max_numbers_per_user, draw_date, draw_method, status, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    id: String(data.id),
    slug: String(data.slug),
    title: String(data.title),
    description: (data.description as string | null) ?? "",
    cover_image_url: (data.cover_image_url as string | null) ?? "",
    price_cents: Number(data.price_cents ?? 0),
    total_numbers: Number(data.total_numbers ?? 0),
    max_numbers_per_user: Number(data.max_numbers_per_user ?? 0),
    draw_date: (data.draw_date as string | null) ?? null,
    draw_method: (data.draw_method as DrawMethod | null) ?? "loteria_federal",
    status: (data.status as RaffleStatus | null) ?? "draft",
    created_at: String(data.created_at ?? new Date().toISOString()),
  };
}

export async function getAdminRaffleImages(raffleId: string): Promise<AdminRaffleImage[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("raffle_images")
    .select("id, raffle_id, url, sort_order, created_at")
    .eq("raffle_id", raffleId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!data) {
    return [];
  }

  return data.map((row) => ({
    id: String(row.id),
    raffle_id: String(row.raffle_id),
    url: String(row.url),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? new Date().toISOString()),
  }));
}

export async function getAdminTransparencyByRaffleId(
  raffleId: string,
): Promise<AdminTransparency | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("transparency")
    .select("raffle_id, draw_method, rules, audit_text, organizer_name, organizer_doc, contact, updated_at")
    .eq("raffle_id", raffleId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    raffle_id: String(data.raffle_id),
    draw_method: (data.draw_method as string | null) ?? "",
    rules: (data.rules as string | null) ?? "",
    audit_text: (data.audit_text as string | null) ?? "",
    organizer_name: (data.organizer_name as string | null) ?? "",
    organizer_doc: (data.organizer_doc as string | null) ?? "",
    contact: (data.contact as string | null) ?? "",
    updated_at: String(data.updated_at ?? new Date().toISOString()),
  };
}

export async function getAllAdminTransparency(): Promise<AdminTransparency[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("transparency")
    .select("raffle_id, draw_method, rules, audit_text, organizer_name, organizer_doc, contact, updated_at")
    .order("updated_at", { ascending: false });

  if (!data) {
    return [];
  }

  return data.map((row) => ({
    raffle_id: String(row.raffle_id),
    draw_method: (row.draw_method as string | null) ?? "",
    rules: (row.rules as string | null) ?? "",
    audit_text: (row.audit_text as string | null) ?? "",
    organizer_name: (row.organizer_name as string | null) ?? "",
    organizer_doc: (row.organizer_doc as string | null) ?? "",
    contact: (row.contact as string | null) ?? "",
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  }));
}

export async function getRaffleNumberStats(raffleId: string): Promise<{
  available: number;
  reserved: number;
  sold: number;
  sample: Array<{ number: number; status: string }>;
}> {
  if (!hasSupabaseEnv()) {
    return {
      available: 0,
      reserved: 0,
      sold: 0,
      sample: [],
    };
  }

  const supabase = await createSupabaseServerClient();

  const [availableResult, reservedResult, soldResult, sampleResult] = await Promise.all([
    supabase
      .from("raffle_numbers")
      .select("id", { count: "exact", head: true })
      .eq("raffle_id", raffleId)
      .eq("status", "available"),
    supabase
      .from("raffle_numbers")
      .select("id", { count: "exact", head: true })
      .eq("raffle_id", raffleId)
      .eq("status", "reserved"),
    supabase
      .from("raffle_numbers")
      .select("id", { count: "exact", head: true })
      .eq("raffle_id", raffleId)
      .eq("status", "sold"),
    supabase
      .from("raffle_numbers")
      .select("number, status")
      .eq("raffle_id", raffleId)
      .order("number", { ascending: true })
      .limit(120),
  ]);

  return {
    available: availableResult.count ?? 0,
    reserved: reservedResult.count ?? 0,
    sold: soldResult.count ?? 0,
    sample:
      sampleResult.data?.map((row) => ({
        number: Number(row.number ?? 0),
        status: String(row.status ?? "available"),
      })) ?? [],
  };
}

export async function getAdminAffiliateSummary(): Promise<AdminAffiliateSummary[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();

  const [{ data: affiliates }, { data: profiles }, { data: orderAffiliates }] = await Promise.all([
    supabase
      .from("affiliates")
      .select("id, user_id, code, display_name, commission_bps, is_active")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, name"),
    supabase
      .from("order_affiliates")
      .select("affiliate_id, status, commission_cents")
      .order("created_at", { ascending: false }),
  ]);

  if (!affiliates || affiliates.length === 0) {
    return [];
  }

  const profileMap = new Map<string, string>();
  (profiles ?? []).forEach((profile) => {
    profileMap.set(String(profile.id), String(profile.name ?? ""));
  });

  const commissionMap = new Map<
    string,
    {
      total_orders: number;
      approved_orders: number;
      paid_orders: number;
      pending_orders: number;
      total_commission_cents: number;
      approved_commission_cents: number;
      paid_commission_cents: number;
    }
  >();

  (orderAffiliates ?? []).forEach((row) => {
    const affiliateId = String(row.affiliate_id);
    const current = commissionMap.get(affiliateId) ?? {
      total_orders: 0,
      approved_orders: 0,
      paid_orders: 0,
      pending_orders: 0,
      total_commission_cents: 0,
      approved_commission_cents: 0,
      paid_commission_cents: 0,
    };

    const commission = Number(row.commission_cents ?? 0);
    const status = String(row.status ?? "pending");

    current.total_orders += 1;
    current.total_commission_cents += commission;

    if (status === "approved") {
      current.approved_orders += 1;
      current.approved_commission_cents += commission;
    } else if (status === "paid") {
      current.paid_orders += 1;
      current.paid_commission_cents += commission;
    } else if (status === "pending") {
      current.pending_orders += 1;
    }

    commissionMap.set(affiliateId, current);
  });

  return affiliates.map((affiliate) => {
    const entry = commissionMap.get(String(affiliate.id));
    const mappedName = profileMap.get(String(affiliate.user_id));

    return {
      affiliate_id: String(affiliate.id),
      user_id: String(affiliate.user_id),
      name: String(affiliate.display_name ?? mappedName ?? `Usuário ${String(affiliate.user_id).slice(0, 6)}`),
      code: String(affiliate.code),
      commission_bps: Number(affiliate.commission_bps ?? 0),
      is_active: Boolean(affiliate.is_active),
      total_orders: entry?.total_orders ?? 0,
      approved_orders: entry?.approved_orders ?? 0,
      paid_orders: entry?.paid_orders ?? 0,
      pending_orders: entry?.pending_orders ?? 0,
      total_commission_cents: entry?.total_commission_cents ?? 0,
      approved_commission_cents: entry?.approved_commission_cents ?? 0,
      paid_commission_cents: entry?.paid_commission_cents ?? 0,
    };
  });
}

export async function getAdminOrderAffiliateRows(): Promise<AdminOrderAffiliateRow[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("order_affiliates")
    .select("id, order_id, affiliate_id, code, commission_cents, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (!data) {
    return [];
  }

  return data.map((row) => ({
    id: String(row.id),
    order_id: String(row.order_id),
    affiliate_id: String(row.affiliate_id),
    code: String(row.code),
    commission_cents: Number(row.commission_cents ?? 0),
    status: (row.status as "pending" | "approved" | "paid" | "canceled") ?? "pending",
    created_at: String(row.created_at ?? new Date().toISOString()),
  }));
}
