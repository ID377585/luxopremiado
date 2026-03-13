import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/env", () => ({
  getSiteUrl: () => "https://luxopremiado.vercel.app",
  hasSupabaseEnv: () => true,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { forgotPasswordAction } from "@/lib/actions/auth";

describe("forgotPasswordAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("normaliza rate limit do Supabase para mensagem amigável", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        resetPasswordForEmail: vi.fn(async () => ({
          error: {
            message: "For security purposes, you can only request this after 60 seconds.",
          },
        })),
      },
    } as never);

    const form = new FormData();
    form.set("email", "recovery.contas.mail@gmail.com");

    await expect(forgotPasswordAction(form)).rejects.toThrow(
      "NEXT_REDIRECT:/recuperar-senha?error=Muitas%20tentativas.%20Aguarde%20cerca%20de%2060%20segundos%20e%20tente%20de%20novo.",
    );
  });
});
