import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface DashboardSummary {
  pendingOrders: number;
  paidOrders: number;
  totalNumbers: number;
}

export interface DashboardOrder {
  id: string;
  status: string;
  amount_cents: number;
  created_at: string;
}

export interface DashboardProfile {
  name: string | null;
  phone: string | null;
  role: string;
}

export interface DashboardAffiliate {
  code: string;
  commission_bps: number;
  is_active: boolean;
  approved_commission_cents: number;
  total_referred_orders: number;
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  if (!hasSupabaseEnv()) {
    return {
      pendingOrders: 1,
      paidOrders: 3,
      totalNumbers: 17,
    };
  }

  const supabase = await createSupabaseServerClient();

  const [pendingResult, paidResult, numberResult] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "paid"),
    supabase
      .from("raffle_numbers")
      .select("id", { count: "exact", head: true })
      .eq("sold_to", userId)
      .eq("status", "sold"),
  ]);

  return {
    pendingOrders: pendingResult.count ?? 0,
    paidOrders: paidResult.count ?? 0,
    totalNumbers: numberResult.count ?? 0,
  };
}

export async function getMyOrders(userId: string): Promise<DashboardOrder[]> {
  if (!hasSupabaseEnv()) {
    return [
      {
        id: "pedido-demo-001",
        status: "paid",
        amount_cents: 9950,
        created_at: new Date().toISOString(),
      },
      {
        id: "pedido-demo-002",
        status: "pending",
        amount_cents: 3980,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("orders")
    .select("id, status, amount_cents, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

export async function getMyPayments(userId: string): Promise<
  {
    id: string;
    provider: string;
    status: string;
    created_at: string;
    order_id: string;
    order: { amount_cents: number } | null;
  }[]
> {
  if (!hasSupabaseEnv()) {
    return [
      {
        id: "pay-demo-001",
        provider: "mercadopago",
        status: "paid",
        created_at: new Date().toISOString(),
        order_id: "order-demo-001",
        order: { amount_cents: 9950 },
      },
    ];
  }

  const supabase = await createSupabaseServerClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id, provider, status, created_at, order_id")
    .order("created_at", { ascending: false })
    .limit(20);

  if (!payments?.length) {
    return [];
  }

  const orderIds = payments.map((payment) => payment.order_id).filter((value): value is string => Boolean(value));

  const { data: orders } = await supabase
    .from("orders")
    .select("id, amount_cents")
    .eq("user_id", userId)
    .in("id", orderIds);

  const orderMap = new Map(orders?.map((order) => [order.id, order.amount_cents]) ?? []);

  return (
    payments.map((payment) => ({
      id: payment.id,
      provider: payment.provider,
      status: payment.status,
      created_at: payment.created_at,
      order_id: payment.order_id,
      order: orderMap.has(payment.order_id) ? { amount_cents: orderMap.get(payment.order_id)! } : null,
    }))
  );
}

export async function getMyProfile(userId: string): Promise<DashboardProfile> {
  if (!hasSupabaseEnv()) {
    return {
      name: "Usuário demo",
      phone: "(11) 99999-9999",
      role: "user",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("name, phone, role")
    .eq("id", userId)
    .maybeSingle();

  return {
    name: data?.name ?? null,
    phone: data?.phone ?? null,
    role: data?.role ?? "user",
  };
}

export async function getMySoldNumbers(userId: string): Promise<number[]> {
  if (!hasSupabaseEnv()) {
    return [10, 25, 30, 74, 108];
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("raffle_numbers")
    .select("number")
    .eq("sold_to", userId)
    .order("number", { ascending: true })
    .limit(100);

  return data?.map((item) => item.number as number) ?? [];
}

export async function getMyAffiliate(userId: string): Promise<DashboardAffiliate | null> {
  if (!hasSupabaseEnv()) {
    return {
      code: "lpdemo123",
      commission_bps: 500,
      is_active: true,
      approved_commission_cents: 2490,
      total_referred_orders: 3,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, code, commission_bps, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (!affiliate) {
    return null;
  }

  const { data: referrals } = await supabase
    .from("order_affiliates")
    .select("commission_cents, status")
    .eq("affiliate_id", affiliate.id);

  const approvedCommissionCents =
    referrals
      ?.filter((row) => row.status === "approved" || row.status === "paid")
      .reduce((acc, row) => acc + Number(row.commission_cents ?? 0), 0) ?? 0;

  return {
    code: String(affiliate.code),
    commission_bps: Number(affiliate.commission_bps ?? 0),
    is_active: Boolean(affiliate.is_active),
    approved_commission_cents: approvedCommissionCents,
    total_referred_orders: referrals?.length ?? 0,
  };
}
