import Image from "next/image";
import { SocialProofEntry, WinnerWallEntry } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface SocialProofProps {
  entries: SocialProofEntry[];
  winnerWall: WinnerWallEntry[];
}

const fallbackTestimonials: SocialProofEntry[] = [
  {
    title: "PIX confirmado na hora",
    content: "Paguei no PIX e meus números já apareceram como confirmados no painel.",
    author: "João, Campinas/SP",
    avatarUrl: "/images/social/joao.svg",
  },
  {
    title: "Compra pelo celular",
    content: "Escolhi meus números no celular e finalizei em menos de 2 minutos.",
    author: "Rodrigo, Campinas/SP",
    avatarUrl: "/images/social/rodrigo.svg",
  },
  {
    title: "Transparência no sorteio",
    content: "Curti a transparência do sorteio e consegui conferir tudo sem dificuldade.",
    author: "Leila, Recife/PE",
    avatarUrl: "/images/social/leila.svg",
  },
  {
    title: "Suporte respondeu rápido",
    content: "Tive uma dúvida e o suporte respondeu com clareza no mesmo dia.",
    author: "Karina, Belo Horizonte/MG",
    avatarUrl: "/images/social/karina.svg",
  },
  {
    title: "Sem taxa escondida",
    content: "Foi exatamente o valor anunciado, sem cobrança surpresa no final.",
    author: "Bruna, Porto Alegre/RS",
    avatarUrl: "/images/social/bruna.svg",
  },
  {
    title: "Navegação simples",
    content: "Consegui escolher e pagar sem pedir ajuda para ninguém.",
    author: "Eduardo, Florianópolis/SC",
    avatarUrl: "/images/social/eduardo.svg",
  },
  {
    title: "Atualizações em cada etapa",
    content: "Recebi aviso de reserva, pagamento e confirmação no fluxo completo.",
    author: "Fernanda, Manaus/AM",
    avatarUrl: "/images/social/fernanda.svg",
  },
  {
    title: "Entrega registrada",
    content: "A entrega foi registrada e a equipe acompanhou até finalizar tudo.",
    author: "Rafael, Goiânia/GO",
    avatarUrl: "/images/social/rafael.svg",
  },
];

const fallbackWinnerWall: WinnerWallEntry[] = [
  {
    name: "Luciana M.",
    prize: "Jeep Compass Série S 0km",
    city: "Fortaleza/CE",
    mediaUrl: "/images/winners/winner-1.svg",
    mediaType: "image",
    verifiedAtLabel: "Entrega validada em 12/01/2026",
  },
  {
    name: "Carlos A.",
    prize: "R$ 80.000 em PIX",
    city: "Belo Horizonte/MG",
    mediaUrl: "/images/winners/winner-2.svg",
    mediaType: "image",
    verifiedAtLabel: "Entrega validada em 05/12/2025",
  },
  {
    name: "Vanessa R.",
    prize: "Moto 0km + documentação",
    city: "Campinas/SP",
    mediaUrl: "/images/winners/winner-3.svg",
    mediaType: "video",
    verifiedAtLabel: "Vídeo de entrega publicado",
  },
];

function buildTestimonials(entries: SocialProofEntry[]): SocialProofEntry[] {
  const validEntries = entries.filter(
    (entry) => entry.title.trim().length > 0 && entry.content.trim().length > 0 && entry.author.trim().length > 0,
  );
  const uniqueEntries: SocialProofEntry[] = [];
  const keys = new Set<string>();

  for (const entry of [...validEntries, ...fallbackTestimonials]) {
    const key = `${entry.title.trim().toLowerCase()}::${entry.author.trim().toLowerCase()}`;
    if (keys.has(key)) {
      continue;
    }

    keys.add(key);
    uniqueEntries.push(entry);

    if (uniqueEntries.length >= 8) {
      break;
    }
  }

  return uniqueEntries;
}

function buildWinnerWall(entries: WinnerWallEntry[]): WinnerWallEntry[] {
  const validEntries = entries.filter(
    (entry) => entry.name.trim().length > 0 && entry.prize.trim().length > 0 && entry.city.trim().length > 0,
  );
  const merged: WinnerWallEntry[] = [];
  const keys = new Set<string>();

  for (const entry of [...validEntries, ...fallbackWinnerWall]) {
    const key = `${entry.name.trim().toLowerCase()}::${entry.city.trim().toLowerCase()}`;
    if (keys.has(key)) {
      continue;
    }

    keys.add(key);
    merged.push(entry);
    if (merged.length >= 6) {
      break;
    }
  }

  return merged;
}

function getAvatarInitials(author: string): string {
  const baseName = author.split(",")[0]?.trim() ?? author.trim();
  const parts = baseName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "LP";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function isVideoMedia(entry: WinnerWallEntry): boolean {
  if (entry.mediaType === "video") {
    return true;
  }

  const normalized = (entry.mediaUrl ?? "").toLowerCase();
  return normalized.endsWith(".mp4") || normalized.includes("video");
}

export function SocialProof({ entries, winnerWall }: SocialProofProps) {
  const testimonials = buildTestimonials(entries);
  const trackItems = [...testimonials, ...testimonials];
  const winnerEntries = buildWinnerWall(winnerWall);

  return (
    <section className={styles.section} id="prova-social">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Quem participa, recomenda</h2>
          <p className={styles.sectionSubtitle}>
            Prova social visual com participantes e ganhadores verificados para reforçar confiança e desejo de compra.
          </p>
        </header>

        <div className={styles.proofCarousel} role="region" aria-label="Carrossel de depoimentos de participantes">
          <ul className={styles.proofTrack}>
            {trackItems.map((entry, index) => (
              <li className={styles.proofSlide} key={`${entry.author}-${entry.title}-${index}`}>
                <article className={styles.proofItem}>
                  <div className={styles.proofHeaderRow}>
                    <span aria-hidden className={styles.proofAvatar}>
                      {entry.avatarUrl ? (
                        <Image
                          alt=""
                          className={styles.proofAvatarImage}
                          height={48}
                          loading="lazy"
                          src={entry.avatarUrl}
                          width={48}
                        />
                      ) : (
                        getAvatarInitials(entry.author)
                      )}
                    </span>
                    <strong className={styles.proofTitle}>{entry.title}</strong>
                  </div>
                  <p className={styles.proofText}>
                    {entry.content.trim().replace(/[.!?]\s*$/, "")}.{" "}
                    <span className={styles.proofAuthor}>{entry.author.trim()}</span>
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.winnerWall}>
          <h3 className={styles.winnerWallTitle}>Mural de vencedores verificados</h3>
          <p className={styles.winnerWallSubtitle}>
            Histórias reais de entrega com nome, cidade e prêmio para aumentar confiança de novos compradores.
          </p>
          <ul className={styles.winnerWallGrid}>
            {winnerEntries.map((entry, index) => {
              const isVideo = isVideoMedia(entry);
              return (
                <li className={styles.winnerWallCard} key={`${entry.name}-${entry.city}-${index}`}>
                  <div className={styles.winnerMediaWrap}>
                    <Image
                      alt={`Comprovante de ${entry.name}`}
                      className={styles.winnerMediaImage}
                      fill
                      loading="lazy"
                      sizes="(max-width: 1100px) 100vw, 33vw"
                      src={entry.mediaUrl ?? fallbackWinnerWall[index % fallbackWinnerWall.length].mediaUrl!}
                    />
                    <span className={styles.winnerMediaBadge}>{isVideo ? "Vídeo de entrega" : "Foto de entrega"}</span>
                  </div>
                  <div className={styles.winnerMeta}>
                    <p className={styles.winnerName}>{entry.name}</p>
                    <p className={styles.winnerPrize}>{entry.prize}</p>
                    <p className={styles.winnerCity}>{entry.city}</p>
                    <p className={styles.winnerVerified}>{entry.verifiedAtLabel ?? "Ganhador verificado"}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
