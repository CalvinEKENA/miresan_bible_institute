"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Logo } from "@/components/brand/brand";
import { PageHeader, Panel } from "@/components/campus/page-header";
import { Button } from "@/components/ui/button";
import { useAuth, useSessionUser } from "@/data/auth/auth-provider";
import { passwordIssues } from "@/domain/identity";
import { ROLE_LABELS } from "@/domain/roles";
import { DATA_MODE } from "@/lib/env";

/** Carte d'étudiant : l'identité institutionnelle, déclinée à l'écran. */
function StudentCard() {
  const { profile, username } = useSessionUser();
  const year = profile.level === 2 ? "2e année" : "1re année";
  const bow = profile.level === 2 ? { label: "vert", color: "#1b6647" } : { label: "bleu", color: "#2f5d8a" };
  return (
    <div className="relative mx-auto aspect-[1.586] w-full max-w-md overflow-hidden rounded-xl bg-forest-900 p-6 text-ivory-50 shadow-lifted">
      <span aria-hidden className="absolute inset-2 rounded-lg border border-gold-500/30" />
      <span aria-hidden className="absolute -right-16 -bottom-20 size-64 rounded-full bg-[radial-gradient(circle,rgb(207_174_98/0.25),transparent_70%)]" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center gap-3">
          <Logo size={48} className="size-11 object-contain" />
          <div className="leading-tight">
            <p className="text-[0.625rem] font-semibold tracking-[0.18em] text-gold-300 uppercase">Carte d’étudiant</p>
            <p className="font-display text-base">Institut Biblique de la MIRESAN</p>
          </div>
        </div>
        <div className="mt-auto">
          <p className="font-display text-[1.75rem] leading-none">{profile.displayName}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 text-xs text-ivory-50/70">
            <span>{profile.role === "student" ? `Diplôme de Théologie · ${year}` : ROLE_LABELS[profile.role]}</span>
            <span className="numeric">@{username}</span>
          </p>
        </div>
        {profile.role === "student" && (
          <p className="absolute top-0 right-0 flex items-center gap-2 text-[0.625rem] tracking-[0.12em] text-ivory-50/60 uppercase">
            <span className="h-2.5 w-5 rounded-full" style={{ background: bow.color }} aria-hidden /> nœud {bow.label}
          </p>
        )}
      </div>
    </div>
  );
}

function ChangePassword() {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const issues = next ? passwordIssues(next) : [];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (issues.length || next !== confirm) {
      setMessage({ ok: false, text: next !== confirm ? "Les deux mots de passe ne correspondent pas." : issues.join(" ") });
      return;
    }
    setPending(true);
    try {
      await changePassword(current, next);
      setMessage({ ok: true, text: DATA_MODE === "demo" ? "Mode démo : aucun mot de passe n’est modifié." : "Mot de passe mis à jour." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setMessage({ ok: false, text: "Mot de passe actuel incorrect ou session expirée." });
    } finally {
      setPending(false);
    }
  }

  const input = "h-11 w-full rounded-sm bg-paper px-3 ring-1 ring-line outline-none focus:ring-2 focus:ring-forest-700";
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Mot de passe actuel</span>
        <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={input} required />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Nouveau mot de passe</span>
        <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={input} required aria-describedby="pw-rules" />
        <span id="pw-rules" className="mt-1.5 block text-xs text-text-muted">
          Au moins 8 caractères, dont une lettre et un chiffre.
        </span>
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Confirmer</span>
        <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} required />
      </label>
      {message && (
        <p role="status" className={message.ok ? "text-sm text-forest-700" : "text-sm text-danger-600"}>
          {message.text}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Changer le mot de passe"}
      </Button>
    </form>
  );
}

export default function ProfilePage() {
  const { profile, username } = useSessionUser();
  const { signOut } = useAuth();
  const router = useRouter();
  return (
    <div className="mx-auto max-w-(--container-content)">
      <PageHeader eyebrow="Mon compte" title="Profil" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <StudentCard />
          <Panel title="Informations">
            <dl className="divide-y divide-line text-sm">
              {[
                ["Identifiant", `@${username}`],
                ["Nom", profile.displayName],
                ["Rôle", ROLE_LABELS[profile.role]],
                ["Promotion", profile.cohortId ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-text-muted">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-text-muted">Pour corriger une information, adressez-vous au secrétariat académique.</p>
          </Panel>
        </div>
        <div className="space-y-6 lg:col-span-7">
          <Panel title="Sécurité">
            <ChangePassword />
          </Panel>
          <Panel title="Session">
            <p className="text-sm text-text-muted">Sur un appareil partagé, pensez à vous déconnecter après usage.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={async () => {
                await signOut();
                router.replace("/connexion");
              }}
            >
              Se déconnecter
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
