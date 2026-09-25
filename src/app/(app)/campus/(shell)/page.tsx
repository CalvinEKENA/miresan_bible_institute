"use client";

import Link from "next/link";
import { PillarGlyph } from "@/components/brand/brand";
import { CourseCover } from "@/components/campus/course-cover";
import { Panel } from "@/components/campus/page-header";
import { useStudentOverview } from "@/components/campus/use-student";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Badge, DemoNotice, ProgressBar, ProgressRing, Skeleton } from "@/components/ui/primitives";
import { verseOfTheDay } from "@/data/verses";
import { capitalize, formatDate, formatTime, greeting, relativeDays } from "@/domain/format";
import { overallPercent, pillarProgress, resumeTarget } from "@/domain/progress";
import { PILLARS, PILLAR_LABELS } from "@/domain/types";
import { cn } from "@/lib/cn";
import { DATA_MODE } from "@/lib/env";

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-12 w-72" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Skeleton className="h-64 lg:col-span-8" />
        <Skeleton className="h-64 lg:col-span-4" />
      </div>
    </div>
  );
}

export default function TodayPage() {
  const { profile, data, status } = useStudentOverview();
  const verse = verseOfTheDay();

  if (status !== "ready" || !data) return <DashboardSkeleton />;

  const now = new Date();
  const percentByCourse = new Map(data.courses.map((c) => [c.course.id, c.percent]));
  const courses = data.courses.map((c) => c.course);
  const pillars = pillarProgress(courses, percentByCourse);
  const overall = overallPercent(courses, percentByCourse);

  // Leçon à reprendre, tous cours confondus
  const allLessons = data.courses.flatMap((c) => c.lessons);
  const resume = resumeTarget(allLessons, data.progress);
  const resumeCourse = resume ? data.courses.find((c) => c.course.id === resume.lesson.courseId) : undefined;

  const upcoming = data.events.filter((e) => new Date(e.end) >= now);
  const nextClass = upcoming.find((e) => e.kind === "class");
  const deadlines = upcoming.filter((e) => e.kind === "exam" || e.kind === "deadline").slice(0, 4);
  const current = data.courses.filter((c) => c.course.term === 1).slice(0, 6);
  const currentTerm = 1;

  return (
    <div className="mx-auto max-w-(--container-content)">
      {/* Salutation */}
      <section className="reveal grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow text-accent">
            {capitalize(formatDate(now.toISOString(), { weekday: "long", day: "numeric", month: "long" }))} · Trimestre {currentTerm}
          </p>
          <h1 className="font-display mt-3 text-[clamp(2.4rem,1.6rem+3vw,4rem)] leading-[1]">
            {greeting(now)}, <em className="text-forest-700">{profile.firstName}</em>.
          </h1>
        </div>
        <figure className="border-l border-gold-600/40 pl-5 lg:col-span-5">
          <blockquote className="font-display text-lg leading-snug text-text-soft italic">« {verse.text} »</blockquote>
          <figcaption className="eyebrow mt-2 text-text-muted">{verse.ref}</figcaption>
        </figure>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:mt-10 lg:grid-cols-12 lg:gap-6">
        {/* Continuer mon enseignement */}
        <section aria-labelledby="resume-title" className="relative isolate overflow-hidden rounded-md bg-forest-800 text-ivory-50 shadow-lifted lg:col-span-8">
          <div aria-hidden className="ruled absolute inset-y-0 right-0 -z-10 w-1/2 opacity-[0.35] [mask-image:linear-gradient(to_left,black,transparent)]" style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0, transparent calc(1.75rem - 1px), rgb(251 248 241 / 0.08) calc(1.75rem - 1px), rgb(251 248 241 / 0.08) 1.75rem)" }} />
          <div aria-hidden className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-[radial-gradient(circle,rgb(207_174_98/0.28),transparent_70%)]" />
          {resume && resumeCourse ? (
            <div className="flex h-full flex-col p-6 sm:p-8">
              <p id="resume-title" className="eyebrow text-gold-300">
                Continuer mon enseignement
              </p>
              <p className="mt-5 text-sm text-ivory-50/65">
                {resumeCourse.course.code} · {resumeCourse.course.title} · Leçon {resume.lesson.order}
              </p>
              <h2 className="font-display mt-2 max-w-xl text-[clamp(1.9rem,1.4rem+2vw,2.9rem)] leading-[1.04]">{resume.lesson.title}</h2>
              <p className="mt-3 max-w-lg text-ivory-50/70">{resume.lesson.summary}</p>
              <div className="mt-auto pt-8">
                <div className="flex items-center gap-3 text-sm">
                  <ProgressBar value={resume.percent} tone="light" className="max-w-xs" label="Avancement de la leçon" />
                  <span className="numeric shrink-0 whitespace-nowrap text-ivory-50/75">{resume.percent} % lu</span>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <ButtonLink href={`/campus/cours/${resumeCourse.course.id}/${resume.lesson.id}`} variant="gold" size="lg" arrow>
                    {resume.percent > 0 ? "Reprendre la lecture" : "Commencer la leçon"}
                  </ButtonLink>
                  <span className="flex items-center gap-2 text-sm text-ivory-50/60">
                    <Icon name="clock" className="size-4" /> {resume.lesson.durationMinutes} min
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <p className="eyebrow text-gold-300">Continuer mon enseignement</p>
              <p className="font-display mt-4 text-3xl">Aucune leçon en cours.</p>
            </div>
          )}
        </section>

        {/* Prochaine séance */}
        <section aria-labelledby="next-title" className="flex flex-col rounded-md bg-paper-raised p-6 shadow-paper ring-1 ring-line lg:col-span-4">
          <h2 id="next-title" className="eyebrow text-text-muted">
            Prochaine séance
          </h2>
          {nextClass ? (
            <>
              <div className="mt-5 flex items-end gap-4">
                <span className="font-display numeric text-[5.5rem] leading-[0.8] text-forest-700">{formatDate(nextClass.start, { day: "numeric" })}</span>
                <span className="pb-1">
                  <span className="block font-display text-2xl leading-none">{capitalize(formatDate(nextClass.start, { weekday: "long" }))}</span>
                  <span className="text-sm text-text-muted">{formatDate(nextClass.start, { month: "long", year: "numeric" })}</span>
                </span>
              </div>
              <p className="numeric mt-5 text-lg font-semibold">
                {formatTime(nextClass.start)} – {formatTime(nextClass.end)}
              </p>
              <p className="mt-1 text-text-soft">{nextClass.title}</p>
              <p className="mt-auto flex items-center gap-2 pt-5 text-sm text-text-muted">
                <Icon name="pin" className="size-4" /> {nextClass.location}
              </p>
              <Badge tone="gold" className="mt-3 self-start">
                {relativeDays(nextClass.start, now)}
              </Badge>
            </>
          ) : (
            <p className="mt-4 text-text-muted">Aucune séance programmée.</p>
          )}
        </section>

        {/* Progression */}
        <Panel title="Ma progression" className="lg:col-span-7" action={<Link href="/campus/resultats" className="text-sm font-semibold text-forest-700 hover:underline">Résultats</Link>}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProgressRing value={overall} size={112} stroke={4} tone="gold" label={`Progression générale : ${overall} %`}>
              <span className="text-center">
                <span className="font-display numeric block text-3xl leading-none">{overall}%</span>
                <span className="text-[0.625rem] font-semibold tracking-[0.12em] text-text-muted uppercase">Année 1</span>
              </span>
            </ProgressRing>
            <ul className="flex-1 space-y-4">
              {PILLARS.map((p) => (
                <li key={p}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <PillarGlyph pillar={p} className="size-4 text-accent" />
                      {PILLAR_LABELS[p].label}
                    </span>
                    <span className="numeric text-text-muted">{pillars[p]} %</span>
                  </div>
                  <ProgressBar value={pillars[p]} tone={p === "deploy" ? "gold" : "forest"} label={`${PILLAR_LABELS[p].label} : ${pillars[p]} %`} />
                </li>
              ))}
            </ul>
          </div>
          {/* Frise annuelle */}
          <ol className="mt-7 grid grid-cols-3 border-t border-line pt-5 text-sm">
            {[1, 2, 3].map((t) => (
              <li key={t} className="relative">
                <span className={cn("absolute top-[-1.45rem] left-0 size-2.5 rounded-full ring-4 ring-paper-raised", t < currentTerm ? "bg-forest-600" : t === currentTerm ? "bg-gold-600" : "bg-line-strong")} />
                <p className={cn("font-semibold", t === currentTerm ? "text-text" : "text-text-muted")}>Trimestre {t}</p>
                <p className="text-xs text-text-muted">{t === currentTerm ? "En cours" : t < currentTerm ? "Achevé" : "À venir"}</p>
              </li>
            ))}
          </ol>
        </Panel>

        {/* Échéances */}
        <Panel title="Examens & travaux" className="lg:col-span-5" action={<Link href="/campus/calendrier" className="text-sm font-semibold text-forest-700 hover:underline">Calendrier</Link>}>
          <ul className="divide-y divide-line">
            {deadlines.map((e) => (
              <li key={e.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <span className="grid w-12 shrink-0 place-items-center rounded-sm bg-paper-sunken py-1.5 text-center">
                  <span className="font-display numeric text-xl leading-none">{formatDate(e.start, { day: "numeric" })}</span>
                  <span className="text-[0.625rem] font-semibold tracking-[0.08em] text-text-muted uppercase">{formatDate(e.start, { month: "short" })}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.9375rem] font-medium">{e.title}</span>
                  <span className="text-xs text-text-muted">{relativeDays(e.start, now)}</span>
                </span>
                <Badge tone={e.kind === "exam" ? "danger" : "warning"}>{e.kind === "exam" ? "Examen" : "Travail"}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Cours actuels */}
      <section aria-labelledby="courses-title" className="mt-12">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 id="courses-title" className="font-display text-3xl">
            Cours du trimestre
          </h2>
          <Link href="/campus/cours" className="text-sm font-semibold text-forest-700 hover:underline">
            Tous mes cours
          </Link>
        </div>
        <ul className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 xl:grid-cols-6">
          {current.map((c) => (
            <li key={c.course.id} className="w-[44vw] max-w-[12rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <CourseCover course={c.course} percent={c.percent} lessons={c.lessons.length} />
            </li>
          ))}
        </ul>
      </section>

      {/* Annonces */}
      <section aria-labelledby="ann-title" className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <h2 id="ann-title" className="font-display text-3xl">
            Annonces
          </h2>
          <p className="mt-2 text-sm text-text-muted">De la Direction et du secrétariat.</p>
        </div>
        <ul className="border-t border-line-strong lg:col-span-9">
          {data.announcements.slice(0, 3).map((a) => (
            <li key={a.id} className="grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <p className="numeric text-sm text-text-muted">{formatDate(a.publishedAt, { day: "numeric", month: "short" })}</p>
              <div>
                <p className="font-display text-xl">
                  {a.pinned && <Icon name="pin" className="mr-1.5 inline size-4 -translate-y-0.5 text-accent" />}
                  {a.title}
                </p>
                <p className="mt-1 text-[0.9375rem] text-text-soft">{a.body}</p>
                <p className="eyebrow mt-2 text-[0.625rem] text-text-muted">{a.author}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {DATA_MODE === "demo" && <DemoNotice className="mt-10">Mode démonstration — données et contenus fictifs.</DemoNotice>}
    </div>
  );
}
