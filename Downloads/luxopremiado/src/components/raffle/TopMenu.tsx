"use client";

import { useEffect, useRef, useState } from "react";

import styles from "@/components/raffle/sections.module.css";

const primaryItems: Array<{ label: string; href: string }> = [
  { label: "Início", href: "#inicio" },
  { label: "Prêmio", href: "#premio" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Área do Usuário", href: "#area-usuario" },
];

const quickMenuItems: Array<{ label: string; href: string }> = [
  { label: "Escolher Números", href: "#escolher-numeros" },
  { label: "Pagamento", href: "#pagamento" },
  { label: "Transparência", href: "#transparencia" },
  { label: "Prova Social", href: "#prova-social" },
  { label: "FAQ", href: "#faq" },
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
                {item.label}
              </a>
            ))}
          </div>

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
