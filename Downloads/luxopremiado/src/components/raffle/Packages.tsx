import Link from "next/link";

import { PackageOffer } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface PackagesProps {
  packages: PackageOffer[];
  raffleSlug: string;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function Packages({ packages, raffleSlug }: PackagesProps) {
  return (
    <section className={styles.section} id="pacotes">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Leve mais números e aumente suas chances</h2>
          <p className={styles.sectionSubtitle}>
            Selecione um pacote para acelerar sua participação e disputar posição no ranking de compradores.
          </p>
        </header>

        <div className={styles.packagesGrid}>
          {packages.map((pack) => (
            <article
              className={`${styles.packageCard} ${pack.highlight ? styles.packageCardHighlight : ""}`}
              key={pack.id}
            >
              <div className={styles.packageTop}>
                <h3 className={styles.packageTitle}>{pack.name}</h3>
                {pack.badge ? <span className={styles.packageBadge}>{pack.badge}</span> : null}
              </div>
              <p className={styles.packageQty}>{pack.quantity} números</p>
              <p className={styles.packagePrice}>{formatCurrency(pack.totalCents)}</p>
              <p className={styles.packageDescription}>{pack.description}</p>
              <Link
                className={styles.packageCta}
                href={`/app/comprar?slug=${encodeURIComponent(raffleSlug)}&pack=${pack.quantity}`}
              >
                PEGAR {pack.quantity} AGORA
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
