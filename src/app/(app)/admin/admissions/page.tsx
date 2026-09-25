"use client";

import { PageHeader } from "@/components/campus/page-header";
import { Icon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/primitives";
import { DEFAULT_SETTINGS } from "@/data/institution";
import { useData } from "@/data/use-data";
import { formatDate } from "@/domain/format";
import { type Application } from "@/domain/types";
import { cn } from "@/lib/cn";

const COLUMNS: { status: Application["status"]; label: string; hint: string }[] = [
  { status: "received", label: "Dossiers reçus", hint: "À examiner" },
  { status: "interview", label: "Entretien préalable", hint: "Rendez-vous à fixer ou mener" },
  { status: "accepted", label: "Admis", hint: "Inscription à finaliser" },
  { status: "declined", label: "Non retenus", hint: "Archivés" },
];

const CHECKLIST: [key: string, label: string][] = [
  ["photos", "4 photos 4×4"],
  ["folder", "Chemise cartonnée"],
  ["form", "Formulaire"],
  ["recommendation", "Recommandation du pasteur"],
  ["testimony", "Témoignage"],
  ["paper", "Rame de papier A4"],
  ["fees", "Frais d’inscription"],
];

export default function AdmissionsPage() {
  const { data, status } = useData("admin:applications", (store) => store.list("applications", { orderBy: ["submittedAt", "desc"] }));
  if (status !== "ready" || !data) return <Skeleton className="h-96" />;
  return (
    <div className="mx-auto max-w-(--container-wide)">
      <PageHeader eyebrow={`Rentrée · ${DEFAULT_SETTINGS.academicYear.startLabel}`} title="Admissions">
        Suivi des candidatures, de l’entretien préalable à l’inscription. Les données de démonstration sont fictives.
      </PageHeader>
      <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {COLUMNS.map((col) => {
          const items = data.filter((a) => a.status === col.status);
          return (
            <section key={col.status} aria-labelledby={`col-${col.status}`} className="w-[80vw] max-w-sm shrink-0 snap-start rounded-md bg-paper-sunken p-3 lg:w-auto lg:max-w-none">
              <header className="flex items-baseline justify-between px-2 pt-1 pb-3">
                <h2 id={`col-${col.status}`} className="font-display text-xl">
                  {col.label}
                </h2>
                <span className="numeric text-sm text-text-muted">{items.length}</span>
              </header>
              <ul className="space-y-3">
                {items.map((a) => {
                  const done = CHECKLIST.filter(([k]) => a.checklist[k]).length;
                  return (
                    <li key={a.id} className="rounded-md bg-paper-raised p-4 shadow-paper ring-1 ring-line">
                      <p className="font-semibold">{a.fullName}</p>
                      <p className="mt-0.5 text-sm text-text-muted">
                        {a.church} · {a.city}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                        <span className="flex gap-0.5" aria-label={`Dossier complet à ${done} sur ${CHECKLIST.length}`}>
                          {CHECKLIST.map(([k, label]) => (
                            <span key={k} title={label} className={cn("h-1.5 w-3 rounded-full", a.checklist[k] ? "bg-forest-600" : "bg-line-strong")} />
                          ))}
                        </span>
                        <span className="numeric">
                          {done}/{CHECKLIST.length} pièces
                        </span>
                      </div>
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
                        <Icon name="clock" className="size-3.5" /> Reçu le {formatDate(a.submittedAt, { day: "numeric", month: "long" })}
                      </p>
                    </li>
                  );
                })}
                {items.length === 0 && <li className="px-2 pb-2 text-sm text-text-muted">{col.hint}</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
