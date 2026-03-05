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

function buildInitialFeed(): ActivityItem[] {
  return [];
}

export function LiveActivityPopup({ scope = "landing" }: LiveActivityPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  // Start empty to avoid SSR/client mismatch; hydrate content after mount.
  const [items, setItems] = useState<ActivityItem[]>([]);

  // First paint after mount, and whenever scope changes
  // Fetch real recent purchases periodically
  useEffect(() => {
    let active = true;
    const fetchActivity = async () => {
      try {
        const res = await fetch(`/api/raffles/luxo-premiado/recent-activity`, { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as {
          activities?: Array<{ buyerName: string; quantity: number; updatedAt: string }>;
        };
        if (!active || !json.activities?.length) return;
        const mapped = json.activities.slice(0, 2).map((a, index) => ({
          id: `${a.updatedAt}-${index}`,
          title: `${a.buyerName} comprou ${a.quantity} número${a.quantity > 1 ? "s" : ""}`,
          subtitle: "Compra confirmada agora",
          minutesAgo: Math.max(0, Math.round((Date.now() - Date.parse(a.updatedAt)) / 60000)),
          tone: "green" as AccentTone,
          icon: "🎟️",
        }));
        setItems(mapped);
        setIsVisible(true);
      } catch {
        // ignore
      }
    };
    fetchActivity();
    const interval = window.setInterval(fetchActivity, 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [scope]);

  // Auto-hide each batch after ~2s
  useEffect(() => {
    if (items.length === 0) {
      setIsVisible(false);
      return;
    }
    setIsVisible(true);
    const timeout = window.setTimeout(() => {
      setIsVisible(false);
      setItems([]);
    }, 3_000);
    return () => window.clearTimeout(timeout);
  }, [items]);

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
