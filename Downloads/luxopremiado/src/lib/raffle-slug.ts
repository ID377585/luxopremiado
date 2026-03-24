const FALLBACK_RAFFLE_SLUG = "bigode-das-rifas";

const LEGACY_RAFFLE_SLUG_ALIASES = new Set([
  "luxo-premiado",
]);

export function normalizeRaffleSlug(
  value: string | undefined | null,
): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (!/^[a-z0-9-]{2,90}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

export function canonicalizeRaffleSlug(
  value: string | undefined | null,
): string | null {
  const normalized = normalizeRaffleSlug(value);

  if (!normalized) {
    return null;
  }

  if (LEGACY_RAFFLE_SLUG_ALIASES.has(normalized)) {
    return FALLBACK_RAFFLE_SLUG;
  }

  return normalized;
}

export function getDefaultRaffleSlug(): string {
  return (
    canonicalizeRaffleSlug(
      process.env.NEXT_PUBLIC_DEFAULT_RAFFLE_SLUG,
    ) ?? FALLBACK_RAFFLE_SLUG
  );
}

export function isDefaultRaffleSlug(slug: string): boolean {
  const normalized = normalizeRaffleSlug(slug);

  if (!normalized) {
    return false;
  }

  const defaultSlug = getDefaultRaffleSlug();

  return (
    normalized === defaultSlug ||
    (defaultSlug === FALLBACK_RAFFLE_SLUG &&
      LEGACY_RAFFLE_SLUG_ALIASES.has(normalized))
  );
}

export function buildLandingPathForSlug(
  slug: string,
  anchor?: string,
): string {
  const normalizedSlug =
    canonicalizeRaffleSlug(slug) ??
    getDefaultRaffleSlug();

  const basePath = `/r/${normalizedSlug}`;

  if (!anchor || !anchor.trim()) {
    return basePath;
  }

  return `${basePath}#${anchor
    .trim()
    .replace(/^#+/, "")}`;
}

export function getLandingPath(anchor?: string): string {
  return buildLandingPathForSlug(
    getDefaultRaffleSlug(),
    anchor,
  );
}