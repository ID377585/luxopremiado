import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RaffleStatus = "draft" | "active" | "closed" | "drawn";
export type DrawMethod = "loteria_federal" | "sorteador" | "ao_vivo" | "outro";
export type AdminOrderAffiliateStatus = "pending" | "approved" | "paid" | "canceled";

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
  status: AdminOrderAffiliateStatus;
  created_at: string;
}

interface RaffleRow {
  id?: unknown;
  slug?: unknown;
  title?: unknown;
  description?: unknown;
  cover_image_url?: unknown;
  price_cents?: unknown;
  total_numbers?: unknown;
  max_numbers_per_user?: unknown;
  draw_date?: unknown;
  draw_method?: unknown;
  status?: unknown;
  created_at?: unknown;
}

interface RaffleImageRow {
  id?: unknown;
  raffle_id?: unknown;
  url?: unknown;
  sort_order?: unknown;
  created_at?: unknown;
}

interface TransparencyRow {
  raffle_id?: unknown;
  draw_method?: unknown;
  rules?: unknown;
  audit_text?: unknown;
  organizer_name?: unknown;
  organizer_doc?: unknown;
  contact?: unknown;
  updated_at?: unknown;
}

interface AffiliateRow {
  id?: unknown;
  user_id?: unknown;
  code?: unknown;
  display_name?: unknown;
  commission_bps?: unknown;
  is_active?: unknown;
}

interface ProfileRow {
  id?: unknown;
  name?: unknown;
}

interface OrderAffiliateAggregateRow {
  affiliate_id?: unknown;
  status?: unknown;
  commission_cents?: unknown;
}

interface OrderAffiliateRow {
  id?: unknown;
  order_id?: unknown;
  affiliate_id?: unknown;
  code?: unknown;
  commission_cents?: unknown;
  status?: unknown;
  created_at?: unknown;
}

interface CommissionSummary {
  total_orders: number;
  approved_orders: number;
  paid_orders: number;
  pending_orders: number;
  total_commission_cents: number;
  approved_commission_cents: number;
  paid_commission_cents: number;
}

const DEFAULT_CREATED_AT = () => new Date().toISOString();

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBoolean(value: unknown): boolean {
  return Boolean(value);
}

function asRaffleStatus(value: unknown): RaffleStatus {
  return value === "active" || value === "closed" || value === "drawn" ? value : "draft";
}

function asDrawMethod(value: unknown): DrawMethod {
  return value === "sorteador" || value === "ao_vivo" || value === "outro"
    ? value
    : "loteria_federal";
}

function asOrderAffiliateStatus(value: unknown): AdminOrderAffiliateStatus {
  return value === "approved" || value === "paid" || value === "canceled" ? value : "pending";
}

function createEmptyCommissionSummary(): CommissionSummary {
  return {
    total_orders: 0,
    approved_orders: 0,
    paid_orders: 0,
    pending_orders: 0,
    total_commission_cents: 0,
    approved_commission_cents: 0,
    paid_commission_cents: 0,
  };
}

function fallbackRaffles(): AdminRaffle[] {
  return [
    {
      id: "demo-raffle-001",
      slug: "bigode-das-rifas",
      title: "Bigode das Rifas",
      description: "Rifa de demonstração enquanto o Supabase não está configurado.",
      cover_image_url: "/images/prize/compass-1.svg",
      price_cents: 1990,
      total_numbers: 10000,
      max_numbers_per_user: 50,
      draw_date: null,
      draw_method: "loteria_federal",
      status: "draft",
      created_at: DEFAULT_CREATED_AT(),
    },
  ];
}

function mapAdminRaffle(row: RaffleRow): AdminRaffle {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    description: asString(row.description),
    cover_image_url: asString(row.cover_image_url),
    price_cents: asNumber(row.price_cents),
    total_numbers: asNumber(row.total_numbers),
    max_numbers_per_user: asNumber(row.max_numbers_per_user),
    draw_date: asNullableString(row.draw_date),
    draw_method: asDrawMethod(row.draw_method),
    status: asRaffleStatus(row.status),
    created_at: asString(row.created_at, DEFAULT_CREATED_AT()),
  };
}

function mapAdminRaffleImage(row: RaffleImageRow): AdminRaffleImage {
  return {
    id: asString(row.id),
    raffle_id: asString(row.raffle_id),
    url: asString(row.url),
    sort_order: asNumber(row.sort_order),
    created_at: asString(row.created_at, DEFAULT_CREATED_AT()),
  };
}

function mapAdminTransparency(row: TransparencyRow): AdminTransparency {
  return {
    raffle_id: asString(row.raffle_id),
    draw_method: asString(row.draw_method),
    rules: asString(row.rules),
    audit_text: asString(row.audit_text),
    organizer_name: asString(row.organizer_name),
    organizer_doc: asString(row.organizer_doc),
    contact: asString(row.contact),
    updated_at: asString(row.updated_at, DEFAULT_CREATED_AT()),
  };
}

function mapAdminOrderAffiliateRow(row: OrderAffiliateRow): AdminOrderAffiliateRow {
  return {
    id: asString(row.id),
    order_id: asString(row.order_id),
    affiliate_id: asString(row.affiliate_id),
    code: asString(row.code),
    commission_cents: asNumber(row.commission_cents),
    status: asOrderAffiliateStatus(row.status),
    created_at: asString(row.created_at, DEFAULT_CREATED_AT()),
  };
}

export async function getAdminRaffles(): Promise<AdminRaffle[]> {
  if (!hasSupabaseEnv()) {
    return fallbackRaffles();
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("raffles")
      .select(
        "id, slug, title, description, cover_image_url, price_cents, total_numbers, max_numbers_per_user, draw_date, draw_method, status, created_at",
      )
      .order("created_at", { ascending: false });

    return ((data ?? []) as RaffleRow[]).map(mapAdminRaffle);
  } catch {
    return [];
  }
}

export async function getAdminRaffleById(id: string): Promise<AdminRaffle | null> {
  if (!hasSupabaseEnv()) {
    return fallbackRaffles().find((raffle) => raffle.id === id) ?? null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("raffles")
      .select(
        "id, slug, title, description, cover_image_url, price_cents, total_numbers, max_numbers_per_user, draw_date, draw_method, status, created_at",
      )
      .eq("id", id)
      .maybeSingle();

    return data ? mapAdminRaffle(data as RaffleRow) : null;
  } catch {
    return null;
  }
}

export async function getAdminRaffleImages(raffleId: string): Promise<AdminRaffleImage[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("raffle_images")
      .select("id, raffle_id, url, sort_order, created_at")
      .eq("raffle_id", raffleId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    return ((data ?? []) as RaffleImageRow[]).map(mapAdminRaffleImage);
  } catch {
    return [];
  }
}

export async function getAdminTransparencyByRaffleId(
  raffleId: string,
): Promise<AdminTransparency | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("transparency")
      .select(
        "raffle_id, draw_method, rules, audit_text, organizer_name, organizer_doc, contact, updated_at",
      )
      .eq("raffle_id", raffleId)
      .maybeSingle();

    return data ? mapAdminTransparency(data as TransparencyRow) : null;
  } catch {
    return null;
  }
}

export async function getAllAdminTransparency(): Promise<AdminTransparency[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("transparency")
      .select(
        "raffle_id, draw_method, rules, audit_text, organizer_name, organizer_doc, contact, updated_at",
      )
      .order("updated_at", { ascending: false });

    return ((data ?? []) as TransparencyRow[]).map(mapAdminTransparency);
  } catch {
    return [];
  }
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

  try {
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
          number: asNumber((row as { number?: unknown }).number),
          status: asString((row as { status?: unknown }).status, "available"),
        })) ?? [],
    };
  } catch {
    return {
      available: 0,
      reserved: 0,
      sold: 0,
      sample: [],
    };
  }
}

export async function getAdminAffiliateSummary(): Promise<AdminAffiliateSummary[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
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

    const affiliateRows = (affiliates ?? []) as AffiliateRow[];
    if (affiliateRows.length === 0) {
      return [];
    }

    const profileMap = new Map<string, string>();
    ((profiles ?? []) as ProfileRow[]).forEach((profile) => {
      profileMap.set(asString(profile.id), asString(profile.name));
    });

    const commissionMap = new Map<string, CommissionSummary>();

    ((orderAffiliates ?? []) as OrderAffiliateAggregateRow[]).forEach((row) => {
      const affiliateId = asString(row.affiliate_id);
      if (!affiliateId) {
        return;
      }

      const current = commissionMap.get(affiliateId) ?? createEmptyCommissionSummary();
      const commission = asNumber(row.commission_cents);
      const status = asOrderAffiliateStatus(row.status);

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

    return affiliateRows.map((affiliate) => {
      const affiliateId = asString(affiliate.id);
      const userId = asString(affiliate.user_id);
      const entry = commissionMap.get(affiliateId);
      const mappedName = profileMap.get(userId);
      const displayName = asString(affiliate.display_name);

      return {
        affiliate_id: affiliateId,
        user_id: userId,
        name: displayName || mappedName || `Usuário ${userId.slice(0, 6)}`,
        code: asString(affiliate.code),
        commission_bps: asNumber(affiliate.commission_bps),
        is_active: asBoolean(affiliate.is_active),
        total_orders: entry?.total_orders ?? 0,
        approved_orders: entry?.approved_orders ?? 0,
        paid_orders: entry?.paid_orders ?? 0,
        pending_orders: entry?.pending_orders ?? 0,
        total_commission_cents: entry?.total_commission_cents ?? 0,
        approved_commission_cents: entry?.approved_commission_cents ?? 0,
        paid_commission_cents: entry?.paid_commission_cents ?? 0,
      };
    });
  } catch {
    return [];
  }
}

export async function getAdminOrderAffiliateRows(): Promise<AdminOrderAffiliateRow[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("order_affiliates")
      .select("id, order_id, affiliate_id, code, commission_cents, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    return ((data ?? []) as OrderAffiliateRow[]).map(mapAdminOrderAffiliateRow);
  } catch {
    return [];
  }
}