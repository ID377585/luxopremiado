"use client";

import { useEffect, useState } from "react";

import styles from "@/components/common/live-activity-popup.module.css";

type Scope = "login" | "landing";

interface LiveActivityPopupProps {
  scope?: Scope;
}

type AccentTone = "blue" | "pink" | "yellow" | "green" | "purple";

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  minutesAgo: number;
  tone: AccentTone;
  icon: string;
}

const templatePool: Record<Scope, Array<Omit<ActivityItem, "id" | "minutesAgo">>> = {
  landing: [
    {
      title: "Números sendo escolhidos",
      subtitle: "Pessoas avaliando a campanha agora",
      tone: "blue",
      icon: "🎟️",
    },
    {
      title: "Pagamento recebido",
      subtitle: "Checkout confirmado no PIX",
      tone: "green",
      icon: "💸",
    },
    {
      title: "Usuário se cadastrou",
      subtitle: "Conta criada para garantir números",
      tone: "yellow",
      icon: "👤",
    },
    {
      title: "Nova mensagem",
      subtitle: "Suporte respondeu pelo chat",
      tone: "pink",
      icon: "💬",
    },
    {
      title: "Nova reserva",
      subtitle: "Números adicionados ao carrinho",
      tone: "purple",
      icon: "✅",
    },
  ],
  login: [
    {
      title: "Login concluído",
      subtitle: "Acesso liberado para comprar",
      tone: "blue",
      icon: "🔐",
    },
    {
      title: "Pagamento recebido",
      subtitle: "Compra finalizada no PIX",
      tone: "green",
      icon: "💸",
    },
    {
      title: "Conta criada",
      subtitle: "Novo participante confirmado",
      tone: "yellow",
      icon: "👤",
    },
    {
      title: "Números escolhidos",
      subtitle: "Checkout rápido liberado",
      tone: "purple",
      icon: "🎯",
    },
    {
      title: "Suporte ativo",
      subtitle: "Equipe online para ajudar",
      tone: "pink",
      icon: "💬",
    },
  ],
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildActivity(scope: Scope): ActivityItem {
  const templateOptions = templatePool[scope];
  const template = templateOptions[randomBetween(0, templateOptions.length - 1)];

  return {
    ...template,
    minutesAgo: randomBetween(1, 18),
    id: `${template.title}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
  };
}

function buildInitialFeed(scope: Scope): ActivityItem[] {
  return Array.from({ length: 4 }, () => buildActivity(scope));
}

export function LiveActivityPopup({ scope = "landing" }: LiveActivityPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  // Start empty to avoid SSR/client mismatch; hydrate content after mount.
  const [items, setItems] = useState<ActivityItem[]>([]);

  // First paint after mount, and whenever scope changes
  useEffect(() => {
    setItems(buildInitialFeed(scope));
  }, [scope]);

  // Progressive reveal & steady rotation
  useEffect(() => {
    const showDelay = window.setTimeout(() => setIsVisible(true), 220);
    const interval = window.setInterval(() => {
      setItems((previous) => {
        const next = [buildActivity(scope), ...previous];
        return next.slice(0, 5);
      });
    }, 5_200);

    return () => {
      window.clearTimeout(showDelay);
      window.clearInterval(interval);
    };
  }, [scope]);

  return (
    <aside
      aria-live="polite"
      className={`${styles.popup} ${isVisible ? styles.visible : ""} ${scope === "login" ? styles.login : styles.landing}`}
      role="status"
    >
      <div className={styles.stack}>
        {items.map((item) => (
          <article key={item.id} className={`${styles.card} ${styles[item.tone]}`}>
            <span aria-hidden className={styles.icon}>
              {item.icon}
            </span>
            <div className={styles.meta}>
              <p className={styles.titleLine}>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.dot}>•</span>
                <span className={styles.time}>{item.minutesAgo} minutos atrás</span>
              </p>
              <p className={styles.subtitle}>{item.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
