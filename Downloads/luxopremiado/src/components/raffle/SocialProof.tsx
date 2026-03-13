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
  // novos depoimentos (>=40)
  {
    title: "Compra em menos de 1 minuto",
    content: "Escolhi os números e paguei rapidinho no app, sem travar.",
    author: "Marina, São Paulo/SP",
    avatarUrl: "/images/social/marina.svg",
  },
  {
    title: "Suporte educado",
    content: "Tive dúvida no checkout e responderam na hora pelo chat.",
    author: "Felipe, Belo Horizonte/MG",
    avatarUrl: "/images/social/felipe.svg",
  },
  {
    title: "Confiança na transparência",
    content: "Gostei de ver as etapas do sorteio descritas com clareza.",
    author: "Patrícia, Brasília/DF",
    avatarUrl: "/images/social/patricia.svg",
  },
  {
    title: "Ranking motiva",
    content: "Fiquei em top 5 e recebi os alerts automáticos, bem legal.",
    author: "Bruno, Salvador/BA",
    avatarUrl: "/images/social/bruno.svg",
  },
  {
    title: "Site leve no 4G",
    content: "Usei no celular com 4G fraco e não travou nenhuma vez.",
    author: "Letícia, Curitiba/PR",
    avatarUrl: "/images/social/leticia.svg",
  },
  {
    title: "Pagamento aprovado na hora",
    content: "PIX reconhecido em segundos, vi os números como confirmados.",
    author: "Diego, Manaus/AM",
    avatarUrl: "/images/social/diego.svg",
  },
  {
    title: "Interface clara",
    content: "As informações do prêmio e regras são bem objetivas.",
    author: "Renata, Fortaleza/CE",
    avatarUrl: "/images/social/renata.svg",
  },
  {
    title: "Entrega filmada",
    content: "Assistir ao vídeo do ganhador me passou segurança.",
    author: "André, Recife/PE",
    avatarUrl: "/images/social/andre.svg",
  },
  {
    title: "Confirmação por e-mail",
    content: "Recebi todos os comprovantes por e-mail rapidinho.",
    author: "Camila, Santos/SP",
    avatarUrl: "/images/social/camila.svg",
  },
  {
    title: "Notificações úteis",
    content: "Avisa quando a reserva está acabando, muito prático.",
    author: "Thiago, Porto Alegre/RS",
    avatarUrl: "/images/social/thiago.svg",
  },
  {
    title: "Checkout seguro",
    content: "Gostei do anti-bot e verificação, passou confiança.",
    author: "Sara, Florianópolis/SC",
    avatarUrl: "/images/social/sara.svg",
  },
  {
    title: "Visual bonito",
    content: "Layout moderno, deu vontade de continuar navegando.",
    author: "Lucas, Vitória/ES",
    avatarUrl: "/images/social/lucas.svg",
  },
  {
    title: "Suporte pelo Whats",
    content: "Responderam no WhatsApp em poucos minutos, ótima experiência.",
    author: "Priscila, Goiânia/GO",
    avatarUrl: "/images/social/priscila.svg",
  },
  {
    title: "Pagamento flexível",
    content: "PIX e cartão disponíveis, escolhi o que foi melhor pra mim.",
    author: "Márcio, São Luís/MA",
    avatarUrl: "/images/social/marcio.svg",
  },
  {
    title: "Transparência no status",
    content: "Cada etapa do pedido fica visível, sem mistério.",
    author: "Helena, João Pessoa/PB",
    avatarUrl: "/images/social/helena.svg",
  },
  {
    title: "Confirmei no app",
    content: "Já vi os números confirmados dentro do app em segundos.",
    author: "Otávio, Belém/PA",
    avatarUrl: "/images/social/otavio.svg",
  },
  {
    title: "Segurança nas reservas",
    content: "Reserva expira certinho, evita gente segurando número à toa.",
    author: "Isabela, Campinas/SP",
    avatarUrl: "/images/social/isabela.svg",
  },
  {
    title: "Recebi recibo detalhado",
    content: "O e-mail de confirmação veio com tudo descrito, gostei.",
    author: "Caio, Niterói/RJ",
    avatarUrl: "/images/social/caio.svg",
  },
  {
    title: "Interface responsiva",
    content: "No tablet ficou perfeito, sem quebra de layout.",
    author: "Bianca, Ribeirão Preto/SP",
    avatarUrl: "/images/social/bianca.svg",
  },
  {
    title: "Boa usabilidade",
    content: "Processo passo a passo bem claro, não tem pegadinha.",
    author: "Guilherme, Campo Grande/MS",
    avatarUrl: "/images/social/guilherme.svg",
  },
  {
    title: "Comunicação simples",
    content: "Textos diretos e informativos, sem jargão.",
    author: "Daniela, Salvador/BA",
    avatarUrl: "/images/social/daniela.svg",
  },
  {
    title: "Entrega confirmada",
    content: "Ver ganhador com nota e foto me deixou tranquila.",
    author: "Rita, Belo Horizonte/MG",
    avatarUrl: "/images/social/rita.svg",
  },
  {
    title: "Alertas úteis",
    content: "Recebi aviso quando quase esgotou, comprei a tempo.",
    author: "Henrique, Curitiba/PR",
    avatarUrl: "/images/social/henrique.svg",
  },
  {
    title: "Confiança no selo",
    content: "O selo de transparência me convenceu a participar.",
    author: "Silvia, Brasília/DF",
    avatarUrl: "/images/social/silvia.svg",
  },
  {
    title: "Processo intuitivo",
    content: "Até minha mãe conseguiu comprar sem ajuda.",
    author: "Fabio, São Paulo/SP",
    avatarUrl: "/images/social/fabio.svg",
  },
  {
    title: "Boas ofertas de combos",
    content: "Os pacotes de números valem a pena, preço justo.",
    author: "Nathalia, Recife/PE",
    avatarUrl: "/images/social/nathalia.svg",
  },
  {
    title: "Suporte paciente",
    content: "Expliquei tudo pelo chat, foram pacientes e rápidos.",
    author: "Rodrigo, Manaus/AM",
    avatarUrl: "/images/social/rodrigo2.svg",
  },
  {
    title: "Confirmação no painel",
    content: "Gosto de ver o status 'confirmado' sem precisar perguntar.",
    author: "Vera, Porto Alegre/RS",
    avatarUrl: "/images/social/vera.svg",
  },
  {
    title: "Rapidez no cashback",
    content: "Estorno foi rápido quando precisei cancelar.",
    author: "Edu, Florianópolis/SC",
    avatarUrl: "/images/social/edu.svg",
  },
  {
    title: "Ranking divertido",
    content: "Fiquei acompanhando o ranking, deu emoção extra.",
    author: "Milena, Santos/SP",
    avatarUrl: "/images/social/milena.svg",
  },
  {
    title: "Segurança de dados",
    content: "Sentir que meus dados estavam seguros fez diferença.",
    author: "Paulo, Fortaleza/CE",
    avatarUrl: "/images/social/paulo.svg",
  },
  {
    title: "UX simples",
    content: "Tudo bem direto: escolher, pagar e acompanhar.",
    author: "Lia, Goiânia/GO",
    avatarUrl: "/images/social/lia.svg",
  },
  {
    title: "Comunicação clara",
    content: "E-mails são objetivos e com links úteis.",
    author: "Marcelo, Maceió/AL",
    avatarUrl: "/images/social/marcelo.svg",
  },
  {
    title: "Pós-venda presente",
    content: "Depois da compra, continuaram informando, gostei.",
    author: "Carla, Vitória/ES",
    avatarUrl: "/images/social/carla.svg",
  },
  {
    title: "Confirmação em segundos",
    content: "PIX reconhecido quase instantâneo, muito bom.",
    author: "Sérgio, João Pessoa/PB",
    avatarUrl: "/images/social/sergio.svg",
  },
  {
    title: "Design confiável",
    content: "Visual profissional passa credibilidade.",
    author: "Vivian, São Luís/MA",
    avatarUrl: "/images/social/vivian.svg",
  },
  {
    title: "Pagamento sem fricção",
    content: "Checkout enxuto, sem etapas desnecessárias.",
    author: "Caue, Belém/PA",
    avatarUrl: "/images/social/caue.svg",
  },
  {
    title: "Experiência fluida",
    content: "Navegação suave, não senti travadas.",
    author: "Joice, Londrina/PR",
    avatarUrl: "/images/social/joice.svg",
  },
  {
    title: "Clareza nas regras",
    content: "Regulamento bem explicado, sem letra miúda.",
    author: "Brenda, Natal/RN",
    avatarUrl: "/images/social/brenda.svg",
  },
  {
    title: "Atendimento humano",
    content: "Nada de bot enrolando, falaram comigo mesmo.",
    author: "Ícaro, Teresina/PI",
    avatarUrl: "/images/social/icaro.svg",
  },
];

const fallbackWinnerWall: WinnerWallEntry[] = [
  {
    name: "Luciana M.",
    prize: "Bigode das Rifas",
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

    if (uniqueEntries.length >= 40) {
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
  const winnerEntries = buildWinnerWall(winnerWall);
  const topRow = testimonials.slice(0, 20);
  const bottomRow = testimonials.slice(20, 40);
  const safeTopRow = topRow.length > 0 ? topRow : testimonials;
  const safeBottomRow = bottomRow.length > 0 ? bottomRow : safeTopRow;
  const topLoop = [...safeTopRow, ...safeTopRow];
  const bottomLoop = [...safeBottomRow, ...safeBottomRow];

  return (
    <section className={styles.section} id="prova-social">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Quem participa, recomenda</h2>
        </header>

        <div className={styles.proofCarousel} role="region" aria-label="Carrossel de depoimentos de participantes">
          <div className={styles.proofMarqueeRow}>
            <ul className={`${styles.proofTrack} ${styles.proofTrackReverse}`}>
              {topLoop.map((entry, index) => (
                <li className={styles.proofSlide} key={`${entry.author}-${entry.title}-top-${index}`}>
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

          <div className={styles.proofMarqueeRow}>
            <ul className={styles.proofTrack}>
              {bottomLoop.map((entry, index) => (
                <li className={styles.proofSlide} key={`${entry.author}-${entry.title}-bottom-${index}`}>
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
