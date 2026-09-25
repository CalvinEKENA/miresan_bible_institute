import { type Role } from "./roles";

/**
 * Matrice de permissions (miroir documentaire de firestore.rules).
 * Toute modification ici doit être reportée dans les règles et testée.
 */
export const PERMISSIONS = [
  "campus.access",
  "teaching.access",
  "admin.access",
  "courses.read",
  "courses.write",
  "lessons.write",
  "assessments.write",
  "assessments.keys.read",
  "grades.read.own",
  "grades.read.all",
  "grades.write",
  "grades.publish",
  "attendance.read.all",
  "attendance.write",
  "students.read",
  "students.write",
  "admissions.manage",
  "payments.read.own",
  "payments.read.all",
  "payments.write",
  "announcements.write",
  "calendar.write",
  "settings.write",
  "users.roles.manage",
  "documents.issue",
  "audit.read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const STUDENT: Permission[] = ["campus.access", "courses.read", "grades.read.own", "payments.read.own"];

const TEACHER: Permission[] = [
  "teaching.access",
  "courses.read",
  "lessons.write",
  "assessments.write",
  "assessments.keys.read",
  "grades.write",
  "attendance.write",
  "students.read",
];

const SECRETARIAT: Permission[] = [
  "admin.access",
  "teaching.access",
  "courses.read",
  "courses.write",
  "grades.read.all",
  "attendance.read.all",
  "attendance.write",
  "students.read",
  "students.write",
  "admissions.manage",
  "announcements.write",
  "calendar.write",
  "documents.issue",
];

const FINANCE: Permission[] = ["admin.access", "students.read", "payments.read.all", "payments.write"];

const DEAN: Permission[] = [
  ...SECRETARIAT,
  "lessons.write",
  "assessments.write",
  "assessments.keys.read",
  "grades.write",
  "grades.publish",
];

const DIRECTION: Permission[] = [
  ...DEAN,
  "payments.read.all",
  "payments.write",
  "settings.write",
  "users.roles.manage",
  "audit.read",
];

export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  super_admin: new Set(PERMISSIONS),
  founder: new Set(DIRECTION),
  director: new Set(DIRECTION),
  dean: new Set(DEAN),
  academic_secretariat: new Set(SECRETARIAT),
  finance_officer: new Set(FINANCE),
  teacher: new Set(TEACHER),
  student: new Set(STUDENT),
};

export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].has(permission);
}
