"use client";

import { RequireRole } from "@/components/auth/require-role";
import { AppShell, type ShellConfig } from "@/components/shell/app-shell";
import { STAFF_ROLES } from "@/domain/roles";

const ADMIN: ShellConfig = {
  space: "Administration",
  home: "/admin",
  groups: [
    {
      items: [{ href: "/admin", label: "Vue générale", icon: "compass", exact: true }],
    },
    {
      label: "Scolarité",
      items: [
        { href: "/admin/etudiants", label: "Étudiants", icon: "people" },
        { href: "/admin/admissions", label: "Admissions", icon: "door" },
        { href: "/admin/enseignants", label: "Enseignants", icon: "chalk" },
        { href: "/admin/presences", label: "Présences", icon: "presence" },
        { href: "/admin/notes", label: "Notes", icon: "seal" },
        { href: "/admin/memoires", label: "Mémoires", icon: "scroll" },
        { href: "/admin/stages", label: "Stages", icon: "compass" },
      ],
    },
    {
      label: "Pédagogie",
      items: [
        { href: "/admin/programmes", label: "Programmes", icon: "layers" },
        { href: "/admin/cours", label: "Cours", icon: "book" },
        { href: "/admin/lecons", label: "Leçons", icon: "document" },
        { href: "/admin/quiz", label: "Quiz", icon: "quill" },
        { href: "/admin/examens", label: "Examens", icon: "checklist" },
        { href: "/admin/bibliotheque", label: "Bibliothèque", icon: "library" },
      ],
    },
    {
      label: "Administration",
      items: [
        { href: "/admin/paiements", label: "Paiements", icon: "coins" },
        { href: "/admin/documents", label: "Documents", icon: "scroll" },
        { href: "/admin/annonces", label: "Annonces", icon: "megaphone" },
        { href: "/admin/calendrier", label: "Calendrier", icon: "calendar" },
        { href: "/admin/parametres", label: "Paramètres", icon: "cog" },
        { href: "/admin/profil", label: "Mon profil", icon: "person" },
      ],
    },
  ],
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={STAFF_ROLES}>
      <AppShell config={ADMIN}>{children}</AppShell>
    </RequireRole>
  );
}
