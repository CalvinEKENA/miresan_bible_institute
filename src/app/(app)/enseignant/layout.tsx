"use client";

import { RequireRole } from "@/components/auth/require-role";
import { AppShell, type ShellConfig } from "@/components/shell/app-shell";

const TEACHER: ShellConfig = {
  space: "Espace enseignant",
  home: "/enseignant",
  groups: [
    {
      items: [
        { href: "/enseignant", label: "Aujourd’hui", icon: "today", exact: true },
        { href: "/enseignant/cours", label: "Mes cours", icon: "book" },
        { href: "/enseignant/presences", label: "Présences", icon: "presence" },
        { href: "/enseignant/evaluations", label: "Évaluations", icon: "quill" },
        { href: "/enseignant/etudiants", label: "Étudiants", icon: "people" },
        { href: "/enseignant/profil", label: "Profil", icon: "person" },
      ],
    },
  ],
  bottom: ["/enseignant", "/enseignant/cours", "/enseignant/presences", "/enseignant/evaluations"],
};

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={["teacher", "dean", "academic_secretariat", "director", "founder", "super_admin"]}>
      <AppShell config={TEACHER}>{children}</AppShell>
    </RequireRole>
  );
}
