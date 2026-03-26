export type RafflePackage = {
  title: string;
  quantity: number;
  originalPrice: string;
  price: string;
  discount: string;
  unitPrice: string;
  description: string;
  cta: string;
  badge?: string;
};

export type RaffleFaq = {
  question: string;
  answer: string;
};

export type RaffleTestimonial = {
  title: string;
  text: string;
  author: string;
};

export type RaffleHighlight = {
  label: string;
  value: string;
};

export type RaffleContent = {
  slug: string;
  title: string;
  shortDescription: string;
  heroTitle: string;
  heroDescription: string;
  heroBadge: string;
  drawDateLabel: string;
  pricePerNumber: string;
  totalNumbers: string;
  mainPrizeTitle: string;
  mainPrizeDescription: string;
  prizeValueLabel: string;
  deliveryLabel: string;
  regulationLabel: string;
  supportLabel: string;
  trustPills: string[];
  highlights: RaffleHighlight[];
  secondaryPrizes: string[];
  packages: RafflePackage[];
  testimonials: RaffleTestimonial[];
  faq: RaffleFaq[];
  seoTitle: string;
  seoDescription: string;
};

export const rafflesContent: Record<string, RaffleContent> = {
  "moto-0km": {
    slug: "moto-0km",
    title: "Moto 0km",
    shortDescription:
      "Campanha com apelo popular forte, ticket acessível e grande poder de conversão para tráfego frio e quente.",
    heroTitle: "CONCORRA A UMA MOTO 0KM E ENTRE FORTE NA DISPUTA.",
    heroDescription:
      "Escolha seus números, finalize no PIX e acompanhe tudo com clareza. Uma campanha pensada para desejo imediato, compra rápida e forte potencial de participação.",
    heroBadge: "Mais procurada",
    drawDateLabel: "30/04/2026 às 19:00",
    pricePerNumber: "R$ 1,99",
    totalNumbers: "12.000 números",
    mainPrizeTitle: "Moto 0km",
    mainPrizeDescription:
      "Uma campanha de alto apelo popular, excelente para acelerar clique, retenção na página e decisão rápida de compra.",
    prizeValueLabel: "Prêmio principal com alto valor percebido",
    deliveryLabel: "Entrega com validação pública",
    regulationLabel: "Regras claras e auditoria da campanha",
    supportLabel: "Suporte para dúvidas no processo de compra",
    trustPills: [
      "Pagamento via PIX",
      "Compra rápida",
      "Números rastreáveis",
      "Campanha auditável",
    ],
    highlights: [
      {
        label: "Prêmio principal",
        value: "Moto 0km",
      },
      {
        label: "Valor por número",
        value: "R$ 1,99",
      },
      {
        label: "Data do sorteio",
        value: "30/04/2026 às 19:00",
      },
      {
        label: "Disponibilidade",
        value: "12.000 números",
      },
    ],
    secondaryPrizes: [
      "Bônus em dinheiro para reforçar atratividade",
      "Campanha com forte apelo para entrada rápida",
      "Excelente prêmio para destaque visual",
    ],
    packages: [
      {
        title: "Pacote Inicial",
        quantity: 10,
        originalPrice: "R$ 19,90",
        price: "R$ 17,90",
        discount: "10%",
        unitPrice: "R$ 1,79",
        description:
          "Boa porta de entrada para quem quer participar com baixo atrito e ainda aproveitar desconto no pacote.",
        cta: "QUERO 10 NÚMEROS",
      },
      {
        title: "Pacote Turbo",
        quantity: 25,
        originalPrice: "R$ 49,75",
        price: "R$ 41,90",
        discount: "15%",
        unitPrice: "R$ 1,67",
        description:
          "Pacote pensado para aumentar cobertura de números e melhorar custo por participação.",
        cta: "QUERO 25 NÚMEROS",
        badge: "Mais vendido",
      },
      {
        title: "Pacote Ranking",
        quantity: 60,
        originalPrice: "R$ 119,40",
        price: "R$ 94,90",
        discount: "20%",
        unitPrice: "R$ 1,58",
        description:
          "Ideal para quem quer entrar forte, ganhar presença no ranking e ampliar suas chances com melhor custo médio.",
        cta: "QUERO 60 NÚMEROS",
      },
    ],
    testimonials: [
      {
        title: "Compra sem enrolação",
        text: "Escolhi os números e finalizei muito rápido. O processo é simples e direto.",
        author: "Bruno, Campinas/SP",
      },
      {
        title: "Ótima sensação de clareza",
        text: "A página deixa bem claro o prêmio, os pacotes e o que fazer para participar.",
        author: "Renata, Osasco/SP",
      },
      {
        title: "Muito mais vontade de entrar",
        text: "Quando o prêmio é forte e o checkout parece fácil, a decisão fica muito mais rápida.",
        author: "Carlos, Sorocaba/SP",
      },
    ],
    faq: [
      {
        question: "Posso escolher números específicos?",
        answer:
          "Sim. Você pode selecionar seus números manualmente, quando disponível, antes de concluir o pagamento.",
      },
      {
        question: "Quando meus números ficam confirmados?",
        answer:
          "Depois da aprovação do pagamento, os números ficam vinculados ao seu pedido no painel do usuário.",
      },
      {
        question: "Essa campanha é auditável?",
        answer:
          "Sim. A campanha deve manter regras, critérios e divulgação do resultado com transparência.",
      },
    ],
    seoTitle: "Moto 0km | Bigode das Rifas",
    seoDescription:
      "Participe da campanha Moto 0km, escolha seus números e finalize sua compra no PIX.",
  },

  "iphone-pro-max": {
    slug: "iphone-pro-max",
    title: "iPhone Pro Max",
    shortDescription:
      "Campanha premium com excelente desempenho em mobile, alto desejo imediato e grande facilidade de entendimento para o público.",
    heroTitle: "CONCORRA A UM IPHONE PRO MAX E ENTRE AGORA NA DISPUTA.",
    heroDescription:
      "Uma campanha com forte apelo premium, ótima para tráfego mobile e compra por impulso. Escolha seus números, pague no PIX e acompanhe tudo com clareza.",
    heroBadge: "Alta conversão",
    drawDateLabel: "07/05/2026 às 19:00",
    pricePerNumber: "R$ 1,49",
    totalNumbers: "8.000 números",
    mainPrizeTitle: "iPhone Pro Max",
    mainPrizeDescription:
      "Prêmio premium com alto desejo de mercado, forte valor percebido e excelente capacidade de retenção na página.",
    prizeValueLabel: "Prêmio premium com forte apelo visual",
    deliveryLabel: "Entrega validada após apuração",
    regulationLabel: "Critérios públicos e campanha transparente",
    supportLabel: "Suporte para compra e confirmação",
    trustPills: [
      "PIX imediato",
      "Campanha premium",
      "Compra no celular",
      "Fluxo simplificado",
    ],
    highlights: [
      {
        label: "Prêmio principal",
        value: "iPhone Pro Max",
      },
      {
        label: "Valor por número",
        value: "R$ 1,49",
      },
      {
        label: "Data do sorteio",
        value: "07/05/2026 às 19:00",
      },
      {
        label: "Disponibilidade",
        value: "8.000 números",
      },
    ],
    secondaryPrizes: [
      "Campanha com forte apelo mobile",
      "Excelente prêmio para decisão rápida",
      "Visual premium com alto valor percebido",
    ],
    packages: [
      {
        title: "Pacote Rápido",
        quantity: 10,
        originalPrice: "R$ 14,90",
        price: "R$ 13,90",
        discount: "7%",
        unitPrice: "R$ 1,39",
        description:
          "Entrada ideal para quem quer participar rápido e aproveitar um custo melhor por número.",
        cta: "QUERO 10 NÚMEROS",
      },
      {
        title: "Pacote Conversão",
        quantity: 25,
        originalPrice: "R$ 37,25",
        price: "R$ 31,90",
        discount: "14%",
        unitPrice: "R$ 1,27",
        description:
          "Pacote pensado para quem quer aumentar cobertura de forma inteligente e mais econômica.",
        cta: "QUERO 25 NÚMEROS",
        badge: "Mais vendido",
      },
      {
        title: "Pacote Premium",
        quantity: 50,
        originalPrice: "R$ 74,50",
        price: "R$ 58,90",
        discount: "21%",
        unitPrice: "R$ 1,17",
        description:
          "Melhor custo médio para quem quer entrar mais forte na campanha e ter presença maior na disputa.",
        cta: "QUERO 50 NÚMEROS",
      },
    ],
    testimonials: [
      {
        title: "Muito forte no celular",
        text: "A campanha conversa muito bem com quem acessa pelo celular e quer decidir rápido.",
        author: "Mariana, São Paulo/SP",
      },
      {
        title: "Prêmio muito desejado",
        text: "iPhone sempre chama atenção e faz a pessoa ter vontade de participar na hora.",
        author: "Diego, Santo André/SP",
      },
      {
        title: "Página objetiva",
        text: "Gostei porque a página explica bem o prêmio e não faz a pessoa se perder.",
        author: "Lucas, Guarulhos/SP",
      },
    ],
    faq: [
      {
        question: "Essa campanha funciona bem para público mobile?",
        answer:
          "Sim. O prêmio tem forte apelo no celular e favorece decisão rápida para quem acessa de redes sociais ou anúncio.",
      },
      {
        question: "Posso comprar poucos números?",
        answer:
          "Sim. Você pode entrar com menor volume ou escolher um pacote com melhor custo por número.",
      },
      {
        question: "Como acompanho a confirmação?",
        answer:
          "Depois do pagamento, o participante acompanha o status do pedido no painel do usuário.",
      },
    ],
    seoTitle: "iPhone Pro Max | Bigode das Rifas",
    seoDescription:
      "Participe da campanha iPhone Pro Max, escolha seus números e finalize com rapidez no PIX.",
  },

  "pix-10-mil": {
    slug: "pix-10-mil",
    title: "PIX de R$ 10.000",
    shortDescription:
      "Campanha de entendimento imediato, prêmio simples de comunicar e excelente desempenho para entrada rápida de participantes.",
    heroTitle: "CONCORRA A R$ 10.000 NO PIX E PARTICIPE AGORA.",
    heroDescription:
      "Prêmio direto, simples de entender e muito forte para decisão rápida. Escolha seus números, pague no PIX e acompanhe tudo com transparência.",
    heroBadge: "Entrada fácil",
    drawDateLabel: "14/05/2026 às 19:00",
    pricePerNumber: "R$ 0,99",
    totalNumbers: "15.000 números",
    mainPrizeTitle: "PIX de R$ 10.000",
    mainPrizeDescription:
      "Uma campanha de forte apelo comercial, fácil de comunicar e excelente para acelerar entrada de novos participantes.",
    prizeValueLabel: "Prêmio direto e fácil de entender",
    deliveryLabel: "Pagamento validado após apuração",
    regulationLabel: "Campanha com critérios claros",
    supportLabel: "Suporte para dúvidas e pedidos",
    trustPills: [
      "Baixa barreira de entrada",
      "Prêmio direto",
      "PIX rápido",
      "Compra objetiva",
    ],
    highlights: [
      {
        label: "Prêmio principal",
        value: "R$ 10.000 no PIX",
      },
      {
        label: "Valor por número",
        value: "R$ 0,99",
      },
      {
        label: "Data do sorteio",
        value: "14/05/2026 às 19:00",
      },
      {
        label: "Disponibilidade",
        value: "15.000 números",
      },
    ],
    secondaryPrizes: [
      "Prêmio de entendimento imediato",
      "Excelente campanha para entrada rápida",
      "Oferta direta com forte apelo comercial",
    ],
    packages: [
      {
        title: "Pacote Entrada",
        quantity: 20,
        originalPrice: "R$ 19,80",
        price: "R$ 17,90",
        discount: "9%",
        unitPrice: "R$ 0,89",
        description:
          "Pacote pensado para dar entrada acessível e ainda melhorar custo por número.",
        cta: "QUERO 20 NÚMEROS",
      },
      {
        title: "Pacote Aceleração",
        quantity: 50,
        originalPrice: "R$ 49,50",
        price: "R$ 39,90",
        discount: "19%",
        unitPrice: "R$ 0,79",
        description:
          "Excelente equilíbrio entre volume, custo e chance de cobertura maior na campanha.",
        cta: "QUERO 50 NÚMEROS",
        badge: "Mais vendido",
      },
      {
        title: "Pacote Forte",
        quantity: 120,
        originalPrice: "R$ 118,80",
        price: "R$ 89,90",
        discount: "24%",
        unitPrice: "R$ 0,74",
        description:
          "Para quem quer entrar pesado, reduzir custo médio e aumentar a força de participação.",
        cta: "QUERO 120 NÚMEROS",
      },
    ],
    testimonials: [
      {
        title: "Muito fácil de entender",
        text: "Prêmio em PIX é direto ao ponto e a pessoa entende rápido o valor da campanha.",
        author: "Fernanda, São Bernardo/SP",
      },
      {
        title: "Boa entrada para novos participantes",
        text: "O valor por número é acessível e isso ajuda muito quem está entrando pela primeira vez.",
        author: "Mateus, Campinas/SP",
      },
      {
        title: "Excelente apelo comercial",
        text: "Quando o prêmio é em dinheiro, a oferta fica simples e muito forte.",
        author: "Silvia, São Paulo/SP",
      },
    ],
    faq: [
      {
        question: "Por que essa campanha converte bem?",
        answer:
          "Porque o prêmio é direto, fácil de entender e tem baixa barreira de entrada, o que ajuda muito na decisão de participação.",
      },
      {
        question: "Como acompanho meu pedido?",
        answer:
          "Depois de concluir o pagamento, o participante acompanha o status e as confirmações no painel.",
      },
      {
        question: "O resultado é divulgado com transparência?",
        answer:
          "Sim. A campanha precisa manter critérios públicos de apuração e divulgação do resultado.",
      },
    ],
    seoTitle: "PIX de R$ 10.000 | Bigode das Rifas",
    seoDescription:
      "Participe da campanha PIX de R$ 10.000, escolha seus números e pague com rapidez no PIX.",
  },
};

export function getRaffleContent(slug: string) {
  return rafflesContent[slug] ?? null;
}

export function getAllRaffleSlugs() {
  return Object.keys(rafflesContent);
}

export function getAllRaffles() {
  return Object.values(rafflesContent);
}