/**
 * IB-MIRESAN — Cloud Functions (2e génération, europe-west1).
 *
 * Toute opération sensible passe par ici : attribution de rôles (custom claims),
 * création de comptes, réinitialisation de mot de passe, correction des
 * évaluations et journal d'audit. La logique de domaine est partagée avec
 * l'application (functions/src/shared ← src/domain, copiée au build).
 */
import { randomInt } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentWritten, onDocumentWrittenWithAuthContext } from "firebase-functions/v2/firestore";
import { HttpsError, onCall, type CallableRequest } from "firebase-functions/v2/https";
import { summarizeAttendance } from "./shared/attendance";
import { identifierToAuthEmail, isValidUsername, normalizeUsername } from "./shared/identity";
import { gradeAttempt } from "./shared/quiz";
import { canAssignRole, isRole, isStaff, type Role } from "./shared/roles";
import { type AnswerValue, type Assessment, type AssessmentKey, type AttendanceSession, type InstitutionSettings } from "./shared/types";

initializeApp();
setGlobalOptions({ region: "europe-west1", maxInstances: 10 });

const db = getFirestore();
const IDENTITY_DOMAIN = process.env.IDENTITY_DOMAIN ?? "id.miresan-bible-institute.app";

function actorRole(request: CallableRequest): Role {
  if (!request.auth) throw new HttpsError("unauthenticated", "Connexion requise.");
  const role = request.auth.token.role;
  if (!isRole(role)) throw new HttpsError("permission-denied", "Aucun rôle attribué.");
  return role;
}

async function audit(action: string, actorUid: string, target: Record<string, unknown>) {
  await db.collection("auditLogs").add({ action, actorUid, target, at: FieldValue.serverTimestamp() });
}

/** Mot de passe provisoire lisible (sans caractères ambigus). */
function temporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

/* ── Rôles ────────────────────────────────────────────────────────────── */

export const setUserRole = onCall<{ uid: string; role: string }>(async (request) => {
  const actor = actorRole(request);
  const { uid, role } = request.data ?? {};
  if (!uid || !isRole(role)) throw new HttpsError("invalid-argument", "Paramètres invalides.");
  if (uid === request.auth!.uid) throw new HttpsError("permission-denied", "Impossible de modifier son propre rôle.");
  if (!canAssignRole(actor, role)) throw new HttpsError("permission-denied", "Rôle non attribuable depuis votre profil.");

  const user = await getAuth().getUser(uid);
  const current = user.customClaims?.role;
  // On ne rétrograde pas un compte de rang supérieur ou égal au sien.
  if (isRole(current) && !canAssignRole(actor, current) && actor !== "super_admin") {
    throw new HttpsError("permission-denied", "Ce compte relève d'un niveau supérieur.");
  }
  await getAuth().setCustomUserClaims(uid, { ...user.customClaims, role });
  await getAuth().revokeRefreshTokens(uid); // la nouvelle autorisation s'applique à la prochaine connexion
  await db.doc(`users/${uid}`).set({ role }, { merge: true });
  await audit("role.set", request.auth!.uid, { uid, from: current ?? null, to: role });
  return { ok: true };
});

/* ── Comptes ─────────────────────────────────────────────────────────── */

interface CreateAccountInput {
  username: string;
  firstName: string;
  lastName: string;
  title?: string;
  role: string;
  programId?: string;
  level?: number;
  cohortId?: string;
}

export const createUserAccount = onCall<CreateAccountInput>(async (request) => {
  const actor = actorRole(request);
  const input = request.data;
  const username = normalizeUsername(input?.username ?? "");
  if (!isValidUsername(username) || !input.firstName || !isRole(input.role)) throw new HttpsError("invalid-argument", "Paramètres invalides.");
  // Le secrétariat crée étudiants et enseignants ; la direction peut créer le personnel de rang inférieur.
  const allowed =
    (actor === "academic_secretariat" && (input.role === "student" || input.role === "teacher")) || canAssignRole(actor, input.role);
  if (!allowed) throw new HttpsError("permission-denied", "Création non autorisée pour ce rôle.");

  const password = temporaryPassword();
  const displayName = `${input.firstName} ${input.lastName}`.trim();
  const user = await getAuth()
    .createUser({ email: identifierToAuthEmail(username, IDENTITY_DOMAIN), password, displayName, emailVerified: true })
    .catch((e: { code?: string }) => {
      if (e.code === "auth/email-already-exists") throw new HttpsError("already-exists", "Cet identifiant est déjà utilisé.");
      throw e;
    });
  await getAuth().setCustomUserClaims(user.uid, { role: input.role });
  await db.doc(`users/${user.uid}`).set({
    uid: user.uid,
    username,
    displayName,
    firstName: input.firstName,
    lastName: input.lastName,
    ...(input.title ? { title: input.title } : {}),
    role: input.role,
    ...(input.programId ? { programId: input.programId, level: input.level ?? 1, cohortId: input.cohortId ?? null } : {}),
    status: "active",
    mustChangePassword: true,
    createdAt: new Date().toISOString(),
  });
  await audit("user.create", request.auth!.uid, { uid: user.uid, username, role: input.role });
  // Le mot de passe provisoire est remis en main propre ; il n'est stocké nulle part.
  return { uid: user.uid, username, temporaryPassword: password };
});

export const resetUserPassword = onCall<{ uid: string }>(async (request) => {
  const actor = actorRole(request);
  if (!["super_admin", "founder", "director", "academic_secretariat"].includes(actor)) throw new HttpsError("permission-denied", "Action réservée au secrétariat.");
  const uid = request.data?.uid;
  if (!uid) throw new HttpsError("invalid-argument", "Compte manquant.");
  const target = await getAuth().getUser(uid);
  const targetRole = target.customClaims?.role;
  if (isRole(targetRole) && isStaff(targetRole) && !canAssignRole(actor, targetRole)) throw new HttpsError("permission-denied", "Compte de rang supérieur.");
  const password = temporaryPassword();
  await getAuth().updateUser(uid, { password });
  await getAuth().revokeRefreshTokens(uid);
  await db.doc(`users/${uid}`).set({ mustChangePassword: true }, { merge: true });
  await audit("user.password_reset", request.auth!.uid, { uid });
  return { temporaryPassword: password };
});

/* ── Évaluations : correction côté serveur ───────────────────────────── */

export const submitAttempt = onCall<{ assessmentId: string; answers: Record<string, AnswerValue> }>(async (request) => {
  actorRole(request);
  const { assessmentId, answers } = request.data ?? {};
  if (!assessmentId || typeof answers !== "object") throw new HttpsError("invalid-argument", "Soumission invalide.");
  const [assessmentSnap, keySnap] = await Promise.all([db.doc(`assessments/${assessmentId}`).get(), db.doc(`assessmentKeys/${assessmentId}`).get()]);
  const assessment = assessmentSnap.data() as Assessment | undefined;
  if (!assessment || assessment.status !== "published") throw new HttpsError("not-found", "Évaluation indisponible.");
  const now = new Date().toISOString();
  if ((assessment.opensAt && now < assessment.opensAt) || (assessment.closesAt && now > assessment.closesAt)) throw new HttpsError("failed-precondition", "Évaluation fermée.");

  const uid = request.auth!.uid;
  if (assessment.maxAttempts > 0) {
    const previous = await db.collection("attempts").where("uid", "==", uid).where("assessmentId", "==", assessmentId).count().get();
    if (previous.data().count >= assessment.maxAttempts) throw new HttpsError("resource-exhausted", "Nombre maximal de tentatives atteint.");
  }
  const key = (keySnap.data() as AssessmentKey | undefined)?.answers ?? {};
  const result = gradeAttempt(assessment.questions, key, answers);
  await db.collection("attempts").add({
    assessmentId,
    courseId: assessment.courseId,
    uid,
    answers,
    score: result.pendingManual ? null : result.score,
    maxScore: result.maxScore,
    pendingManual: result.pendingManual,
    submittedAt: now,
  });
  return result;
});

/* ── Journal d'audit (données sensibles) ─────────────────────────────── */

function auditTrigger(collection: "grades" | "payments") {
  return onDocumentWrittenWithAuthContext(`${collection}/{id}`, async (event) => {
    const before = event.data?.before.data() ?? null;
    const after = event.data?.after.data() ?? null;
    await db.collection("auditLogs").add({
      action: `${collection}.${!before ? "create" : !after ? "delete" : "update"}`,
      actorUid: event.authId ?? null,
      target: { collection, id: event.params.id },
      before,
      after,
      at: FieldValue.serverTimestamp(),
    });
  });
}

export const auditGrades = auditTrigger("grades");
export const auditPayments = auditTrigger("payments");

/* ── Résumés d'assiduité : l'étudiant ne lit jamais la feuille complète ── */

export const summarizeAttendanceOnWrite = onDocumentWritten("attendance/{sessionId}", async (event) => {
  const session = (event.data?.after.data() ?? event.data?.before.data()) as AttendanceSession | undefined;
  if (!session) return;
  const [course, settings, sessions] = await Promise.all([
    db.doc(`courses/${session.courseId}`).get(),
    db.doc("settings/institution").get(),
    db.collection("attendance").where("courseId", "==", session.courseId).get(),
  ]);
  const level = course.data()?.level ?? 1;
  const policy = (settings.data() as InstitutionSettings | undefined)?.attendance;
  const students = await db.collection("users").where("role", "==", "student").where("level", "==", level).get();
  const all = sessions.docs.map((d) => d.data() as AttendanceSession);
  const batch = db.batch();
  for (const s of students.docs) {
    const summary = summarizeAttendance(all, s.id, policy);
    batch.set(db.doc(`attendanceSummaries/${s.id}`), { [session.courseId]: summary, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  await batch.commit();
});
