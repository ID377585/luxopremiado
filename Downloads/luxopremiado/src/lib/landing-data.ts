import { RaffleLandingData, NumberTile } from "@/types/raffle";

export const FALLBACK_TOTAL_NUMBERS = 10_000;
export const FALLBACK_INITIAL_PAGE_SIZE = 200;
const DEFAULT_UNIT_PRICE_CENTS = 1990;

const packageTemplates = [
  {
    id: "popular",
    name: "Pacote Popular",
    quantity: 10,
    discountPercent: 5,
    badge: "Mais vendido",
    description: "Entrada rápida na disputa com economia por número e confirmação mais ágil.",
    highlight: true,
  },
  {
    id: "turbo",
    name: "Pacote Turbo",
    quantity: 25,
    discountPercent: 10,
    description: "Mais volume para subir no ranking e aumentar alcance no sorteio.",
  },
  {
    id: "top-ranking",
    name: "Pacote Top Ranking",
    quantity: 50,
    discountPercent: 15,
    description: "Foco total em posição no ranking e maior cobertura de números com melhor custo.",
  },
] as const;

function fallbackStatusForNumber(number: number): NumberTile["status"] {
  if (number % 9 === 0) {
    return "sold";
  }

  if (number % 5 === 0) {
    return "reserved";
  }

  return "available";
}

export function buildFallbackNumberTiles(params: {
  page: number;
  pageSize: number;
  totalNumbers?: number;
}): NumberTile[] {
  const totalNumbers = params.totalNumbers ?? FALLBACK_TOTAL_NUMBERS;
  const page = Math.max(1, params.page);
  const pageSize = Math.max(1, params.pageSize);
  const start = (page - 1) * pageSize;
  const end = Math.min(totalNumbers - 1, start + pageSize - 1);

  if (start >= totalNumbers) {
    return [];
  }

  return Array.from({ length: end - start + 1 }, (_, index) => {
    const number = start + index;
    return {
      number,
      status: fallbackStatusForNumber(number),
    };
  });
}

export function buildPackageOffersForUnitPrice(unitPriceCents: number) {
  return packageTemplates.map((template) => {
    const { discountPercent, ...baseTemplate } = template;
    const referenceTotalCents = unitPriceCents * template.quantity;
    const discountMultiplier = (100 - discountPercent) / 100;
    const totalCents = Math.round(referenceTotalCents * discountMultiplier);
    const savingsCents = Math.max(0, referenceTotalCents - totalCents);

    return {
      ...baseTemplate,
      totalCents,
      referenceTotalCents,
      savingsCents,
      savingsPercent: discountPercent,
      pricePerNumberCents: Math.round(totalCents / template.quantity),
    };
  });
}

export const fallbackRaffleData: RaffleLandingData = {
  raffleId: null,
  slug: "luxo-premiado",
  totalNumbers: FALLBACK_TOTAL_NUMBERS,
  maxNumbersPerUser: 50,
  hero: {
    title: "Sua chance de concorrer a um prêmio grande começa com poucos cliques.",
    subtitle:
      "Escolha seus números, pague no PIX e acompanhe tudo com transparência. Compra rápida, confirmação automática e sorteio auditável.",
    drawDateLabel: "Sorteio: 30/04/2026 às 19:00",
    priceLabel: "R$ 19,90 por número",
    badges: ["PIX imediato (sem enrolação)", "Números rastreáveis em tempo real", "Ranking de compradores"],
    ctaLabel: "QUERO ESCOLHER MEUS NÚMEROS AGORA",
  },
  prize: {
    title: "Jeep Compass Série S 0km",
    description:
      "Veículo novo, documentação regular e entrega com transmissão ao vivo para garantir transparência total.",
    images: [
      "/images/prize/compass-1.svg",
      "/images/prize/compass-2.svg",
      "/images/prize/compass-3.svg",
    ],
    features: [
      { label: "Ano/Modelo", value: "2026/2026" },
      { label: "Motor", value: "1.3 Turbo Flex" },
      { label: "Garantia", value: "Fábrica" },
      { label: "Entrega", value: "Todo o Brasil" },
    ],
  },
  howItWorks: [
    {
      title: "1. Crie sua conta",
      description: "Cadastro rápido para acompanhar números, pagamento e confirmação em um só painel.",
    },
    {
      title: "2. Selecione os números",
      description: "Escolha manualmente ou use pacotes aleatórios para ganhar velocidade na compra.",
    },
    {
      title: "3. Finalize pagamento",
      description: "Finalize no PIX e acompanhe o status em tempo real direto no checkout.",
    },
    {
      title: "4. Acompanhe o sorteio",
      description: "Resultado, auditoria e histórico publicados com transparência na campanha.",
    },
  ],
  numberTiles: buildFallbackNumberTiles({
    page: 1,
    pageSize: FALLBACK_INITIAL_PAGE_SIZE,
    totalNumbers: FALLBACK_TOTAL_NUMBERS,
  }),
  buyerRanking: [
    { position: 1, participant: "Marina #A13", totalNumbers: 92, trendDelta: 2 },
    { position: 2, participant: "Rodrigo #BC7", totalNumbers: 87, trendDelta: -1 },
    { position: 3, participant: "Leila #9DF", totalNumbers: 69, trendDelta: 1 },
    { position: 4, participant: "Carlos #1A2", totalNumbers: 62, trendDelta: -2 },
    { position: 5, participant: "Amanda #7C1", totalNumbers: 55, trendDelta: 1 },
  ],
  packages: buildPackageOffersForUnitPrice(DEFAULT_UNIT_PRICE_CENTS),
  stats: {
    availableNumbers: 8412,
    reservedNumbers: 1142,
    soldNumbers: 7846,
    averagePerUser: 4.8,
  },
  checkoutMethods: [
    {
      name: "PIX",
      description: "Aprovação quase imediata com QR Code e código copia e cola.",
    },
    {
      name: "Cartão",
      description: "Parcelamento conforme regras do gateway de pagamento.",
    },
  ],
  transparency: {
    drawMethod: "Baseado no resultado da Loteria Federal",
    organizer: "Luxo Premiado Entretenimento Ltda.",
    organizerDoc: "CNPJ 00.000.000/0001-00",
    contact: "suporte@luxopremiado.com.br",
    rulesSummary:
      "Todos os números ficam auditáveis em tempo real e o regulamento completo é publicado antes da abertura das vendas.",
  },
  socialProof: [
    {
      title: "Pagamento confirmado em minutos",
      content: "Paguei no PIX e meus números apareceram confirmados no painel na mesma hora.",
      author: "João, Campinas/SP",
      avatarUrl: "/images/social/joao.svg",
    },
    {
      title: "Compra pelo celular",
      content: "Escolhi os números no celular e finalizei em menos de 2 minutos.",
      author: "Rodrigo, Campinas/SP",
      avatarUrl: "/images/social/rodrigo.svg",
    },
    {
      title: "Transparência no sorteio",
      content: "Consegui acompanhar tudo e conferir o resultado com clareza na própria página.",
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
  ],
  winnerWall: [
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
  ],
  retention: {
    title: "Ative alertas e aumente recompra",
    subtitle:
      "Receba aviso de pagamento confirmado, lembrete do sorteio e alerta de ranking para voltar antes da próxima rodada.",
    features: [
      {
        title: "E-mail automático por etapa",
        description: "Confirmação de pagamento, lembrete do sorteio e resultado final no mesmo fluxo.",
        channel: "email",
      },
      {
        title: "Atualização por WhatsApp",
        description: "Status do pedido, mudança de posição no ranking e aviso de campanha ativa.",
        channel: "whatsapp",
      },
      {
        title: "Painel com recompra rápida",
        description: "Histórico de pedidos com atalho para comprar novamente em poucos cliques.",
        channel: "painel",
      },
    ],
    ctaPrimaryLabel: "ATIVAR ALERTAS NO PAINEL",
    ctaPrimaryHref: "/area-do-usuario",
    ctaSecondaryLabel: "QUERO COMPRAR MAIS NÚMEROS",
    ctaSecondaryHref: "/app/comprar",
  },
  faq: [
    {
      question: "Como sei que meus números foram confirmados?",
      answer:
        "Assim que o pagamento é aprovado, os números ficam marcados como vendidos no seu painel e você recebe confirmação por e-mail.",
    },
    {
      question: "Posso escolher números específicos?",
      answer:
        "Sim. Você pode selecionar manualmente no grid ou usar a seleção aleatória para preencher automaticamente.",
    },
    {
      question: "O que acontece se eu não pagar a tempo?",
      answer:
        "A reserva expira automaticamente no tempo configurado e os números voltam para disponibilidade pública.",
    },
    {
      question: "Como funciona a auditoria do sorteio?",
      answer:
        "Publicamos regras, método, prova do resultado e validação dos números vencedores na área de transparência.",
    },
    {
      question: "Qual é a data e o horário oficiais do sorteio?",
      answer:
        "A data e o horário ficam destacados no topo da campanha. Qualquer alteração é publicada com antecedência e registrada na seção de transparência.",
    },
    {
      question: "Onde vejo o resultado do sorteio?",
      answer:
        "Após a apuração, publicamos o número vencedor na página da campanha e também no painel do usuário com status atualizado.",
    },
    {
      question: "Quanto tempo leva para receber o prêmio?",
      answer:
        "Depois da validação dos documentos do ganhador, iniciamos a entrega conforme o regulamento. O prazo exato depende do tipo de prêmio e localidade.",
    },
    {
      question: "Preciso pagar alguma taxa extra para receber o prêmio?",
      answer:
        "Não cobramos taxas ocultas na plataforma. Custos e responsabilidades da entrega seguem as regras publicadas no regulamento da campanha.",
    },
    {
      question: "Posso comprar números em mais de um pedido?",
      answer:
        "Sim. Você pode realizar novas compras enquanto houver disponibilidade de números e dentro do limite máximo por usuário.",
    },
    {
      question: "Como funciona o estorno se o pagamento falhar?",
      answer:
        "Se houver cobrança com falha de confirmação, abrimos análise com o gateway e registramos tudo no seu histórico para correção ou estorno.",
    },
    {
      question: "Como entro em contato com o suporte?",
      answer:
        "Use os canais informados no rodapé e na seção de transparência. O suporte responde com prioridade para dúvidas de pagamento e confirmação.",
    },
    {
      question: "Posso transferir meus números para outra pessoa?",
      answer:
        "A transferência depende das regras da campanha ativa. Consulte o regulamento da rifa para saber os critérios e prazos permitidos.",
    },
  ],
};
