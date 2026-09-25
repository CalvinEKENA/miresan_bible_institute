import { describe, expect, it } from "vitest";
import { OFFICIAL_COURSES } from "@/data/catalog";
import { DEFAULT_SETTINGS } from "@/data/institution";
import { canStillJustify, summarizeAttendance } from "@/domain/attendance";
import { findBook, formatReference, parseReference } from "@/domain/bible";
import { canProgress, courseAverage, generalAverage, isValidated, mention } from "@/domain/grading";
import { authEmailToUsername, identifierToAuthEmail, isValidUsername, normalizeUsername, passwordIssues } from "@/domain/identity";
import { can } from "@/domain/permissions";
import { coursePercent, resumeTarget } from "@/domain/progress";
import { canAssignRole, homePathFor, isStaff } from "@/domain/roles";
import { type AttendanceSession, type Lesson, type LessonProgress } from "@/domain/types";

describe("catalogue officiel", () => {
  it("contient 36 cours, 18 par année, codes uniques", () => {
    expect(OFFICIAL_COURSES).toHaveLength(36);
    expect(OFFICIAL_COURSES.filter((c) => c.level === 1)).toHaveLength(18);
    expect(OFFICIAL_COURSES.filter((c) => c.level === 2)).toHaveLength(18);
    expect(new Set(OFFICIAL_COURSES.map((c) => c.id)).size).toBe(36);
  });

  it("marque la répartition trimestrielle comme provisoire", () => {
    expect(OFFICIAL_COURSES.every((c) => c.termProvisional)).toBe(true);
    expect(OFFICIAL_COURSES.find((c) => c.id === "a1-07")?.term).toBe(2);
  });
});

describe("paramètres institutionnels", () => {
  it("n'affirme jamais une affiliation acquise", () => {
    const text = JSON.stringify(DEFAULT_SETTINGS).toLowerCase();
    expect(text).toContain("démarche d’affiliation");
    expect(text).not.toMatch(/\b(accrédité|affilié à|affiliation obtenue)\b/);
  });

  it("signale les ambiguïtés à confirmer", () => {
    expect(DEFAULT_SETTINGS.notices.map((n) => n.id)).toEqual(expect.arrayContaining(["thursday-hours", "contact-email"]));
    expect(DEFAULT_SETTINGS.emails.filter((e) => e.primary)).toHaveLength(1);
  });
});

describe("notation", () => {
  it("pondère contrôle continu et examen (40/60 par défaut)", () => {
    expect(courseAverage({ continuous: 12, exam: 8, resit: null })).toBe(9.6);
  });
  it("retient la meilleure note avec le rattrapage", () => {
    expect(courseAverage({ continuous: 8, exam: 7, resit: 12 })).toBe(12);
    expect(courseAverage({ continuous: 14, exam: 14, resit: 9 })).toBe(14);
  });
  it("valide à 10/20 et attribue une mention", () => {
    expect(isValidated(10)).toBe(true);
    expect(isValidated(9.99)).toBe(false);
    expect(mention(16.5)).toBe("Très bien");
    expect(mention(9)).toBe("Non validé");
  });
  it("exige la validation de toutes les matières pour passer", () => {
    expect(canProgress([12, 10, 15])).toBe(true);
    expect(canProgress([12, 9.5, 15])).toBe(false);
    expect(generalAverage([10, null, 14])).toBe(12);
  });
});

describe("assiduité", () => {
  const sessions: AttendanceSession[] = Array.from({ length: 8 }, (_, i) => ({
    id: `s${i}`,
    courseId: "a1-01",
    date: "2026-11-07",
    marks: (i < 2 ? { u1: "absent" } : i < 5 ? { u1: "late" } : {}) as AttendanceSession["marks"],
  }));
  it("convertit 3 retards en 1 absence et applique le seuil de 25 %", () => {
    const s = summarizeAttendance(sessions, "u1");
    expect(s.late).toBe(3);
    expect(s.effectiveAbsences).toBe(3);
    expect(s.absenceRate).toBeCloseTo(0.375);
    expect(s.excludedFromExam).toBe(true);
  });
  it("considère un étudiant non marqué comme présent", () => {
    expect(summarizeAttendance(sessions, "u2").present).toBe(8);
  });
  it("autorise la justification sous 7 jours", () => {
    const d = new Date("2026-11-07T10:00:00Z");
    expect(canStillJustify(d, new Date("2026-11-13T10:00:00Z"))).toBe(true);
    expect(canStillJustify(d, new Date("2026-11-15T10:00:00Z"))).toBe(false);
  });
});

describe("identité", () => {
  it("dérive une identité technique à partir de l'identifiant", () => {
    expect(identifierToAuthEmail("PasteurArmel", "id.example.app")).toBe("pasteurarmel@id.example.app");
    expect(identifierToAuthEmail("x@y.cm", "id.example.app")).toBe("x@y.cm");
    expect(authEmailToUsername("pasteurarmel@id.example.app", "id.example.app")).toBe("pasteurarmel");
  });
  it("normalise et valide les identifiants", () => {
    expect(normalizeUsername("  Élise Ngo ")).toBe("elise.ngo");
    expect(isValidUsername("pasteurarmel")).toBe(true);
    expect(isValidUsername("a")).toBe(false);
    expect(isValidUsername("bad name")).toBe(false);
  });
  it("impose une robustesse minimale aux nouveaux mots de passe", () => {
    expect(passwordIssues("court")).not.toHaveLength(0);
    expect(passwordIssues("Parole2026")).toHaveLength(0);
  });
});

describe("rôles et permissions", () => {
  it("un étudiant ne peut ni noter, ni gérer les rôles, ni les paiements", () => {
    expect(can("student", "grades.write")).toBe(false);
    expect(can("student", "users.roles.manage")).toBe(false);
    expect(can("student", "payments.write")).toBe(false);
    expect(can("student", "grades.read.own")).toBe(true);
  });
  it("un enseignant ne peut pas devenir administrateur", () => {
    expect(can("teacher", "admin.access")).toBe(false);
    expect(canAssignRole("teacher", "super_admin")).toBe(false);
    expect(canAssignRole("teacher", "teacher")).toBe(false);
  });
  it("la direction attribue uniquement des rôles inférieurs", () => {
    expect(canAssignRole("director", "teacher")).toBe(true);
    expect(canAssignRole("director", "founder")).toBe(false);
    expect(canAssignRole("director", "director")).toBe(false);
    expect(canAssignRole("super_admin", "founder")).toBe(true);
    expect(canAssignRole("dean", "teacher")).toBe(false);
  });
  it("oriente chaque rôle vers son espace", () => {
    expect(homePathFor("student")).toBe("/campus");
    expect(homePathFor("teacher")).toBe("/enseignant");
    expect(homePathFor("founder")).toBe("/admin");
    expect(isStaff("finance_officer")).toBe(true);
    expect(isStaff("teacher")).toBe(false);
  });
});

describe("références bibliques", () => {
  it("comprend les abréviations françaises", () => {
    expect(formatReference(parseReference("Ép 4:12")!)).toBe("Éphésiens 4:12");
    expect(formatReference(parseReference("2 Tm 2.2")!)).toBe("2 Timothée 2:2");
    expect(formatReference(parseReference("Jn 3:16-18")!, "short")).toBe("Jn 3:16-18");
    expect(parseReference("Psaumes 119")?.chapter).toBe(119);
    expect(findBook("esaie")?.id).toBe("Isa");
  });
  it("rejette les références invalides", () => {
    expect(parseReference("Livre 3:4")).toBeNull();
    expect(parseReference("Jean 3:18-16")).toBeNull();
  });
});

describe("progression", () => {
  const lessons = [1, 2, 3, 4].map((order) => ({ id: `l${order}`, order }) as Lesson);
  const progress: LessonProgress[] = [
    { id: "u_l1", uid: "u", courseId: "c", lessonId: "l1", percent: 100, completed: true, updatedAt: "2026-01-01" },
    { id: "u_l2", uid: "u", courseId: "c", lessonId: "l2", percent: 50, completed: false, updatedAt: "2026-01-03" },
  ];
  it("calcule l'avancement d'un cours", () => {
    expect(coursePercent(lessons, progress)).toBe(38);
  });
  it("propose de reprendre la leçon entamée la plus récente", () => {
    expect(resumeTarget(lessons, progress)?.lesson.id).toBe("l2");
    expect(resumeTarget(lessons, [progress[0]!])?.lesson.id).toBe("l2");
  });
});
