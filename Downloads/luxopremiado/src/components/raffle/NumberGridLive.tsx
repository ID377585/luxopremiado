"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "@/components/raffle/sections.module.css";
import { formatRaffleNumber } from "@/lib/format";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { NumberStatus, NumberTile } from "@/types/raffle";

interface GlobalNumberStats {
  available: number;
  reserved: number;
  sold: number;
}

interface NumberGridLiveProps {
  raffleId: string | null;
  raffleSlug: string;
  initialNumbers: NumberTile[];
  initialGlobalStats?: GlobalNumberStats;
  totalNumbers: number;
  maxNumbersPerUser: number;
  recommendedPackQty?: number | null;
  isAuthenticated?: boolean;
  onReservationCreated?: (reservation: {
    orderId: string;
    raffleId: string;
    reservedNumbers: number[];
    amountCents: number;
    expiresAt: string | null;
  }) => void;
}

function normalizeStatus(status: unknown): NumberStatus {
  if (status === "reserved" || status === "sold") {
    return status;
  }

  return "available";
}

function deriveGlobalStatsFromTiles(numbers: NumberTile[], totalNumbers: number): GlobalNumberStats {
  const sold = numbers.filter((item) => item.status === "sold").length;
  const reserved = numbers.filter((item) => item.status === "reserved").length;
  const available = Math.max(0, totalNumbers - sold - reserved);

  return { available, reserved, sold };
}

function normalizeGlobalStats(
  stats: Partial<GlobalNumberStats> | undefined,
  fallback: GlobalNumberStats,
): GlobalNumberStats {
  if (!stats) {
    return fallback;
  }

  const sold = Number.isFinite(stats.sold) ? Number(stats.sold) : fallback.sold;
  const reserved = Number.isFinite(stats.reserved) ? Number(stats.reserved) : fallback.reserved;
  const available = Number.isFinite(stats.available) ? Number(stats.available) : fallback.available;

  return {
    sold: Math.max(0, sold),
    reserved: Math.max(0, reserved),
    available: Math.max(0, available),
  };
}

function applyStatusDelta(
  current: GlobalNumberStats,
  previousStatus: NumberStatus,
  nextStatus: NumberStatus,
): GlobalNumberStats {
  if (previousStatus === nextStatus) {
    return current;
  }

  const updated: GlobalNumberStats = { ...current };

  const decrement = (status: NumberStatus) => {
    if (status === "sold") {
      updated.sold = Math.max(0, updated.sold - 1);
      return;
    }

    if (status === "reserved") {
      updated.reserved = Math.max(0, updated.reserved - 1);
      return;
    }

    updated.available = Math.max(0, updated.available - 1);
  };

  const increment = (status: NumberStatus) => {
    if (status === "sold") {
      updated.sold += 1;
      return;
    }

    if (status === "reserved") {
      updated.reserved += 1;
      return;
    }

    updated.available += 1;
  };

  decrement(previousStatus);
  increment(nextStatus);

  return updated;
}

export function NumberGridLive({
  raffleId,
  raffleSlug,
  initialNumbers,
  initialGlobalStats,
  totalNumbers,
  maxNumbersPerUser,
  recommendedPackQty = null,
  isAuthenticated = false,
  onReservationCreated,
}: NumberGridLiveProps) {
  const pageSize = 200;
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [numbers, setNumbers] = useState(initialNumbers);
  const [globalStats, setGlobalStats] = useState<GlobalNumberStats>(() =>
    normalizeGlobalStats(initialGlobalStats, deriveGlobalStatsFromTiles(initialNumbers, totalNumbers)),
  );
  const [page, setPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  useEffect(() => {
    setNumbers(initialNumbers);
    setPage(1);
  }, [initialNumbers]);

  useEffect(() => {
    setGlobalStats(normalizeGlobalStats(initialGlobalStats, deriveGlobalStatsFromTiles(initialNumbers, totalNumbers)));
  }, [initialGlobalStats, initialNumbers, totalNumbers]);

  useEffect(() => {
    if (page === 1) {
      setNumbers(initialNumbers);
      setPageLoading(false);
      return;
    }

    const controller = new AbortController();
    setPageLoading(true);

    const fetchPage = async () => {
      try {
        const response = await fetch(
          `/api/raffles/${encodeURIComponent(raffleSlug)}/numbers?page=${page}&pageSize=${pageSize}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const data = (await response.json()) as {
          error?: string;
          numbers?: NumberTile[];
          stats?: GlobalNumberStats;
        };

        if (!response.ok || !data.numbers) {
          setMessage(data.error ?? "Falha ao carregar os números desta página.");
          return;
        }

        setNumbers(data.numbers);
        if (data.stats) {
          setGlobalStats((current) => normalizeGlobalStats(data.stats, current));
        }
      } catch {
        if (!controller.signal.aborted) {
          setMessage("Erro de conexão ao carregar página de números.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setPageLoading(false);
        }
      }
    };

    void fetchPage();

    return () => {
      controller.abort();
    };
  }, [initialNumbers, page, pageSize, raffleSlug]);

  useEffect(() => {
    setSelectedNumbers((current) =>
      current.filter((number) => numbers.some((item) => item.number === number && item.status === "available")),
    );
  }, [numbers]);

  useEffect(() => {
    if (!supabase || !raffleId) {
      setIsLive(false);
      return;
    }

    const channel = supabase
      .channel(`raffle-numbers-${raffleId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "raffle_numbers",
          filter: `raffle_id=eq.${raffleId}`,
        },
        (payload) => {
          const rawNumber = payload.new?.number;
          const rawStatus = payload.new?.status;
          const previousRawStatus = payload.old?.status;
          const number = typeof rawNumber === "number" ? rawNumber : Number(rawNumber);

          if (!Number.isFinite(number)) {
            return;
          }

          const previousStatus = normalizeStatus(previousRawStatus);
          const nextStatus = normalizeStatus(rawStatus);

          setNumbers((current) =>
            current.map((item) =>
              item.number === number
                ? {
                    ...item,
                    status: normalizeStatus(rawStatus),
                  }
                : item,
            ),
          );
          setGlobalStats((current) => applyStatusDelta(current, previousStatus, nextStatus));

          setLastUpdatedAt(new Date());
        },
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, raffleId]);

  const available = globalStats.available;
  const reserved = globalStats.reserved;
  const sold = globalStats.sold;
  const totalPages = Math.max(1, Math.ceil(totalNumbers / pageSize));

  function toggleNumberSelection(number: number, status: NumberStatus) {
    if (!isAuthenticated) {
      setMessage("Faça login para selecionar números e iniciar o pagamento.");
      return;
    }

    if (status !== "available" || loading) {
      return;
    }

    setMessage("");
    setSelectedNumbers((current) =>
      current.includes(number) ? current.filter((item) => item !== number) : [...current, number],
    );
  }

  async function reserve(payload: { numbers?: number[]; qty?: number }) {
    if (!isAuthenticated) {
      setMessage("Faça login para reservar números.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (turnstileEnabled && !turnstileToken) {
        setMessage("Complete a validação de segurança para continuar.");
        return;
      }

      const affiliateCode = localStorage.getItem("lp_ref") ?? undefined;

      const response = await fetch(`/api/raffles/${encodeURIComponent(raffleSlug)}/reserve`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          numbers: payload.numbers,
          qty: payload.qty,
          affiliateCode,
          botTrap: "",
          turnstileToken: turnstileToken ?? undefined,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        success?: boolean;
        reservation?: {
          orderId: string;
          raffleId: string;
          reservedNumbers: number[];
          amountCents: number;
          expiresAt: string | null;
        } | null;
      };

      if (!response.ok) {
        setMessage(data.error ?? "Não foi possível reservar os números.");
        return;
      }

      setSelectedNumbers([]);
      setMessage("Reserva criada com sucesso. Siga para o pagamento.");
      if (data.reservation) {
        onReservationCreated?.(data.reservation);
      }
    } catch {
      setMessage("Erro de conexão ao tentar reservar os números.");
    } finally {
      setLoading(false);
    }
  }

  async function reserveSelected() {
    if (selectedNumbers.length === 0) {
      setMessage("Selecione pelo menos um número disponível.");
      return;
    }

    await reserve({ numbers: selectedNumbers });
  }

  async function reserveRandom(qty = 5) {
    await reserve({ qty });
  }

  return (
    <>
      <div className={styles.filterRow}>
        <span className={styles.filterTag}>Disponíveis: {available}</span>
        <span className={styles.filterTag}>Reservados: {reserved}</span>
        <span className={styles.filterTag}>Vendidos: {sold}</span>
        <span className={styles.filterTag}>Limite por usuário: {maxNumbersPerUser || "sem limite"}</span>
        <span className={styles.filterTag}>
          Página {page}/{totalPages}
        </span>
        <span className={`${styles.filterTag} ${isAuthenticated ? styles.liveOn : styles.liveOff}`}>
          {isAuthenticated ? "Online" : "Offline"}
        </span>
        <span className={`${styles.filterTag} ${isLive ? styles.liveOn : styles.liveOff}`}>
          Tempo real: {isLive ? "Ao vivo" : "Aguardando"}
        </span>
      </div>

      <div className={styles.actionRow}>
        <button
          className={styles.actionButtonGhost}
          disabled={!isAuthenticated || page <= 1 || pageLoading}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          type="button"
        >
          Página anterior
        </button>
        <button
          className={styles.actionButtonGhost}
          disabled={!isAuthenticated || page >= totalPages || pageLoading}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          type="button"
        >
          Próxima página
        </button>
      </div>

      <div className={styles.actionRow}>
        <button className={styles.actionButton} disabled={!isAuthenticated || loading} onClick={reserveSelected} type="button">
          {loading ? "Reservando..." : `Reservar selecionados (${selectedNumbers.length})`}
        </button>
        <button
          className={`${styles.actionButtonGhost} ${recommendedPackQty === 5 ? styles.actionButtonHot : ""}`}
          disabled={!isAuthenticated || loading}
          onClick={() => reserveRandom(5)}
          type="button"
        >
          Reservar 5 aleatórios
        </button>
        <button
          className={`${styles.actionButtonGhost} ${recommendedPackQty === 10 ? styles.actionButtonHot : ""}`}
          disabled={!isAuthenticated || loading}
          onClick={() => reserveRandom(10)}
          type="button"
        >
          Reservar 10 (Popular)
        </button>
        <button
          className={`${styles.actionButtonGhost} ${recommendedPackQty === 25 ? styles.actionButtonHot : ""}`}
          disabled={!isAuthenticated || loading}
          onClick={() => reserveRandom(25)}
          type="button"
        >
          Reservar 25 (Turbo)
        </button>
        <button
          className={`${styles.actionButtonGhost} ${recommendedPackQty === 50 ? styles.actionButtonHot : ""}`}
          disabled={!isAuthenticated || loading}
          onClick={() => reserveRandom(50)}
          type="button"
        >
          Reservar 50 (Top)
        </button>
      </div>

      {turnstileEnabled ? (
        <div className={styles.turnstileWrap}>
          <TurnstileWidget onTokenChange={setTurnstileToken} />
        </div>
      ) : null}

      {message ? <p className={styles.liveMeta}>{message}</p> : null}
      {pageLoading ? <p className={styles.liveMeta}>Carregando página de números...</p> : null}
      {!isAuthenticated ? <p className={styles.liveMeta}>Faça login para liberar seleção e pagamento.</p> : null}
      {recommendedPackQty ? (
        <p className={styles.liveMeta}>Pacote sugerido ativo: {recommendedPackQty} números. Clique no botão correspondente.</p>
      ) : null}

      {lastUpdatedAt ? (
        <p className={styles.liveMeta}>Última atualização: {lastUpdatedAt.toLocaleTimeString("pt-BR")}</p>
      ) : null}

      <div className={styles.numbersGrid}>
        {numbers.map((item) => (
          <button
            className={`${styles.numberTile} ${styles[item.status]} ${
              selectedNumbers.includes(item.number) ? styles.selected : ""
            }`}
            key={item.number}
            onClick={() => toggleNumberSelection(item.number, item.status)}
            type="button"
          >
            {formatRaffleNumber(item.number)}
          </button>
        ))}
      </div>
    </>
  );
}
