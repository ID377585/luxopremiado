import { afterEach, describe, expect, it } from "vitest";

import {
  buildLandingPathForSlug,
  canonicalizeRaffleSlug,
  getDefaultRaffleSlug,
  isDefaultRaffleSlug,
} from "@/lib/raffle-slug";

const originalDefaultSlug = process.env.NEXT_PUBLIC_DEFAULT_RAFFLE_SLUG;

describe("raffle slug helpers", () => {
  afterEach(() => {
    if (typeof originalDefaultSlug === "string") {
      process.env.NEXT_PUBLIC_DEFAULT_RAFFLE_SLUG = originalDefaultSlug;
      return;
    }

    delete process.env.NEXT_PUBLIC_DEFAULT_RAFFLE_SLUG;
  });

  it("usa bigode-das-rifas como slug padrão público", () => {
    delete process.env.NEXT_PUBLIC_DEFAULT_RAFFLE_SLUG;

    expect(getDefaultRaffleSlug()).toBe("bigode-das-rifas");
  });

  it("canoniza o slug legado para a URL pública nova", () => {
    process.env.NEXT_PUBLIC_DEFAULT_RAFFLE_SLUG = "luxo-premiado";

    expect(canonicalizeRaffleSlug("luxo-premiado")).toBe("bigode-das-rifas");
    expect(getDefaultRaffleSlug()).toBe("bigode-das-rifas");
    expect(buildLandingPathForSlug("luxo-premiado", "inicio")).toBe("/r/bigode-das-rifas#inicio");
  });

  it("aceita o slug antigo como alias do padrão atual", () => {
    expect(isDefaultRaffleSlug("luxo-premiado")).toBe(true);
    expect(isDefaultRaffleSlug("bigode-das-rifas")).toBe(true);
  });
});
