import Link from "next/link";

import styles from "@/components/raffle/sections.module.css";
import { buildLandingPathForSlug } from "@/lib/raffle-slug";

interface FooterProps {
  raffleSlug: string;
}

const whatsappLink = "https://wa.me/5511999999999?text=Preciso%20de%20ajuda";

export function Footer({ raffleSlug }: FooterProps) {
  const institutionalLinks = [
    { label: "Sobre", href: buildLandingPathForSlug(raffleSlug, "inicio") },
    { label: "Transparência", href: buildLandingPathForSlug(raffleSlug, "transparencia") },
    { label: "Termos", href: "/termos" },
    { label: "Privacidade", href: "/privacidade" },
  ];

  const confidenceLinks = [
    { label: "Prova social", href: "#ganhadores" },
    { label: "Auditados", href: buildLandingPathForSlug(raffleSlug, "transparencia") },
    { label: "Ranking", href: "#ranking-compradores" },
    { label: "Vídeos de entrega", href: "#ganhadores" },
  ];

  const operationalLinks = [
    { label: "Área do usuário", href: "/area-do-usuario" },
    { label: "Alertas", href: "#alertas" },
    { label: "Contato", href: "mailto:suporte@bigodedasrifas.com" },
    { label: "WhatsApp", href: whatsappLink, external: true },
    { label: "Suporte", href: "#suporte" },
  ];

  const renderLinks = (items: { label: string; href: string; external?: boolean }[]) =>
    items.map((item) => (
      <Link
        className={styles.footerLink}
        href={item.href}
        key={item.href + item.label}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noreferrer noopener" : undefined}
      >
        {item.label}
      </Link>
    ));

  return (
    <footer className={styles.footer} id="rodape">
      <div className={`${styles.container} ${styles.footerGridExtended}`}>
        <div className={styles.footerColumn}>
          <p className={styles.footerBrand}>© {new Date().getFullYear()} Bigode das Rifas.</p>
          <p className={styles.footerSubtext}>Compra transparente, sorteio auditável e suporte ativo.</p>
        </div>
        <div className={styles.footerColumn}>
          <p className={styles.footerSectionTitle}>Institucional</p>
          <div className={styles.footerLinks}>{renderLinks(institutionalLinks)}</div>
        </div>
        <div className={styles.footerColumn}>
          <p className={styles.footerSectionTitle}>Confiança</p>
          <div className={styles.footerLinks}>{renderLinks(confidenceLinks)}</div>
        </div>
        <div className={styles.footerColumn}>
          <p className={styles.footerSectionTitle}>Operacionais</p>
          <div className={styles.footerLinks}>{renderLinks(operationalLinks)}</div>
        </div>
      </div>
    </footer>
  );
}
