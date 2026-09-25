"use client";

import { PageHeader, Panel } from "@/components/campus/page-header";
import { useStudentOverview } from "@/components/campus/use-student";
import { Badge, EmptyState, ProgressBar, Skeleton } from "@/components/ui/primitives";
import { DEFAULT_SETTINGS } from "@/data/institution";
import { useData } from "@/data/use-data";
import { summarizeAttendance } from "@/domain/attendance";
import { courseAverage, generalAverage, isValidated, mention } from "@/domain/grading";
import { cn } from "@/lib/cn";

const fmt = (n: number | null) => (n == null ? "—" : n.toFixed(2).replace(".", ","));

export default function ResultsPage() {
  const { profile, data, status } = useStudentOverview();
  // Assiduité : en production, un résumé par étudiant est calculé côté serveur
  // (les feuilles de présence complètes restent réservées au personnel).
  const attendance = useData(`attendance:${profile.uid}`, async (store) => {
    try {
      return await store.list("attendance");
    } catch {
      return [];
    }
  });

  if (status !== "ready" || !data) return <Skeleton className="h-96" />;
  const policy = DEFAULT_SETTINGS.grading;
  const rows = data.courses
    .map(({ course }) => {
      const grade = data.grades.find((g) => g.courseId === course.id);
      const avg = grade ? courseAverage(grade, policy) : null;
      const sessions = (attendance.data ?? []).filter((s) => s.courseId === course.id);
      const att = sessions.length ? summarizeAttendance(sessions, profile.uid, DEFAULT_SETTINGS.attendance) : null;
      return { course, grade, avg, att };
    })
    .filter((r) => r.course.term === 1);
  const general = generalAverage(rows.map((r) => r.avg));
  const graded = rows.filter((r) => r.avg != null);

  return (
    <div className="mx-auto max-w-(--container-content)">
      <PageHeader eyebrow="Première année · Trimestre 1" title="Résultats">
        Notes sur {policy.scale}. Contrôle continu {Math.round(policy.continuousWeight * 100)} % · examen {Math.round(policy.examWeight * 100)} % (pondération fixée par la Direction des études). Validation à {policy.passMark}/{policy.scale}.
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="relative overflow-hidden rounded-md bg-forest-800 p-7 text-ivory-50 shadow-lifted lg:col-span-4">
          <p className="eyebrow text-gold-300">Moyenne provisoire</p>
          <p className="font-display numeric mt-4 text-[5rem] leading-none">
            {fmt(general)}
            <span className="text-2xl text-ivory-50/55"> / 20</span>
          </p>
          <p className="mt-3 text-ivory-50/70">{mention(general, policy) ?? "En attente de notes"}</p>
          <p className="mt-6 border-t border-ivory-50/10 pt-4 text-sm text-ivory-50/60">
            {graded.length} matière{graded.length > 1 ? "s" : ""} notée{graded.length > 1 ? "s" : ""} sur {rows.length} ce trimestre. Seules les notes publiées par l’Institut apparaissent.
          </p>
        </section>

        <Panel title="Relevé du trimestre" className="overflow-x-auto lg:col-span-8">
          {rows.length === 0 ? (
            <EmptyState title="Aucune note publiée" />
          ) : (
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line-strong text-xs tracking-[0.08em] text-text-muted uppercase">
                  <th className="py-2 pr-3 font-semibold">Matière</th>
                  <th className="px-2 py-2 text-right font-semibold">CC</th>
                  <th className="px-2 py-2 text-right font-semibold">Examen</th>
                  <th className="px-2 py-2 text-right font-semibold">Moyenne</th>
                  <th className="py-2 pl-3 text-right font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="numeric">
                {rows.map(({ course, grade, avg }) => (
                  <tr key={course.id} className="border-b border-line last:border-0">
                    <td className="py-3.5 pr-3">
                      <span className="font-display block text-base leading-snug">{course.title}</span>
                      <span className="text-xs text-text-muted">{course.code}</span>
                    </td>
                    <td className="px-2 text-right">{fmt(grade?.continuous ?? null)}</td>
                    <td className="px-2 text-right">{fmt(grade?.exam ?? null)}</td>
                    <td className={cn("px-2 text-right font-semibold", avg != null && !isValidated(avg, policy) && "text-danger-600")}>{fmt(avg)}</td>
                    <td className="py-3.5 pl-3 text-right">
                      {avg == null ? <Badge>En attente</Badge> : grade?.exam == null ? <Badge tone="info">Partiel</Badge> : isValidated(avg, policy) ? <Badge tone="forest">Validé</Badge> : <Badge tone="danger">Rattrapage</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        {rows.some((r) => r.att) && (
          <Panel title="Assiduité" className="lg:col-span-12">
            <ul className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map(({ course, att }) =>
                att ? (
                  <li key={course.id}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{course.title}</span>
                      <span className={cn("numeric shrink-0", att.excludedFromExam ? "text-danger-600" : "text-text-muted")}>{Math.round(att.absenceRate * 100)} % d’absence</span>
                    </div>
                    <ProgressBar value={100 - att.absenceRate * 100} tone={att.absenceRate > 0.15 ? "gold" : "forest"} label={`Présence ${course.title}`} />
                    <p className="mt-1 text-xs text-text-muted">
                      {att.present} présences · {att.late} retard{att.late > 1 ? "s" : ""} · {att.absent} absence{att.absent > 1 ? "s" : ""}
                    </p>
                  </li>
                ) : null,
              )}
            </ul>
          </Panel>
        )}
      </div>
    </div>
  );
}
