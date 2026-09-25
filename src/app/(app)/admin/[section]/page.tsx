"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/campus/page-header";
import { Icon } from "@/components/ui/icons";
import { Badge, EmptyState } from "@/components/ui/primitives";

/**
 * Modules du back-office en cours de construction : chacun décrit son périmètre
 * pour guider la suite du développement (voir docs/HANDOFF.md).
 */
const MODULES: Record<string, { title: string; group: string; intro: string; features: string[] }> = {
  enseignants: { title: "Enseignants", group: "Scolarité", intro: "Corps enseignant, affectations et charge horaire.", features: ["Fiches enseignants", "Affectation aux cours", "Création de comptes (rôle teacher, jamais admin)", "Disponibilités"] },
  presences: { title: "Présences", group: "Scolarité", intro: "Appel par séance, justificatifs et seuils réglementaires.", features: ["Feuille d’appel (présent par défaut)", "Retards convertis en absences (3 = 1)", "Justification sous 7 jours", "Alerte au-delà de 25 % d’absences"] },
  notes: { title: "Notes", group: "Scolarité", intro: "Saisie, pondération, délibération et publication.", features: ["Saisie CC et examens sur 20", "Pondération paramétrable", "Rattrapage", "Publication contrôlée et journal d’audit"] },
  memoires: { title: "Mémoires", group: "Scolarité", intro: "Suivi des mémoires de deuxième année.", features: ["Dépôt et validation du sujet (fin du T1 de 2e année)", "Directeur de mémoire", "Jury d’au moins deux enseignants", "Soutenance et note"] },
  stages: { title: "Stages", group: "Scolarité", intro: "Stages pratiques en Église locale ou œuvre agréée.", features: ["Convention et lieu d’accueil", "Rapport de stage", "Attestation du responsable d’accueil"] },
  programmes: { title: "Programmes", group: "Pédagogie", intro: "Diplôme, certificats, formations courtes, spécialisations.", features: ["Niveaux et trimestres libres", "Plusieurs campus", "Duplication d’un programme", "Archivage"] },
  lecons: { title: "Leçons", group: "Pédagogie", intro: "Éditeur de leçons en blocs (texte, versets, médias, quiz).", features: ["Blocs riches et versets LSG", "Médias sur Storage (chargement à la demande)", "Glossaire et questions de réflexion", "Prévisualisation Study Mode"] },
  quiz: { title: "Quiz", group: "Pédagogie", intro: "Banque de questions et quiz intégrés aux leçons.", features: ["12 types de questions", "Corrigés isolés (assessmentKeys)", "Correction serveur", "Statistiques de réussite"] },
  examens: { title: "Examens", group: "Pédagogie", intro: "Sessions d’examens et rattrapages.", features: ["Calendrier des sessions", "Contrôle d’éligibilité (assiduité)", "Sujets et barèmes", "Publication des résultats"] },
  bibliotheque: { title: "Bibliothèque", group: "Pédagogie", intro: "Ressources numériques par cours.", features: ["Livres, PDF, audio, vidéo", "Domaine public signalé", "Poids des fichiers affiché", "Accès par cours"] },
  paiements: { title: "Paiements", group: "Administration", intro: "Encaissements, reçus et relances.", features: ["Enregistrement espèces / Mobile Money / banque", "Reçus numérotés", "Échéancier en 3 tranches", "Journal d’audit"] },
  documents: { title: "Documents", group: "Administration", intro: "Attestations, relevés et diplômes.", features: ["Attestation de fin de 1re année", "Relevés annuels", "Diplôme signé par le Fondateur", "Vérification publique par QR code"] },
  annonces: { title: "Annonces", group: "Administration", intro: "Communication ciblée (public, étudiants, enseignants, personnel).", features: ["Rédaction et programmation", "Épinglage", "Ciblage par audience", "Diffusion sur le site public"] },
  calendrier: { title: "Calendrier", group: "Administration", intro: "Année académique, trimestres, séances et événements.", features: ["Génération des séances depuis les horaires", "Examens et congés", "Rentrée et cérémonies", "Export"] },
};

export default function AdminSection() {
  const { section } = useParams<{ section: string }>();
  const mod = MODULES[section];
  if (!mod) return <EmptyState title="Section introuvable" action={<Link href="/admin">Vue générale</Link>} />;
  return (
    <div className="mx-auto max-w-(--container-content)">
      <PageHeader eyebrow={mod.group} title={mod.title} actions={<Badge tone="gold">En construction</Badge>}>
        {mod.intro}
      </PageHeader>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="rounded-md bg-paper-raised p-7 shadow-paper ring-1 ring-line lg:col-span-7">
          <p className="eyebrow text-accent">Périmètre du module</p>
          <ol className="mt-5 space-y-4">
            {mod.features.map((f, i) => (
              <li key={f} className="flex gap-4">
                <span className="font-display numeric w-6 text-xl text-accent">{i + 1}</span>
                <span className="border-b border-dashed border-line pb-3 text-[0.9375rem]">{f}</span>
              </li>
            ))}
          </ol>
        </section>
        <aside className="space-y-4 lg:col-span-5">
          <p className="text-sm leading-relaxed text-text-muted">Le modèle de données, les règles d’accès Firestore et la matrice de permissions de ce module sont déjà en place ; l’interface de gestion sera livrée dans une prochaine itération.</p>
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:underline">
            <Icon name="arrowLeft" className="size-4" /> Vue générale
          </Link>
        </aside>
      </div>
    </div>
  );
}
