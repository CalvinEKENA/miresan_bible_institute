/**
 * Rôles institutionnels. Le rôle est porté par un custom claim Firebase (`role`)
 * posé exclusivement côté serveur (Admin SDK / Cloud Functions). L'interface ne
 * fait que refléter ces droits ; l'autorité réelle est dans firestore.rules.
 */
export const ROLES = [
  "super_admin",
  "founder",
  "director",
  "dean",
  "academic_secretariat",
  "finance_officer",
  "teacher",
  "student",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super administrateur",
  founder: "Fondateur",
  director: "Direction générale",
  dean: "Doyen académique",
  academic_secretariat: "Secrétariat académique",
  finance_officer: "Direction financière",
  teacher: "Enseignant",
  student: "Étudiant",
};

/** Rôles ayant accès au back-office /admin. */
export const STAFF_ROLES = [
  "super_admin",
  "founder",
  "director",
  "dean",
  "academic_secretariat",
  "finance_officer",
] as const satisfies readonly Role[];

export type StaffRole = (typeof STAFF_ROLES)[number];

/**
 * Rang hiérarchique : un acteur ne peut attribuer qu'un rôle de rang strictement
 * inférieur au sien (sauf super_admin qui peut tout attribuer, y compris founder).
 */
export const ROLE_RANK: Record<Role, number> = {
  super_admin: 100,
  founder: 90,
  director: 80,
  dean: 70,
  academic_secretariat: 50,
  finance_officer: 50,
  teacher: 30,
  student: 10,
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isStaff(role: Role | null | undefined): role is StaffRole {
  return role != null && (STAFF_ROLES as readonly string[]).includes(role);
}

export function canAssignRole(actor: Role, target: Role): boolean {
  if (actor === "super_admin") return true;
  if (!isStaff(actor)) return false;
  // Seules la direction et le fondateur gèrent les rôles ; jamais au-dessus de soi.
  if (!["founder", "director"].includes(actor)) return false;
  return ROLE_RANK[target] < ROLE_RANK[actor];
}

/** Espace d'atterrissage après connexion. */
export function homePathFor(role: Role): string {
  if (role === "student") return "/campus";
  if (role === "teacher") return "/enseignant";
  return "/admin";
}
