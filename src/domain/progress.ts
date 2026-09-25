import { type Course, type Lesson, type LessonProgress, type Pillar, PILLARS } from "./types";

export function coursePercent(lessons: Pick<Lesson, "id">[], progress: LessonProgress[]): number {
  if (lessons.length === 0) return 0;
  const byLesson = new Map(progress.map((p) => [p.lessonId, p]));
  const sum = lessons.reduce((s, l) => {
    const p = byLesson.get(l.id);
    return s + (p?.completed ? 100 : Math.min(100, p?.percent ?? 0));
  }, 0);
  return Math.round(sum / lessons.length);
}

/** Progression par pilier : moyenne des cours du pilier (pondération égale). */
export function pillarProgress(courses: Course[], percentByCourse: Map<string, number>): Record<Pillar, number> {
  const out = { discover: 0, develop: 0, deploy: 0 } as Record<Pillar, number>;
  for (const pillar of PILLARS) {
    const list = courses.filter((c) => c.pillar === pillar);
    out[pillar] =
      list.length === 0 ? 0 : Math.round(list.reduce((s, c) => s + (percentByCourse.get(c.id) ?? 0), 0) / list.length);
  }
  return out;
}

export function overallPercent(courses: Course[], percentByCourse: Map<string, number>): number {
  if (courses.length === 0) return 0;
  return Math.round(courses.reduce((s, c) => s + (percentByCourse.get(c.id) ?? 0), 0) / courses.length);
}

/** Leçon à reprendre : la plus récemment touchée et non achevée, sinon la première non commencée. */
export function resumeTarget(lessons: Lesson[], progress: LessonProgress[]): { lesson: Lesson; percent: number } | null {
  const inProgress = progress
    .filter((p) => !p.completed && p.percent > 0)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  for (const p of inProgress) {
    const lesson = lessons.find((l) => l.id === p.lessonId);
    if (lesson) return { lesson, percent: p.percent };
  }
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const next = [...lessons].sort((a, b) => a.order - b.order).find((l) => !done.has(l.id));
  return next ? { lesson: next, percent: 0 } : null;
}
