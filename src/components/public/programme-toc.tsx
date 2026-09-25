import { PillarGlyph } from "@/components/brand/brand";
import { coursesByLevel } from "@/data/catalog";
import { type Course, PILLAR_LABELS } from "@/domain/types";
import { cn } from "@/lib/cn";

/** Programme présenté comme une table des matières : numéros, points de conduite, pilier. */
export function ProgrammeToc({ courses, detailed = false }: { courses: Course[]; detailed?: boolean }) {
  const levels = [...new Set(courses.map((c) => c.level))].sort();
  return (
    <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
      {levels.map((level) => {
        const list = coursesByLevel(courses, level);
        return (
          <section key={level} aria-labelledby={`annee-${level}`}>
            <header className="flex items-end justify-between border-b border-line-strong pb-4">
              <h3 id={`annee-${level}`} className="font-display text-3xl">
                {level === 1 ? "Première" : level === 2 ? "Deuxième" : `${level}e`} année
              </h3>
              <p className="numeric text-sm text-text-muted">{list.length} cours</p>
            </header>
            <ol>
              {list.map((course, i) => {
                const newTerm = i === 0 || list[i - 1]?.term !== course.term;
                return (
                  <li key={course.id}>
                    {detailed && newTerm && (
                      <p className="eyebrow mt-6 mb-1 text-text-muted">
                        Trimestre {course.term}
                        {course.termProvisional && <span className="ml-2 normal-case tracking-normal italic">(provisoire)</span>}
                      </p>
                    )}
                    <div className={cn("group flex items-baseline gap-3 border-b border-line py-3", detailed && "py-4")}>
                      <span className="numeric w-7 shrink-0 text-xs text-accent">{String(course.order).padStart(2, "0")}</span>
                      <span className="min-w-0">
                        <span className="font-display text-[1.15rem] leading-snug transition-colors group-hover:text-forest-700">{course.title}</span>
                        {detailed && <span className="mt-1 block text-sm text-text-muted">{course.description}</span>}
                      </span>
                      <span aria-hidden className="leader hidden sm:block" />
                      <span className="flex shrink-0 items-center gap-1.5 text-text-muted" title={PILLAR_LABELS[course.pillar].label}>
                        <PillarGlyph pillar={course.pillar} className="size-4" />
                        <span className="sr-only">{PILLAR_LABELS[course.pillar].label}</span>
                        {detailed && <span className="hidden text-xs md:inline">{PILLAR_LABELS[course.pillar].label}</span>}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

export function PillarLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted", className)}>
      {(["discover", "develop", "deploy"] as const).map((p) => (
        <li key={p} className="flex items-center gap-2">
          <PillarGlyph pillar={p} className="size-4 text-accent" />
          {PILLAR_LABELS[p].label}
        </li>
      ))}
    </ul>
  );
}
