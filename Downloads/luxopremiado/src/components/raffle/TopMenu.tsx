"use client";

import { useEffect, useRef, useState } from "react";

import styles from "@/components/raffle/sections.module.css";

const primaryItems: Array<{ label: string; href: string; icon?: "lock" }> = [
  { label: "Início", href: "#inicio" },
  { label: "Prêmio", href: "#premio" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Ranking", href: "#ranking-compradores" },
  { label: "Vencedores", href: "#prova-social" },
  { label: "Transparência", href: "#transparencia" },
  { label: "Alertas", href: "#alertas" },
  { label: "FAQ", href: "#faq" },
  { label: "Área do Usuário", href: "/area-do-usuario", icon: "lock" },
];

const quickMenuItems: Array<{ label: string; href: string }> = [
  { label: "Escolher Números", href: "/app/comprar" },
  { label: "Pacotes", href: "#pacotes" },
  { label: "Pagamento", href: "/app/comprar#pagamento" },
  { label: "Prova Social", href: "#prova-social" },
  { label: "Alertas", href: "#alertas" },
];

export function TopMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <header className={styles.topMenuWrap} ref={menuRef}>
      <div aria-hidden className={styles.topMenuShade} />
      <div className={styles.topMenuShell}>
        <nav aria-label="Menu principal da campanha" className={styles.topMenuNav}>
          <div className={styles.topMenuPrimary}>
            {primaryItems.map((item) => (
              <a className={styles.topMenuLink} href={item.href} key={item.href}>
                {item.icon === "lock" ? (
                  <svg
                    aria-hidden
                    className={styles.topMenuLock}
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 10V7.75C8 5.679 9.679 4 11.75 4H12.25C14.321 4 16 5.679 16 7.75V10"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.9"
                    />
                    <rect
                      height="9"
                      rx="2"
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeWidth="1.9"
                      width="12"
                      x="6"
                      y="10"
                    />
                  </svg>
                ) : null}
                {item.label}
              </a>
            ))}
          </div>
          <a className={styles.topMenuCta} href="/app/comprar">
            Comprar agora
          </a>

          <button
            aria-controls="menu-rapido-campanha"
            aria-expanded={isMenuOpen}
            aria-label="Abrir menu rápido"
            className={`${styles.topMenuBurger} ${isMenuOpen ? styles.topMenuBurgerOpen : ""}`}
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </nav>

        <div
          className={`${styles.topMenuDrawer} ${isMenuOpen ? styles.topMenuDrawerOpen : ""}`}
          id="menu-rapido-campanha"
        >
          {quickMenuItems.map((item) => (
            <a
              className={styles.topMenuDrawerLink}
              href={item.href}
              key={item.href}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
