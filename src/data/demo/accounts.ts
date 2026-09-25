/** Comptes fictifs du mode démo (aucun lien avec les comptes réels Firebase). */
export const DEMO_PASSWORD = "demo2026";

export const DEMO_ACCOUNTS = [
  { username: "etudiant.demo", uid: "demo-student", label: "Étudiante", detail: "1re année · promotion 2026" },
  { username: "enseignant.demo", uid: "demo-teacher", label: "Enseignant", detail: "Cours du 1er trimestre" },
  { username: "direction.demo", uid: "demo-admin", label: "Direction", detail: "Super administrateur" },
] as const;
