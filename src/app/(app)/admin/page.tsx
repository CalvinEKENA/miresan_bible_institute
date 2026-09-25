"use client";

import Link from "next/link";
import { Panel } from "@/components/campus/page-header";
import { Icon, type IconName } from "@/components/ui/icons";
import { Badge, ProgressBar, Skeleton } from "@/components/ui/primitives";
import { loadInstitutionOverview } from "@/data/admin";
import { useSessionUser } from "@/data/auth/auth-provider";
import { useData } from "@/data/use-data";
import { capitalize, formatDate, formatXAF, greeting, relativeDays } from "@/domain/format";
import { cn } from "@/lib/cn";

function Figure({ label, value, detail, href, accent }: { label: string; value: string; detail: string; href: string; accent?: boolean }) {
  return (
    <Link href={href} className="group block bg-paper-raised px-5 py-6 transition-colors hover:bg-paper-sunken lg:px-6">
      <p className="eyebrow text-text-muted">{label}</p>
      <p className={cn("font-display numeric mt-3 text-[clamp(2.4rem,1.8rem+1.6vw,3.4rem)] leading-none", accent && "text-forest-700")}>{value}</p>
      <p className="mt-2 text-sm text-text-muted">{detail}</p>
    </Link>
  );
}

type Alert = { id: string; tone: "danger" | "warning" | "info"; icon: IconName; title: string; text: string; href: string; action: string };

export default function AdminHome() {
  const { profile } = useSessionUser();
  const { data, status } = useData("admin:overview", loadInstitutionOverview);

  if (status !== "ready" || !data) {
    return (
      <div className="mx-auto max-w-(--container-wide) space-y-6">
        <Skeleton className="h-14 w-96" />
        <Skeleton className="h-36" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Skeleton className="h-72 lg:col-span-8" />
          <Skeleton className="h-72 lg:col-span-4" />
        </div>
      </div>
    );
  }

  const now = new Date();
  const name = profile.title ? `${profile.title} ${profile.firstName}` : profile.firstName;
  const byLevel = (l: number) => data.students.filter((s) => (s.level ?? 1) === l).length;
  const pipeline = (["received", "interview", "accepted"] as const).map((s) => ({ status: s, count: data.applications.filter((a) => a.status === s).length }));

  const alerts: Alert[] = [
    ...data.atRisk.slice(0, 2).map((r) => ({
      id: `risk-${r.student.uid}-${r.course.id}`,
      tone: r.summary.excludedFromExam ? ("danger" as const) : ("warning" as const),
      icon: "presence" as const,
      title: `${r.student.displayName} — ${Math.round(r.summary.absenceRate * 100)} % d’absence`,
      text: `${r.course.title}. ${r.summary.excludedFromExam ? "Seuil réglementaire dépassé : accès à l’examen compromis." : "Proche du seuil réglementaire de 25 %."}`,
      href: "/admin/presences",
      action: "Voir les présences",
    })),
    ...(data.payments.behind.length
      ? [
          {
            id: "payments",
            tone: "warning" as const,
            icon: "coins" as const,
            title: `${data.payments.behind.length} étudiants en retard sur la 1re tranche`,
            text: "Inscription réglée mais pension non soldée pour la première tranche.",
            href: "/admin/paiements",
            action: "Suivre les paiements",
          },
        ]
      : []),
    ...(data.settings?.notices ?? []).map((n) => ({
      id: n.id,
      tone: n.severity === "warning" ? ("warning" as const) : ("info" as const),
      icon: "cog" as const,
      title: n.id === "thursday-hours" ? "Horaire du jeudi à confirmer" : n.id === "contact-email" ? "Adresse e-mail officielle à confirmer" : "Répartition des cours par trimestre provisoire",
      text: n.message,
      href: "/admin/parametres",
      action: "Ouvrir les paramètres",
    })),
  ];

  return (
    <div className="mx-auto max-w-(--container-wide)">
      {/* En-tête éditorial */}
      <header className="reveal flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-accent">{capitalize(formatDate(now.toISOString(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</p>
          <h1 className="font-display mt-3 text-[clamp(2.4rem,1.6rem+3vw,4.2rem)] leading-[1]">
            {greeting(now)} <em className="text-forest-700">{name}</em>
          </h1>
          <p className="mt-3 text-lg text-text-muted">Aujourd’hui à l’Institut · Année {data.settings?.academicYear.label ?? ""} · Trimestre 1</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/annonces" className="inline-flex h-10 items-center gap-2 rounded-sm bg-forest-800 px-4 text-sm font-semibold text-ivory-50 hover:bg-forest-700">
            <Icon name="megaphone" className="size-4" /> Publier une annonce
          </Link>
          <Link href="/campus" className="inline-flex h-10 items-center gap-2 rounded-sm px-4 text-sm font-semibold ring-1 ring-line-strong hover:bg-paper-sunken">
            Voir le campus étudiant
          </Link>
        </div>
      </header>

      {/* Registre : chiffres du jour */}
      <section aria-label="Indicateurs" className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md bg-line shadow-paper ring-1 ring-line md:grid-cols-3 xl:grid-cols-5 [&>*:last-child]:col-span-2 xl:[&>*:last-child]:col-span-1">
        <Figure label="Étudiants actifs" value={String(data.students.length)} detail={`${byLevel(1)} en 1re année · ${byLevel(2)} en 2e`} href="/admin/etudiants" accent />
        <Figure label="Cours actifs" value={String(data.activeCourses.length)} detail={`Trimestre 1 · ${data.coursesWithContent} cours avec contenu`} href="/admin/cours" />
        <Figure label="Présence" value={`${Math.round(data.attendanceRate * 100)} %`} detail={`${data.atRisk.length} situation(s) à suivre`} href="/admin/presences" />
        <Figure label="Pension recouvrée" value={`${Math.round(data.payments.rate * 100)} %`} detail={`${formatXAF(data.payments.collected)} encaissés`} href="/admin/paiements" />
        <Figure label="Candidatures" value={String(data.applications.length)} detail={`${pipeline[1]?.count ?? 0} entretien(s) à mener`} href="/admin/admissions" />
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* À traiter */}
        <Panel title="À traiter" className="lg:col-span-8" action={<span className="numeric text-sm text-text-muted">{alerts.length} éléments</span>}>
          <ul className="divide-y divide-line">
            {alerts.map((a) => (
              <li key={a.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <span className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-full", a.tone === "danger" ? "bg-danger-100 text-danger-600" : a.tone === "warning" ? "bg-warning-100 text-warning-600" : "bg-info-100 text-info-600")}>
                  <Icon name={a.icon} className="size-[1.1rem]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{a.title}</p>
                  <p className="mt-0.5 text-sm text-text-muted">{a.text}</p>
                </div>
                <Link href={a.href} className="hidden shrink-0 self-center text-sm font-semibold text-forest-700 hover:underline sm:block">
                  {a.action}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Examens */}
        <Panel title="Examens à venir" className="lg:col-span-4 lg:self-start" action={<Link href="/admin/examens" className="text-sm font-semibold text-forest-700 hover:underline">Tout voir</Link>}>
          <ul className="space-y-4">
            {data.exams.map((e) => (
              <li key={e.id} className="flex gap-4">
                <span className="w-12 shrink-0 rounded-sm bg-paper-sunken py-1.5 text-center">
                  <span className="font-display numeric block text-xl leading-none">{formatDate(e.start, { day: "numeric" })}</span>
                  <span className="text-[0.625rem] font-semibold tracking-[0.08em] text-text-muted uppercase">{formatDate(e.start, { month: "short" })}</span>
                </span>
                <span>
                  <span className="block text-[0.9375rem] leading-snug font-medium">{e.title}</span>
                  <span className="text-xs text-text-muted">{relativeDays(e.start, now)}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Paiements */}
        <Panel title="Scolarité" className="lg:col-span-5" action={<Link href="/admin/paiements" className="text-sm font-semibold text-forest-700 hover:underline">Paiements</Link>}>
          <div className="flex items-baseline justify-between">
            <p className="font-display numeric text-2xl whitespace-nowrap">{formatXAF(data.payments.collected)}</p>
            <p className="numeric text-sm text-text-muted">sur {formatXAF(data.payments.expected)}</p>
          </div>
          <ProgressBar value={data.payments.rate * 100} tone="gold" className="mt-3 h-1.5" label="Taux de recouvrement" />
          <p className="mt-2 text-xs text-text-muted">Inscription + pension annuelle attendues pour les étudiants actifs.</p>
          <ul className="mt-5 divide-y divide-line border-t border-line text-sm">
            {data.payments.recent.map((p) => {
              const s = data.users.find((u) => u.uid === p.uid);
              return (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{s?.displayName}</span>
                    <span className="text-xs text-text-muted">
                      {p.label} · {p.method === "mobile_money" ? "Mobile Money" : p.method === "cash" ? "Espèces" : "Banque"}
                    </span>
                  </span>
                  <span className="numeric shrink-0">{formatXAF(p.amount)}</span>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Admissions */}
        <Panel title="Admissions" className="lg:col-span-3" action={<Link href="/admin/admissions" className="text-sm font-semibold text-forest-700 hover:underline">Dossiers</Link>}>
          <ol className="space-y-3">
            {pipeline.map((p, i) => (
              <li key={p.status} className="flex items-center gap-3">
                <span className="font-display numeric w-10 text-3xl leading-none">{p.count}</span>
                <span className="flex-1 border-b border-dashed border-line pb-1 text-sm">{["Dossiers reçus", "Entretiens", "Admis"][i]}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-xs text-text-muted">Rentrée : {data.settings?.academicYear.startLabel}</p>
        </Panel>

        {/* Annonces */}
        <Panel title="Annonces" className="lg:col-span-4" action={<Link href="/admin/annonces" className="text-sm font-semibold text-forest-700 hover:underline">Gérer</Link>}>
          <ul className="space-y-4">
            {data.announcements.slice(0, 3).map((a) => (
              <li key={a.id}>
                <div className="flex items-center gap-2">
                  <Badge tone={a.audience === "public" ? "gold" : a.audience === "staff" ? "info" : "forest"}>{a.audience === "public" ? "Public" : a.audience === "staff" ? "Personnel" : "Étudiants"}</Badge>
                  <span className="numeric text-xs text-text-muted">{formatDate(a.publishedAt, { day: "numeric", month: "short" })}</span>
                </div>
                <p className="font-display mt-1.5 text-lg leading-snug">{a.title}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
