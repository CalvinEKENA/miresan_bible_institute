import { getStore } from "./store";
import { DATA_MODE } from "@/lib/env";
import { gradeAttempt, type AttemptResult } from "@/domain/quiz";
import { type AnswerValue, type Assessment, type Attempt } from "@/domain/types";

/**
 * Soumission d'une tentative.
 * - Démo : correction locale (le corrigé est dans le seed).
 * - Firebase : Cloud Function `submitAttempt` (le corrigé `assessmentKeys/*` n'est
 *   jamais lisible par un étudiant ; la note est calculée et écrite côté serveur).
 */
export async function submitAttempt(uid: string, assessment: Assessment, answers: Record<string, AnswerValue>): Promise<AttemptResult> {
  if (DATA_MODE === "firebase") {
    const [{ getFunctions, httpsCallable }, { firebaseApp }] = await Promise.all([import("firebase/functions"), import("@/lib/firebase/client")]);
    const call = httpsCallable<{ assessmentId: string; answers: Record<string, AnswerValue> }, AttemptResult>(getFunctions(firebaseApp(), "europe-west1"), "submitAttempt");
    const { data } = await call({ assessmentId: assessment.id, answers });
    return data;
  }
  const store = await getStore();
  const key = await store.get("assessmentKeys", assessment.id);
  const result = gradeAttempt(assessment.questions, key?.answers ?? {}, answers);
  const attempt: Attempt = {
    id: `${uid}_${assessment.id}_${Date.now().toString(36)}`,
    assessmentId: assessment.id,
    uid,
    answers,
    score: result.pendingManual ? null : result.score,
    maxScore: result.maxScore,
    pendingManual: result.pendingManual,
    submittedAt: new Date().toISOString(),
  };
  await store.set("attempts", attempt.id, attempt);
  return result;
}
