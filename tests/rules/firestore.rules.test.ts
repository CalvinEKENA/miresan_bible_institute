import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

const as = (uid: string, role?: string) => env.authenticatedContext(uid, role ? { role } : {}).firestore();
const anon = () => env.unauthenticatedContext().firestore();

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-miresan",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

afterAll(async () => env?.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "settings/institution"), { name: "IB-MIRESAN" });
    await setDoc(doc(db, "settings/private"), { secret: true });
    await setDoc(doc(db, "courses/a1-01"), { title: "Introduction à la Bible", teacherIds: ["teacher1"], level: 1 });
    await setDoc(doc(db, "courses/a1-02"), { title: "Homilétique", teacherIds: [], level: 1 });
    await setDoc(doc(db, "users/student1"), { uid: "student1", username: "esther", role: "student", mustChangePassword: true });
    await setDoc(doc(db, "users/student2"), { uid: "student2", username: "paul", role: "student", mustChangePassword: false });
    await setDoc(doc(db, "grades/student1_a1-01"), { uid: "student1", courseId: "a1-01", continuous: 12, exam: 14, published: true });
    await setDoc(doc(db, "grades/student1_a1-02"), { uid: "student1", courseId: "a1-02", continuous: 9, exam: null, published: false });
    await setDoc(doc(db, "grades/student2_a1-01"), { uid: "student2", courseId: "a1-01", continuous: 15, exam: 15, published: true });
    await setDoc(doc(db, "payments/student1_registration"), { uid: "student1", amount: 15000 });
    await setDoc(doc(db, "payments/student2_registration"), { uid: "student2", amount: 15000 });
    await setDoc(doc(db, "assessments/quiz1"), { courseId: "a1-01", status: "published", questions: [] });
    await setDoc(doc(db, "assessmentKeys/quiz1"), { assessmentId: "quiz1", answers: { q1: { type: "single", optionId: "a" } } });
    await setDoc(doc(db, "attendance/a1-01-s1"), { courseId: "a1-01", marks: { student2: "absent" } });
    await setDoc(doc(db, "progress/student1_l1"), { uid: "student1", courseId: "a1-01", lessonId: "l1", percent: 40, completed: false });
    await setDoc(doc(db, "announcements/pub"), { audience: "public", title: "Rentrée" });
    await setDoc(doc(db, "announcements/staff"), { audience: "staff", title: "Conseil" });
  });
});

describe("visiteurs", () => {
  it("lisent les paramètres publics et le catalogue, rien d'autre", async () => {
    await assertSucceeds(getDoc(doc(anon(), "settings/institution")));
    await assertSucceeds(getDoc(doc(anon(), "courses/a1-01")));
    await assertSucceeds(getDoc(doc(anon(), "announcements/pub")));
    await assertFails(getDoc(doc(anon(), "settings/private")));
    await assertFails(getDoc(doc(anon(), "users/student1")));
    await assertFails(getDoc(doc(anon(), "announcements/staff")));
  });
});

describe("étudiant", () => {
  it("ne peut pas modifier ses propres notes", async () => {
    const db = as("student1", "student");
    await assertFails(updateDoc(doc(db, "grades/student1_a1-01"), { exam: 20 }));
    await assertFails(setDoc(doc(db, "grades/student1_new"), { uid: "student1", courseId: "a1-01", continuous: 20, published: true }));
  });

  it("lit ses notes publiées, pas les non publiées ni celles des autres", async () => {
    const db = as("student1", "student");
    await assertSucceeds(getDoc(doc(db, "grades/student1_a1-01")));
    await assertFails(getDoc(doc(db, "grades/student1_a1-02")));
    await assertFails(getDoc(doc(db, "grades/student2_a1-01")));
    await assertSucceeds(getDocs(query(collection(db, "grades"), where("uid", "==", "student1"), where("published", "==", true))));
    await assertFails(getDocs(query(collection(db, "grades"), where("uid", "==", "student1"))));
  });

  it("ne peut pas modifier son rôle", async () => {
    const db = as("student1", "student");
    await assertFails(updateDoc(doc(db, "users/student1"), { role: "super_admin" }));
    await assertSucceeds(updateDoc(doc(db, "users/student1"), { mustChangePassword: false }));
    await assertFails(updateDoc(doc(db, "users/student2"), { phone: "+237" }));
  });

  it("ne peut pas remettre le drapeau de mot de passe à vrai", async () => {
    const db = as("student2", "student");
    await assertFails(updateDoc(doc(db, "users/student2"), { mustChangePassword: true }));
  });

  it("ne peut pas modifier ses paiements ni lire ceux des autres", async () => {
    const db = as("student1", "student");
    await assertSucceeds(getDoc(doc(db, "payments/student1_registration")));
    await assertFails(updateDoc(doc(db, "payments/student1_registration"), { amount: 999999 }));
    await assertFails(setDoc(doc(db, "payments/student1_fake"), { uid: "student1", amount: 120000 }));
    await assertFails(getDoc(doc(db, "payments/student2_registration")));
  });

  it("ne lit ni les données privées d'un autre étudiant, ni les feuilles d'appel, ni les corrigés", async () => {
    const db = as("student1", "student");
    await assertFails(getDoc(doc(db, "users/student2")));
    await assertFails(getDoc(doc(db, "attendance/a1-01-s1")));
    await assertFails(getDoc(doc(db, "assessmentKeys/quiz1")));
    await assertSucceeds(getDoc(doc(db, "assessments/quiz1")));
  });

  it("fait progresser sa lecture sans pouvoir la faire régresser ni écrire celle d'un autre", async () => {
    const db = as("student1", "student");
    await assertSucceeds(updateDoc(doc(db, "progress/student1_l1"), { percent: 80 }));
    await assertFails(updateDoc(doc(db, "progress/student1_l1"), { percent: 10 }));
    await assertFails(setDoc(doc(db, "progress/student2_l1"), { uid: "student2", courseId: "a1-01", lessonId: "l1", percent: 100 }));
  });

  it("ne peut pas écrire de tentative ni dans le journal d'audit", async () => {
    const db = as("student1", "student");
    await assertFails(setDoc(doc(db, "attempts/x"), { uid: "student1", score: 20 }));
    await assertFails(setDoc(doc(db, "auditLogs/x"), { action: "forged" }));
  });
});

describe("enseignant", () => {
  it("ne peut pas devenir administrateur ni lire les paramètres privés", async () => {
    const db = as("teacher1", "teacher");
    await assertFails(setDoc(doc(db, "users/teacher1"), { role: "super_admin" }));
    await assertFails(updateDoc(doc(db, "settings/institution"), { name: "x" }));
    await assertFails(getDoc(doc(db, "payments/student1_registration")));
  });

  it("gère l'appel et les notes non publiées de ses cours uniquement", async () => {
    const db = as("teacher1", "teacher");
    await assertSucceeds(setDoc(doc(db, "attendance/a1-01-s2"), { courseId: "a1-01", marks: {} }));
    await assertFails(setDoc(doc(db, "attendance/a1-02-s1"), { courseId: "a1-02", marks: {} }));
    await assertSucceeds(setDoc(doc(db, "grades/student2_a1-01b"), { uid: "student2", courseId: "a1-01", continuous: 11, published: false }));
    await assertFails(setDoc(doc(db, "grades/student2_a1-01c"), { uid: "student2", courseId: "a1-01", continuous: 11, published: true }));
    await assertFails(updateDoc(doc(db, "grades/student2_a1-01"), { exam: 3 })); // déjà publiée
    await assertSucceeds(getDoc(doc(db, "assessmentKeys/quiz1")));
  });
});

describe("personnel", () => {
  it("la direction édite les paramètres ; le secrétariat non", async () => {
    await assertSucceeds(updateDoc(doc(as("dir", "director"), "settings/institution"), { name: "Institut" }));
    await assertFails(updateDoc(doc(as("sec", "academic_secretariat"), "settings/institution"), { name: "x" }));
  });

  it("le secrétariat ne peut pas changer un rôle", async () => {
    await assertFails(updateDoc(doc(as("sec", "academic_secretariat"), "users/student1"), { role: "teacher" }));
    await assertSucceeds(updateDoc(doc(as("sec", "academic_secretariat"), "users/student1"), { phone: "+237 6" }));
  });

  it("seule la finance enregistre les paiements ; personne ne les supprime", async () => {
    await assertSucceeds(setDoc(doc(as("fin", "finance_officer"), "payments/student1_t1"), { uid: "student1", amount: 40000 }));
    await assertFails(setDoc(doc(as("dean", "dean"), "payments/student1_t2"), { uid: "student1", amount: 40000 }));
    await assertFails(deleteDoc(doc(as("admin", "super_admin"), "payments/student1_registration")));
  });

  it("un rôle inconnu ou absent n'ouvre aucun droit", async () => {
    await assertFails(getDoc(doc(as("x", "hacker"), "users/student1")));
    await assertFails(getDoc(doc(as("y"), "users/student1")));
  });
});
