import {
  type Announcement,
  type Application,
  type Assessment,
  type AssessmentKey,
  type Attempt,
  type AttendanceSession,
  type CalendarEvent,
  type Course,
  type Enrollment,
  type Grade,
  type Highlight,
  type InstitutionSettings,
  type Lesson,
  type LessonProgress,
  type LibraryResource,
  type MessageThread,
  type Payment,
  type Program,
  type UserProfile,
} from "@/domain/types";

/** Carte des collections Firestore ↔ types du domaine. Source unique de typage. */
export interface CollectionMap {
  settings: InstitutionSettings & { id: string };
  programs: Program;
  courses: Course;
  lessons: Lesson;
  assessments: Assessment;
  assessmentKeys: AssessmentKey & { id: string };
  attempts: Attempt;
  users: UserProfile & { id: string };
  enrollments: Enrollment;
  progress: LessonProgress;
  grades: Grade;
  attendance: AttendanceSession;
  payments: Payment;
  announcements: Announcement;
  events: CalendarEvent;
  applications: Application;
  highlights: Highlight;
  threads: MessageThread;
  library: LibraryResource;
}

export type CollectionName = keyof CollectionMap;
export type Doc<K extends CollectionName> = CollectionMap[K];

export type WhereOp = "==" | "!=" | "<" | "<=" | ">" | ">=" | "in" | "array-contains";
export type Where = [field: string, op: WhereOp, value: unknown];

export interface ListQuery {
  where?: Where[];
  orderBy?: [field: string, direction?: "asc" | "desc"];
  limit?: number;
}

/**
 * Contrat d'accès aux données. Deux implémentations :
 * - DemoStore (mémoire + surcouche localStorage) ;
 * - FirestoreStore (SDK Firebase, chargé dynamiquement).
 * Les règles d'accès réelles sont appliquées par Firestore (firestore.rules).
 */
export interface DataStore {
  readonly mode: "demo" | "firebase";
  get<K extends CollectionName>(collection: K, id: string): Promise<Doc<K> | null>;
  list<K extends CollectionName>(collection: K, query?: ListQuery): Promise<Doc<K>[]>;
  set<K extends CollectionName>(collection: K, id: string, data: Doc<K>): Promise<void>;
  update<K extends CollectionName>(collection: K, id: string, patch: Partial<Doc<K>>): Promise<void>;
  remove(collection: CollectionName, id: string): Promise<void>;
}
