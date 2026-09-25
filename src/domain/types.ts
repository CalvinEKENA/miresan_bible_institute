import { type Role } from "./roles";

/** Date ISO 8601 (chaîne) — sérialisable, identique en démo et dans Firestore. */
export type ISODate = string;

/* ── Pédagogie : les trois piliers ─────────────────────────────────────── */

export const PILLARS = ["discover", "develop", "deploy"] as const;
export type Pillar = (typeof PILLARS)[number];

export const PILLAR_LABELS: Record<Pillar, { label: string; verb: string; numeral: string }> = {
  discover: { label: "Découvrir", verb: "découvrir", numeral: "I" },
  develop: { label: "Développer", verb: "développer", numeral: "II" },
  deploy: { label: "Déployer", verb: "déployer", numeral: "III" },
};

/* ── Institution (paramètres administrables) ───────────────────────────── */

export interface ContactEmail {
  address: string;
  label: string;
  /** Source d'où provient l'adresse (flyer, logo…) — utile tant qu'elle n'est pas confirmée. */
  source?: string;
  confirmed: boolean;
  primary: boolean;
}

export interface FeeItem {
  id: string;
  label: string;
  amount: number;
  currency: "XAF";
  note?: string;
  installments?: number;
}

export interface WeeklySlot {
  id: string;
  /** 0 = dimanche … 6 = samedi */
  weekday: number;
  start: string; // "HH:mm"
  end: string; // "HH:mm"
  label?: string;
}

export interface ConfigNotice {
  id: string;
  field: string;
  message: string;
  severity: "info" | "warning";
}

export interface GradingPolicy {
  scale: number; // 20
  passMark: number; // 10
  continuousWeight: number; // 0..1
  examWeight: number; // 0..1
  allowResit: boolean;
  mentions: { min: number; label: string }[];
}

export interface AttendancePolicy {
  maxAbsenceRate: number; // 0.25
  latesPerAbsence: number; // 3
  justificationDays: number; // 7
}

export interface InstitutionSettings {
  name: string;
  shortName: string;
  englishName: string;
  acronym: string;
  motto: [string, string, string];
  tagline: string;
  legalCover: string;
  address: { line: string; city: string; country: string };
  phones: string[];
  emails: ContactEmail[];
  website: string;
  affiliation: { partner: string; acronym: string; status: "project" | "in_progress"; wording: string };
  academicYear: { label: string; startDate: ISODate; startLabel: string };
  schedule: WeeklySlot[];
  fees: FeeItem[];
  admissionRequirements: string[];
  audiences: string[];
  grading: GradingPolicy;
  attendance: AttendancePolicy;
  notices: ConfigNotice[];
  updatedAt?: ISODate;
}

/* ── Offre de formation (non figée : cycles, certificats, spécialisations…) ── */

export type ProgramKind = "diploma" | "certificate" | "short_course" | "specialization";

export interface Program {
  id: string;
  title: string;
  kind: ProgramKind;
  description: string;
  /** Niveaux (années, modules…) — nombre libre. */
  levels: { id: string; label: string; order: number }[];
  termsPerLevel: number;
  campusId: string;
  status: "active" | "draft" | "archived";
}

export type PublicationStatus = "draft" | "published" | "archived";

export interface Course {
  id: string;
  programId: string;
  code: string;
  title: string;
  /** Niveau dans le programme (1 = première année…) */
  level: number;
  /** Numéro d'ordre officiel dans la liste de l'année. */
  order: number;
  /** Trimestre — provisoire tant que la Direction des études ne l'a pas fixé. */
  term: number;
  termProvisional: boolean;
  pillar: Pillar;
  description: string;
  teacherIds: string[];
  hours?: number;
  status: PublicationStatus;
}

/* ── Leçons & contenu riche ───────────────────────────────────────────── */

export type LessonBlock =
  | { id: string; type: "heading"; text: string; level: 2 | 3 }
  | { id: string; type: "paragraph"; text: string; dropCap?: boolean }
  | { id: string; type: "verse"; reference: string; text: string; version: string }
  | { id: string; type: "quote"; text: string; source?: string }
  | { id: string; type: "list"; ordered: boolean; items: string[] }
  | { id: string; type: "callout"; tone: "note" | "key" | "warning"; title: string; text: string }
  | { id: string; type: "image"; src: string; alt: string; caption?: string; width: number; height: number }
  | { id: string; type: "video"; url: string; title: string; durationSec?: number; poster?: string }
  | { id: string; type: "audio"; url: string; title: string; durationSec?: number }
  | { id: string; type: "pdf"; url: string; title: string; sizeKb?: number }
  | { id: string; type: "reflection"; prompt: string }
  | { id: string; type: "quiz"; assessmentId: string; title: string };

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  order: number;
  title: string;
  summary: string;
  durationMinutes: number;
  blocks: LessonBlock[];
  glossary: GlossaryEntry[];
  status: PublicationStatus;
  /** Contenu fictif : affiché avec un bandeau d'avertissement. */
  demo?: boolean;
}

/* ── Évaluations ───────────────────────────────────────────────────────── */

export type QuestionType =
  | "single"
  | "multiple"
  | "true_false"
  | "short_text"
  | "long_text"
  | "matching"
  | "ordering"
  | "verse_completion"
  | "case_study"
  | "reflection"
  | "file_upload"
  | "oral";

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  options?: { id: string; label: string }[];
  /** matching : éléments de gauche / droite */
  pairs?: { left: { id: string; label: string }[]; right: { id: string; label: string }[] };
  reference?: string;
}

/** Réponse attendue — stockée à part (assessmentKeys), jamais lisible par un étudiant. */
export type AnswerKey =
  | { type: "single" | "true_false"; optionId: string }
  | { type: "multiple"; optionIds: string[] }
  | { type: "short_text" | "verse_completion"; accepted: string[] }
  | { type: "ordering"; order: string[] }
  | { type: "matching"; pairs: Record<string, string> };

export type AnswerValue = string | string[] | Record<string, string>;

export interface Assessment {
  id: string;
  courseId: string;
  kind: "quiz" | "exam" | "assignment";
  title: string;
  description: string;
  durationMinutes?: number;
  opensAt?: ISODate;
  closesAt?: ISODate;
  maxAttempts: number;
  questions: Question[];
  status: PublicationStatus;
}

export interface AssessmentKey {
  assessmentId: string;
  answers: Record<string, AnswerKey>;
}

export interface Attempt {
  id: string;
  assessmentId: string;
  uid: string;
  answers: Record<string, AnswerValue>;
  score: number | null;
  maxScore: number;
  pendingManual: number;
  submittedAt: ISODate;
}

/* ── Scolarité ─────────────────────────────────────────────────────────── */

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  title?: string;
  role: Role;
  recoveryEmail?: string;
  phone?: string;
  programId?: string;
  level?: number;
  cohortId?: string;
  status: "active" | "suspended" | "alumni";
  mustChangePassword: boolean;
  createdAt: ISODate;
  demo?: boolean;
}

export interface Enrollment {
  id: string;
  uid: string;
  programId: string;
  cohortId: string;
  level: number;
  status: "active" | "completed" | "withdrawn";
  startedAt: ISODate;
}

export interface LessonProgress {
  id: string; // `${uid}_${lessonId}`
  uid: string;
  courseId: string;
  lessonId: string;
  percent: number;
  completed: boolean;
  lastBlockId?: string;
  updatedAt: ISODate;
}

export interface Grade {
  id: string;
  uid: string;
  courseId: string;
  term: number;
  level: number;
  continuous: number | null;
  exam: number | null;
  resit: number | null;
  published: boolean;
  publishedAt?: ISODate;
}

export type AttendanceMark = "present" | "absent" | "late" | "excused";

export interface AttendanceSession {
  id: string;
  courseId: string;
  date: ISODate;
  marks: Record<string, AttendanceMark>;
}

export interface Payment {
  id: string;
  uid: string;
  feeId: string;
  label: string;
  amount: number;
  currency: "XAF";
  paidAt: ISODate;
  method: "cash" | "mobile_money" | "bank";
  receiptNo: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: "public" | "students" | "teachers" | "staff" | "all";
  pinned: boolean;
  publishedAt: ISODate;
  author: string;
}

export type EventKind = "class" | "exam" | "deadline" | "holiday" | "ceremony" | "event";

export interface CalendarEvent {
  id: string;
  title: string;
  kind: EventKind;
  start: ISODate;
  end: ISODate;
  courseId?: string;
  location?: string;
  audience: "public" | "students" | "teachers" | "staff" | "all";
}

export interface Application {
  id: string;
  fullName: string;
  phone: string;
  church: string;
  city: string;
  status: "received" | "interview" | "accepted" | "declined";
  submittedAt: ISODate;
  checklist: Record<string, boolean>;
}

export interface Highlight {
  id: string;
  uid: string;
  lessonId: string;
  blockId: string;
  text: string;
  note?: string;
  createdAt: ISODate;
}

export interface MessageThread {
  id: string;
  participantIds: string[];
  subject: string;
  lastMessage: string;
  lastAt: ISODate;
  unreadFor: string[];
}

export interface LibraryResource {
  id: string;
  title: string;
  author: string;
  kind: "book" | "pdf" | "audio" | "video" | "article";
  courseIds: string[];
  description: string;
  url?: string;
  publicDomain: boolean;
}
