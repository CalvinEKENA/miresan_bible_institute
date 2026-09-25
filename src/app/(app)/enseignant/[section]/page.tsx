"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/campus/page-header";
import { Badge, EmptyState } from "@/components/ui/primitives";

const SECTIONS: Record<string, { title: string; intro: string }> = {
  cours: { title: "Mes cours", intro: "Éditeur de leçons en blocs, ressources et publication." },
  presences: { title: "Présences", intro: "Historique des appels et justificatifs. L’appel du jour se fait depuis l’accueil." },
  evaluations: { title: "Évaluations", intro: "Quiz, travaux, correction des réponses libres et saisie des notes." },
  etudiants: { title: "Étudiants", intro: "Suivi de la progression et de l’assiduité de vos étudiants." },
};

export default function TeacherSection() {
  const { section } = useParams<{ section: string }>();
  const s = SECTIONS[section];
  if (!s) return <EmptyState title="Section introuvable" action={<Link href="/enseignant">Accueil</Link>} />;
  return (
    <div className="mx-auto max-w-(--container-content)">
      <PageHeader eyebrow="Espace enseignant" title={s.title} actions={<Badge tone="gold">En construction</Badge>}>
        {s.intro}
      </PageHeader>
      <EmptyState title="Module en préparation">Ce module sera livré dans une prochaine itération. Les données et les règles d’accès sont déjà prêtes.</EmptyState>
    </div>
  );
}
