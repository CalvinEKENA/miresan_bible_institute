import { type Grade, type GradingPolicy } from "./types";

export const DEFAULT_GRADING: GradingPolicy = {
  scale: 20,
  passMark: 10,
  continuousWeight: 0.4,
  examWeight: 0.6,
  allowResit: true,
  mentions: [
    { min: 16, label: "Très bien" },
    { min: 14, label: "Bien" },
    { min: 12, label: "Assez bien" },
    { min: 10, label: "Passable" },
  ],
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Moyenne d'une matière : CC × poids + examen × poids.
 * - Si une seule composante existe, elle compte seule (évaluation partielle).
 * - La note de rattrapage remplace la moyenne si elle est meilleure (plafonnée à la note de passage
 *   lorsque la politique l'exige — non imposé par le règlement actuel).
 */
export function courseAverage(
  grade: Pick<Grade, "continuous" | "exam" | "resit">,
  policy: GradingPolicy = DEFAULT_GRADING,
): number | null {
  const { continuous, exam, resit } = grade;
  let base: number | null;
  if (continuous != null && exam != null) {
    const total = policy.continuousWeight + policy.examWeight || 1;
    base = (continuous * policy.continuousWeight + exam * policy.examWeight) / total;
  } else {
    base = continuous ?? exam ?? null;
  }
  if (base == null) return resit ?? null;
  if (policy.allowResit && resit != null && resit > base) return round2(resit);
  return round2(base);
}

export function isValidated(average: number | null, policy: GradingPolicy = DEFAULT_GRADING): boolean {
  return average != null && average >= policy.passMark;
}

export function mention(average: number | null, policy: GradingPolicy = DEFAULT_GRADING): string | null {
  if (average == null) return null;
  const sorted = [...policy.mentions].sort((a, b) => b.min - a.min);
  return sorted.find((m) => average >= m.min)?.label ?? "Non validé";
}

/** Moyenne générale (non pondérée par défaut ; coefficients à venir). */
export function generalAverage(averages: (number | null)[]): number | null {
  const valid = averages.filter((a): a is number => a != null);
  if (valid.length === 0) return null;
  return round2(valid.reduce((s, a) => s + a, 0) / valid.length);
}

/** Passage en année supérieure : toutes les matières du niveau doivent être validées. */
export function canProgress(averages: (number | null)[], policy: GradingPolicy = DEFAULT_GRADING): boolean {
  return averages.length > 0 && averages.every((a) => isValidated(a, policy));
}

export function validateScore(score: number, policy: GradingPolicy = DEFAULT_GRADING): boolean {
  return Number.isFinite(score) && score >= 0 && score <= policy.scale;
}
