import Link from "next/link";

import styles from "@/components/raffle/sections.module.css";
import { buildLandingPathForSlug } from "@/lib/raffle-slug";

interface FooterProps {
  raffleSlug: string;
}

const whatsappLink =
  "https://wa.me/5511986754605?text=Preciso%20de%20ajuda%20com%20minha%20compra%20na%20Bigode%20das%20Rifas";

export function Footer({ raffleSlug }: FooterProps) {
  const transparencyHref = buildLandingPathForSlug(raffleSlug, "transparencia");
  const landingInicioHref = buildLandingPathForSlug(raffleSlug, "inicio");

  const institutionalLinks = [
    { label: "Sobre", href: landingInicioHref },
    { label: "Transparência", href: transparencyHref },
    { label: "Termos de uso", href: "/termos" },
    { label: "Política de privacidade", href: "/privacidade" },
    { label: "Contato", href: "/contato" },
  ];

  const confidenceLinks = [
    { label: "Prova social", href: "#ganhadores" },
    { label: "Auditados", href: transparencyHref },
    { label: "Ranking", href: "#ranking-compradores" },
    { label: "Vídeos de entrega", href: "#ganhadores" },
  ];

  const operationalLinks = [
    { label: "Área do usuário", href: "/app" },
    { label: "Meus pagamentos", href: "/app/pagamentos" },
    { label: "Perfil", href: "/app/perfil" },
    { label: "Contato por e-mail", href: "mailto:suporte@bigodedasrifas.com", external: true },
    { label: "WhatsApp", href: whatsappLink, external: true },
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
          <p className={styles.footerSubtext}>
            Compra transparente, sorteio auditável e suporte ativo.
          </p>
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