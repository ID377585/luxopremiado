"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "@/components/common/live-activity-popup.module.css";

interface LiveActivityPopupProps {
  scope?: "login" | "landing";
}

interface ActivityState {
  watchers: number;
  minutesAgo: number;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildActivity(scope: "login" | "landing"): ActivityState {
  if (scope === "login") {
    return {
      watchers: randomBetween(3, 9),
      minutesAgo: randomBetween(1, 3),
    };
  }

  return {
    watchers: randomBetween(6, 18),
    minutesAgo: randomBetween(1, 4),
  };
}

export function LiveActivityPopup({ scope = "landing" }: LiveActivityPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activity, setActivity] = useState<ActivityState>(() => buildActivity(scope));

  const label = useMemo(() => {
    if (scope === "login") {
      return `${activity.watchers} pessoas estão escolhendo números agora`;
    }

    return `${activity.watchers} pessoas estão olhando esta campanha agora`;
  }, [activity, scope]);

  useEffect(() => {
    const showDelay = window.setTimeout(() => {
      setActivity(buildActivity(scope));
      setIsVisible(true);
    }, 360);

    const hideDelay = window.setTimeout(() => {
      setIsVisible(false);
    }, 2_360);

    return () => {
      window.clearTimeout(showDelay);
      window.clearTimeout(hideDelay);
    };
  }, [scope]);

  return (
    <aside
      aria-live="polite"
      className={`${styles.popup} ${isVisible ? styles.visible : ""} ${scope === "login" ? styles.login : styles.landing}`}
      role="status"
    >
      <p className={styles.title}>{label}</p>
      <p className={styles.subtitle}>Atividade atualizada há {activity.minutesAgo} min</p>
    </aside>
  );
}
