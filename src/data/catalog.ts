import { type Course, type Pillar } from "@/domain/types";
import { THEOLOGY_DIPLOMA } from "./institution";

/**
 * Les 36 enseignements officiels (flyer de rentrée 2026, listes « 1re année » et « 2e année »).
 *
 * - Les intitulés reprennent le flyer avec une normalisation typographique légère
 *   (accents, « grecque », « hébraïque ») — modifiables depuis /admin/cours.
 * - `pillar` : rattachement éditorial proposé aux trois axes de la devise.
 * - `term` : répartition PROVISOIRE (1–6 / 7–12 / 13–18) tant que la Direction
 *   des études ne l'a pas fixée → `termProvisional: true`.
 * - Rien ici n'est une limite d'architecture : un programme peut porter n'importe
 *   quel nombre de niveaux, de trimestres et de cours.
 */
type Entry = [title: string, pillar: Pillar, description: string];

const YEAR_1: Entry[] = [
  ["Introduction à la Bible", "discover", "Formation, inspiration, canon et grandes articulations des Écritures."],
  ["Homilétique", "deploy", "Préparer et délivrer une prédication fidèle au texte et adressée à son auditoire."],
  ["Leadership, loyauté et déloyauté", "deploy", "Le leadership serviteur, la loyauté dans l’œuvre et les ressorts de la déloyauté."],
  ["Théologie 1 : Doctrine sur Dieu", "develop", "Existence, attributs et œuvres de Dieu ; la Trinité."],
  ["Les épîtres générales", "discover", "Jacques, Pierre, Jean et Jude : contexte, message et actualité."],
  ["Anglais 1", "develop", "Bases de l’anglais pour la lecture et le ministère."],
  ["Théologie 2 : Christologie et sotériologie", "develop", "La personne et l’œuvre de Christ ; la doctrine du salut."],
  ["Pneumatologie", "develop", "La personne et l’œuvre du Saint-Esprit."],
  ["Évangiles synoptiques", "discover", "Matthieu, Marc et Luc : convergences, spécificités et théologie."],
  ["Survol du Nouveau Testament", "discover", "Vue d’ensemble des vingt-sept livres du Nouveau Testament."],
  ["Religion comparée", "develop", "Les grandes traditions religieuses au regard de l’Évangile."],
  ["Initiation à la langue chinoise", "develop", "Premiers pas en chinois, ouverture missionnaire."],
  ["Survol de l’Ancien Testament", "discover", "Vue d’ensemble des livres de l’Ancien Testament et de leur histoire."],
  ["Les 7 dispensations", "discover", "Lecture dispensationnelle de l’histoire du salut."],
  ["Les épîtres pastorales", "discover", "1 et 2 Timothée, Tite : l’ordre et la vie de l’Église locale."],
  ["Théologie 3 : Pneumatologie", "develop", "Approfondissement doctrinal de l’œuvre de l’Esprit."],
  ["Les épîtres de prison", "discover", "Éphésiens, Philippiens, Colossiens et Philémon."],
  ["Sociologie : le pasteur et son environnement", "deploy", "Le ministère pastoral dans son contexte social et culturel."],
];

const YEAR_2: Entry[] = [
  ["Typologie", "discover", "Figures, types et accomplissements dans l’Écriture."],
  ["Coutumes bibliques", "discover", "Vie quotidienne, culture et usages du monde biblique."],
  ["Théologie 5 : Ecclésiologie et eschatologie", "develop", "L’Église de Dieu et les fins dernières."],
  ["Maturité chrétienne", "develop", "Croissance spirituelle, caractère et discipline du disciple."],
  ["Ministère pastoral", "deploy", "Les fonctions du pasteur : paître, enseigner, accompagner."],
  ["Le pasteur et la psychologie", "deploy", "Repères psychologiques pour l’accompagnement pastoral."],
  ["Implantation des Églises", "deploy", "Vision, méthode et étapes de l’implantation d’Églises."],
  ["Histoire de l’Église", "discover", "De l’Église primitive aux Églises d’Afrique aujourd’hui."],
  ["Administration de l’Église", "deploy", "Organisation, gestion et gouvernance de l’Église locale."],
  ["Le réveil évangélique", "develop", "Histoire et théologie des réveils."],
  ["Initiation à la langue hébraïque", "develop", "Alphabet, vocabulaire et premiers textes de l’Ancien Testament."],
  ["Anglais 2", "develop", "Approfondissement de l’anglais biblique et ministériel."],
  ["Missiologie", "deploy", "Fondements bibliques et pratique de la mission."],
  ["Daniel et Apocalypse", "discover", "Lecture des deux grands livres prophétiques et apocalyptiques."],
  [
    "Théologie 4 : Angélologie et démonologie",
    "develop",
    "Doctrine sur les anges : leur nature, leur rôle, et la réalité du combat spirituel.",
  ],
  ["Initiation à la langue grecque", "develop", "Alphabet, vocabulaire et premiers textes du Nouveau Testament."],
  ["Anthropologie biblique et psychospiritualité", "develop", "L’être humain selon l’Écriture : corps, âme et esprit."],
  ["Cours de droit : le pasteur et le droit", "deploy", "Cadre juridique du ministère et de l’Église au Cameroun."],
];

function build(level: number, entries: Entry[]): Course[] {
  return entries.map(([title, pillar, description], index) => {
    const order = index + 1;
    const code = `A${level}-${String(order).padStart(2, "0")}`;
    return {
      id: code.toLowerCase(),
      programId: THEOLOGY_DIPLOMA.id,
      code,
      title,
      level,
      order,
      term: Math.min(3, Math.floor(index / 6) + 1),
      termProvisional: true,
      pillar,
      description,
      teacherIds: [],
      status: "published",
    } satisfies Course;
  });
}

export const OFFICIAL_COURSES: Course[] = [...build(1, YEAR_1), ...build(2, YEAR_2)];

export function coursesByLevel(courses: Course[], level: number): Course[] {
  return courses.filter((c) => c.level === level).sort((a, b) => a.order - b.order);
}
