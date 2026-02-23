import { NextRequest } from "next/server";

interface AntiBotOptions {
  request: NextRequest;
  action: "reserve" | "payment";
  userId: string;
  botTrap?: string;
  turnstileToken?: string;
}

interface AntiBotResult {
  ok: boolean;
  status: number;
  error?: string;
}

interface RateEntry {
  count: number;
  resetAt: number;
}

const USER_AGENT_BLOCKLIST = /(bot|crawler|spider|scrapy|curl|wget|python|httpclient|headless|phantom|go-http-client)/i;
const DEFAULT_LIMITS: Record<AntiBotOptions["action"], { max: number; windowMs: number }> = {
  reserve: { max: 20, windowMs: 60_000 },
  payment: { max: 10, windowMs: 60_000 },
};

const globalStore = globalThis as typeof globalThis & {
  __lpRateLimiter?: Map<string, RateEntry>;
};

function getStore(): Map<string, RateEntry> {
  if (!globalStore.__lpRateLimiter) {
    globalStore.__lpRateLimiter = new Map<string, RateEntry>();
  }

  return globalStore.__lpRateLimiter;
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const store = getStore();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= max) {
    return false;
  }

  current.count += 1;
  store.set(key, current);
  return true;
}

async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return true;
  }

  if (!token) {
    return false;
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: ip,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

export async function enforceAntiBot(options: AntiBotOptions): Promise<AntiBotResult> {
  const ua = options.request.headers.get("user-agent") ?? "";

  if (!ua || USER_AGENT_BLOCKLIST.test(ua)) {
    return {
      ok: false,
      status: 403,
      error: "Requisição bloqueada por proteção anti-bot.",
    };
  }

  if ((options.botTrap ?? "").trim().length > 0) {
    return {
      ok: false,
      status: 403,
      error: "Falha de verificação anti-bot.",
    };
  }

  const ip = clientIp(options.request);
  const limits = DEFAULT_LIMITS[options.action];
  const key = `${options.action}:${options.userId}:${ip}`;

  if (!rateLimit(key, limits.max, limits.windowMs)) {
    return {
      ok: false,
      status: 429,
      error: "Muitas tentativas. Aguarde e tente novamente.",
    };
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const validToken = await verifyTurnstileToken(options.turnstileToken ?? "", ip);

    if (!validToken) {
      return {
        ok: false,
        status: 403,
        error: "Validação de segurança inválida.",
      };
    }
  }

  return { ok: true, status: 200 };
}
