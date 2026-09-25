"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Monogram, PillarGlyph } from "@/components/brand/brand";
import { Panel } from "@/components/campus/page-header";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Badge, Skeleton } from "@/components/ui/primitives";
import { useSessionUser } from "@/data/auth/auth-provider";
import { getStore } from "@/data/store";
import { invalidate, useData } from "@/data/use-data";
import { capitalize, formatDate, formatTime, greeting, initials, relativeDays } from "@/domain/format";
import { type AttendanceMark, type Course, type UserProfile } from "@/domain/types";
import { cn } from "@/lib/cn";

const MARKS: { id: AttendanceMark; label: string; short: string; tone: string }[] = [
  { id: "present", label: "Présent", short: "P", tone: "bg-forest-700 text-ivory-50" },
  { id: "late", label: "En retard", short: "R", tone: "bg-warning-600 text-ivory-50" },
  { id: "absent", label: "Absent", short: "A", tone: "bg-danger-600 text-ivory-50" },
  { id: "excused", label: "Excusé", short: "E", tone: "bg-info-600 text-ivory-50" },
];

/** Feuille d'appel : tout le monde est présent par défaut, on ne note que les exceptions. */
function RollCall({ course, students, onSaved }: { course: Course; students: UserProfile[]; onSaved: () => void }) {
  const [marks, setMarks] = useState<Record<string, AttendanceMark>>({});
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const counts = useMemo(() => {
    const c: Record<AttendanceMark, number> = { present: 0, late: 0, absent: 0, excused: 0 };
    for (const s of students) c[marks[s.uid] ?? "present"] += 1;
    return c;
  }, [marks, students]);

  async function save() {
    setState("saving");
    const store = await getStore();
    const date = new Date().toISOString();
    const id = `${course.id}-${date.slice(0, 10)}`;
    const exceptions = Object.fromEntries(Object.entries(marks).filter(([, m]) => m !== "present"));
    await store.set("attendance", id, { id, courseId: course.id, date, marks: exceptions });
    invalidate("admin:");
    setState("saved");
    onSaved();
  }

  return (
    <div>
      <ul className="divide-y divide-line">
        {students.map((s) => {
          const current = marks[s.uid] ?? "present";
          return (
            <li key={s.uid} className="flex items-center gap-3 py-2.5">
              <Monogram initials={initials(s.displayName)} size={34} className="text-[0.7rem]" />
              <span className="min-w-0 flex-1 truncate text-[0.9375rem]">{s.displayName}</span>
              <div role="radiogroup" aria-label={`Présence de ${s.displayName}`} className="flex gap-1">
                {MARKS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={current === m.id}
                    aria-label={m.label}
                    title={m.label}
                    onClick={() => {
                      setMarks((x) => ({ ...x, [s.uid]: m.id }));
                      setState("idle");
                    }}
                    className={cn("grid size-9 place-items-center rounded-sm text-xs font-bold transition-colors", current === m.id ? m.tone : "text-text-muted ring-1 ring-line hover:ring-line-strong")}
                  >
                    {m.short}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="numeric text-sm text-text-muted">
          {counts.present} présents · {counts.late} retards · {counts.absent} absents · {counts.excused} excusés
        </p>
        <Button onClick={() => void save()} disabled={state === "saving"}>
          {state === "saved" ? (
            <>
              <Icon name="check" className="size-4" /> Appel enregistré
            </>
          ) : state === "saving" ? (
            "Enregistrement…"
          ) : (
            "Enregistrer l’appel"
          )}
        </Button>
      </div>
    </div>
  );
}

export default function TeacherHome() {
  const { profile, uid } = useSessionUser();
  const { data, status, reload } = useData(`teacher:${uid}`, async (store) => {
    const [courses, lessons, users, events] = await Promise.all([
      store.list("courses", { where: [["teacherIds", "array-contains", uid]] }),
      store.list("lessons"),
      store.list("users", { where: [["role", "==", "student"]] }),
      store.list("events", { orderBy: ["start", "asc"] }),
    ]);
    return { courses: courses.sort((a, b) => a.level - b.level || a.order - b.order), lessons, users, events };
  });
  const [rollCourse, setRollCourse] = useState<string | null>(null);

  if (status !== "ready" || !data) return <Skeleton className="h-96" />;
  const now = new Date();
  const mine = new Set(data.courses.map((c) => c.id));
  const nextClass = data.events.find((e) => e.kind === "class" && new Date(e.end) >= now && (!e.courseId || mine.has(e.courseId) || data.courses.length === 0));
  const selected = data.courses.find((c) => c.id === (rollCourse ?? data.courses[0]?.id));
  const students = data.users.filter((u) => u.status === "active" && (u.level ?? 1) === (selected?.level ?? 1)).sort((a, b) => a.lastName.localeCompare(b.lastName));

  return (
    <div className="mx-auto max-w-(--container-wide)">
      <header className="reveal border-b border-line pb-8">
        <p className="eyebrow text-accent">{capitalize(formatDate(now.toISOString(), { weekday: "long", day: "numeric", month: "long" }))}</p>
        <h1 className="font-display mt-3 text-[clamp(2.4rem,1.6rem+3vw,4rem)] leading-[1]">
          {greeting(now)}, <em className="text-forest-700">{profile.title ? `${profile.title} ${profile.lastName}` : profile.firstName}</em>
        </h1>
        <p className="mt-3 text-lg text-text-muted">
          {data.courses.length} cours confiés · {students.length} étudiants dans la promotion
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-md bg-forest-800 p-6 text-ivory-50 shadow-lifted sm:p-8 lg:col-span-5 lg:self-start">
          <p className="eyebrow text-gold-300">Prochaine séance</p>
          {nextClass ? (
            <>
              <p className="font-display mt-4 text-4xl leading-tight">{capitalize(formatDate(nextClass.start, { weekday: "long", day: "numeric", month: "long" }))}</p>
              <p className="numeric mt-2 text-lg text-gold-100">
                {formatTime(nextClass.start)} – {formatTime(nextClass.end)}
              </p>
              <p className="mt-3 text-ivory-50/70">{nextClass.title}</p>
              <p className="mt-1 text-sm text-ivory-50/55">{nextClass.location}</p>
              <Badge tone="gold" className="mt-5">
                {relativeDays(nextClass.start, now)}
              </Badge>
            </>
          ) : (
            <p className="mt-4 text-ivory-50/70">Aucune séance programmée.</p>
          )}
        </section>

        <Panel title="Faire l’appel" className="lg:col-span-7" action={<span className="text-xs text-text-muted">Présent par défaut</span>}>
          {selected ? (
            <>
              <label className="mb-4 block text-sm">
                <span className="sr-only">Cours</span>
                <select value={selected.id} onChange={(e) => setRollCourse(e.target.value)} className="h-10 w-full rounded-sm bg-paper px-3 ring-1 ring-line outline-none focus:ring-2 focus:ring-forest-700">
                  {data.courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} · {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <RollCall key={selected.id} course={selected} students={students} onSaved={() => void reload()} />
            </>
          ) : (
            <p className="text-sm text-text-muted">Aucun cours ne vous est encore affecté.</p>
          )}
        </Panel>

        <section className="lg:col-span-12" aria-labelledby="my-courses">
          <h2 id="my-courses" className="font-display mt-4 text-3xl">
            Mes cours
          </h2>
          <ul className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-md bg-line sm:grid-cols-2 xl:grid-cols-3">
            {data.courses.map((c) => {
              const count = data.lessons.filter((l) => l.courseId === c.id).length;
              return (
                <li key={c.id} className="bg-paper-raised p-6">
                  <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-accent uppercase">
                    <PillarGlyph pillar={c.pillar} className="size-4" /> {c.code} · T{c.term}
                  </p>
                  <p className="font-display mt-3 text-2xl leading-snug">{c.title}</p>
                  <p className="mt-2 text-sm text-text-muted">{count ? `${count} leçons publiées` : "Aucune leçon publiée"}</p>
                  <div className="mt-4 flex gap-4 text-sm font-semibold">
                    <Link href={`/campus/cours/${c.id}`} className="text-forest-700 hover:underline">
                      Aperçu étudiant
                    </Link>
                    <Link href="/enseignant/cours" className="text-text-muted hover:text-text">
                      Éditer
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
