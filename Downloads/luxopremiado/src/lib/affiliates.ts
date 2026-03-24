import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const AFFILIATE_COOKIE = "lp_ref";
const AFFILIATE_REGEX = /^[a-zA-Z0-9_-]{3,40}$/;

export function normalizeAffiliateCode(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const code = value.trim();
  if (!AFFILIATE_REGEX.test(code)) {
    return null;
  }

  return code;
}

export function getAffiliateCodeFromRequest(request: NextRequest): string | null {
  const headerCode = request.headers.get("x-affiliate-code");
  const fromHeader = normalizeAffiliateCode(headerCode);

  if (fromHeader) {
    return fromHeader;
  }

  const cookieCode = request.cookies.get(AFFILIATE_COOKIE)?.value;
  return normalizeAffiliateCode(cookieCode);
}

export async function getAffiliateCodeFromServerCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return normalizeAffiliateCode(cookieStore.get(AFFILIATE_COOKIE)?.value);
}

export async function attachAffiliateToOrder(orderId: string, code: string): Promise<boolean> {
  if (!hasSupabaseEnv()) {
    return false;
  }

  const normalized = normalizeAffiliateCode(code);
  if (!normalized) {
    return false;
  }

  try {
    const serviceClient = createSupabaseServiceClient();
    const { data, error } = await serviceClient.rpc("link_affiliate_to_order", {
      p_order_id: orderId,
      p_affiliate_code: normalized,
    });

    if (error) {
      return false;
    }

    return data === true;
  } catch {
    return false;
  }
}
