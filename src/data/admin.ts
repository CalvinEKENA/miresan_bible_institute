import { type DataStore } from "./store/types";
import { summarizeAttendance } from "@/domain/attendance";
import { type InstitutionSettings } from "@/domain/types";

/** Agrégats du tableau de bord de direction (lectures réservées au personnel). */
export async function loadInstitutionOverview(store: DataStore) {
  const [settingsDoc, users, courses, lessons, progress, attendance, payments, events, applications, announcements] = await Promise.all([
    store.get("settings", "institution"),
    store.list("users"),
    store.list("courses"),
    store.list("lessons"),
    store.list("progress"),
    store.list("attendance"),
    store.list("payments"),
    store.list("events", { orderBy: ["start", "asc"] }),
    store.list("applications", { orderBy: ["submittedAt", "desc"] }),
    store.list("announcements", { orderBy: ["publishedAt", "desc"] }),
  ]);
  const settings = settingsDoc as InstitutionSettings | null;
  const students = users.filter((u) => u.role === "student" && u.status === "active");
  const teachers = users.filter((u) => u.role === "teacher");

  /* Cours actifs : cours publiés du trimestre en cours (T1) */
  const activeCourses = courses.filter((c) => c.status === "published" && c.term === 1);
  const withContent = new Set(lessons.map((l) => l.courseId));

  /* Présences */
  let marks = 0;
  let present = 0;
  for (const s of attendance) {
    const cohort = students.filter((u) => (courses.find((c) => c.id === s.courseId)?.level ?? 1) === (u.level ?? 1));
    for (const u of cohort) {
      const m = s.marks[u.uid] ?? "present";
      marks += 1;
      if (m !== "absent") present += 1;
    }
  }
  const attendanceRate = marks ? present / marks : 1;
  const atRisk = students
    .flatMap((u) =>
      activeCourses
        .filter((c) => c.level === (u.level ?? 1))
        .map((c) => ({ student: u, course: c, summary: summarizeAttendance(attendance.filter((a) => a.courseId === c.id), u.uid, settings?.attendance) }))
        .filter((x) => x.summary.sessions > 0 && x.summary.absenceRate > (settings?.attendance.maxAbsenceRate ?? 0.25) * 0.8),
    )
    .sort((a, b) => b.summary.absenceRate - a.summary.absenceRate);

  /* Paiements */
  const fees = settings?.fees ?? [];
  const annualDue = (fees.find((f) => f.id === "registration")?.amount ?? 0) + (fees.find((f) => f.id === "tuition")?.amount ?? 0);
  const expected = students.length * annualDue;
  const collected = payments.filter((p) => p.feeId === "registration" || p.feeId.startsWith("tuition")).reduce((s, p) => s + p.amount, 0);
  const paidByStudent = new Map<string, number>();
  for (const p of payments) if (p.feeId === "registration" || p.feeId.startsWith("tuition")) paidByStudent.set(p.uid, (paidByStudent.get(p.uid) ?? 0) + p.amount);
  const tuitionTranche = (fees.find((f) => f.id === "tuition")?.amount ?? 0) / (fees.find((f) => f.id === "tuition")?.installments ?? 1);
  const behind = students.filter((u) => (paidByStudent.get(u.uid) ?? 0) < (fees.find((f) => f.id === "registration")?.amount ?? 0) + tuitionTranche);

  /* Progression moyenne des étudiants ayant commencé */
  const byStudent = new Map<string, number[]>();
  for (const p of progress) byStudent.set(p.uid, [...(byStudent.get(p.uid) ?? []), p.percent]);

  const now = new Date();
  return {
    settings,
    students,
    teachers,
    courses,
    activeCourses,
    coursesWithContent: withContent.size,
    lessonsCount: lessons.length,
    attendanceRate,
    atRisk,
    payments: { expected, collected, rate: expected ? collected / expected : 0, behind, recent: [...payments].sort((a, b) => b.paidAt.localeCompare(a.paidAt)).slice(0, 5) },
    exams: events.filter((e) => e.kind === "exam" && new Date(e.end) >= now),
    applications,
    announcements,
    activeLearners: byStudent.size,
    users,
  };
}

export type InstitutionOverview = Awaited<ReturnType<typeof loadInstitutionOverview>>;
