interface CachedRaffleStats {
  sold: number;
  reserved: number;
  total: number;
  available: number;
  expiresAt: number;
}

const globalStore = globalThis as typeof globalThis & {
  __lpRaffleStatsCache?: Map<string, CachedRaffleStats>;
};

function getCacheStore(): Map<string, CachedRaffleStats> {
  if (!globalStore.__lpRaffleStatsCache) {
    globalStore.__lpRaffleStatsCache = new Map<
      string,
      CachedRaffleStats
    >();
  }

  return globalStore.__lpRaffleStatsCache;
}

function getTtlMs(): number {
  const raw = Number(
    process.env.RAFFLE_STATS_CACHE_TTL_MS ?? 5000,
  );

  return Number.isFinite(raw) && raw > 0 ? raw : 5000;
}

export function getCachedRaffleStats(
  raffleId: string,
): CachedRaffleStats | null {
  const cache = getCacheStore();
  const cached = cache.get(raffleId);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    cache.delete(raffleId);
    return null;
  }

  return cached;
}

export function setCachedRaffleStats(input: {
  raffleId: string;
  total: number;
  sold: number;
  reserved: number;
}): CachedRaffleStats {
  const sold = Math.max(0, Number(input.sold));
  const reserved = Math.max(0, Number(input.reserved));
  const total = Math.max(0, Number(input.total));

  const available = Math.max(
    0,
    total - sold - reserved,
  );

  const next: CachedRaffleStats = {
    sold,
    reserved,
    total,
    available,
    expiresAt: Date.now() + getTtlMs(),
  };

  getCacheStore().set(input.raffleId, next);

  return next;
}