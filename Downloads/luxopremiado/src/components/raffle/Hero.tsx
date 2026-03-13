import Image from "next/image";
import Link from "next/link";

import { HeroData } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface HeroProps {
  data: HeroData;
}

export function Hero({ data }: HeroProps) {
  return (
    <section className={styles.hero} id="inicio">
      <div className={`${styles.container} ${styles.heroGrid}`}>
        <div className={styles.heroPanel}>
          <div className={styles.heroLogoWrap}>
            <Image
              alt="Bigode das Rifas"
              className={styles.heroLogo}
              height={270}
              priority
              src="/images/branding/bigode-logo.png"
              width={480}
            />
          </div>
          <p className={styles.heroKicker}>Bigode das Rifas</p>
          <ul className={styles.heroBadgeList}>
            {data.badges.map((badge) => (
              <li className={styles.heroBadge} key={badge}>
                {badge}
              </li>
            ))}
          </ul>
          <h1 className={styles.heroTitle}>{data.title}</h1>
          <p className={styles.heroSubtitle}>{data.subtitle}</p>
          <ul className={styles.legalChecklist} aria-label="Avisos legais">
            <li>✔ Não é aposta</li>
            <li>✔ É sorteio de cotas</li>
            <li>✔ É regulamentado</li>
          </ul>
          <div className={styles.heroMeta}>
            <span className={styles.heroMetaItem}>{data.drawDateLabel}</span>
            <span className={styles.heroMetaItem}>{data.priceLabel}</span>
            <span className={`${styles.heroMetaItem} ${styles.heroMetaItemSoft}`}>
              Afiliados VIP: comissão + benefícios exclusivos
            </span>
          </div>
          <Link className={styles.heroCta} href="/app/comprar">
            {data.ctaLabel}
          </Link>
          <p className={styles.heroMicrotext}>
            Sem taxas escondidas. Você acompanha o status dos seus números pelo painel depois do pagamento.
          </p>
        </div>
      </div>
    </section>
  );
}
