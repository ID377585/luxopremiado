import { SocialProofEntry } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface SocialProofProps {
  entries: SocialProofEntry[];
}

const fallbackTestimonials: SocialProofEntry[] = [
  {
    title: "PIX confirmado na hora",
    content: "Paguei no PIX e meus números já apareceram como confirmados no painel.",
    author: "João, Campinas/SP",
  },
  {
    title: "Compra pelo celular",
    content: "Escolhi meus números no celular e finalizei em menos de 2 minutos.",
    author: "Rodrigo, Campinas/SP",
  },
  {
    title: "Transparência no sorteio",
    content: "Curti a transparência do sorteio e consegui conferir tudo sem dificuldade.",
    author: "Leila, Recife/PE",
  },
  {
    title: "Suporte respondeu rápido",
    content: "Tive uma dúvida e o suporte respondeu com clareza no mesmo dia.",
    author: "Karina, Belo Horizonte/MG",
  },
  {
    title: "Sem taxa escondida",
    content: "Foi exatamente o valor anunciado, sem cobrança surpresa no final.",
    author: "Bruna, Porto Alegre/RS",
  },
  {
    title: "Navegação simples",
    content: "Consegui escolher e pagar sem pedir ajuda para ninguém.",
    author: "Eduardo, Florianópolis/SC",
  },
  {
    title: "Atualizações em cada etapa",
    content: "Recebi aviso de reserva, pagamento e confirmação no fluxo completo.",
    author: "Fernanda, Manaus/AM",
  },
  {
    title: "Entrega registrada",
    content: "A entrega foi registrada e a equipe acompanhou até finalizar tudo.",
    author: "Rafael, Goiânia/GO",
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

export function SocialProof({ entries }: SocialProofProps) {
  const testimonials = buildTestimonials(entries);
  const trackItems = [...testimonials, ...testimonials];

  return (
    <section className={styles.section} id="prova-social">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Quem participa, recomenda</h2>
          <p className={styles.sectionSubtitle}>
            Compra rápida, confirmação clara e confiança na entrega do prêmio.
          </p>
        </header>

        <div className={styles.proofCarousel} role="region" aria-label="Carrossel de depoimentos de participantes">
          <ul className={styles.proofTrack}>
            {trackItems.map((entry, index) => (
              <li className={styles.proofSlide} key={`${entry.author}-${entry.title}-${index}`}>
                <article className={styles.proofItem}>
                  <div className={styles.proofHeaderRow}>
                    <span aria-hidden className={styles.proofAvatar}>
                      {getAvatarInitials(entry.author)}
                    </span>
                    <strong className={styles.proofTitle}>{entry.title}</strong>
                  </div>
                  <p className={styles.proofText}>
                    {entry.content.trim()} <span className={styles.proofAuthor}>{entry.author.trim()}</span>
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
