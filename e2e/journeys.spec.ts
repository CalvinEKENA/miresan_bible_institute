import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, username: string) {
  await page.goto("/connexion");
  await page.getByLabel("Identifiant").fill(username);
  await page.getByLabel("Mot de passe", { exact: true }).fill("demo2026");
  await page.getByRole("button", { name: "Se connecter" }).click();
}

test.describe("site public", () => {
  test("la page d'accueil présente l'Institut et sa devise", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Institut");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Miresan");
    await expect(page.getByText("Commencer ma formation")).toBeVisible();
    await expect(page.locator("#programme")).toContainText("Introduction à la Bible");
    await expect(page.locator("body")).not.toContainText(/affiliation obtenue|accrédité par/i);
  });

  test("aucun défilement horizontal", async ({ page }) => {
    for (const path of ["/", "/programme", "/connexion"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(1);
    }
  });

  test("le programme liste les 36 enseignements", async ({ page }) => {
    await page.goto("/programme");
    await expect(page.locator("section[aria-labelledby^='annee'] ol > li")).toHaveCount(36);
  });
});

test.describe("connexion", () => {
  test("refuse un mauvais mot de passe", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByLabel("Identifiant").fill("etudiant.demo");
    await page.getByLabel("Mot de passe", { exact: true }).fill("mauvais");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("Identifiant ou mot de passe incorrect.")).toBeVisible();
  });

  test("protège le campus", async ({ page }) => {
    await page.goto("/campus");
    await expect(page).toHaveURL(/\/connexion\?suite=%2Fcampus/);
  });
});

test.describe("parcours étudiant", () => {
  test("tableau de bord, leçon et quiz", async ({ page }) => {
    await signIn(page, "etudiant.demo");
    await expect(page).toHaveURL(/\/campus$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Esther");
    await page.getByRole("link", { name: /Reprendre la lecture/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("L’inspiration des Écritures");
    await expect(page.getByText("2 Timothée 3:16-17").first()).toBeVisible();

    await page.goto("/campus/evaluations/quiz-a1-01-l2");
    await page.getByLabel("inspirée de Dieu").check();
    await page.getByRole("button", { name: /Suivante/ }).click();
    await expect(page.getByText("Plusieurs réponses possibles")).toBeVisible();
  });

  test("un étudiant ne peut pas ouvrir l'administration", async ({ page }) => {
    await signIn(page, "etudiant.demo");
    await expect(page).toHaveURL(/\/campus$/);
    await page.goto("/admin");
    await expect(page.getByText("Cet espace ne correspond pas à votre profil.")).toBeVisible();
  });
});

test.describe("direction", () => {
  test("accueille le Fondateur et signale les points à confirmer", async ({ page }) => {
    await signIn(page, "direction.demo");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Pasteur Armel");
    await expect(page.getByText("Répartition des cours par trimestre provisoire")).toBeVisible();
    await page.goto("/admin/parametres");
    await expect(page.getByLabel("Adresse e-mail").first()).toHaveValue("ibmiresan@gmail.com");
    await expect(page.getByText("Points à confirmer")).toBeVisible();
  });
});
