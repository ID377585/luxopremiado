import { describe, expect, it } from "vitest";

import {
  calculateVipPointBreakdown,
  calculateVipPoints,
  calculateVipXpProgress,
  getVipPrestigeBenefit,
  getVipPrestigeLevel,
  resolveVipAccess,
} from "@/lib/vip";

describe("VIP rules", () => {
  it("bloqueia acesso quando o usuário não é afiliado ativo", () => {
    const result = resolveVipAccess({
      affiliateActive: false,
      manualOverride: false,
      manualTier: "none",
      persistedPoints: 0,
      raffleSpendCents: 500000,
      auctionSpendCents: 300000,
      approvedCommissionCents: 0,
      referredOrders: 0,
    });

    expect(result.access).toBe(false);
    expect(result.effectiveTier).toBe("none");
    expect(result.lockedReason).toContain("afiliado");
  });

  it("libera VIP automaticamente para afiliado com pontuação suficiente", () => {
    const result = resolveVipAccess({
      affiliateActive: true,
      manualOverride: false,
      manualTier: "none",
      persistedPoints: 0,
      raffleSpendCents: 150000,
      auctionSpendCents: 50000,
      partnerInvestmentCents: 600000,
      referredPartnerSpendCents: [200000, 200000, 200000],
      approvedCommissionCents: 0,
      referredOrders: 3,
    });

    expect(calculateVipPoints({
      raffleSpendCents: 150000,
      auctionSpendCents: 50000,
      partnerInvestmentCents: 600000,
    })).toBe(8000);
    expect(result.access).toBe(true);
    expect(result.effectiveTier).toBe("vip");
    expect(result.effectiveLabel).toBe("VIP");
  });

  it("detalha o breakdown de pontos por origem", () => {
    const breakdown = calculateVipPointBreakdown({
      raffleSpendCents: 12500,
      auctionSpendCents: 20999,
      partnerInvestmentCents: 333300,
    });

    expect(breakdown.rafflePoints).toBe(125);
    expect(breakdown.auctionPoints).toBe(209);
    expect(breakdown.networkPoints).toBe(3333);
    expect(breakdown.automaticPoints).toBe(3667);
  });

  it("respeita override manual para liberar a área", () => {
    const result = resolveVipAccess({
      affiliateActive: false,
      manualOverride: true,
      manualTier: "elite",
      persistedPoints: 100,
      raffleSpendCents: 0,
      auctionSpendCents: 0,
      partnerInvestmentCents: 0,
      approvedCommissionCents: 0,
      referredOrders: 0,
    });

    expect(result.access).toBe(true);
    expect(result.effectiveTier).toBe("elite");
    expect(result.nextTier).toBeNull();
  });

  it("só libera VIP Elite quando há 20 mil pontos e três convidados com 5 mil cada", () => {
    const result = resolveVipAccess({
      affiliateActive: true,
      manualOverride: false,
      manualTier: "none",
      persistedPoints: 0,
      raffleSpendCents: 350000,
      auctionSpendCents: 150000,
      partnerInvestmentCents: 1500000,
      referredPartnerSpendCents: [500000, 500000, 500000],
      approvedCommissionCents: 0,
      referredOrders: 6,
    });

    expect(result.access).toBe(true);
    expect(result.effectiveTier).toBe("elite");
    expect(result.effectiveLabel).toBe("VIP Elite");
  });

  it("resolve o nível de prestígio correto dentro da trilha", () => {
    expect(getVipPrestigeLevel(6800).label).toBe("Ouro");
    expect(getVipPrestigeLevel(23000).label).toBe("Diamante");
  });

  it("converte gasto em XP usando 10 XP por real", () => {
    const progress = calculateVipXpProgress(100);

    expect(progress.totalXp).toBe(10);
    expect(progress.currentLevel.id).toBe("base");
  });

  it("gera benefícios específicos por nível de prestígio", () => {
    const benefit = getVipPrestigeBenefit("diamante");

    expect(benefit.cashbackPercent).toBeGreaterThanOrEqual(22);
    expect(benefit.purchaseDiscountPercent).toBeGreaterThan(0);
    expect(benefit.freeSpins).toBeGreaterThan(0);
    expect(benefit.benefits.length).toBeGreaterThan(5);
  });
});
