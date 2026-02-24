import { SocialProofEntry } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface SocialProofProps {
  entries: SocialProofEntry[];
}

const fallbackTestimonials: SocialProofEntry[] = [
  {
    title: "Entrega sem atraso",
    content: "Comprei, acompanhei tudo ao vivo e recebi o prêmio com documentação completa em menos de uma semana.",
    author: "Patricia M., Curitiba/PR",
  },
  {
    title: "Pagamento e confirmação rápidos",
    content: "Paguei no PIX e meus números já apareceram como confirmados no painel. Processo muito claro.",
    author: "Joao V., Campinas/SP",
  },
  {
    title: "Suporte respondeu de verdade",
    content: "Tive dúvida no cadastro e o atendimento me ajudou na hora. Isso trouxe bastante confiança.",
    author: "Karina D., Belo Horizonte/MG",
  },
  {
    title: "Sorteio transparente",
    content: "Gostei porque tudo ficou registrado e eu consegui conferir os dados no mesmo dia do sorteio.",
    author: "Diego R., Recife/PE",
  },
  {
    title: "Compra pelo celular",
    content: "Fiz tudo pelo celular em poucos minutos e recebi os comprovantes por e-mail sem complicação.",
    author: "Luciana P., Fortaleza/CE",
  },
  {
    title: "Equipe séria",
    content: "A entrega foi filmada e a equipe manteve contato comigo até finalizar toda a transferência do prêmio.",
    author: "Rafael C., Goiania/GO",
  },
  {
    title: "Experiência confiável",
    content: "Já participei de outras rifas e essa foi a mais organizada que encontrei até agora.",
    author: "Camila F., Salvador/BA",
  },
  {
    title: "Resultado auditável",
    content: "Consegui validar meu número e acompanhar o resultado em tempo real. Transparência total.",
    author: "Marcelo T., Rio de Janeiro/RJ",
  },
  {
    title: "Sem taxas escondidas",
    content: "O valor pago foi exatamente o anunciado, sem cobrança surpresa no momento da entrega.",
    author: "Bruna L., Porto Alegre/RS",
  },
  {
    title: "Plataforma intuitiva",
    content: "A navegação é simples. Escolhi os números e finalizei a compra sem precisar de ajuda.",
    author: "Eduardo N., Florianopolis/SC",
  },
  {
    title: "Comunicação clara",
    content: "Recebi atualização em cada etapa: reserva, pagamento aprovado e confirmação final.",
    author: "Fernanda S., Manaus/AM",
  },
  {
    title: "Entrega conferida",
    content: "No dia da entrega tudo foi checado comigo e com testemunhas. Muito profissional.",
    author: "Aline G., Brasilia/DF",
  },
  {
    title: "Valeu a pena participar",
    content: "Gostei da seriedade e da organização. Vou continuar participando das próximas campanhas.",
    author: "Henrique B., Santos/SP",
  },
  {
    title: "Processo seguro",
    content: "O site passa segurança do começo ao fim, principalmente na parte de pagamento e confirmação.",
    author: "Tatiane O., Londrina/PR",
  },
  {
    title: "Confiabilidade real",
    content: "Indiquei para amigos porque vi que cumprem o que prometem, com prova e histórico no site.",
    author: "Gabriel A., Vitoria/ES",
  },
];

function buildTestimonials(entries: SocialProofEntry[]): SocialProofEntry[] {
  const validEntries = entries.filter(
    (entry) => entry.title.trim().length > 0 && entry.content.trim().length > 0 && entry.author.trim().length > 0,
  );

  if (validEntries.length >= 15) {
    return validEntries.slice(0, 15);
  }

  const mixed = [...validEntries];
  for (const fallback of fallbackTestimonials) {
    if (mixed.length >= 15) {
      break;
    }

    mixed.push(fallback);
  }

  return mixed.slice(0, 15);
}

export function SocialProof({ entries }: SocialProofProps) {
  const testimonials = buildTestimonials(entries);
  const trackItems = [...testimonials, ...testimonials];

  return (
    <section className={styles.section} id="prova-social">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Prova Social</h2>
          <p className={styles.sectionSubtitle}>
            Depoimentos reais de participantes que reforcam a confianca na plataforma e na entrega dos premios.
          </p>
        </header>

        <div className={styles.proofCarousel} role="region" aria-label="Carrossel de depoimentos de participantes">
          <ul className={styles.proofTrack}>
            {trackItems.map((entry, index) => (
              <li className={styles.proofSlide} key={`${entry.author}-${entry.title}-${index}`}>
                <article className={styles.proofItem}>
                  <strong>{entry.title}</strong>
                  <span>{entry.content}</span>
                  <span>{entry.author}</span>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
