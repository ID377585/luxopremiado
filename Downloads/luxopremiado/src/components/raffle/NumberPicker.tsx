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

interface NumberPickerProps {
  isAuthenticated?: boolean;
  raffleSlug: string;
  numbers: NumberTile[];
  totalNumbers: number;
  raffleId: string | null;
  maxNumbersPerUser: number;
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

export function NumberPicker({
  isAuthenticated = false,
  raffleSlug,
  numbers,
  totalNumbers,
  raffleId,
  maxNumbersPerUser,
}: NumberPickerProps) {
  const [reservation, setReservation] = useState<ReservationState | null>(null);
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<"stripe" | "mercadopago" | "asaas">("mercadopago");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [orderStatus, setOrderStatus] = useState<string>("-");
  const [countdown, setCountdown] = useState("--:--");

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
          <p className={styles.sectionSubtitle}>Seleção manual ou aleatória com reserva temporária automática.</p>
        </header>

        <div className={styles.numberPickerWrap}>
          <div>
            <NumberGridLive
              initialNumbers={numbers}
              isAuthenticated={isAuthenticated}
              maxNumbersPerUser={maxNumbersPerUser}
              onReservationCreated={handleReservationCreated}
              raffleId={raffleId}
              raffleSlug={raffleSlug}
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
