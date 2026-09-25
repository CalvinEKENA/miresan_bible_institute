import { DEFAULT_ATTENDANCE } from "@/domain/attendance";
import { DEFAULT_GRADING } from "@/domain/grading";
import { type InstitutionSettings, type Program } from "@/domain/types";

/**
 * Paramètres institutionnels PAR DÉFAUT (données réelles, issues des Statuts,
 * du Règlement intérieur du 24/07/2026 et du flyer de rentrée 2026).
 *
 * En production, la source de vérité est le document Firestore `settings/institution`,
 * éditable depuis /admin/parametres. Ces valeurs ne servent qu'à l'initialisation
 * (scripts/init-institution.ts) et de repli si Firestore est injoignable.
 */
export const DEFAULT_SETTINGS: InstitutionSettings = {
  name: "Institut Biblique de la MIRESAN",
  shortName: "IB-MIRESAN",
  englishName: "MIRESAN Bible Institute",
  acronym: "MBI",
  motto: ["Découvrir", "Développer", "Déployer"],
  tagline: "Une formation pour aujourd’hui, un impact pour demain.",
  legalCover:
    "Établissement privé confessionnel d’enseignement biblique, théologique et ministériel, à but non lucratif, placé sous la couverture juridique de la Grace Bible Church in Cameroon (GBCC).",
  address: { line: "Église de la MIRESAN, Complexe El Dorado, Nkomo", city: "Yaoundé", country: "Cameroun" },
  phones: ["+237 686 921 208", "+237 673 011 317"],
  emails: [
    { address: "ibmiresan@gmail.com", label: "Adresse officielle", source: "Confirmée par la Direction (septembre 2026)", confirmed: true, primary: true },
    { address: "ib_miresan@yahoo.com", label: "Adresse du flyer 2026 (non retenue)", source: "Flyer de rentrée 2026", confirmed: false, primary: false },
  ],
  website: "www.ib.miresan.org",
  affiliation: {
    partner: "Christ for Africa University",
    acronym: "CFAU",
    status: "in_progress",
    wording: "Une démarche d’affiliation auprès de la Christ for Africa University (CFAU) est engagée.",
  },
  academicYear: { label: "2026 – 2027", startDate: "2026-11-07T08:00:00+01:00", startLabel: "Samedi 7 novembre 2026" },
  schedule: [
    // Horaire du flyer de rentrée, retenu par la Direction (les Statuts indiquaient 15h00–20h30).
    { id: "thu", weekday: 4, start: "16:00", end: "20:00", label: "Cours du jeudi" },
    { id: "sat", weekday: 6, start: "08:00", end: "14:30", label: "Cours du samedi" },
  ],
  fees: [
    { id: "registration", label: "Frais d’inscription", amount: 15000, currency: "XAF" },
    {
      id: "tuition",
      label: "Pension annuelle",
      amount: 120000,
      currency: "XAF",
      installments: 3,
      note: "Payable en une seule fois ou en trois tranches.",
    },
    { id: "badge", label: "Badge", amount: 1000, currency: "XAF" },
    { id: "student_card", label: "Carte d’étudiant", amount: 1000, currency: "XAF" },
  ],
  admissionRequirements: [
    "Être né de nouveau et membre actif d’une Église locale",
    "4 photos d’identité 4×4",
    "1 chemise cartonnée",
    "Formulaire d’inscription rempli lors de l’inscription",
    "Lettre de recommandation de votre pasteur",
    "Témoignage de conversion et de votre appel",
    "1 rame de papier A4",
    "Frais d’inscription",
  ],
  audiences: [
    "Pasteurs",
    "Évangélistes",
    "Apôtres",
    "Prophètes",
    "Docteurs",
    "Anciens d’Église",
    "Diacres et diaconesses",
    "Responsables de départements",
    "Membres d’Église appelés au ministère",
    "Toute personne désireuse d’approfondir sa connaissance biblique",
  ],
  grading: DEFAULT_GRADING,
  attendance: DEFAULT_ATTENDANCE,
  notices: [
    {
      id: "term-split",
      field: "courses.term",
      severity: "info",
      message:
        "La répartition des cours par trimestre est provisoire (1–6 / 7–12 / 13–18) en attendant sa fixation par la Direction des études.",
    },
  ],
};

export const GOVERNANCE = [
  { role: "Fondateur", name: "Rév. Armel Désiré SEUWOU" },
  { role: "Directeur", name: "Rév. NGONO Mathurin" },
  { role: "Doyen académique", name: "Rév. YAKI Jean" },
] as const;

export const VISION =
  "Faire de chaque croyant un disciple équipé, enraciné dans la Parole, capable de transformer son Église et sa communauté.";

export const MISSION =
  "Former, équiper et accompagner les hommes et les femmes appelés au ministère.";

/** Intitulés : Statuts, art. 9. Phrases d’accompagnement : proposition éditoriale à valider. */
export const VALUES = [
  { title: "Fidélité aux Écritures", text: "La Parole de Dieu est la norme de l’enseignement et de la vie." },
  { title: "Excellence", text: "Servir Dieu mérite le meilleur de notre étude et de notre travail." },
  { title: "Intégrité et sainteté", text: "La formation du caractère précède celle du ministère." },
  { title: "Service et humilité", text: "Être formé pour servir, et non pour être servi." },
  { title: "Discipline et ponctualité", text: "L’assiduité est une première école de fidélité." },
  { title: "Respect des appels", text: "Chaque appel est honoré dans sa diversité." },
] as const;

export const SLOGANS = [
  "Une formation pour aujourd’hui, un impact pour demain.",
  "De l’appel à l’équipement, de l’équipement au déploiement !",
  "Ensemble pour la moisson !",
  "Prépare-toi pour le service, Dieu a une œuvre pour toi !",
] as const;

export const THEOLOGY_DIPLOMA: Program = {
  id: "diplome-theologie",
  title: "Diplôme de Théologie",
  kind: "diploma",
  description:
    "Formation biblique, théologique et ministérielle en deux années, organisées en trois trimestres, avec stage pratique et mémoire de fin de cycle.",
  levels: [
    { id: "annee-1", label: "Première année", order: 1 },
    { id: "annee-2", label: "Deuxième année", order: 2 },
  ],
  termsPerLevel: 3,
  campusId: "yaounde-nkomo",
  status: "active",
};

export const PROGRAMS: Program[] = [THEOLOGY_DIPLOMA];
