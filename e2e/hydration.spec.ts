import { expect, test, type Page } from "@playwright/test";

/**
 * Garde-fou d'hydratation : échoue si une page importante produit une erreur
 * d'hydratation React, un écart serveur/client ou une exception non capturée.
 * - `npm run test:hydration` : serveur de développement (React y signale aussi les écarts d'attributs).
 * - `npm run test:e2e` : build de production (erreurs #418/#423/#425 et exceptions).
 */
const ROUTES: { path: string; as?: string }[] = [
  { path: "/" },
  { path: "/programme" },
  { path: "/connexion" },
  { path: "/campus", as: "demo-student" },
  { path: "/campus/cours/a1-01/a1-01-l2", as: "demo-student" },
  { path: "/campus/evaluations/quiz-a1-01-l2", as: "demo-student" },
  { path: "/enseignant", as: "demo-teacher" },
  { path: "/admin", as: "demo-admin" },
  { path: "/admin/parametres", as: "demo-admin" },
];

const HYDRATION = /hydrat|did(?:n't| not) match|server rendered (?:html|text)|Minified React error #(?:418|423|425)/i;

function collect(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(`exception : ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && HYDRATION.test(message.text())) problems.push(`hydratation : ${message.text().split("\n")[0]}`);
  });
  return problems;
}

async function visit(page: Page, path: string, as?: string) {
  if (as) {
    await page.goto("/connexion");
    await page.evaluate((uid) => localStorage.setItem("mbi-demo-session", uid), as);
  }
  await page.goto(path, { waitUntil: "networkidle" });
  await page.waitForTimeout(800); // laisse React terminer l'hydratation et les chargements différés
}

for (const route of ROUTES) {
  test(`aucune erreur d'hydratation ni exception : ${route.path}`, async ({ page }) => {
    const problems = collect(page);
    await visit(page, route.path, route.as);
    expect(problems, problems.join("\n")).toEqual([]);
  });
}

test("contrôle : le détecteur signale bien une altération du DOM avant hydratation", async ({ page }) => {
  test.skip(!process.env.HYDRATION_DEV, "React ne signale les écarts d'attributs qu'en développement");
  // Simule une extension (type Dark Reader) qui retouche les SVG avant l'hydratation.
  await page.addInitScript(() => {
    new MutationObserver(() =>
      document.querySelectorAll("svg:not([data-ext])").forEach((svg) => {
        svg.setAttribute("data-ext", "1");
        svg.setAttribute("fill", "red");
      }),
    ).observe(document, { childList: true, subtree: true });
  });
  const problems = collect(page);
  await visit(page, "/");
  expect(problems.some((p) => p.startsWith("hydratation"))).toBe(true);
});
