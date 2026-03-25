function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }

  return value;
}

function getDefaultSiteUrl(): string {
  if (process.env.NODE_ENV === "production") {
    return "https://www.bigodedasrifas.com";
  }

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

  if (vercelHost) {
    const host = vercelHost.replace(/^https?:\/\//i, "").trim().replace(/\/+$/, "");
    if (host) {
      return `https://${host}`;
    }
  }

  return "http://localhost:3000";
}

function normalizeSiteUrl(rawValue: string | undefined): string {
  const fallback = getDefaultSiteUrl();
  const normalized = (rawValue ?? "").trim().replace(/\s+/g, "");

  if (!normalized) {
    return fallback;
  }

  try {
    const url = new URL(normalized);
    if (process.env.NODE_ENV === "production" && url.hostname !== "www.bigodedasrifas.com") {
      return fallback;
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseUrl(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function getSupabaseServiceRoleKey(): string {
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getSiteUrl(): string {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function canUseDemoFallback(): boolean {
  if (process.env.ALLOW_FAKE_FALLBACK === "true") {
    return true;
  }

  return process.env.NODE_ENV !== "production";
}

export function isPaymentFlowEnabled(): boolean {
  return (
    process.env.ENABLE_PAYMENTS === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === "true"
  );
}