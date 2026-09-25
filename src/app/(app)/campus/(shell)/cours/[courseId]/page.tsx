"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Monogram, PillarGlyph } from "@/components/brand/brand";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Badge, EmptyState, ProgressRing, Skeleton } from "@/components/ui/primitives";
import { useSessionUser } from "@/data/auth/auth-provider";
import { loadCourse } from "@/data/repositories";
import { useData } from "@/data/use-data";
import { initials } from "@/domain/format";
import { resumeTarget } from "@/domain/progress";
import { PILLAR_LABELS } from "@/domain/types";
import { cn } from "@/lib/cn";

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { uid } = useSessionUser();
  const { data, status } = useData(`course:${uid}:${courseId}`, (store) => loadCourse(store, courseId, uid));

  if (status !== "ready" || !data) {
    return (
      <div className="mx-auto max-w-(--container-content) space-y-4">
        <Skeleton className="h-56" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  const { course, lessons, progress, assessments, teachers, percent } = data;
  if (!course) return <EmptyState title="Cours introuvable" action={<ButtonLink href="/campus/cours">Mes cours</ButtonLink>} />;

  const resume = resumeTarget(lessons, progress);
  const dark = course.pillar === "deploy";

  return (
    <div className="mx-auto max-w-(--container-content)">
      <Link href="/campus/cours" className="mb-5 inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <Icon name="arrowLeft" className="size-4" /> Mes cours
      </Link>

      {/* Frontispice */}
      <header className={cn("relative isolate overflow-hidden rounded-md p-6 shadow-paper sm:p-10", dark ? "bg-forest-800 text-ivory-50" : course.pillar === "develop" ? "bg-sage-200 text-ink-900" : "bg-ivory-200 text-ink-900")}>
        <span aria-hidden className={cn("absolute inset-3 -z-10 rounded-sm border", dark ? "border-gold-500/25" : "border-gold-700/20")} />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className={cn("flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase", dark ? "text-gold-300" : "text-gold-700")}>
              <PillarGlyph pillar={course.pillar} className="size-4" /> {course.code} · {PILLAR_LABELS[course.pillar].label} · Trimestre {course.term}
            </p>
            <h1 className="font-display mt-4 text-[clamp(2.2rem,1.5rem+3vw,3.8rem)] leading-[1.02]">{course.title}</h1>
            <p className={cn("mt-4 max-w-2xl text-lg", dark ? "text-ivory-50/75" : "text-ink-900/70")}>{course.description}</p>
            {resume && (
              <ButtonLink href={`/campus/cours/${course.id}/${resume.lesson.id}`} variant={dark ? "gold" : "primary"} size="lg" arrow className="mt-8">
                {resume.percent > 0 ? `Reprendre · Leçon ${resume.lesson.order}` : percent > 0 ? `Continuer · Leçon ${resume.lesson.order}` : "Commencer le cours"}
              </ButtonLink>
            )}
          </div>
          <ProgressRing value={percent} size={128} stroke={4} tone="gold" label={`Progression du cours : ${percent} %`} className={dark ? "text-ivory-50" : "text-ink-900"}>
            <span className="text-center">
              <span className="font-display numeric block text-3xl leading-none">{percent}%</span>
              <span className="text-[0.625rem] font-semibold tracking-[0.12em] uppercase opacity-60">parcouru</span>
            </span>
          </ProgressRing>
        </div>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Leçons : table des matières */}
        <section className="lg:col-span-8" aria-labelledby="lessons-title">
          <h2 id="lessons-title" className="font-display text-3xl">
            Leçons
          </h2>
          {lessons.length === 0 ? (
            <div className="mt-5">
              <EmptyState title="Contenu en préparation">L’enseignant publiera prochainement les leçons de ce cours.</EmptyState>
            </div>
          ) : (
            <ol className="mt-5 border-t border-line-strong">
              {lessons.map((l) => {
                const p = progress.find((x) => x.lessonId === l.id);
                const done = p?.completed;
                return (
                  <li key={l.id}>
                    <Link href={`/campus/cours/${course.id}/${l.id}`} className="group flex items-center gap-4 border-b border-line py-5 transition-colors hover:bg-paper-sunken/60 sm:gap-6 sm:px-2">
                      <span className={cn("font-display numeric grid size-11 shrink-0 place-items-center rounded-full text-lg ring-1", done ? "bg-forest-700 text-ivory-50 ring-forest-700" : "ring-line-strong")}>
                        {done ? <Icon name="check" className="size-5" /> : l.order}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-display block text-xl leading-snug group-hover:text-forest-700">{l.title}</span>
                        <span className="mt-0.5 line-clamp-1 block text-sm text-text-muted">{l.summary}</span>
                      </span>
                      <span className="hidden shrink-0 text-right text-sm text-text-muted sm:block">
                        {l.durationMinutes} min
                        {p && !done && p.percent > 0 && <span className="numeric block text-xs text-accent">{p.percent} % lu</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <aside className="space-y-8 lg:col-span-4">
          <section>
            <h2 className="eyebrow text-text-muted">Enseignant</h2>
            {teachers.length ? (
              <ul className="mt-4 space-y-3">
                {teachers.map((t) => (
                  <li key={t.uid} className="flex items-center gap-3">
                    <Monogram initials={initials(t.displayName)} size={44} />
                    <span>
                      <span className="block font-semibold">
                        {t.title ? `${t.title} ` : ""}
                        {t.displayName}
                      </span>
                      {t.demo && <span className="text-xs text-text-muted">Enseignant de démonstration</span>}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-text-muted">Affectation en cours par la Direction des études.</p>
            )}
          </section>
          <section>
            <h2 className="eyebrow text-text-muted">Évaluations</h2>
            {assessments.length ? (
              <ul className="mt-4 space-y-2">
                {assessments.map((a) => (
                  <li key={a.id}>
                    <Link href={`/campus/evaluations/${a.id}`} className="flex items-center justify-between gap-3 rounded-md bg-paper-raised p-4 ring-1 ring-line hover:ring-accent/40">
                      <span>
                        <span className="block font-medium">{a.title}</span>
                        <span className="text-xs text-text-muted">{a.questions.length} questions</span>
                      </span>
                      <Badge tone="gold">{a.kind === "quiz" ? "Quiz" : a.kind === "exam" ? "Examen" : "Travail"}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-text-muted">Aucune évaluation publiée.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
