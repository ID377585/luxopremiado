const FALLBACK_RAFFLE_SLUG = "luxo-premiado";

export function normalizeRaffleSlug(value: string | undefined | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!/^[a-z0-9-]{2,90}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

export function getDefaultRaffleSlug(): string {
  return normalizeRaffleSlug(process.env.NEXT_PUBLIC_DEFAULT_RAFFLE_SLUG) ?? FALLBACK_RAFFLE_SLUG;
}

export function isDefaultRaffleSlug(slug: string): boolean {
  return normalizeRaffleSlug(slug) === getDefaultRaffleSlug();
}

export function buildLandingPathForSlug(slug: string, anchor?: string): string {
  const normalizedSlug = normalizeRaffleSlug(slug) ?? getDefaultRaffleSlug();
  const basePath = `/r/${normalizedSlug}`;

  if (!anchor || !anchor.trim()) {
    return basePath;
  }

  return `${basePath}#${anchor.trim().replace(/^#+/, "")}`;
}

export function getLandingPath(anchor?: string): string {
  return buildLandingPathForSlug(getDefaultRaffleSlug(), anchor);
}
