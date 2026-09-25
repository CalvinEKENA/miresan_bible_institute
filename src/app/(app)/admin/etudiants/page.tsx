"use client";

import { useDeferredValue, useState } from "react";
import { Monogram } from "@/components/brand/brand";
import { PageHeader } from "@/components/campus/page-header";
import { Icon } from "@/components/ui/icons";
import { Badge, ProgressBar, Skeleton } from "@/components/ui/primitives";
import { loadInstitutionOverview } from "@/data/admin";
import { useData } from "@/data/use-data";
import { formatXAF, initials } from "@/domain/format";
import { cn } from "@/lib/cn";

export default function StudentsPage() {
  const { data, status } = useData("admin:overview", loadInstitutionOverview);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<0 | 1 | 2>(0);
  const q = useDeferredValue(query);
  const payments = useData("admin:payments", (store) => store.list("payments"));
  const progress = useData("admin:progress", (store) => store.list("progress"));

  if (status !== "ready" || !data) return <Skeleton className="h-96" />;

  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const rows = data.students
    .filter((s) => (level ? (s.level ?? 1) === level : true))
    .filter((s) => !q || norm(`${s.displayName} ${s.username}`).includes(norm(q)))
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  const annual = (data.settings?.fees ?? []).filter((f) => f.id === "registration" || f.id === "tuition").reduce((s, f) => s + f.amount, 0);

  return (
    <div className="mx-auto max-w-(--container-wide)">
      <PageHeader eyebrow="Scolarité" title="Étudiants" actions={<span className="numeric self-end text-sm text-text-muted">{data.students.length} actifs</span>}>
        Promotions, progression, assiduité et situation financière.
      </PageHeader>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Rechercher un étudiant</span>
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher par nom ou identifiant…" className="h-11 w-full rounded-sm bg-paper-raised pr-3 pl-9 ring-1 ring-line outline-none focus:ring-2 focus:ring-forest-700" />
        </label>
        <div role="tablist" aria-label="Niveau" className="flex gap-1 rounded-sm bg-paper-sunken p-1">
          {([0, 1, 2] as const).map((l) => (
            <button key={l} role="tab" aria-selected={level === l} onClick={() => setLevel(l)} className={cn("h-9 rounded-xs px-3 text-sm font-medium", level === l ? "bg-paper-raised shadow-paper" : "text-text-muted")}>
              {l === 0 ? "Tous" : l === 1 ? "1re année" : "2e année"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md bg-paper-raised shadow-paper ring-1 ring-line">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="border-b border-line-strong text-xs tracking-[0.08em] text-text-muted uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Étudiant</th>
              <th className="px-3 py-3 font-semibold">Niveau</th>
              <th className="px-3 py-3 font-semibold">Progression</th>
              <th className="px-3 py-3 font-semibold">Assiduité</th>
              <th className="px-5 py-3 text-right font-semibold">Scolarité</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const paid = (payments.data ?? []).filter((p) => p.uid === s.uid && (p.feeId === "registration" || p.feeId.startsWith("tuition"))).reduce((t, p) => t + p.amount, 0);
              const mine = (progress.data ?? []).filter((p) => p.uid === s.uid);
              const pct = mine.length ? Math.round(mine.reduce((t, p) => t + p.percent, 0) / Math.max(mine.length, 1)) : 0;
              const risk = data.atRisk.find((r) => r.student.uid === s.uid);
              return (
                <tr key={s.uid} className="border-b border-line last:border-0 hover:bg-paper-sunken/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Monogram initials={initials(s.displayName)} size={36} className="text-[0.75rem]" />
                      <div>
                        <p className="font-medium">{s.displayName}</p>
                        <p className="text-xs text-text-muted">@{s.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3">
                    <span className="flex items-center gap-2">
                      <span aria-hidden className="h-2 w-4 rounded-full" style={{ background: (s.level ?? 1) === 2 ? "#1b6647" : "#2f5d8a" }} />
                      {(s.level ?? 1) === 2 ? "2e année" : "1re année"}
                    </span>
                  </td>
                  <td className="w-44 px-3">
                    {mine.length ? (
                      <span className="flex items-center gap-2">
                        <ProgressBar value={pct} label={`Progression ${s.displayName}`} />
                        <span className="numeric w-9 text-right text-xs text-text-muted">{pct} %</span>
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">Pas encore commencé</span>
                    )}
                  </td>
                  <td className="px-3">
                    {risk ? <Badge tone={risk.summary.excludedFromExam ? "danger" : "warning"}>{Math.round(risk.summary.absenceRate * 100)} % abs. · {risk.course.code}</Badge> : <Badge tone="forest">Régulière</Badge>}
                  </td>
                  <td className="px-5 text-right">
                    <span className="numeric block">{formatXAF(paid)}</span>
                    <span className="text-xs text-text-muted">{annual ? Math.round((paid / annual) * 100) : 0} % de l’annuel</span>
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
