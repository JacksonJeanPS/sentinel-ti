import { test, expect } from "@playwright/test";
test("landing e autenticação são acessíveis", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Investigue indicadores",
  );
  await page.getByRole("link", { name: "Entrar", exact: true }).first().click();
  await expect(
    page.getByRole("heading", { name: "Acesse sua conta" }),
  ).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeVisible();
});
