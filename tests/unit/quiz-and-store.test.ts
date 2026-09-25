import { describe, expect, it } from "vitest";
import { tokenize, highlightRanges, plainText } from "@/components/study/inline";
import { DEMO_QUIZ, DEMO_QUIZ_KEY } from "@/data/demo/lessons";
import { buildDemoSeed, nextSlot } from "@/data/demo/seed";
import { DemoStore } from "@/data/store/demo-store";
import { applyQuery } from "@/data/store/query";
import { gradeAttempt, normalizeText } from "@/domain/quiz";

describe("moteur de quiz", () => {
  it("corrige un sans-faute sur 20 et laisse la réflexion à l'enseignant", () => {
    const result = gradeAttempt(DEMO_QUIZ.questions, DEMO_QUIZ_KEY.answers, {
      q1: "a",
      q2: ["a", "b", "d", "e"],
      q3: "true",
      q4: "Lumière",
      q5: ["gen", "exo", "lev", "num"],
      q6: { gen: "pent", act: "hist", rom: "ep", ps: "poet" },
      q7: "Parce que…",
    });
    expect(result.pendingManual).toBe(1);
    expect(result.score).toBe(16);
    expect(result.on20).toBeNull();
  });

  it("accorde un crédit partiel sans jamais devenir négatif", () => {
    const q = DEMO_QUIZ.questions.find((x) => x.id === "q2")!;
    const partial = gradeAttempt([q], DEMO_QUIZ_KEY.answers, { q2: ["a", "b"] });
    expect(partial.score).toBe(2);
    const wrong = gradeAttempt([q], DEMO_QUIZ_KEY.answers, { q2: ["c"] });
    expect(wrong.score).toBe(0);
    expect(wrong.on20).toBe(0);
  });

  it("tolère accents et casse pour les versets à compléter", () => {
    expect(normalizeText("  LUMIÈRE ")).toBe("lumiere");
  });
});

describe("DemoStore", () => {
  it("interroge le seed avec une sémantique proche de Firestore", async () => {
    const store = new DemoStore(buildDemoSeed(new Date("2026-10-01T10:00:00Z")));
    const y1 = await store.list("courses", { where: [["level", "==", 1]], orderBy: ["order", "desc"], limit: 3 });
    expect(y1.map((c) => c.order)).toEqual([18, 17, 16]);
    const grades = await store.list("grades", { where: [["uid", "==", "demo-student"], ["published", "==", true]] });
    expect(grades.length).toBeGreaterThan(0);
    await store.update("courses", "a1-01", { title: "Titre modifié" });
    expect((await store.get("courses", "a1-01"))?.title).toBe("Titre modifié");
  });

  it("ne contient aucun mot de passe réel ni compte réel", () => {
    const seed = buildDemoSeed();
    const users = Object.values(seed.users ?? {});
    expect(users.every((u) => u.demo)).toBe(true);
    expect(users.some((u) => u.username === "pasteurarmel")).toBe(false);
    expect(JSON.stringify(seed)).not.toMatch(/SEUWO\d/);
  });

  it("applique in / array-contains", () => {
    const docs = [{ a: 1, t: ["x"] }, { a: 2, t: ["y"] }, { a: 3, t: ["x", "y"] }];
    expect(applyQuery(docs, { where: [["a", "in", [1, 3]]] })).toHaveLength(2);
    expect(applyQuery(docs, { where: [["t", "array-contains", "y"]] })).toHaveLength(2);
  });
});

describe("calendrier démo", () => {
  it("calcule la prochaine séance hebdomadaire (heure de Yaoundé)", () => {
    const thursday = { id: "thu", weekday: 4, start: "15:00", end: "20:30" };
    const { start } = nextSlot(thursday, new Date("2026-09-25T09:00:00Z")); // vendredi
    expect(start.toISOString()).toBe("2026-10-01T14:00:00.000Z");
  });
});

describe("texte enrichi du Study Mode", () => {
  it("découpe gras et italique", () => {
    expect(tokenize("un **mot** et *un autre*").map((t) => [t.text, t.bold, t.italic])).toEqual([
      ["un ", false, false],
      ["mot", true, false],
      [" et ", false, false],
      ["un autre", false, true],
    ]);
    expect(plainText("*theopneustos* signifie")).toBe("theopneustos signifie");
  });
  it("positionne un surlignage sur le texte visible", () => {
    const plain = plainText("Le mot grec (*theopneustos*) signifie");
    expect(highlightRanges(plain, [{ id: "h", text: "theopneustos) signifie" }])).toEqual([{ start: 13, end: 35, id: "h" }]);
  });
});
