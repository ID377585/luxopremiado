export type NumberStatus = "available" | "reserved" | "sold";

export interface HeroData {
  title: string;
  subtitle: string;
  drawDateLabel: string;
  priceLabel: string;
  badges: string[];
  ctaLabel: string;
}

export interface PrizeFeature {
  label: string;
  value: string;
}

export interface PrizeData {
  title: string;
  description: string;
  images: string[];
  features: PrizeFeature[];
}

export interface HowItWorksStep {
  title: string;
  description: string;
}

export interface NumberTile {
  number: number;
  status: NumberStatus;
}

export interface CheckoutMethod {
  name: string;
  description: string;
}

export interface PackageOffer {
  id: string;
  name: string;
  quantity: number;
  totalCents: number;
  badge?: string;
  description: string;
  highlight?: boolean;
}

export interface CampaignStats {
  availableNumbers: number;
  reservedNumbers: number;
  soldNumbers: number;
  averagePerUser: number;
}

export interface BuyerRankingEntry {
  position: number;
  participant: string;
  totalNumbers: number;
  trendDelta?: number;
}

export interface TransparencyData {
  drawMethod: string;
  organizer: string;
  organizerDoc: string;
  contact: string;
  rulesSummary: string;
}

export interface SocialProofEntry {
  title: string;
  content: string;
  author: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RaffleLandingData {
  raffleId: string | null;
  slug: string;
  totalNumbers: number;
  maxNumbersPerUser: number;
  hero: HeroData;
  prize: PrizeData;
  howItWorks: HowItWorksStep[];
  numberTiles: NumberTile[];
  buyerRanking: BuyerRankingEntry[];
  packages: PackageOffer[];
  stats: CampaignStats;
  checkoutMethods: CheckoutMethod[];
  transparency: TransparencyData;
  socialProof: SocialProofEntry[];
  faq: FaqItem[];
}
