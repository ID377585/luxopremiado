import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const AFFILIATE_COOKIE = "lp_ref";
const AFFILIATE_REGEX = /^[a-zA-Z0-9_-]{3,40}$/;

function sanitizeAffiliateCode(value: string): string {
  return value.trim();
}

export function normalizeAffiliateCode(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const code = sanitizeAffiliateCode(value);
  if (!code || !AFFILIATE_REGEX.test(code)) {
    return null;
  }

  return code;
}

export function getAffiliateCodeFromRequest(request: NextRequest): string | null {
  const headerCode = normalizeAffiliateCode(request.headers.get("x-affiliate-code"));
  if (headerCode) {
    return headerCode;
  }

  return normalizeAffiliateCode(request.cookies.get(AFFILIATE_COOKIE)?.value);
}

export async function getAffiliateCodeFromServerCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return normalizeAffiliateCode(cookieStore.get(AFFILIATE_COOKIE)?.value);
}

export async function attachAffiliateToOrder(orderId: string, code: string): Promise<boolean> {
  if (!hasSupabaseEnv()) {
    return false;
  }

  const normalizedCode = normalizeAffiliateCode(code);
  const normalizedOrderId = typeof orderId === "string" ? orderId.trim() : "";

  if (!normalizedCode || !normalizedOrderId) {
    return false;
  }

  try {
    const serviceClient = createSupabaseServiceClient();
    const { data, error } = await serviceClient.rpc("link_affiliate_to_order", {
      p_order_id: normalizedOrderId,
      p_affiliate_code: normalizedCode,
    });

    if (error) {
      return false;
    }

    return data === true;
  } catch {
    return false;
  }
}