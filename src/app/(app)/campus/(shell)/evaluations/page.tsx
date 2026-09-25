"use client";

import Link from "next/link";
import { PageHeader } from "@/components/campus/page-header";
import { useStudentOverview } from "@/components/campus/use-student";
import { Icon } from "@/components/ui/icons";
import { Badge, EmptyState, Skeleton } from "@/components/ui/primitives";
import { useData } from "@/data/use-data";
import { formatDate, relativeDays } from "@/domain/format";

export default function AssessmentsPage() {
  const { profile, data: overview } = useStudentOverview();
  const { data, status } = useData(`assessments:${profile.uid}`, async (store) => {
    const [assessments, attempts] = await Promise.all([
      store.list("assessments", { where: [["status", "==", "published"]] }),
      store.list("attempts", { where: [["uid", "==", profile.uid]] }),
    ]);
    return { assessments, attempts };
  });

  if (status !== "ready" || !data) return <Skeleton className="h-64" />;
  const now = new Date();
  const courseTitle = (id: string) => overview?.courses.find((c) => c.course.id === id)?.course.title ?? id;
  const exams = (overview?.events ?? []).filter((e) => (e.kind === "exam" || e.kind === "deadline") && new Date(e.end) >= now);

  return (
    <div className="mx-auto max-w-(--container-content)">
      <PageHeader eyebrow="Trimestre 1" title="Évaluations">
        Quiz d’auto-évaluation, travaux à rendre et examens de fin de trimestre.
      </PageHeader>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-labelledby="quiz-title">
          <h2 id="quiz-title" className="font-display text-2xl">
            Quiz & exercices
          </h2>
          {data.assessments.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Aucun quiz publié" />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.assessments.map((a) => {
                const tries = data.attempts.filter((t) => t.assessmentId === a.id);
                const best = tries.reduce<number | null>((m, t) => (t.score != null && t.maxScore ? Math.max(m ?? 0, (t.score / t.maxScore) * 20) : m), null);
                return (
                  <li key={a.id}>
                    <Link href={`/campus/evaluations/${a.id}`} className="group flex items-center gap-5 rounded-md bg-paper-raised p-5 shadow-paper ring-1 ring-line transition-shadow hover:shadow-lifted">
                      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold-100/70 text-gold-800 ring-1 ring-gold-500/30">
                        <Icon name="quill" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-xs text-text-muted">{courseTitle(a.courseId)}</span>
                        <span className="font-display block text-xl leading-snug group-hover:text-forest-700">{a.title}</span>
                        <span className="mt-1 block text-sm text-text-muted">
                          {a.questions.length} questions · {a.durationMinutes} min {tries.length > 0 && `· ${tries.length} tentative${tries.length > 1 ? "s" : ""}`}
                        </span>
                      </span>
                      {best != null ? (
                        <span className="text-right">
                          <span className="font-display numeric block text-2xl">{best.toFixed(1).replace(".", ",")}</span>
                          <span className="text-xs text-text-muted">/ 20</span>
                        </span>
                      ) : (
                        <Badge tone="gold">À faire</Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="lg:col-span-5" aria-labelledby="exam-title">
          <h2 id="exam-title" className="font-display text-2xl">
            Examens & travaux
          </h2>
          <ul className="mt-4 divide-y divide-line rounded-md bg-paper-sunken px-5">
            {exams.map((e) => (
              <li key={e.id} className="flex items-start gap-4 py-4">
                <span className="w-12 shrink-0 text-center">
                  <span className="font-display numeric block text-2xl leading-none">{formatDate(e.start, { day: "numeric" })}</span>
                  <span className="text-[0.625rem] font-semibold tracking-[0.1em] text-text-muted uppercase">{formatDate(e.start, { month: "short" })}</span>
                </span>
                <span className="flex-1">
                  <span className="block font-medium">{e.title}</span>
                  <span className="text-sm text-text-muted">{relativeDays(e.start, now)}{e.location ? ` · ${e.location}` : ""}</span>
                </span>
                <Badge tone={e.kind === "exam" ? "danger" : "warning"}>{e.kind === "exam" ? "Examen" : "Travail"}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            Rappel du règlement : au-delà de 25 % d’absences dans une matière, l’accès à l’examen est refusé.
          </p>
        </section>
      </div>
    </div>
  );
}
