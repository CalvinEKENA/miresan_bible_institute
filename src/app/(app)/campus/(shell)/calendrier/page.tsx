"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/campus/page-header";
import { useStudentOverview } from "@/components/campus/use-student";
import { Icon } from "@/components/ui/icons";
import { Badge, Skeleton } from "@/components/ui/primitives";
import { capitalize, formatDate, formatTime } from "@/domain/format";
import { type CalendarEvent, type EventKind } from "@/domain/types";
import { cn } from "@/lib/cn";

const KIND: Record<EventKind, { label: string; tone: "forest" | "danger" | "warning" | "gold" | "info" | "neutral"; dot: string }> = {
  class: { label: "Cours", tone: "forest", dot: "bg-forest-600" },
  exam: { label: "Examen", tone: "danger", dot: "bg-danger-600" },
  deadline: { label: "Échéance", tone: "warning", dot: "bg-warning-600" },
  ceremony: { label: "Cérémonie", tone: "gold", dot: "bg-gold-600" },
  holiday: { label: "Congé", tone: "info", dot: "bg-info-600" },
  event: { label: "Événement", tone: "neutral", dot: "bg-stone-500" },
};

const dayKey = (iso: string) => formatDate(iso, { year: "numeric", month: "2-digit", day: "2-digit" });

function MonthGrid({ month, events, selected, onSelect }: { month: Date; events: CalendarEvent[]; selected: string | null; onSelect: (k: string | null) => void }) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // semaine commençant le lundi
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const byDay = new Map<string, CalendarEvent[]>();
  for (const e of events) byDay.set(dayKey(e.start), [...(byDay.get(dayKey(e.start)) ?? []), e]);
  const today = dayKey(new Date().toISOString());
  return (
    <div>
      <div className="grid grid-cols-7 text-center text-[0.6875rem] font-semibold tracking-[0.1em] text-text-muted uppercase">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i} className="py-2">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const date = new Date(month.getFullYear(), month.getMonth(), i + 1, 12);
          const key = dayKey(date.toISOString());
          const list = byDay.get(key) ?? [];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(selected === key ? null : key)}
              aria-pressed={selected === key}
              aria-label={`${formatDate(date.toISOString(), { day: "numeric", month: "long" })}${list.length ? `, ${list.length} événement(s)` : ""}`}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-sm text-sm transition-colors",
                key === today && "font-bold text-forest-700",
                selected === key ? "bg-forest-800 text-ivory-50" : list.length ? "bg-paper-raised ring-1 ring-line hover:ring-accent/50" : "text-text-muted hover:bg-paper-sunken",
              )}
            >
              <span className="numeric">{i + 1}</span>
              {list.length > 0 && (
                <span className="absolute bottom-1.5 flex gap-0.5">
                  {list.slice(0, 3).map((e) => (
                    <span key={e.id} className={cn("size-1 rounded-full", KIND[e.kind].dot)} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { data, status } = useStudentOverview();
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);

  const groups = useMemo(() => {
    const now = new Date();
    const upcoming = (data?.events ?? []).filter((e) => new Date(e.end) >= now || (selected && dayKey(e.start) === selected));
    const filtered = selected ? upcoming.filter((e) => dayKey(e.start) === selected) : upcoming;
    const map = new Map<string, CalendarEvent[]>();
    for (const e of filtered) map.set(dayKey(e.start), [...(map.get(dayKey(e.start)) ?? []), e]);
    return [...map.entries()];
  }, [data, selected]);

  if (status !== "ready" || !data) return <Skeleton className="h-96" />;

  return (
    <div className="mx-auto max-w-(--container-content)">
      <PageHeader eyebrow="Année académique 2026 – 2027" title="Calendrier">
        Séances, examens et échéances. Les horaires sont fixés par l’administration de l’Institut.
      </PageHeader>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="rounded-md bg-paper-raised p-5 shadow-paper ring-1 ring-line lg:sticky lg:top-24">
            <div className="mb-3 flex items-center justify-between">
              <button type="button" className="grid size-9 place-items-center rounded-sm hover:bg-paper-sunken" aria-label="Mois précédent" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
                <Icon name="arrowLeft" className="size-4" />
              </button>
              <p className="font-display text-xl">{capitalize(formatDate(month.toISOString(), { month: "long", year: "numeric" }))}</p>
              <button type="button" className="grid size-9 place-items-center rounded-sm hover:bg-paper-sunken" aria-label="Mois suivant" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
                <Icon name="arrowRight" className="size-4" />
              </button>
            </div>
            <MonthGrid month={month} events={data.events} selected={selected} onSelect={setSelected} />
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-4 text-xs text-text-muted">
              {(["class", "exam", "deadline", "ceremony"] as const).map((k) => (
                <li key={k} className="flex items-center gap-1.5">
                  <span className={cn("size-1.5 rounded-full", KIND[k].dot)} /> {KIND[k].label}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="lg:col-span-8" aria-label="Agenda">
          {selected && (
            <button type="button" onClick={() => setSelected(null)} className="mb-4 text-sm font-semibold text-forest-700 hover:underline">
              ← Tout l’agenda
            </button>
          )}
          <ol className="space-y-8">
            {groups.map(([key, list]) => {
              const first = list[0]!;
              return (
                <li key={key} className="grid grid-cols-1 gap-4 sm:grid-cols-[6.5rem_1fr]">
                  <div className="flex items-baseline gap-3 sm:block">
                    <p className="font-display numeric text-4xl leading-none">{formatDate(first.start, { day: "numeric" })}</p>
                    <p className="text-sm text-text-muted">{capitalize(formatDate(first.start, { weekday: "long" }))} · {formatDate(first.start, { month: "long" })}</p>
                  </div>
                  <ul className="space-y-3">
                    {list.map((e) => (
                      <li key={e.id} className={cn("rounded-md border-l-2 bg-paper-raised p-4 ring-1 ring-line", e.kind === "exam" ? "border-l-danger-600" : e.kind === "deadline" ? "border-l-warning-600" : e.kind === "ceremony" ? "border-l-gold-600" : "border-l-forest-600")}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">{e.title}</p>
                          <Badge tone={KIND[e.kind].tone}>{KIND[e.kind].label}</Badge>
                        </div>
                        <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
                          {e.start !== e.end && (
                            <span className="numeric flex items-center gap-1.5">
                              <Icon name="clock" className="size-3.5" /> {formatTime(e.start)} – {formatTime(e.end)}
                            </span>
                          )}
                          {e.location && (
                            <span className="flex items-center gap-1.5">
                              <Icon name="pin" className="size-3.5" /> {e.location}
                            </span>
                          )}
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
