"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { formatBrlFromCents } from "@/lib/format";
import { PrizeConfigEntry, PrizeData } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface PrizeProps {
  data: PrizeData;
}

function resolveConfigs(configs?: PrizeConfigEntry[]): PrizeConfigEntry[] {
  if (!configs || configs.length === 0) return [];
  return [...configs].sort((a, b) => a.prizeOrder - b.prizeOrder);
}

export function Prize({ data }: PrizeProps) {
  const configs = useMemo(() => resolveConfigs(data.configs), [data.configs]);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = configs[activeIndex];

  const detailTitle = active?.prizeLabel ?? data.title;
  const detailImage = active?.imageUrl ?? data.images[0];
  const features = useMemo(() => {
    if (!active) return data.features;

    const items: { label: string; value: string }[] = [];

    if (typeof active.prizeValueCents === "number" && active.prizeValueCents >= 0) {
      items.push({ label: "Valor do prêmio", value: formatBrlFromCents(active.prizeValueCents) });
    }

    if (typeof active.totalNumbers === "number" && active.totalNumbers > 0) {
      items.push({ label: "Total de números", value: active.totalNumbers.toLocaleString("pt-BR") });
    }

    if (typeof active.drawDate === "string" && active.drawDate.trim().length > 0) {
      const safeDate = new Date(active.drawDate);
      const formatted =
        Number.isNaN(safeDate.getTime()) === false
          ? safeDate.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
          : active.drawDate;
      items.push({ label: "Data do sorteio", value: formatted });
    }

    const soldOut = (active.stats?.available ?? 1) <= 0 && (active.stats?.sold ?? 0) >= (active.totalNumbers ?? 0);
    if (soldOut && typeof active.luckyNumber === "number" && active.luckyNumber > 0) {
      items.push({ label: "Número da sorte", value: `#${active.luckyNumber}` });
    }

    const yearModelLabel = active.yearModelLabel || "Ano/Modelo";
    if (active.yearModelValue && active.yearModelValue.trim().length > 0) {
      items.push({ label: yearModelLabel, value: active.yearModelValue });
    }

    const motorLabel = active.motorLabel || "Motor";
    if (active.motorValue && active.motorValue.trim().length > 0) {
      items.push({ label: motorLabel, value: active.motorValue });
    }

    const guaranteeValue = active.guaranteeValue?.trim();
    if (guaranteeValue) {
      items.push({ label: "Garantia", value: guaranteeValue });
    }

    const deliveryValue = active.deliveryValue?.trim();
    if (deliveryValue) {
      items.push({ label: "Entrega", value: deliveryValue });
    }

    return items.length ? [...items, ...data.features] : data.features;
  }, [active, data.features]);

  return (
    <section className={styles.section} id="premio">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Prêmios</h2>
          <p className={styles.sectionSubtitle}>
            Prêmios cadastrados pelo administrador. Clique para ver detalhes e valores.
          </p>
        </header>

        <div className={styles.prizeGridMulti}>
          <div className={styles.prizeCards}>
            {(configs.length ? configs : [{ prizeLabel: data.title, imageUrl: data.images[0], prizeOrder: 1 }]).map(
              (item, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={`${item.prizeOrder}-${item.prizeLabel}`}
                    className={`${styles.prizeCard} ${isActive ? styles.prizeCardActive : ""}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                  >
                    <div className={styles.prizeCardThumb}>
                      <Image
                        alt={item.prizeLabel ?? data.title}
                        src={item.imageUrl ?? data.images[index % data.images.length]}
                        fill
                        sizes="160px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className={styles.prizeCardMeta}>
                      <p>{item.prizeLabel ?? data.title}</p>
                      <span>Ordem {item.prizeOrder}</span>
                    </div>
                  </button>
                );
              },
            )}
          </div>

          <article className={styles.card}>
            <div className={styles.prizeDetailHeader}>
              <div className={styles.prizeDetailImage}>
                <Image alt={detailTitle} src={detailImage} fill sizes="320px" style={{ objectFit: "cover" }} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>{detailTitle}</h3>
                <p className={styles.cardText}>{data.description}</p>
              </div>
            </div>

            <ul className={styles.featureList}>
              {features.map((feature) => (
                <li className={styles.featureItem} key={feature.label}>
                  <span>{feature.label}</span>
                  <strong>{feature.value}</strong>
                </li>
              ))}
            </ul>
            <p className={styles.prizeTrustText}>Entrega com registro público para reforçar segurança e confiança.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
