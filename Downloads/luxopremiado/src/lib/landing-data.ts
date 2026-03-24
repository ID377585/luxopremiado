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
    description:
      "Entrada rápida na disputa com economia por número e confirmação mais ágil.",
    highlight: true,
  },
  {
    id: "turbo",
    name: "Pacote Turbo",
    quantity: 25,
    discountPercent: 10,
    badge: "Mais vendido",
    description:
      "Mais volume para subir no ranking e aumentar alcance no sorteio.",
  },
  {
    id: "top-ranking",
    name: "Pacote Top Ranking",
    quantity: 50,
    discountPercent: 15,
    description:
      "Foco total em posição no ranking e maior cobertura de números com melhor custo.",
  },
] as const;

function fallbackStatusForNumber(
  number: number,
): NumberTile["status"] {
  if (number % 9 === 0) return "sold";
  if (number % 5 === 0) return "reserved";
  return "available";
}

export function buildFallbackNumberTiles(params: {
  page: number;
  pageSize: number;
  totalNumbers?: number;
}): NumberTile[] {
  const totalNumbers =
    params.totalNumbers ?? FALLBACK_TOTAL_NUMBERS;
  const page = Math.max(1, params.page);
  const pageSize = Math.max(1, params.pageSize);

  const start = (page - 1) * pageSize;
  const end = Math.min(
    totalNumbers - 1,
    start + pageSize - 1,
  );

  if (start >= totalNumbers) {
    return [];
  }

  return Array.from(
    { length: end - start + 1 },
    (_, index) => {
      const number = start + index;
      return {
        number,
        status: fallbackStatusForNumber(number),
      };
    },
  );
}

export function buildPackageOffersForUnitPrice(
  unitPriceCents: number,
) {
  return packageTemplates.map((template) => {
    const { discountPercent, ...baseTemplate } = template;

    const referenceTotalCents =
      unitPriceCents * template.quantity;

    const discountMultiplier =
      (100 - discountPercent) / 100;

    const totalCents = Math.round(
      referenceTotalCents * discountMultiplier,
    );

    const savingsCents = Math.max(
      0,
      referenceTotalCents - totalCents,
    );

    return {
      ...baseTemplate,
      totalCents,
      referenceTotalCents,
      savingsCents,
      savingsPercent: discountPercent,
      pricePerNumberCents: Math.round(
        totalCents / template.quantity,
      ),
    };
  });
}

export const fallbackRaffleData: RaffleLandingData = {
  raffleId: null,
  slug: "bigode-das-rifas",
  totalNumbers: FALLBACK_TOTAL_NUMBERS,
  maxNumbersPerUser: 50,

  hero: {
    title: "SUA CHANCE DE OURO\nCOMEÇA AQUI.",
    subtitle:
      "Escolha seus números, pague no PIX e acompanhe tudo com transparência.",
    drawDateLabel: "Sorteio: 30/04/2026 às 19:00",
    priceLabel: "R$ 19,90 por número",
    badges: [
      "PIX imediato",
      "Números em tempo real",
      "Ranking de compradores",
    ],
    ctaLabel: "QUERO ESCOLHER MEUS NÚMEROS AGORA",
  },

  prize: {
    title: "Bigode das Rifas",
    description:
      "Campanha oficial com compra rápida e transparente.",
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
      description: "Cadastro rápido.",
    },
    {
      title: "2. Escolha números",
      description: "Manual ou automático.",
    },
    {
      title: "3. Pague no PIX",
      description: "Confirmação rápida.",
    },
    {
      title: "4. Acompanhe",
      description: "Sorteio auditável.",
    },
  ],

  numberTiles: buildFallbackNumberTiles({
    page: 1,
    pageSize: FALLBACK_INITIAL_PAGE_SIZE,
  }),

  buyerRanking: [
    {
      position: 1,
      participant: "Marina #A13",
      totalNumbers: 92,
      trendDelta: 2,
    },
    {
      position: 2,
      participant: "Rodrigo #BC7",
      totalNumbers: 87,
      trendDelta: -1,
    },
  ],

  packages: buildPackageOffersForUnitPrice(
    DEFAULT_UNIT_PRICE_CENTS,
  ),

  stats: {
    availableNumbers: 8412,
    reservedNumbers: 1142,
    soldNumbers: 7846,
    averagePerUser: 0,
  },

  checkoutMethods: [
    {
      name: "PIX",
      description: "Aprovação imediata.",
    },
    {
      name: "Cartão",
      description: "Parcelamento disponível.",
    },
  ],

  transparency: {
    drawMethod: "Loteria Federal",
    organizer: "Bigode das Rifas",
    organizerDoc: "CNPJ 00.000.000/0001-00",
    contact: "suporte@bigodedasrifas.com",
    rulesSummary: "Regulamento disponível antes da venda.",
  },

  socialProof: [
    {
      title: "Pagamento rápido",
      content: "PIX confirmado na hora.",
      author: "João",
      avatarUrl: "/images/social/joao.svg",
    },
  ],

  winnerWall: [
    {
      name: "Luciana",
      prize: "Carro 0km",
      city: "Fortaleza",
      mediaUrl: "/images/winners/winner-1.svg",
      mediaType: "image",
      verifiedAtLabel: "Entrega validada",
    },
  ],

  retention: {
    title: "Ative alertas",
    subtitle: "Receba notificações.",
    features: [],
    ctaPrimaryLabel: "ATIVAR",
    ctaPrimaryHref: "/area-do-usuario",
    ctaSecondaryLabel: "COMPRAR MAIS",
    ctaSecondaryHref: "/app/comprar",
  },

  faq: [
    {
      question: "Como confirmar?",
      answer: "Pagamento aprovado = confirmado.",
    },
  ],
};