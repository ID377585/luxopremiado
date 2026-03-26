"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownCardProps = {
  title: string;
  targetDateIso: string;
  subtitle?: string;
};

function getTimeLeft(targetDateIso: string) {
  const target = new Date(targetDateIso).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return {
      expired: true,
      text: "ENCERRADA",
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const text = `${String(days).padStart(2, "0")}d ${String(hours).padStart(
    2,
    "0"
  )}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(
    2,
    "0"
  )}s`;

  return {
    expired: false,
    text,
  };
}

export default function CountdownCard({
  title,
  targetDateIso,
  subtitle,
}: CountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDateIso));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDateIso));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDateIso]);

  const statusLabel = useMemo(() => {
    return timeLeft.expired ? "CAMPANHA ENCERRADA" : "CONTAGEM REGRESSIVA";
  }, [timeLeft.expired]);

  return (
    <article
      style={{
        background:
          "linear-gradient(135deg, rgba(247,217,120,0.16), rgba(10,20,64,0.94))",
        border: "1px solid rgba(242,208,103,0.28)",
        borderRadius: 24,
        padding: 24,
        boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
      }}
    >
      <p
        style={{
          marginTop: 0,
          marginBottom: 8,
          color: "#f2d067",
          fontWeight: 900,
        }}
      >
        {statusLabel}
      </p>

      <h2 style={{ margin: "0 0 10px", fontSize: 28 }}>{title}</h2>

      <div
        style={{
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: 1.2,
        }}
      >
        {timeLeft.text}
      </div>

      {subtitle ? (
        <p
          style={{
            margin: "12px 0 0",
            color: "rgba(255,255,255,0.82)",
            lineHeight: 1.7,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </article>
  );
}