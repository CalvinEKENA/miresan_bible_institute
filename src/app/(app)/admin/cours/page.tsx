"use client";

import { useState } from "react";
import { PillarGlyph } from "@/components/brand/brand";
import { PageHeader } from "@/components/campus/page-header";
import { Badge, Skeleton } from "@/components/ui/primitives";
import { useData } from "@/data/use-data";
import { PILLAR_LABELS } from "@/domain/types";
import { cn } from "@/lib/cn";

export default function AdminCoursesPage() {
  const [level, setLevel] = useState(1);
  const { data, status } = useData("admin:courses", async (store) => {
    const [courses, lessons, users, programs] = await Promise.all([store.list("courses"), store.list("lessons"), store.list("users", { where: [["role", "==", "teacher"]] }), store.list("programs")]);
    return { courses, lessons, users, programs };
  });
  if (status !== "ready" || !data) return <Skeleton className="h-96" />;

  const list = data.courses.filter((c) => c.level === level).sort((a, b) => a.order - b.order);
  const program = data.programs[0];

  return (
    <div className="mx-auto max-w-(--container-wide)">
      <PageHeader eyebrow={program?.title ?? "Programme"} title="Cours">
        Catalogue administrable : intitulés, pilier, trimestre, enseignants et statut de publication. Le programme n’est pas limité à 36 cours ni à deux niveaux.
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Niveau" className="flex gap-1 rounded-sm bg-paper-sunken p-1">
          {(program?.levels ?? []).map((l) => (
            <button key={l.id} role="tab" aria-selected={level === l.order} onClick={() => setLevel(l.order)} className={cn("h-9 rounded-xs px-4 text-sm font-medium", level === l.order ? "bg-paper-raised shadow-paper" : "text-text-muted")}>
              {l.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-text-muted">
          <Badge tone="warning">Provisoire</Badge> <span className="ml-1">Répartition par trimestre à fixer par la Direction des études.</span>
        </p>
      </div>

      <div className="overflow-x-auto rounded-md bg-paper-raised shadow-paper ring-1 ring-line">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="border-b border-line-strong text-xs tracking-[0.08em] text-text-muted uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Code</th>
              <th className="px-3 py-3 font-semibold">Intitulé</th>
              <th className="px-3 py-3 font-semibold">Pilier</th>
              <th className="px-3 py-3 font-semibold">Trimestre</th>
              <th className="px-3 py-3 font-semibold">Leçons</th>
              <th className="px-3 py-3 font-semibold">Enseignant</th>
              <th className="px-5 py-3 text-right font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const lessons = data.lessons.filter((l) => l.courseId === c.id).length;
              const teacher = data.users.find((u) => c.teacherIds.includes(u.uid));
              return (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-paper-sunken/50">
                  <td className="numeric px-5 py-3.5 font-semibold text-accent">{c.code}</td>
                  <td className="px-3">
                    <span className="font-display text-base">{c.title}</span>
                  </td>
                  <td className="px-3">
                    <span className="flex items-center gap-1.5 text-text-soft">
                      <PillarGlyph pillar={c.pillar} className="size-4 text-accent" /> {PILLAR_LABELS[c.pillar].label}
                    </span>
                  </td>
                  <td className="px-3">
                    T{c.term}
                    {c.termProvisional && <span className="ml-1 text-xs text-text-muted italic">prov.</span>}
                  </td>
                  <td className="numeric px-3">{lessons || <span className="text-text-muted">—</span>}</td>
                  <td className="px-3 text-text-soft">{teacher?.displayName ?? <span className="text-text-muted">À affecter</span>}</td>
                  <td className="px-5 text-right">
                    <Badge tone={c.status === "published" ? "forest" : c.status === "draft" ? "neutral" : "info"}>{c.status === "published" ? "Publié" : c.status === "draft" ? "Brouillon" : "Archivé"}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
