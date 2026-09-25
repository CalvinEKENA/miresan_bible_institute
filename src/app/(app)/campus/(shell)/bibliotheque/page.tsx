"use client";

import { PageHeader } from "@/components/campus/page-header";
import { Icon, type IconName } from "@/components/ui/icons";
import { Badge, Skeleton } from "@/components/ui/primitives";
import { useData } from "@/data/use-data";
import { type LibraryResource } from "@/domain/types";

const KIND: Record<LibraryResource["kind"], { label: string; icon: IconName }> = {
  book: { label: "Livre", icon: "book" },
  pdf: { label: "PDF", icon: "pdf" },
  audio: { label: "Audio", icon: "headphones" },
  video: { label: "Vidéo", icon: "video" },
  article: { label: "Article", icon: "document" },
};

export default function LibraryPage() {
  const { data, status } = useData("library", (store) => store.list("library"));
  if (status !== "ready" || !data) return <Skeleton className="h-80" />;
  return (
    <div className="mx-auto max-w-(--container-content)">
      <PageHeader eyebrow="Ressources" title="Bibliothèque">
        Ouvrages, fiches et enregistrements recommandés par les enseignants. Les fichiers lourds se téléchargent à la demande.
      </PageHeader>
      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-md bg-line sm:grid-cols-2">
        {data.map((r) => (
          <li key={r.id} className="flex gap-5 bg-paper-raised p-6">
            <span className="grid h-20 w-15 shrink-0 place-items-center rounded-r-sm rounded-l-xs bg-forest-800 text-gold-300 shadow-paper">
              <Icon name={KIND[r.kind].icon} className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{KIND[r.kind].label}</Badge>
                {r.publicDomain && <Badge tone="forest">Domaine public</Badge>}
              </div>
              <h2 className="font-display mt-2 text-xl leading-snug">{r.title}</h2>
              <p className="text-sm text-text-muted">{r.author}</p>
              <p className="mt-2 text-sm text-text-soft">{r.description}</p>
              <p className="mt-3 text-xs font-semibold text-text-muted">{r.url ? "Disponible" : "Fichier bientôt disponible"}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
