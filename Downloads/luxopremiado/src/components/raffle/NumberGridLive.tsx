"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "@/components/raffle/sections.module.css";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { NumberStatus, NumberTile } from "@/types/raffle";

interface NumberGridLiveProps {
  raffleId: string | null;
  raffleSlug: string;
  initialNumbers: NumberTile[];
  maxNumbersPerUser: number;
}

function normalizeStatus(status: unknown): NumberStatus {
  if (status === "reserved" || status === "sold") {
    return status;
  }

  return "available";
}

export function NumberGridLive({
  raffleId,
  raffleSlug,
  initialNumbers,
  maxNumbersPerUser,
}: NumberGridLiveProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [numbers, setNumbers] = useState(initialNumbers);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    setNumbers(initialNumbers);
  }, [initialNumbers]);

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
          const number = typeof rawNumber === "number" ? rawNumber : Number(rawNumber);

          if (!Number.isFinite(number)) {
            return;
          }

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

  const available = numbers.filter((item) => item.status === "available").length;
  const reserved = numbers.filter((item) => item.status === "reserved").length;
  const sold = numbers.filter((item) => item.status === "sold").length;

  function toggleNumberSelection(number: number, status: NumberStatus) {
    if (status !== "available" || loading) {
      return;
    }

    setMessage("");
    setSelectedNumbers((current) =>
      current.includes(number) ? current.filter((item) => item !== number) : [...current, number],
    );
  }

  async function reserve(payload: { numbers?: number[]; qty?: number }) {
    setLoading(true);
    setMessage("");

    try {
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
        }),
      });

      const data = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        setMessage(data.error ?? "Não foi possível reservar os números.");
        return;
      }

      setSelectedNumbers([]);
      setMessage("Reserva criada com sucesso. Siga para o pagamento.");
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

  async function reserveRandom() {
    await reserve({ qty: 5 });
  }

  return (
    <>
      <div className={styles.filterRow}>
        <span className={styles.filterTag}>Disponíveis: {available}</span>
        <span className={styles.filterTag}>Reservados: {reserved}</span>
        <span className={styles.filterTag}>Vendidos: {sold}</span>
        <span className={styles.filterTag}>Limite por usuário: {maxNumbersPerUser || "sem limite"}</span>
        <span className={`${styles.filterTag} ${isLive ? styles.liveOn : styles.liveOff}`}>
          {isLive ? "Ao vivo" : "Offline"}
        </span>
      </div>

      <div className={styles.actionRow}>
        <button className={styles.actionButton} disabled={loading} onClick={reserveSelected} type="button">
          {loading ? "Reservando..." : `Reservar selecionados (${selectedNumbers.length})`}
        </button>
        <button className={styles.actionButtonGhost} disabled={loading} onClick={reserveRandom} type="button">
          Reservar 5 aleatórios
        </button>
      </div>

      {message ? <p className={styles.liveMeta}>{message}</p> : null}

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
            {item.number}
          </button>
        ))}
      </div>
    </>
  );
}
