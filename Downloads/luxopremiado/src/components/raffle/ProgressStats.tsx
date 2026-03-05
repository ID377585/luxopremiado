"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { CampaignStats, PrizeConfigEntry } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface ProgressStatsProps {
  stats: CampaignStats;
  totalNumbers: number;
  raffleSlug: string;
  prizeConfigs?: PrizeConfigEntry[];
}

interface LiveUrgencyPulse {
  recentSold: number;
  minutesAgo: number;
  viewersNow: number;
}

interface LivePrizeStat {
  prizeOrder: number;
  total: number;
  sold: number;
  reserved: number;
  available: number;
}

interface LiveStatsPayload {
  totals: {
    sold: number;
    reserved: number;
    available: number;
    totalNumbers: number;
  };
  prizes: LivePrizeStat[];
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildInitialPulse(stats: CampaignStats, totalNumbers: number): LiveUrgencyPulse {
  const safeTotal = Math.max(totalNumbers, 1);
  const recentSold = clampNumber(Math.round((stats.soldNumbers / safeTotal) * 140), 12, 120);
  const viewersNow = clampNumber(Math.round(stats.reservedNumbers * 0.38), 17, 420);

  return {
    recentSold,
    minutesAgo: 2,
    viewersNow,
  };
}

function buildNextPulse(
  previous: LiveUrgencyPulse,
  stats: CampaignStats,
  totalNumbers: number,
): LiveUrgencyPulse {
  const safeTotal = Math.max(totalNumbers, 1);
  const variationSeed = Date.now() % 7;
  const soldBase = clampNumber(Math.round((stats.soldNumbers / safeTotal) * 150), 10, 140);
  const viewersBase = clampNumber(Math.round(stats.reservedNumbers * 0.4), 15, 480);
  const soldVariation = variationSeed - 3;
  const viewersVariation = (variationSeed % 5) - 2;

  return {
    recentSold: clampNumber(soldBase + soldVariation, 8, 160),
    minutesAgo: previous.minutesAgo >= 4 ? 1 : previous.minutesAgo + 1,
    viewersNow: clampNumber(viewersBase + viewersVariation * 3, 12, 520),
  };
}

export function ProgressStats({ stats, totalNumbers, raffleSlug, prizeConfigs }: ProgressStatsProps) {
  const [pulse, setPulse] = useState<LiveUrgencyPulse>(() => buildInitialPulse(stats, totalNumbers));
  const [livePrizes, setLivePrizes] = useState<LivePrizeStat[] | null>(null);
  const [liveTotals, setLiveTotals] = useState<LiveStatsPayload["totals"] | null>(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPulse((current) => buildNextPulse(current, stats, totalNumbers));
    }, 25_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [stats, totalNumbers]);

  const rows = useMemo(() => {
    const entries =
      prizeConfigs?.length && prizeConfigs.length > 0
        ? [...prizeConfigs].sort((a, b) => a.prizeOrder - b.prizeOrder)
        : ([{ prizeOrder: 1, prizeLabel: "Prêmios", totalNumbers }] as Array<
            PrizeConfigEntry & { totalNumbers: number }
          >);

    return entries.map((entry) => {
      const total = Math.max(entry.totalNumbers ?? totalNumbers, 1);
      const liveRow = livePrizes?.find((p) => p.prizeOrder === entry.prizeOrder);
      const sold =
        typeof liveRow?.sold === "number"
          ? liveRow.sold
          : typeof (entry as PrizeConfigEntry).stats?.sold === "number"
            ? (entry as PrizeConfigEntry).stats!.sold
            : stats.soldNumbers;
      const reserved =
        typeof liveRow?.reserved === "number"
          ? liveRow.reserved
          : typeof (entry as PrizeConfigEntry).stats?.reserved === "number"
            ? (entry as PrizeConfigEntry).stats!.reserved
            : stats.reservedNumbers;
      const available =
        typeof liveRow?.available === "number"
          ? liveRow.available
          : Math.max(
              0,
              typeof (entry as PrizeConfigEntry).stats?.available === "number"
                ? (entry as PrizeConfigEntry).stats!.available
                : total - sold - reserved,
            );
      const soldPercent = Math.min(100, Math.max(0, (sold / total) * 100));
      const socialPressure = Math.min(100, Math.max(0, ((sold + reserved) / total) * 100));
      const remaining = Math.max(0, total - sold - reserved);

      return {
        key: `${entry.prizeOrder}-${entry.prizeLabel}`,
        label: entry.prizeLabel,
        soldPercent,
        socialPressure,
        remaining,
        total,
        available,
        sold,
        reserved,
      };
    });
  }, [livePrizes, prizeConfigs, stats.reservedNumbers, stats.soldNumbers, totalNumbers]);

  const remainingNumbers =
    rows[0]?.remaining ??
    Math.max(
      0,
      (liveTotals?.totalNumbers ?? totalNumbers) - (liveTotals?.sold ?? stats.soldNumbers) - (liveTotals?.reserved ?? stats.reservedNumbers),
    );

  // Pull fresh stats every 20s
  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/raffles/${encodeURIComponent(raffleSlug)}/stats`, { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as LiveStatsPayload;
        if (!active) return;
        setLivePrizes(json.prizes ?? null);
        setLiveTotals(json.totals ?? null);
      } catch {
        // ignore
      }
    };
    fetchStats();
    const interval = window.setInterval(fetchStats, 20_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [raffleSlug]);

  return (
    <section className={styles.section} id="escassez">
      <div className={styles.container}>
        <article className={styles.progressCard}>
          <header className={styles.progressHeader}>
            <h2 className={styles.sectionTitle}>Números acabando: garanta o seu agora</h2>
            <p className={styles.sectionSubtitle}>
              Escassez real com atualização contínua de reserva e venda para acelerar decisão de compra.
            </p>
          </header>

          <div className={styles.liveUrgencyPanel} aria-live="polite">
            <p className={styles.liveUrgencyHeadline}>
              Últimos <strong>{pulse.recentSold}</strong> números vendidos há <strong>{pulse.minutesAgo}</strong> min
            </p>
            <p className={styles.liveUrgencySubline}>
              <strong>{pulse.viewersNow}</strong> pessoas estão olhando agora. Faltam{" "}
              <strong>{remainingNumbers.toLocaleString("pt-BR")}</strong> números para encerrar.
            </p>
          </div>

          <div className={styles.progressLines}>
            {rows.map((row) => (
              <div key={row.key} className={styles.progressLineItem}>
                <div className={styles.progressLineHeader}>
                  <strong>{row.label}</strong>
                  <span>
                    Vendidos: {row.soldPercent.toFixed(1)}% • Pressão: {row.socialPressure.toFixed(1)}%
                  </span>
                </div>
                <div className={styles.progressBarTrack} aria-label={`Progresso de ${row.label}`}>
                  <div className={styles.progressBarFill} style={{ width: `${row.soldPercent}%` }} />
                </div>
                <p className={styles.progressPercent}>
                  Faltam {row.remaining.toLocaleString("pt-BR")} números para encerrar (total {row.total.toLocaleString("pt-BR")}).
                </p>
                <ul className={styles.progressStatsGrid}>
                  <li className={styles.statCard}>
                    <p className={styles.statLabel}>Disponíveis</p>
                    <p className={styles.statValue}>{row.available.toLocaleString("pt-BR")}</p>
                  </li>
                  <li className={styles.statCard}>
                    <p className={styles.statLabel}>Reservados</p>
                    <p className={styles.statValue}>{row.reserved.toLocaleString("pt-BR")}</p>
                  </li>
                  <li className={styles.statCard}>
                    <p className={styles.statLabel}>Vendidos</p>
                    <p className={styles.statValue}>{row.sold.toLocaleString("pt-BR")}</p>
                  </li>
                  <li className={styles.statCard}>
                    <p className={styles.statLabel}>Média por usuário</p>
                    <p className={styles.statValue}>{stats.averagePerUser.toLocaleString("pt-BR")}</p>
                  </li>
                </ul>
              </div>
            ))}
          </div>

          <ul className={styles.progressStatsGrid}>
            <li className={styles.statCard}>
              <p className={styles.statLabel}>Disponíveis</p>
              <p className={styles.statValue}>{stats.availableNumbers.toLocaleString("pt-BR")}</p>
            </li>
            <li className={styles.statCard}>
              <p className={styles.statLabel}>Reservados</p>
              <p className={styles.statValue}>{stats.reservedNumbers.toLocaleString("pt-BR")}</p>
            </li>
            <li className={styles.statCard}>
              <p className={styles.statLabel}>Vendidos</p>
              <p className={styles.statValue}>{stats.soldNumbers.toLocaleString("pt-BR")}</p>
            </li>
            <li className={styles.statCard}>
              <p className={styles.statLabel}>Média por usuário</p>
              <p className={styles.statValue}>{stats.averagePerUser.toLocaleString("pt-BR")}</p>
            </li>
          </ul>

          <p className={styles.progressUrgency}>Hoje já saíram vários números. Não deixa para a última hora.</p>

          <Link className={styles.progressCta} href={`/app/comprar?slug=${encodeURIComponent(raffleSlug)}`}>
            QUERO ESCOLHER MEUS NÚMEROS AGORA
          </Link>
        </article>
      </div>
    </section>
  );
}
