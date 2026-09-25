"use client";

import { useState } from "react";
import { PillarGlyph } from "@/components/brand/brand";
import { CourseCover } from "@/components/campus/course-cover";
import { PageHeader } from "@/components/campus/page-header";
import { useStudentOverview } from "@/components/campus/use-student";
import { Skeleton } from "@/components/ui/primitives";
import { PILLARS, PILLAR_LABELS, type Pillar } from "@/domain/types";
import { cn } from "@/lib/cn";

export default function CoursesPage() {
  const { data, status, profile } = useStudentOverview();
  const [pillar, setPillar] = useState<Pillar | "all">("all");

  if (status !== "ready" || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 12 }, (_, i) => (
          <Skeleton key={i} className="aspect-[3/4] h-auto" />
        ))}
      </div>
    );
  }

  const filtered = data.courses.filter((c) => pillar === "all" || c.course.pillar === pillar);
  const terms = [...new Set(filtered.map((c) => c.course.term))].sort();

  return (
    <div className="mx-auto max-w-(--container-content)">
      <PageHeader eyebrow={`${profile.level === 2 ? "Deuxième" : "Première"} année · ${data.courses.length} enseignements`} title="Mes cours">
        Votre bibliothèque de l’année, rangée par trimestre.
      </PageHeader>

      <div role="tablist" aria-label="Filtrer par pilier" className="scrollbar-none -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {(["all", ...PILLARS] as const).map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={pillar === p}
            onClick={() => setPillar(p)}
            className={cn(
              "flex h-9 shrink-0 items-center gap-2 rounded-sm px-3.5 text-sm font-medium ring-1 transition-colors",
              pillar === p ? "bg-forest-800 text-ivory-50 ring-forest-800" : "text-text-soft ring-line hover:ring-line-strong",
            )}
          >
            {p !== "all" && <PillarGlyph pillar={p} className="size-4" />}
            {p === "all" ? "Tous" : PILLAR_LABELS[p].label}
          </button>
        ))}
      </div>

      {terms.map((term) => {
        const list = filtered.filter((c) => c.course.term === term);
        return (
          <section key={term} className="mb-12" aria-labelledby={`t${term}`}>
            <div className="mb-5 flex items-baseline gap-4">
              <h2 id={`t${term}`} className="font-display text-2xl">
                Trimestre {term}
              </h2>
              <span aria-hidden className="h-px flex-1 bg-line" />
              {list[0]?.course.termProvisional && <span className="text-xs text-text-muted italic">répartition provisoire</span>}
            </div>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5 xl:grid-cols-6">
              {list.map((c) => (
                <li key={c.course.id}>
                  <CourseCover course={c.course} percent={c.percent} lessons={c.lessons.length} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
