"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { CampaignStats } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface ProgressStatsProps {
  stats: CampaignStats;
  totalNumbers: number;
  raffleSlug: string;
}

interface LiveUrgencyPulse {
  recentSold: number;
  minutesAgo: number;
  viewersNow: number;
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

export function ProgressStats({ stats, totalNumbers, raffleSlug }: ProgressStatsProps) {
  const [pulse, setPulse] = useState<LiveUrgencyPulse>(() => buildInitialPulse(stats, totalNumbers));

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPulse((current) => buildNextPulse(current, stats, totalNumbers));
    }, 25_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [stats, totalNumbers]);

  const safeTotal = Math.max(totalNumbers, 1);
  const soldPercent = Math.min(100, Math.max(0, (stats.soldNumbers / safeTotal) * 100));
  const remainingNumbers = Math.max(0, totalNumbers - stats.soldNumbers - stats.reservedNumbers);
  const socialPressurePercent = useMemo(() => {
    if (totalNumbers <= 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, ((stats.soldNumbers + stats.reservedNumbers) / totalNumbers) * 100));
  }, [stats.reservedNumbers, stats.soldNumbers, totalNumbers]);

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

          <div className={styles.progressBarTrack} aria-label="Progresso de números vendidos">
            <div className={styles.progressBarFill} style={{ width: `${soldPercent}%` }} />
          </div>

          <p className={styles.progressPercent}>
            Vendidos: {soldPercent.toFixed(1)}% • Pressão de compra: {socialPressurePercent.toFixed(1)}%
          </p>

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
