import Link from "next/link";
import { PillarGlyph } from "@/components/brand/brand";
import { ProgressBar } from "@/components/ui/primitives";
import { type Course, PILLAR_LABELS } from "@/domain/types";
import { cn } from "@/lib/cn";

const COVER: Record<Course["pillar"], string> = {
  discover: "bg-[linear-gradient(160deg,#f6f1e6,#eee6d5)] text-ink-900",
  develop: "bg-[linear-gradient(160deg,#d4ddd3,#b3c3b6)] text-ink-900",
  deploy: "bg-[linear-gradient(160deg,#145039,#0b2a1f)] text-ivory-50",
};

/** Couverture de livre : le cours comme un volume de la bibliothèque de l'étudiant. */
export function CourseCover({ course, percent, lessons, className }: { course: Course; percent: number; lessons: number; className?: string }) {
  const dark = course.pillar === "deploy";
  return (
    <Link
      href={`/campus/cours/${course.id}`}
      className={cn(
        "group relative flex aspect-[3/4] flex-col overflow-hidden rounded-r-md rounded-l-xs p-4 shadow-paper ring-1 ring-black/5 transition-[transform,box-shadow] duration-(--duration-base) ease-(--ease-editorial) hover:-translate-y-1 hover:shadow-lifted sm:p-5",
        COVER[course.pillar],
        className,
      )}
    >
      {/* Mors de la reliure */}
      <span aria-hidden className={cn("absolute inset-y-0 left-2.5 w-px", dark ? "bg-ivory-50/15" : "bg-ink-900/10")} />
      <span aria-hidden className={cn("absolute inset-2 rounded-r-sm border", dark ? "border-gold-500/25" : "border-gold-800/20")} />
      <div className="relative flex items-center justify-between">
        <span className={cn("numeric text-[0.6875rem] font-semibold tracking-[0.1em]", dark ? "text-gold-300" : "text-gold-800")}>{course.code}</span>
        <PillarGlyph pillar={course.pillar} className={cn("size-4", dark ? "text-gold-300/80" : "text-gold-800/80")} />
      </div>
      <h3 className="font-display relative mt-auto text-[1.2rem] leading-[1.12] sm:text-[1.35rem]">{course.title}</h3>
      <p className={cn("relative mt-2 text-[0.6875rem] font-medium tracking-[0.06em] uppercase", dark ? "text-ivory-50/60" : "text-stone-500")}>
        {PILLAR_LABELS[course.pillar].label} · {lessons > 0 ? `${lessons} leçons` : "En préparation"}
      </p>
      <div className="relative mt-3 flex items-center gap-2">
        <ProgressBar value={percent} tone={dark ? "light" : "forest"} label={`Progression : ${percent} %`} />
        <span className={cn("numeric text-[0.6875rem] font-semibold", dark ? "text-ivory-50/75" : "text-stone-600")}>{percent}%</span>
      </div>
    </Link>
  );
}
