"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "@/components/raffle/sections.module.css";
import { NumberGridLive } from "@/components/raffle/NumberGridLive";
import { NumberTile } from "@/types/raffle";

interface ReservationState {
  orderId: string;
  raffleId: string;
  reservedNumbers: number[];
  amountCents: number;
  expiresAt: string | null;
}

interface PaymentState {
  providerReference: string;
  status: "pending" | "initiated";
  pixQrCode?: string;
  pixCopyPaste?: string;
  checkoutUrl?: string;
  expiresAt?: string;
}

interface StoredCheckoutState {
  reservation: ReservationState;
  payment: PaymentState | null;
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
      payment: parsed.payment ?? null,
      orderStatus: typeof parsed.orderStatus === "string" ? parsed.orderStatus : "pending",
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function getRawString(raw: Record<string, unknown> | null | undefined, key: string): string | undefined {
  const value = raw?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
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
}: NumberPickerProps) {
  const [reservation, setReservation] = useState<ReservationState | null>(null);
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [checkoutTurnstileToken, setCheckoutTurnstileToken] = useState<string | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<"stripe" | "mercadopago" | "asaas">("mercadopago");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [orderStatus, setOrderStatus] = useState<string>("-");
  const [countdown, setCountdown] = useState("--:--");
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
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

  const canStartPayment = useMemo(
    () => Boolean(reservation?.orderId) && !paymentLoading,
    [paymentLoading, reservation?.orderId],
  );

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
      setPayment(stored.payment);
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
        setPayment(data.checkout.latestPayment ?? null);

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
      payment,
      orderStatus,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(checkoutStorageKey, JSON.stringify(payload));
  }, [checkoutStorageKey, isAuthenticated, isExpired, isPaid, orderStatus, payment, reservation]);

  function handleReservationCreated(next: ReservationState) {
    setReservation(next);
    setPayment(null);
    setOrderStatus("pending");
    setStatusMessage("Reserva criada. Finalize o pagamento antes do prazo.");
  }

  async function startPayment() {
    if (!reservation) {
      setStatusMessage("Reserve números antes de iniciar pagamento.");
      return;
    }

    setPaymentLoading(true);
    setStatusMessage("");

    try {
      if (turnstileEnabled && !checkoutTurnstileToken) {
        setStatusMessage("Complete a validação de segurança para iniciar o pagamento.");
        return;
      }

      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          orderId: reservation.orderId,
          provider: paymentProvider,
          method: paymentMethod,
          botTrap: "",
          turnstileToken: checkoutTurnstileToken ?? undefined,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        payment?: {
          providerReference: string;
          status: "pending" | "initiated";
          pixQrCode?: string;
          pixCopyPaste?: string;
          checkoutUrl?: string;
          expiresAt?: string;
        };
      };

      if (!response.ok || !data.payment) {
        setStatusMessage(data.error ?? "Não foi possível criar pagamento.");
        return;
      }

      setPayment(data.payment);
      setStatusMessage("Pagamento iniciado. Acompanhe o status abaixo.");
      setOrderStatus("pending");

      if (data.payment.checkoutUrl) {
        window.open(data.payment.checkoutUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setStatusMessage("Falha de conexão ao iniciar pagamento.");
    } finally {
      setPaymentLoading(false);
    }
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

      if (data.latestPayment?.provider_reference) {
        setPayment({
          providerReference: data.latestPayment.provider_reference,
          status: data.latestPayment.status === "initiated" ? "initiated" : "pending",
          pixQrCode: data.latestPayment.pix_qr_code ?? undefined,
          pixCopyPaste: data.latestPayment.pix_copy_paste ?? undefined,
          checkoutUrl:
            getRawString(data.latestPayment.raw, "checkoutUrl") ??
            getRawString(data.latestPayment.raw, "checkout_url"),
          expiresAt: getRawString(data.latestPayment.raw, "expiresAt"),
        });
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
        </header>

        <div className={styles.numberPickerWrap}>
          <div>
            <NumberGridLive
              initialNumbers={numbers}
              initialGlobalStats={{
                available: initialStats.availableNumbers,
                reserved: initialStats.reservedNumbers,
                sold: initialStats.soldNumbers,
              }}
              isAuthenticated={isAuthenticated}
              maxNumbersPerUser={maxNumbersPerUser}
              onReservationCreated={handleReservationCreated}
              onTurnstileTokenChange={setCheckoutTurnstileToken}
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
              <label className={styles.checkoutLabel}>
                Provider
                <select
                  className={styles.checkoutSelect}
                  onChange={(event) => setPaymentProvider(event.target.value as "stripe" | "mercadopago" | "asaas")}
                  value={paymentProvider}
                >
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="stripe">Stripe</option>
                  <option value="asaas">Asaas</option>
                </select>
              </label>

              <label className={styles.checkoutLabel}>
                Método
                <select
                  className={styles.checkoutSelect}
                  onChange={(event) => setPaymentMethod(event.target.value as "pix" | "card")}
                  value={paymentMethod}
                >
                  <option value="pix">PIX</option>
                  <option value="card">Cartão</option>
                </select>
              </label>

              <button className={styles.actionButton} disabled={!canStartPayment} onClick={startPayment} type="button">
                {paymentLoading ? "Iniciando..." : "Iniciar pagamento"}
              </button>

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

            {payment?.pixCopyPaste ? (
              <div className={styles.pixBox}>
                <strong>PIX Copia e Cola</strong>
                <p>{payment.pixCopyPaste}</p>
              </div>
            ) : null}

            {payment?.checkoutUrl ? (
              <a className={styles.heroCta} href={payment.checkoutUrl} rel="noreferrer" target="_blank">
                Abrir checkout do provedor
              </a>
            ) : null}

            {statusMessage ? <p className={styles.liveMeta}>{statusMessage}</p> : null}
          </aside>
        </div>
      </div>
    </section>
  );
}
