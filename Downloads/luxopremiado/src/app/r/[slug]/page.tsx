import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import Image from "next/image";
import Link from "next/link";

import styles from "@/components/raffle/sections.module.css";
import { FAQ } from "@/components/raffle/FAQ";
import { Footer } from "@/components/raffle/Footer";
import { Hero } from "@/components/raffle/Hero";
import { HowItWorks } from "@/components/raffle/HowItWorks";
import { Auction } from "@/components/raffle/Auction";
import { StickyMobileCTA } from "@/components/raffle/StickyMobileCTA";
import { Transparency } from "@/components/raffle/Transparency";
import { TopMenu } from "@/components/raffle/TopMenu";
import { LuckyNumberBanner } from "@/components/raffle/lucky-number-banner";
import { ProgressStats } from "@/components/raffle/ProgressStats";
import { AffiliateTracker } from "@/components/raffle/AffiliateTracker";
import { LiveActivityPopup } from "@/components/common/LiveActivityPopup";
import { getSiteUrl } from "@/lib/env";
import { getRaffleLandingData, RaffleDataError } from "@/lib/raffles";
import { getSessionUser, isAdminUser } from "@/lib/session";
import { RaffleLandingData } from "@/types/raffle";

interface RafflePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RafflePageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = getSiteUrl();

  try {
    const raffle = await getRaffleLandingData(slug, {
      timeoutMs: 8_000,
      allowUnavailableFallback: true,
      resolveToAvailableSlug: true,
    });
    const canonicalUrl = `${siteUrl}/r/${raffle.slug}`;
    const primaryImage = raffle.prize.images[0] ?? "/images/branding/bigode-logo.png";
    const imageUrl = /^https?:\/\//i.test(primaryImage)
      ? primaryImage
      : `${siteUrl}${primaryImage.startsWith("/") ? primaryImage : `/${primaryImage}`}`;
    const title = "Bigode das Rifas";
    const description = "Bigode das Rifas com compra rápida, transparência e acompanhamento completo da campanha.";
    const primaryPrizeLabel =
      raffle.prize.configs?.find((item) => item.prizeOrder === 1)?.prizeLabel?.trim() || raffle.prize.title;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "Bigode das Rifas",
        locale: "pt_BR",
        type: "website",
        images: [
          {
            url: imageUrl,
            alt: primaryPrizeLabel,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    const canonicalUrl = `${siteUrl}/r/${slug}`;

    return {
      title: "Bigode das Rifas",
      description: "Bigode das Rifas com compra rápida, transparência e acompanhamento completo da campanha.",
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: "Bigode das Rifas",
        description: "Bigode das Rifas com compra rápida, transparência e acompanhamento completo da campanha.",
        url: canonicalUrl,
        siteName: "Bigode das Rifas",
        locale: "pt_BR",
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "Bigode das Rifas",
        description: "Bigode das Rifas com compra rápida, transparência e acompanhamento completo da campanha.",
      },
    };
  }
}

const whatsappLink = "https://wa.me/5511999999999?text=Preciso%20de%20ajuda";

export default async function RafflePage({ params }: RafflePageProps) {
  const { slug } = await params;
  const user = await getSessionUser();
  const isAdmin = user ? await isAdminUser(user.id, user.email) : false;
  let raffle: RaffleLandingData;

  try {
    raffle = await getRaffleLandingData(slug, {
      timeoutMs: 8_000,
      allowUnavailableFallback: true,
      resolveToAvailableSlug: true,
    });
  } catch (error) {
    if (error instanceof RaffleDataError && error.code === "NOT_FOUND") {
      notFound();
    }

    throw error;
  }

  if (raffle.slug !== slug) {
    redirect(`/r/${encodeURIComponent(raffle.slug)}#inicio`);
  }

  const totalNumbers =
    raffle.stats.availableNumbers + raffle.stats.reservedNumbers + raffle.stats.soldNumbers;
  const soldPercent = totalNumbers > 0 ? Math.round((raffle.stats.soldNumbers / totalNumbers) * 100) : 0;
  const formatNumberLabel = (value: number) => value.toLocaleString("pt-BR");

  const highlightCards = [
    {
      icon: "⚡",
      title: "PIX instantâneo",
      description: "Confirmação automática no painel assim que o comprovante é reconhecido.",
    },
    {
      icon: "🧾",
      title: "Auditoria oficialmente registrada",
      description: "Resultados e regulamento publicados com base na Loteria Federal.",
    },
    {
      icon: "🤝",
      title: "Suporte VIP",
      description: "WhatsApp, chat e e-mail com prioridade para dúvidas e entregas.",
    },
  ];

  const modalityCards = [
    {
      title: "Rifas",
      summary: "Números limitados, pacotes com desconto e progresso em tempo real.",
      href: "#rifas",
      label: "Ver rifas",
    },
    {
      title: "Leilões",
      summary: "Lances com contador regressivo, regras claras e trio de moderadores.",
      href: "#leiloes",
      label: "Dar lance",
    },
    {
      title: "Experiências",
      summary: "Ativações premium para quem busca emoção e entregas especiais.",
      href: "#experiencias",
      label: "Conhecer experiências",
    },
    {
      title: "VIP",
      summary: "Comissões, benefícios exclusivos e acompanhamento personalizado.",
      href: "#vip",
      label: "Quero ser VIP",
    },
  ];

  const campaignHighlights = [
    {
      label: "Campanha oficial",
      title: raffle.prize.title,
      blurb: raffle.prize.description,
      date: raffle.hero.drawDateLabel,
      price: raffle.hero.priceLabel,
      progressValue: soldPercent,
      progressLabel: `${soldPercent}% confirmados`,
      href: "/app/comprar",
    },
    {
      label: "Experiências exclusivas",
      title: "Drive & Jantar Executivo",
      blurb: "Prêmios com hospitality e transporte premium para você curtir o momento.",
      date: "Sorteio: 15/04/2026",
      price: "Pacote a partir de R$ 1.250",
      progressValue: 62,
      progressLabel: "62% dos lugares garantidos",
      href: "#experiencias",
    },
    {
      label: "Leilão VIP",
      title: "Lote 01 – Disputa ao vivo",
      blurb: "Lances controlados com limite, transparência e ranking em tempo real.",
      date: "Encerramento: 18/04/2026",
      price: "Lance mínimo R$ 800",
      progressValue: 48,
      progressLabel: "48% do lote disputado",
      href: "#leiloes",
    },
  ];

  const benefitCards = [
    {
      icon: "📊",
      title: "Ranking em tempo real",
      description: "Acompanhe posições, alertas e conquiste o topo com transparência.",
    },
    {
      icon: "🕵️",
      title: "Auditoria visível",
      description: "Sorteio baseado em Loteria Federal, com regras completas no rodapé.",
    },
    {
      icon: "🛡️",
      title: "Suporte dedicado",
      description: "WhatsApp, chat e e-mail monitorados para todas as campanhas.",
    },
    {
      icon: "🏆",
      title: "Prova social real",
      description: "Ganhadores registrados com fotos, vídeos e histórico comprovado.",
    },
  ];

  const processPreview = raffle.howItWorks.slice(0, 3);
  const winnerCards = raffle.winnerWall.slice(0, 3);

  const experiences = [
    {
      title: "Drive & Jantar Executivo",
      description: "Passe de luxo para pista, jantar e traslado com concierge dedicado.",
      price: "R$ 1.250 por número",
      highlights: ["Helicóptero até o circuito", "Jantar com chef premiado", "Kit premium do evento"],
    },
    {
      title: "Experiência Náutica",
      description: "Viagem de iate com open bar, DJ e motoristas particulares para chegada e saída.",
      price: "R$ 1.800 por número",
      highlights: ["Iate privativo", "Bar completo", "Transfer door to door"],
    },
    {
      title: "Retiro Instagramável",
      description: "Hospedagem boutique, tratamento spa e passeios exclusivos em local selecionado.",
      price: "R$ 2.250 por número",
      highlights: ["Suíte master", "Spa & mimos", "Passeio com fotógrafo"],
    },
  ];

  const vipBenefits = [
    {
      title: "Comissão automática",
      detail: "Receba por cada compra confirmada sem precisar pedir aprovação.",
    },
    {
      title: "Atendimento prioritário",
      detail: "Linha direta com a equipe, fila VIP no WhatsApp e no chat.",
    },
    {
      title: "Painel completo",
      detail: "Links, cliques e histórico com relatórios semanais.",
    },
  ];

  const vipLevels = [
    {
      name: "VIP Bronze",
      perks: ["Comissão fixa de 5%", "Alerts por WhatsApp"],
    },
    {
      name: "VIP Prata",
      perks: ["Comissão de 7%", "Acesso antecipado às rifas"],
    },
    {
      name: "VIP Ouro",
      perks: ["Comissão de 10%", "Mentoria e convite para experiências"],
    },
  ];

  const vipTestimonials = raffle.socialProof.slice(0, 2);

  const rifasFilters = ["Todas", "Prêmios em destaque", "Leilões e experiências"];

  const rifasList = [
    {
      title: raffle.prize.title,
      status: "Venda aberta",
      price: raffle.hero.priceLabel,
      date: raffle.hero.drawDateLabel,
      sold: raffle.stats.soldNumbers,
      available: raffle.stats.availableNumbers,
      reserved: raffle.stats.reservedNumbers,
      progressValue: soldPercent,
      badge: "Mais populares",
      href: "/app/comprar",
    },
    {
      title: "Experiência Gran Turismo",
      status: "Campanha premium",
      price: "R$ 950 por número",
      date: "Sorteio: 25/04/2026",
      sold: 372,
      available: 628,
      reserved: 56,
      progressValue: 56,
      href: "#experiencias",
    },
    {
      title: "Leilão Ouro em tempo real",
      status: "Disputa publicada",
      price: "Lance mínimo R$ 800",
      date: "Encerramento: 18/04/2026",
      sold: 198,
      available: 0,
      reserved: 0,
      progressValue: 48,
      href: "#leiloes",
    },
  ];

  const rifasFaq = [
    {
      question: "Como escolho meus números?",
      answer:
        "Selecione manualmente ou use os pacotes sugeridos para garantir mais agilidade. O painel mostra o status de cada número em tempo real.",
    },
    {
      question: "Qual o limite por pessoa?",
      answer: "Você pode garantir até 50 números por CPF e a compra é dividida em pacotes com descontos progressivos.",
    },
    {
      question: "Quando o sorteio acontece?",
      answer: "Todas as datas estão no topo da campanha e o resultado é anunciado ao vivo com auditoria pública.",
    },
  ];

  const supportFaqCategories = [
    {
      title: "Pagamento",
      items: [
        "PIX aprovado em segundos e confirmado direto no painel.",
        "Cartão validado pelo gateway e parcelamento liberado conforme regras do site.",
      ],
    },
    {
      title: "Números",
      items: [
        "Confirmados vendem menos tempo e aparecem com selo verde.",
        "Reserva expira em 5 minutos se o PIX não for enviado; você recebe aviso.",
      ],
    },
    {
      title: "Resultado",
      items: [
        "Sorteio baseado na Loteria Federal e publicado com cronograma completo.",
        "Ranking e ganhadores ficam disponíveis na página oficial para conferência.",
      ],
    },
    {
      title: "Entrega",
      items: [
        "Todos os ganhadores recebem confirmação com foto, vídeo e nota fiscal.",
        "Equipe acompanha o transporte e envia rastreamento assim que possível.",
      ],
    },
  ];

  const supportChannels = [
    { label: "WhatsApp", detail: "Atendimento rápido e oficial", href: whatsappLink },
    { label: "E-mail", detail: "suporte@bigodedasrifas.com", href: "mailto:suporte@bigodedasrifas.com" },
    { label: "Área do usuário", detail: "Histórico e alertas", href: "/area-do-usuario" },
  ];

  const supportHours = "Segunda a sábado, das 9h às 21h";

  return (
    <main>
      <AffiliateTracker />
      <LiveActivityPopup scope="landing" />
      <TopMenu
        userAreaHref={isAdmin ? "/app/configuracoes" : "/area-do-usuario"}
        userAreaLabel={isAdmin ? "Configurações" : "Área do Usuário"}
      />

      <Hero data={raffle.hero} />

      <section className={styles.section} aria-label="Destaques imediatos">
        <div className={`${styles.container} ${styles.highlightGrid}`}>
          {highlightCards.map((item) => (
            <article className={styles.highlightCard} key={item.title}>
              <span className={styles.highlightIcon} aria-hidden>
                {item.icon}
              </span>
              <h3 className={styles.highlightTitle}>{item.title}</h3>
              <p className={styles.highlightText}>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-label="Escolha sua modalidade">
        <div className={`${styles.container} ${styles.modalityGrid}`}>
          {modalityCards.map((item) => (
            <article className={styles.modalityCard} key={item.title}>
              <p className={styles.modalityLabel}>{item.title}</p>
              <h3 className={styles.modalityTitle}>{item.summary}</h3>
              <Link className={styles.modalityCta} href={item.href}>
                {item.label}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-label="Campanhas em destaque">
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Campanhas em destaque</h2>
            <p className={styles.sectionSubtitle}>
              Espaços organizados para rifas, leilões e experiências com foco em conversões claras.
            </p>
          </header>
          <div className={styles.campaignGrid}>
            {campaignHighlights.map((card) => (
              <article className={styles.campaignCard} key={card.title}>
                <span className={styles.campaignLabel}>{card.label}</span>
                <h3 className={styles.campaignTitle}>{card.title}</h3>
                <p className={styles.campaignBlurb}>{card.blurb}</p>
                <p className={styles.campaignMeta}>{card.date}</p>
                <p className={styles.campaignMeta}>{card.price}</p>
                <div className={styles.campaignProgress}>
                  <div className={styles.campaignProgressTrack}>
                    <div
                      className={styles.campaignProgressFill}
                      style={{ width: `${card.progressValue}%` }}
                    />
                  </div>
                  <span className={styles.campaignProgressValue}>{card.progressLabel}</span>
                </div>
                <Link className={styles.campaignCta} href={card.href}>
                  Ver campanha
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-label="Benefícios">
        <div className={`${styles.container} ${styles.benefitsGrid}`}>
          {benefitCards.map((benefit) => (
            <article className={styles.benefitCard} key={benefit.title}>
              <span className={styles.benefitIcon} aria-hidden>
                {benefit.icon}
              </span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-label="Ganhadores verificados">
        <div className={`${styles.container} ${styles.winnerGallery}`}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Ganhadores verificáveis</h2>
            <p className={styles.sectionSubtitle}>
              Histórias reais com fotos e datas para reforçar confiança imediata.
            </p>
          </header>
          <div className={styles.winnerCardsGrid}>
            {winnerCards.map((winner) => (
              <article className={styles.winnerCard} key={`${winner.name}-${winner.city}`}>
                <div className={styles.winnerImageWrap}>
                  <Image
                    fill
                    sizes="(max-width: 900px) 100vw, 33vw"
                    src={winner.mediaUrl ?? "/images/winners/winner-1.svg"}
                    alt={`Comprovante de ${winner.name}`}
                    className={styles.winnerImage}
                  />
                </div>
                <div className={styles.winnerMeta}>
                  <p className={styles.winnerName}>{winner.name}</p>
                  <p className={styles.winnerPrize}>{winner.prize}</p>
                  <p className={styles.winnerCity}>{winner.city}</p>
                  <p className={styles.winnerVerified}>{winner.verifiedAtLabel ?? "Vencedor confirmado"}</p>
                </div>
              </article>
            ))}
          </div>
          <Link className={styles.sectionCta} href="#rifas">
            Participe da próxima disputa
          </Link>
        </div>
      </section>

      <section className={styles.section} aria-label="Como funciona rápido">
        <div className={`${styles.container} ${styles.processPreviewGrid}`}>
          {processPreview.map((step) => (
            <article className={styles.processPreviewCard} key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.vipCallout}`}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>VIP com prioridade e comissão</h2>
            <p className={styles.sectionSubtitle}>
              Programa exclusivo para afiliados que querem ganhar mais vendendo rifas e experiências.
            </p>
          </header>
          <div className={styles.vipCalloutGrid}>
            <div>
              <p className={styles.vipCalloutText}>
                Ganhe comissão automática, suporte dedicado e monitoramento em tempo real de cliques e vendas.
              </p>
              <Link className={styles.primaryCta} href="/app/perfil">
                Ativar meu código VIP
              </Link>
            </div>
            <div className={styles.vipLevelsGrid}>
              {vipLevels.map((level) => (
                <article className={styles.vipLevelCard} key={level.name}>
                  <p className={styles.vipLevelTitle}>{level.name}</p>
                  <ul className={styles.vipLevelPerks}>
                    {level.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FAQ
        items={raffle.faq}
        limit={3}
        id="faq-home"
        title="Dúvidas objetivas"
        subtitle="Três respostas diretas para os principais momentos da compra."
        ctaLabel="Ver todas as perguntas"
        ctaHref="/app/comprar"
      />

      <section className={`${styles.section} ${styles.callToAction}`}>
        <div className={styles.container}>
          <div className={styles.ctaShell}>
            <div>
              <p className={styles.ctaLabel}>Pronto para encarar o próximo sorteio?</p>
              <h3 className={styles.ctaTitle}>Escolha seus números e acompanhe tudo em tempo real.</h3>
            </div>
            <Link className={styles.primaryCta} href="/app/comprar">
              Entrar na próxima disputa
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.rifasSection}`} id="rifas">
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Rifas ativas</h2>
            <p className={styles.sectionSubtitle}>
              Filtros rápidos, status e contadores ajudam a decidir o melhor momento de participar.
            </p>
          </header>
          <LuckyNumberBanner raffleSlug={raffle.slug} stats={raffle.stats} />
          <ProgressStats
            raffleSlug={raffle.slug}
            stats={raffle.stats}
            totalNumbers={raffle.totalNumbers}
            prizeConfigs={raffle.prize.configs}
          />
          <div className={styles.rifasFilters}>
            {rifasFilters.map((filter) => (
              <button type="button" className={styles.rifasFilterButton} key={filter}>
                {filter}
              </button>
            ))}
          </div>
          <div className={styles.rifaCardsGrid}>
            {rifasList.map((rifa) => (
              <article className={styles.rifaCard} key={rifa.title}>
                <div className={styles.rifaCardHeader}>
                  <div>
                    <p className={styles.rifaBadge}>{rifa.badge}</p>
                    <h3>{rifa.title}</h3>
                  </div>
                  <span className={styles.rifaStatus}>{rifa.status}</span>
                </div>
                <p className={styles.rifaPrice}>{rifa.price}</p>
                <p className={styles.rifaMeta}>{rifa.date}</p>
                <div className={styles.rifaProgressBar}>
                  <div className={styles.rifaProgressFill} style={{ width: `${rifa.progressValue}%` }} />
                </div>
                <p className={styles.rifaStats}>
                  {formatNumberLabel(rifa.sold)} confirmados · {formatNumberLabel(rifa.available)} disponíveis
                </p>
                <Link className={styles.secondaryCta} href={rifa.href}>
                  Escolher números
                </Link>
              </article>
            ))}
          </div>
          <div className={styles.rifasFaqGrid}>
            {rifasFaq.map((item) => (
              <article className={styles.rifasFaqCard} key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.auctionSection}`} id="leiloes">
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Leilões ao vivo</h2>
            <p className={styles.sectionSubtitle}>
              Leilões separados das rifas para aumentar a urgência e o foco no lance perfeito.
            </p>
          </header>
          <div className={styles.auctionLayout}>
            <div className={styles.auctionMain}>
              <Auction raffleSlug={raffle.slug} />
            </div>
            <div className={styles.auctionSidebar}>
              <article className={styles.auctionSidebarCard}>
                <h3>Dinâmica do leilão</h3>
                <p>Defina proxy, acompanhe o relógio e veja o valor atual com atualização a cada 15s.</p>
                <ul className={styles.auctionRules}>
                  <li>Limite de dois lances por participante a cada 5 minutos.</li>
                  <li>Transparência total com histórico público desde o primeiro lance.</li>
                  <li>O maior lance válido vence; empate vai para o primeiro registrado.</li>
                </ul>
              </article>
              <article className={styles.auctionSidebarCard}>
                <h3>Regras principais</h3>
                <ul className={styles.auctionRules}>
                  <li>Cada lance tem carimbo oficial e é auditado pelo time jurídico.</li>
                  <li>Auditoria em vídeo é liberada imediatamente após o encerramento.</li>
                  <li>Ganhe alertas quando você ficar em segundo lugar.</li>
                </ul>
              </article>
              <Link className={styles.primaryCta} href="#leiloes">
                Participar do leilão
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.experiencesSection}`} id="experiencias">
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Experiências premium</h2>
            <p className={styles.sectionSubtitle}>Desejo, exclusividade e escassez em um único bloco.</p>
          </header>
          <div className={styles.experiencesGrid}>
            {experiences.map((item) => (
              <article className={styles.experienceCard} key={item.title}>
                <p className={styles.experienceBadge}>Experiência</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <p className={styles.experiencePrice}>{item.price}</p>
                <ul>
                  {item.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                <Link className={styles.secondaryCta} href="/app/comprar">
                  Garantir experiência
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.vipSection}`} id="vip">
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Programa VIP e afiliados</h2>
            <p className={styles.sectionSubtitle}>
              Ganhe comissões reais, níveis com vantagens e acesso a suportes prioritários.
            </p>
          </header>
          <div className={styles.vipContentGrid}>
            <div className={styles.vipBenefitsGrid}>
              {vipBenefits.map((benefit) => (
                <article className={styles.vipBenefitCard} key={benefit.title}>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.detail}</p>
                </article>
              ))}
            </div>
            <div className={styles.vipTestimonials}>
              {vipTestimonials.map((testimonial) => (
                <article className={styles.vipTestimonialCard} key={testimonial.title}>
                  <p className={styles.vipTestimonialText}>{testimonial.content}</p>
                  <p className={styles.vipTestimonialAuthor}>— {testimonial.author}</p>
                </article>
              ))}
            </div>
          </div>
          <Link className={styles.primaryCta} href="/app/perfil">
            Ativar meu código VIP
          </Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.winnerSection}`} id="ganhadores">
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Linha do tempo de vencedores</h2>
            <p className={styles.sectionSubtitle}>
              Cartões com foto, prêmio, cidade e datas para garantir confiança plena.
            </p>
          </header>
          <div className={styles.winnerTimeline}>
            {winnerCards.map((entry, index) => (
              <article className={styles.winnerTimelineCard} key={`${entry.name}-${index}`}>
                <div>
                  <p className={styles.winnerTimelinePrize}>{entry.prize}</p>
                  <p className={styles.winnerTimelineName}>{entry.name}</p>
                  <p className={styles.winnerTimelineCity}>{entry.city}</p>
                  <p className={styles.winnerTimelineDate}>{entry.verifiedAtLabel ?? "Entrega registrada"}</p>
                </div>
                <div className={styles.winnerTimelineMedia}>
                  <Image
                    src={entry.mediaUrl ?? "/images/winners/winner-1.svg"}
                    alt={`Comprovante ${entry.name}`}
                    width={160}
                    height={110}
                    className={styles.winnerTimelineImage}
                  />
                </div>
              </article>
            ))}
          </div>
          <Link className={styles.primaryCta} href="#rifas">
            Participe da próxima campanha
          </Link>
        </div>
      </section>

      <HowItWorks steps={raffle.howItWorks} />

      <section className={`${styles.section} ${styles.supportSection}`} id="suporte">
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Suporte oficial</h2>
            <p className={styles.sectionSubtitle}>
              Canais legítimos, FAQ segmentado e aviso anti-golpes para cada etapa da jornada.
            </p>
          </header>
          <div className={styles.supportGrid}>
            <article className={styles.supportCard}>
              <h3>Canais de contato</h3>
              <ul className={styles.supportChannels}>
                {supportChannels.map((channel) => (
                  <li key={channel.label} className={styles.supportChannelItem}>
                    <Link href={channel.href} target={channel.href.startsWith("http") ? "_blank" : undefined}>
                      <strong>{channel.label}</strong>
                      <span>{channel.detail}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className={styles.supportHours}>Horário: {supportHours}</p>
              <p className={styles.supportSafety}>
                Avisos de segurança: nunca pedimos códigos ou PIX fora do ambiente oficial.
              </p>
            </article>
            <article className={styles.supportCard}>
              <h3>Perguntas por categoria</h3>
              <div className={styles.supportFaqGrid}>
                {supportFaqCategories.map((category) => (
                  <div key={category.title} className={styles.supportFaqCategory}>
                    <p className={styles.supportFaqTitle}>{category.title}</p>
                    <ul>
                      {category.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
            <article className={styles.supportCard}>
              <h3>Formulário rápido</h3>
              <form className={styles.supportForm}>
                <label>
                  Nome completo
                  <input name="nome" placeholder="Seu nome" />
                </label>
                <label>
                  E-mail ou WhatsApp
                  <input name="contato" placeholder="Email ou WhatsApp" />
                </label>
                <label>
                  Mensagem
                  <textarea name="mensagem" placeholder="Como podemos ajudar?" rows={4} />
                </label>
                <button type="submit" className={styles.secondaryCta}>
                  Abrir chamado
                </button>
              </form>
            </article>
          </div>
        </div>
      </section>

      <Transparency data={raffle.transparency} />
      <Footer raffleSlug={raffle.slug} />
      <StickyMobileCTA raffleSlug={raffle.slug} />
    </main>
  );
}
