"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "@/components/raffle/sections.module.css";
import { NumberGridLive } from "@/components/raffle/NumberGridLive";
import { NumberTile, PrizeConfigEntry } from "@/types/raffle";

interface ReservationState {
  orderId: string;
  raffleId: string;
  reservedNumbers: number[];
  amountCents: number;
  expiresAt: string | null;
}

interface StoredCheckoutState {
  reservation: ReservationState;
  orderStatus: string;
  savedAt: string;
}

interface NumberPickerProps {
  isAuthenticated?: boolean;
  raffleSlug: string;
  numbers: NumberTile[];
  totalNumbers: number;
  raffleId: string | null;
  maxNumbersPerUser: number;
  initialStats: {
    availableNumbers: number;
    reservedNumbers: number;
    soldNumbers: number;
  };
  recommendedPackQty?: number | null;
  prizeConfigs?: PrizeConfigEntry[];
}

function formatBrl(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatCountdown(targetIso: string | null): string {
  if (!targetIso) {
    return "--:--";
  }

  const target = new Date(targetIso).getTime();
  const diff = Math.max(0, target - Date.now());
  const minutes = Math.floor(diff / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function readStorage(key: string): StoredCheckoutState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredCheckoutState>;
    if (!parsed || typeof parsed !== "object" || !parsed.reservation?.orderId) {
      return null;
    }

    return {
      reservation: parsed.reservation,
      orderStatus: typeof parsed.orderStatus === "string" ? parsed.orderStatus : "pending",
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function NumberPicker({
  isAuthenticated = false,
  raffleSlug,
  numbers,
  totalNumbers,
  raffleId,
  maxNumbersPerUser,
  initialStats,
  recommendedPackQty = null,
  prizeConfigs,
}: NumberPickerProps) {
  const [reservation, setReservation] = useState<ReservationState | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [orderStatus, setOrderStatus] = useState<string>("-");
  const [countdown, setCountdown] = useState("--:--");
  const prizeOptions = useMemo(
    () =>
      prizeConfigs && prizeConfigs.length
        ? [...prizeConfigs].sort((a, b) => a.prizeOrder - b.prizeOrder)
        : null,
    [prizeConfigs],
  );
  const [selectedPrizeOrder, setSelectedPrizeOrder] = useState<number | null>(
    prizeOptions?.[0]?.prizeOrder ?? null,
  );
  const checkoutStorageKey = useMemo(() => `lp_active_checkout:${raffleSlug}`, [raffleSlug]);

  useEffect(() => {
    if (!reservation?.expiresAt) {
      setCountdown("--:--");
      return;
    }

    const timer = setInterval(() => {
      setCountdown(formatCountdown(reservation.expiresAt));
    }, 1000);

    setCountdown(formatCountdown(reservation.expiresAt));

    return () => clearInterval(timer);
  }, [reservation?.expiresAt]);

  const selectedCount = reservation?.reservedNumbers.length ?? 0;
  const filteredNumbers = useMemo(() => {
    if (!selectedPrizeOrder) return numbers;
    return numbers.filter(
      (n) => n.prizeOrder === selectedPrizeOrder || (typeof n.prizeOrder === "undefined" && selectedPrizeOrder === 1),
    );
  }, [numbers, selectedPrizeOrder]);

  const selectedStats = useMemo(() => {
    if (prizeOptions && selectedPrizeOrder) {
      const match = prizeOptions.find((p) => p.prizeOrder === selectedPrizeOrder);
      if (match?.stats) {
        return {
          availableNumbers: match.stats.available,
          reservedNumbers: match.stats.reserved,
          soldNumbers: match.stats.sold,
        };
      }
    }
    return initialStats;
  }, [initialStats, prizeOptions, selectedPrizeOrder]);

  const isPaid = orderStatus === "paid";
  const isExpired = orderStatus === "expired" || (countdown === "00:00" && !isPaid);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;
    const stored = readStorage(checkoutStorageKey);

    if (stored) {
      setReservation(stored.reservation);
      setOrderStatus(stored.orderStatus);
      setStatusMessage("Checkout restaurado. Continue o pagamento.");
    }

    const hydrateFromServer = async () => {
      try {
        const response = await fetch(`/api/raffles/${encodeURIComponent(raffleSlug)}/active-checkout`, {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as {
          error?: string;
          checkout?: {
            reservation: ReservationState;
            orderStatus: string;
            latestPayment?: {
              providerReference: string;
              status: "pending" | "initiated";
              pixQrCode?: string;
              pixCopyPaste?: string;
              checkoutUrl?: string;
              expiresAt?: string;
            } | null;
          } | null;
        };

        if (!isMounted || !response.ok || !data.checkout?.reservation?.orderId) {
          return;
        }

        setReservation(data.checkout.reservation);
        setOrderStatus(data.checkout.orderStatus);

        if (!stored || stored.reservation.orderId !== data.checkout.reservation.orderId) {
          setStatusMessage("Checkout ativo encontrado no servidor. Continue o pagamento.");
        }
      } catch {
        // silencioso para não poluir a experiência se o endpoint não responder.
      }
    };

    void hydrateFromServer();

    return () => {
      isMounted = false;
    };
  }, [checkoutStorageKey, isAuthenticated, raffleSlug]);

  useEffect(() => {
    if (typeof window === "undefined" || !isAuthenticated) {
      return;
    }

    if (!reservation?.orderId || isPaid || isExpired) {
      window.localStorage.removeItem(checkoutStorageKey);
      return;
    }

    const payload: StoredCheckoutState = {
      reservation,
      orderStatus,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(checkoutStorageKey, JSON.stringify(payload));
  }, [checkoutStorageKey, isAuthenticated, isExpired, isPaid, orderStatus, reservation]);

  function handleReservationCreated(next: ReservationState) {
    setReservation(next);
    setOrderStatus("pending");
    setStatusMessage("Reserva criada. Finalize o pagamento antes do prazo.");
  }

  const refreshOrderStatus = useCallback(async () => {
    if (!reservation?.orderId) {
      return;
    }

    setStatusLoading(true);

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(reservation.orderId)}/status`, {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as {
        error?: string;
        order?: { status: string; expires_at?: string | null };
        latestPayment?: {
          provider_reference?: string | null;
          status?: string | null;
          pix_qr_code?: string | null;
          pix_copy_paste?: string | null;
          raw?: Record<string, unknown> | null;
        } | null;
      };

      if (!response.ok || !data.order) {
        setStatusMessage(data.error ?? "Não foi possível consultar o pedido.");
        return;
      }

      setOrderStatus(data.order.status);

      if (data.order.expires_at) {
        const nextExpiresAt = data.order.expires_at ?? null;
        setReservation((current) =>
          current
            ? {
                ...current,
                expiresAt: nextExpiresAt,
              }
            : current,
        );
      }

      if (data.order.status === "paid") {
        setStatusMessage("Pagamento confirmado. Seus números estão garantidos.");
      } else if (data.order.status === "expired") {
        setStatusMessage("Reserva expirada. Faça uma nova seleção de números.");
      } else {
        setStatusMessage(`Status do pedido: ${data.order.status}`);
      }
    } catch {
      setStatusMessage("Erro ao consultar status do pedido.");
    } finally {
      setStatusLoading(false);
    }
  }, [reservation?.orderId]);

  useEffect(() => {
    if (!reservation?.orderId) {
      return;
    }

    void refreshOrderStatus();
    const poll = setInterval(() => {
      void refreshOrderStatus();
    }, 10_000);

    return () => clearInterval(poll);
  }, [refreshOrderStatus, reservation?.orderId]);

  return (
    <section className={styles.section} id="escolher-numeros">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Escolher Números</h2>
          <p className={styles.sectionSubtitle}>
            Seleção manual ou pacotes aleatórios com reserva temporária automática para fechar no PIX.
          </p>
          {prizeOptions && (
            <div className={styles.prizeSelectorRow}>
              <label className={styles.prizeSelectorLabel}>
                Escolha o prêmio para concorrer
                <select
                  className={styles.prizeSelector}
                  value={selectedPrizeOrder ?? ""}
                  onChange={(e) => setSelectedPrizeOrder(Number(e.target.value) || null)}
                >
                  {prizeOptions.map((p) => (
                    <option key={p.prizeOrder} value={p.prizeOrder}>
                      {p.prizeLabel}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </header>

        <div className={styles.numberPickerWrap}>
          <div>
            <NumberGridLive
              initialNumbers={filteredNumbers}
              initialGlobalStats={{
                available: selectedStats.availableNumbers,
                reserved: selectedStats.reservedNumbers,
                sold: selectedStats.soldNumbers,
              }}
              isAuthenticated={isAuthenticated}
              maxNumbersPerUser={maxNumbersPerUser}
              onReservationCreated={handleReservationCreated}
              raffleId={raffleId}
              raffleSlug={raffleSlug}
              recommendedPackQty={recommendedPackQty}
              totalNumbers={totalNumbers}
            />
          </div>

          <aside className={styles.card}>
            <h3 className={styles.cardTitle}>Checkout do participante</h3>
            <p className={styles.cardText}>
              Faça a reserva e conclua o pagamento antes do tempo expirar para confirmar seus números.
            </p>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <span>Pedido</span>
                <strong>{reservation?.orderId ?? "-"}</strong>
              </li>
              <li className={styles.featureItem}>
                <span>Quantidade</span>
                <strong>{selectedCount}</strong>
              </li>
              <li className={styles.featureItem}>
                <span>Total</span>
                <strong>{reservation ? formatBrl(reservation.amountCents) : "-"}</strong>
              </li>
              <li className={styles.featureItem}>
                <span>Tempo restante</span>
                <strong>{countdown}</strong>
              </li>
              <li className={styles.featureItem}>
                <span>Status</span>
                <strong>{orderStatus}</strong>
              </li>
            </ul>

            <div className={styles.checkoutControls}>
              <p className={styles.checkoutWarning}>
                Pagamento temporariamente indisponível nesta etapa. Reserve seus números e acompanhe o status do pedido.
              </p>

              <button
                className={styles.actionButtonGhost}
                disabled={!reservation?.orderId || statusLoading}
                onClick={refreshOrderStatus}
                type="button"
              >
                {statusLoading ? "Consultando..." : "Atualizar status"}
              </button>
            </div>

            {isPaid ? <p className={styles.checkoutSuccess}>Pagamento confirmado. Números vinculados ao seu usuário.</p> : null}
            {isExpired ? (
              <p className={styles.checkoutWarning}>
                Reserva expirada. Volte para a grade e faça uma nova reserva para continuar.
              </p>
            ) : null}

            {statusMessage ? <p className={styles.liveMeta}>{statusMessage}</p> : null}
          </aside>
        </div>
      </div>
    </section>
  );
}
