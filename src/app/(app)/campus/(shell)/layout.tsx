"use client";

import { AppShell, type ShellConfig } from "@/components/shell/app-shell";

const CAMPUS: ShellConfig = {
  space: "Campus étudiant",
  home: "/campus",
  groups: [
    {
      items: [
        { href: "/campus", label: "Aujourd’hui", icon: "today", exact: true },
        { href: "/campus/cours", label: "Mes cours", icon: "book" },
        { href: "/campus/calendrier", label: "Calendrier", icon: "calendar" },
        { href: "/campus/evaluations", label: "Évaluations", icon: "quill" },
        { href: "/campus/resultats", label: "Résultats", icon: "seal" },
      ],
    },
    {
      label: "Ressources",
      items: [
        { href: "/campus/bibliotheque", label: "Bibliothèque", icon: "library" },
        { href: "/campus/messages", label: "Messages", icon: "envelope", badge: "1" },
        { href: "/campus/profil", label: "Profil", icon: "person" },
      ],
    },
  ],
  bottom: ["/campus", "/campus/cours", "/campus/calendrier", "/campus/evaluations"],
};

export default function CampusShellLayout({ children }: { children: React.ReactNode }) {
  return <AppShell config={CAMPUS}>{children}</AppShell>;
}
