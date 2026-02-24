import Link from "next/link";

import styles from "@/components/raffle/sections.module.css";

interface StickyMobileCTAProps {
  raffleSlug: string;
}

export function StickyMobileCTA({ raffleSlug }: StickyMobileCTAProps) {
  return (
    <div className={styles.stickyMobileCta} role="region" aria-label="Atalho de compra">
      <div className={styles.stickyMobileInner}>
        <div>
          <p className={styles.stickyMobileTitle}>Compra rápida no PIX</p>
          <p className={styles.stickyMobileText}>Escolha seus números e confirme agora.</p>
        </div>
        <Link className={styles.stickyMobileButton} href={`/app/comprar?slug=${encodeURIComponent(raffleSlug)}`}>
          Comprar agora
        </Link>
      </div>
    </div>
  );
}
