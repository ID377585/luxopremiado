import Link from "next/link";

import styles from "@/components/raffle/sections.module.css";

export function Footer() {
  return (
    <footer className={styles.footer} id="rodape">
      <div className={`${styles.container} ${styles.footerGrid}`}>
        <p>© {new Date().getFullYear()} luxopremiado.com.br. Todos os direitos reservados.</p>
        <nav className={styles.footerLinks}>
          <Link className={styles.footerLink} href="/termos">
            Termos
          </Link>
          <Link className={styles.footerLink} href="/privacidade">
            Privacidade
          </Link>
          <Link className={styles.footerLink} href="/r/luxo-premiado#transparencia">
            Transparência
          </Link>
          <Link className={styles.footerLink} href="mailto:suporte@luxopremiado.com.br">
            suporte@luxopremiado.com.br
          </Link>
        </nav>
      </div>
    </footer>
  );
}
