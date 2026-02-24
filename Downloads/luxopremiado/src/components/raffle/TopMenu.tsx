import styles from "@/components/raffle/sections.module.css";

const menuItems: Array<{ label: string; href: string }> = [
  { label: "Início", href: "#inicio" },
  { label: "Prêmio", href: "#premio" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Área do Usuário", href: "#area-usuario" },
  { label: "Escolher Números", href: "#escolher-numeros" },
  { label: "Pagamento", href: "#pagamento" },
  { label: "Transparência", href: "#transparencia" },
  { label: "Prova Social", href: "#prova-social" },
  { label: "FAQ", href: "#faq" },
  { label: "Rodapé", href: "#rodape" },
];

export function TopMenu() {
  return (
    <header className={styles.topMenuWrap}>
      <div className={styles.topMenuShell}>
        <nav aria-label="Menu principal da campanha" className={styles.topMenuNav}>
          {menuItems.map((item) => (
            <a className={styles.topMenuLink} href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
