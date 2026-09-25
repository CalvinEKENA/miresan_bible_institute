import { type DataStore } from "./store/types";
import { coursePercent } from "@/domain/progress";
import {
  type Announcement,
  type CalendarEvent,
  type Course,
  type Grade,
  type Lesson,
  type LessonProgress,
  type UserProfile,
} from "@/domain/types";

/**
 * Chargements composés, écrits une seule fois au-dessus de DataStore.
 * Chaque requête est compatible avec les règles Firestore (filtre par uid, etc.).
 */

export interface StudentCourse {
  course: Course;
  lessons: Lesson[];
  percent: number;
}

export interface StudentOverview {
  courses: StudentCourse[];
  progress: LessonProgress[];
  grades: Grade[];
  events: CalendarEvent[];
  announcements: Announcement[];
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export async function loadStudentOverview(store: DataStore, profile: UserProfile): Promise<StudentOverview> {
  const level = profile.level ?? 1;
  const [courses, lessons, progress, grades, events, announcements] = await Promise.all([
    store.list("courses", {
      where: [
        ["programId", "==", profile.programId ?? ""],
        ["level", "==", level],
        ["status", "==", "published"],
      ],
    }),
    store.list("lessons", { where: [["status", "==", "published"]] }),
    store.list("progress", { where: [["uid", "==", profile.uid]] }),
    store.list("grades", {
      where: [
        ["uid", "==", profile.uid],
        ["published", "==", true],
      ],
    }),
    store.list("events", { where: [["audience", "in", ["students", "all", "public"]]], orderBy: ["start", "asc"] }),
    store.list("announcements", { where: [["audience", "in", ["students", "all", "public"]]], orderBy: ["publishedAt", "desc"] }),
  ]);

  const lessonsByCourse = new Map<string, Lesson[]>();
  for (const l of lessons) lessonsByCourse.set(l.courseId, [...(lessonsByCourse.get(l.courseId) ?? []), l]);

  return {
    courses: courses.sort(byOrder).map((course) => {
      const list = (lessonsByCourse.get(course.id) ?? []).sort(byOrder);
      return { course, lessons: list, percent: coursePercent(list, progress.filter((p) => p.courseId === course.id)) };
    }),
    progress,
    grades,
    events,
    announcements,
  };
}

export async function loadCourse(store: DataStore, courseId: string, uid: string) {
  const [course, lessons, progress, assessments] = await Promise.all([
    store.get("courses", courseId),
    store.list("lessons", { where: [["courseId", "==", courseId]] }),
    store.list("progress", {
      where: [
        ["uid", "==", uid],
        ["courseId", "==", courseId],
      ],
    }),
    store.list("assessments", {
      where: [
        ["courseId", "==", courseId],
        ["status", "==", "published"],
      ],
    }),
  ]);
  const teachers = course?.teacherIds.length
    ? (await Promise.all(course.teacherIds.map((id) => store.get("users", id)))).filter((u): u is NonNullable<typeof u> => !!u)
    : [];
  const sorted = lessons.filter((l) => l.status === "published").sort(byOrder);
  return { course, lessons: sorted, progress, assessments, teachers, percent: coursePercent(sorted, progress) };
}

export async function saveLessonProgress(store: DataStore, entry: Omit<LessonProgress, "id" | "updatedAt">) {
  const id = `${entry.uid}_${entry.lessonId}`;
  const existing = await store.get("progress", id);
  // La progression ne régresse jamais (relecture d'une leçon achevée).
  const percent = Math.max(existing?.percent ?? 0, entry.percent);
  await store.set("progress", id, {
    ...entry,
    id,
    percent,
    completed: existing?.completed || entry.completed || percent >= 100,
    updatedAt: new Date().toISOString(),
  });
}
