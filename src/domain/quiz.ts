import { type AnswerKey, type AnswerValue, type Question, type QuestionType } from "./types";

/** Types corrigés automatiquement ; les autres attendent une correction humaine. */
export const AUTO_GRADED: ReadonlySet<QuestionType> = new Set([
  "single",
  "multiple",
  "true_false",
  "short_text",
  "verse_completion",
  "ordering",
  "matching",
]);

export const normalizeText = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’'`]/g, "'")
    .replace(/[^\p{L}\p{N}' ]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export interface QuestionResult {
  questionId: string;
  earned: number | null; // null = correction manuelle
  max: number;
  correct: boolean | null;
}

export function gradeQuestion(question: Question, key: AnswerKey | undefined, answer: AnswerValue | undefined): QuestionResult {
  const base = { questionId: question.id, max: question.points };
  if (!AUTO_GRADED.has(question.type) || !key) return { ...base, earned: null, correct: null };
  if (answer == null) return { ...base, earned: 0, correct: false };

  let correct = false;
  let earned = 0;
  switch (key.type) {
    case "single":
    case "true_false":
      correct = answer === key.optionId;
      earned = correct ? question.points : 0;
      break;
    case "multiple": {
      const given = new Set(Array.isArray(answer) ? answer : []);
      const expected = new Set(key.optionIds);
      const hits = [...given].filter((id) => expected.has(id)).length;
      const wrong = given.size - hits;
      correct = hits === expected.size && wrong === 0;
      // Crédit partiel : bonnes réponses moins mauvaises, jamais négatif.
      earned = expected.size === 0 ? 0 : Math.max(0, ((hits - wrong) / expected.size) * question.points);
      break;
    }
    case "short_text":
    case "verse_completion": {
      const value = typeof answer === "string" ? normalizeText(answer) : "";
      correct = key.accepted.some((a) => normalizeText(a) === value);
      earned = correct ? question.points : 0;
      break;
    }
    case "ordering": {
      const given = Array.isArray(answer) ? answer : [];
      correct = given.length === key.order.length && given.every((id, i) => id === key.order[i]);
      earned = correct ? question.points : 0;
      break;
    }
    case "matching": {
      const given = typeof answer === "object" && !Array.isArray(answer) ? answer : {};
      const entries = Object.entries(key.pairs);
      const hits = entries.filter(([left, right]) => given[left] === right).length;
      correct = hits === entries.length;
      earned = entries.length === 0 ? 0 : (hits / entries.length) * question.points;
      break;
    }
  }
  return { ...base, earned: Math.round(earned * 100) / 100, correct };
}

export interface AttemptResult {
  results: QuestionResult[];
  score: number;
  maxScore: number;
  pendingManual: number;
  /** Score ramené sur 20 (uniquement si tout est corrigé automatiquement). */
  on20: number | null;
}

export function gradeAttempt(
  questions: Question[],
  keys: Record<string, AnswerKey>,
  answers: Record<string, AnswerValue>,
): AttemptResult {
  const results = questions.map((q) => gradeQuestion(q, keys[q.id], answers[q.id]));
  const score = results.reduce((s, r) => s + (r.earned ?? 0), 0);
  const maxScore = results.reduce((s, r) => s + r.max, 0);
  const pendingManual = results.filter((r) => r.earned == null).length;
  return {
    results,
    score: Math.round(score * 100) / 100,
    maxScore,
    pendingManual,
    on20: pendingManual === 0 && maxScore > 0 ? Math.round((score / maxScore) * 20 * 100) / 100 : null,
  };
}
