"use client";

import { useState } from "react";
import { PageHeader, Panel } from "@/components/campus/page-header";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Badge, Skeleton } from "@/components/ui/primitives";
import { useSessionUser } from "@/data/auth/auth-provider";
import { getStore } from "@/data/store";
import { invalidate, useData } from "@/data/use-data";
import { capitalize, formatXAF, weekdayName } from "@/domain/format";
import { can } from "@/domain/permissions";
import { type InstitutionSettings } from "@/domain/types";
import { cn } from "@/lib/cn";

const input = "h-10 w-full rounded-sm bg-paper px-3 ring-1 ring-line outline-none focus:ring-2 focus:ring-forest-700 disabled:opacity-60";

function Editor({ initial, canEdit }: { initial: InstitutionSettings; canEdit: boolean }) {
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  async function save() {
    setSaved("saving");
    try {
      const store = await getStore();
      await store.update("settings", "institution", { ...draft, updatedAt: new Date().toISOString() });
      invalidate("admin:");
      setSaved("saved");
    } catch {
      setSaved("error");
    }
  }

  const resolveNotice = (id: string) => setDraft((d) => ({ ...d, notices: d.notices.filter((n) => n.id !== id) }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {draft.notices.length > 0 && (
        <Panel title="Points à confirmer" className="border-l-2 border-l-warning-600 lg:col-span-12">
          <ul className="divide-y divide-line">
            {draft.notices.map((n) => (
              <li key={n.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                <Icon name="alert" className="size-5 shrink-0 text-warning-600" />
                <p className="flex-1 text-sm">{n.message}</p>
                {canEdit && (
                  <button type="button" onClick={() => resolveNotice(n.id)} className="shrink-0 text-sm font-semibold text-forest-700 hover:underline">
                    Marquer comme résolu
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title="Coordonnées institutionnelles" className="lg:col-span-7">
        <fieldset disabled={!canEdit} className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold">Adresses e-mail</p>
            <ul className="space-y-2">
              {draft.emails.map((e, i) => (
                <li key={i} className={cn("rounded-md p-3 ring-1", e.primary ? "ring-2 ring-forest-700" : "ring-line")}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      aria-label="Adresse e-mail"
                      className={input}
                      value={e.address}
                      onChange={(ev) => setDraft((d) => ({ ...d, emails: d.emails.map((x, j) => (j === i ? { ...x, address: ev.target.value } : x)) }))}
                    />
                    <label className="flex shrink-0 items-center gap-2 text-sm">
                      <input type="radio" name="primary-email" checked={e.primary} onChange={() => setDraft((d) => ({ ...d, emails: d.emails.map((x, j) => ({ ...x, primary: j === i })) }))} className="accent-forest-700" />
                      Principale
                    </label>
                    <label className="flex shrink-0 items-center gap-2 text-sm">
                      <input type="checkbox" checked={e.confirmed} onChange={(ev) => setDraft((d) => ({ ...d, emails: d.emails.map((x, j) => (j === i ? { ...x, confirmed: ev.target.checked } : x)) }))} className="accent-forest-700" />
                      Confirmée
                    </label>
                  </div>
                  {e.source && <p className="mt-1.5 text-xs text-text-muted">Source : {e.source}</p>}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {draft.phones.map((p, i) => (
              <label key={i} className="block text-sm">
                <span className="mb-1.5 block font-semibold">Téléphone {i + 1}</span>
                <input className={input} value={p} onChange={(ev) => setDraft((d) => ({ ...d, phones: d.phones.map((x, j) => (j === i ? ev.target.value : x)) }))} />
              </label>
            ))}
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold">Site web</span>
            <input className={input} value={draft.website} onChange={(ev) => setDraft((d) => ({ ...d, website: ev.target.value }))} />
          </label>
        </fieldset>
      </Panel>

      <Panel title="Horaires hebdomadaires" className="lg:col-span-5">
        <fieldset disabled={!canEdit} className="space-y-3">
          {draft.schedule.map((slot, i) => (
            <div key={slot.id} className="grid grid-cols-[6rem_1fr_1fr] items-center gap-2">
              <span className="font-display text-lg">{capitalize(weekdayName(slot.weekday))}</span>
              <input type="time" aria-label={`Début ${weekdayName(slot.weekday)}`} className={input} value={slot.start} onChange={(ev) => setDraft((d) => ({ ...d, schedule: d.schedule.map((x, j) => (j === i ? { ...x, start: ev.target.value } : x)) }))} />
              <input type="time" aria-label={`Fin ${weekdayName(slot.weekday)}`} className={input} value={slot.end} onChange={(ev) => setDraft((d) => ({ ...d, schedule: d.schedule.map((x, j) => (j === i ? { ...x, end: ev.target.value } : x)) }))} />
            </div>
          ))}
        </fieldset>
        <p className="mt-4 text-xs leading-relaxed text-text-muted">Les horaires alimentent le site public, le calendrier et la génération des séances. Aucun horaire n’est codé en dur.</p>
      </Panel>

      <Panel title="Frais de scolarité" className="lg:col-span-7">
        <fieldset disabled={!canEdit}>
          <ul className="divide-y divide-line">
            {draft.fees.map((f, i) => (
              <li key={f.id} className="grid grid-cols-[1fr_9rem] items-center gap-3 py-3 first:pt-0">
                <span>
                  <span className="block font-medium">{f.label}</span>
                  <span className="text-xs text-text-muted">{formatXAF(f.amount)}{f.installments ? ` · ${f.installments} tranches possibles` : ""}</span>
                </span>
                <input type="number" min={0} step={500} aria-label={`Montant ${f.label}`} className={cn(input, "numeric text-right")} value={f.amount} onChange={(ev) => setDraft((d) => ({ ...d, fees: d.fees.map((x, j) => (j === i ? { ...x, amount: Number(ev.target.value) } : x)) }))} />
              </li>
            ))}
          </ul>
        </fieldset>
      </Panel>

      <Panel title="Règles académiques" className="lg:col-span-5">
        <dl className="divide-y divide-line text-sm">
          {[
            ["Note de validation", `${draft.grading.passMark} / ${draft.grading.scale}`],
            ["Pondération CC / examen", `${Math.round(draft.grading.continuousWeight * 100)} % / ${Math.round(draft.grading.examWeight * 100)} %`],
            ["Seuil d’absences", `${Math.round(draft.attendance.maxAbsenceRate * 100)} %`],
            ["Retards pour une absence", String(draft.attendance.latesPerAbsence)],
            ["Délai de justification", `${draft.attendance.justificationDays} jours`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5">
              <dt className="text-text-muted">{k}</dt>
              <dd className="numeric font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-text-muted">Pondération définie par la Direction des études (valeur de démarrage : 40 / 60).</p>
      </Panel>

      <div className="sticky bottom-[calc(var(--bottom-nav-height)+1rem)] z-(--z-sticky) flex items-center justify-end gap-4 rounded-md bg-paper-raised/95 p-3 shadow-lifted ring-1 ring-line backdrop-blur lg:bottom-4 lg:col-span-12">
        <p className="mr-auto pl-2 text-sm text-text-muted" aria-live="polite">
          {!canEdit ? "Lecture seule : votre rôle ne permet pas de modifier les paramètres." : saved === "saved" && !dirty ? "Modifications enregistrées." : saved === "error" ? "Échec de l’enregistrement." : dirty ? "Modifications non enregistrées." : "Aucune modification."}
        </p>
        {canEdit && (
          <>
            <Button variant="ghost" disabled={!dirty} onClick={() => setDraft(initial)}>
              Annuler
            </Button>
            <Button disabled={!dirty || saved === "saving"} onClick={() => void save()}>
              {saved === "saving" ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { role } = useSessionUser();
  const { data, status } = useData("admin:settings", (store) => store.get("settings", "institution"));
  if (status !== "ready") return <Skeleton className="h-96" />;
  return (
    <div className="mx-auto max-w-(--container-wide)">
      <PageHeader eyebrow="Administration" title="Paramètres" actions={data?.updatedAt ? <Badge tone="neutral">Modifié</Badge> : undefined}>
        Coordonnées, horaires, frais et règles : la source unique utilisée par le site public et le campus.
      </PageHeader>
      {data ? <Editor key={data.updatedAt ?? "initial"} initial={data} canEdit={can(role, "settings.write")} /> : <p>Paramètres introuvables. Lancez l’initialisation de l’Institut.</p>}
    </div>
  );
}
