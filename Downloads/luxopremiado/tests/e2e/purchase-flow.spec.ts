import { expect, test } from "@playwright/test";

const hasCredentials = Boolean(process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD);

test.describe("Funil de compra (sem pagamento)", () => {
  test.skip(!hasCredentials, "Defina E2E_USER_EMAIL e E2E_USER_PASSWORD para executar o fluxo completo.");

  test("login -> reserva -> atualização de status", async ({ page }) => {
    await page.goto("/login?next=/app/comprar");

    await page.getByPlaceholder("Seu e-mail").fill(String(process.env.E2E_USER_EMAIL));
    await page.getByPlaceholder("Sua senha").fill(String(process.env.E2E_USER_PASSWORD));
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/app\/comprar/);
    await expect(page.getByRole("heading", { name: /escolher números/i })).toBeVisible();

    const randomReserveButton = page.getByRole("button", { name: /reservar 5 aleatórios/i });
    await randomReserveButton.click();

    await expect(
      page.getByText(/reserva criada|checkout ativo encontrado|checkout restaurado/i),
    ).toBeVisible({ timeout: 20_000 });

    const refreshStatusButton = page.getByRole("button", { name: /atualizar status/i });
    await refreshStatusButton.click();
    await expect(page.getByText(/status do pedido|pagamento confirmado|reserva expirada/i)).toBeVisible({
      timeout: 20_000,
    });
  });
});
