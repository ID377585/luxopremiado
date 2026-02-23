import { RaffleLandingData, NumberTile } from "@/types/raffle";

function buildNumberTiles(total: number): NumberTile[] {
  return Array.from({ length: total }, (_, index) => {
    const number = index + 1;

    if (number % 9 === 0) {
      return { number, status: "sold" };
    }

    if (number % 5 === 0) {
      return { number, status: "reserved" };
    }

    return { number, status: "available" };
  });
}

export const fallbackRaffleData: RaffleLandingData = {
  slug: "luxo-premiado",
  hero: {
    title: "Luxo Premiado",
    subtitle:
      "Concorra a um Jeep Compass Série S 0km com sorteio público e números rastreáveis.",
    drawDateLabel: "Sorteio: 30/04/2026 às 19:00",
    priceLabel: "R$ 19,90 por número",
    badges: ["PIX imediato", "Sorteio auditável", "Suporte 7 dias"],
    ctaLabel: "Escolher números",
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
      description: "Cadastro rápido com e-mail e senha para acompanhar seus pedidos.",
    },
    {
      title: "2. Selecione os números",
      description:
        "Escolha números específicos ou use seleção aleatória inteligente.",
    },
    {
      title: "3. Finalize pagamento",
      description: "Pague por PIX ou cartão e receba confirmação automática.",
    },
    {
      title: "4. Acompanhe o sorteio",
      description: "Veja resultado, auditoria e histórico no painel do usuário.",
    },
  ],
  numberTiles: buildNumberTiles(120),
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
      title: "Entrega registrada",
      content:
        "Recebi meu prêmio sem dor de cabeça, com toda documentação pronta e transmissão ao vivo.",
      author: "Marina, Salvador/BA",
    },
    {
      title: "Compra simples",
      content:
        "Escolhi meus números no celular e paguei no PIX em menos de 2 minutos.",
      author: "Rodrigo, Campinas/SP",
    },
    {
      title: "Plataforma confiável",
      content:
        "Curti a transparência do sorteio e o histórico de ganhadores no próprio site.",
      author: "Leila, Recife/PE",
    },
  ],
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
  ],
};
