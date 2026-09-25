import { OFFICIAL_COURSES } from "@/data/catalog";
import { DEFAULT_SETTINGS, PROGRAMS, THEOLOGY_DIPLOMA } from "@/data/institution";
import { type CollectionName, type Doc } from "@/data/store/types";
import {
  type Announcement,
  type Application,
  type AttendanceMark,
  type AttendanceSession,
  type CalendarEvent,
  type Enrollment,
  type Grade,
  type LessonProgress,
  type LibraryResource,
  type MessageThread,
  type Payment,
  type UserProfile,
  type WeeklySlot,
} from "@/domain/types";
import { DEMO_LESSONS, DEMO_OUTLINE_LESSONS, DEMO_QUIZ, DEMO_QUIZ_KEY } from "./lessons";

/**
 * JEU DE DONNÉES FICTIF — mode démo uniquement.
 * Les personnes (hors gouvernance) sont inventées et marquées `demo: true`.
 * Les dates sont calculées relativement à « maintenant » pour que la démo reste vivante.
 */

export { DEMO_ACCOUNTS, DEMO_PASSWORD } from "./accounts";

const FIRST = ["Esther", "Paul", "Grâce", "Josué", "Ruth", "Emmanuel", "Débora", "Samuel", "Lydie", "Caleb", "Priscille", "Timothée", "Anne", "Élie", "Marthe", "Daniel", "Naomie", "Étienne", "Sara", "Joël", "Rebecca", "Nathan", "Abigaïl", "Silas"];
const LAST = ["Mbarga", "Ndongo", "Essomba", "Atangana", "Fouda", "Tchoumi", "Ndzana", "Mballa", "Owona", "Nkoulou", "Mvondo", "Ekambi", "Manga", "Abena", "Onana", "Kamga", "Nana", "Tsala", "Ebogo", "Menye", "Zambo", "Ayissi", "Nguele", "Ekani"];

const iso = (d: Date) => d.toISOString();
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

/** Prochaine occurrence d'un créneau hebdomadaire (heure de Yaoundé, UTC+1). */
export function nextSlot(slot: WeeklySlot, from: Date, weekOffset = 0): { start: Date; end: Date } {
  const day = new Date(from);
  const delta = (slot.weekday - day.getUTCDay() + 7) % 7;
  const base = addDays(day, delta + weekOffset * 7);
  const [sh = 0, sm = 0] = slot.start.split(":").map(Number);
  const [eh = 0, em = 0] = slot.end.split(":").map(Number);
  const start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), sh - 1, sm));
  const end = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), eh - 1, em));
  if (weekOffset === 0 && end < from) return nextSlot(slot, from, 1);
  return { start, end };
}

type Tables = { [K in CollectionName]?: Record<string, Doc<K>> };

function byId<T extends { id: string }>(rows: T[]): Record<string, T> {
  return Object.fromEntries(rows.map((r) => [r.id, r]));
}

export function buildDemoSeed(now: Date = new Date()): Tables {
  const created = iso(addDays(now, -60));

  /* ── Personnes ─────────────────────────────────────────────────────── */
  const admin: UserProfile & { id: string } = {
    id: "demo-admin",
    uid: "demo-admin",
    username: "direction.demo",
    displayName: "Pasteur Armel",
    title: "Pasteur",
    firstName: "Armel",
    lastName: "SEUWOU",
    role: "super_admin",
    status: "active",
    mustChangePassword: false,
    createdAt: created,
    demo: true,
  };
  const teacher: UserProfile & { id: string } = {
    id: "demo-teacher",
    uid: "demo-teacher",
    username: "enseignant.demo",
    displayName: "Samuel Ndzana",
    title: "Pasteur",
    firstName: "Samuel",
    lastName: "Ndzana",
    role: "teacher",
    status: "active",
    mustChangePassword: false,
    createdAt: created,
    demo: true,
  };
  const students: (UserProfile & { id: string })[] = FIRST.map((first, i) => {
    const last = LAST[(i * 7) % LAST.length] ?? "Demo";
    const uid = i === 0 ? "demo-student" : `demo-student-${String(i + 1).padStart(2, "0")}`;
    return {
      id: uid,
      uid,
      username: i === 0 ? "etudiant.demo" : `${first}.${last}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ’]/g, ""),
      displayName: `${first} ${last}`,
      firstName: first,
      lastName: last,
      role: "student",
      programId: THEOLOGY_DIPLOMA.id,
      level: i < 16 ? 1 : 2,
      cohortId: i < 16 ? "promo-2026" : "promo-2025",
      status: "active",
      mustChangePassword: false,
      createdAt: created,
      demo: true,
    };
  });
  const me = students[0]!;

  /* ── Cours : l'enseignant démo porte les cours du 1er trimestre ──── */
  const courses = OFFICIAL_COURSES.map((c) => (c.level === 1 && c.term === 1 ? { ...c, teacherIds: [teacher.uid] } : c));
  const lessons = [...DEMO_LESSONS, ...DEMO_OUTLINE_LESSONS];

  const enrollments: Enrollment[] = students.map((s) => ({
    id: `${s.uid}_${THEOLOGY_DIPLOMA.id}`,
    uid: s.uid,
    programId: THEOLOGY_DIPLOMA.id,
    cohortId: s.cohortId ?? "promo-2026",
    level: s.level ?? 1,
    status: "active",
    startedAt: created,
  }));

  /* ── Progression de l'étudiante démo ─────────────────────────────── */
  const progressRows: [lessonId: string, courseId: string, percent: number, daysAgo: number, lastBlockId?: string][] = [
    ["a1-01-l1", "a1-01", 100, 9],
    ["a1-01-l2", "a1-01", 46, 1, "b7"],
    ["a1-02-l1", "a1-02", 100, 12],
    ["a1-02-l2", "a1-02", 100, 6],
    ["a1-02-l3", "a1-02", 30, 3],
    ["a1-03-l1", "a1-03", 100, 8],
    ["a1-04-l1", "a1-04", 100, 5],
    ["a1-04-l2", "a1-04", 64, 4],
    ["a1-05-l1", "a1-05", 100, 10],
    ["a1-06-l1", "a1-06", 20, 2],
  ];
  const progress: LessonProgress[] = progressRows.map(([lessonId, courseId, percent, daysAgo, lastBlockId]) => ({
    id: `${me.uid}_${lessonId}`,
    uid: me.uid,
    courseId,
    lessonId,
    percent,
    completed: percent >= 100,
    ...(lastBlockId ? { lastBlockId } : {}),
    updatedAt: iso(addDays(now, -daysAgo)),
  }));

  /* ── Notes (contrôle continu du T1 publié pour quelques cours) ────── */
  const grades: Grade[] = [];
  students.forEach((s, i) => {
    if (s.level !== 1) return;
    ["a1-01", "a1-02", "a1-03", "a1-04"].forEach((courseId, j) => {
      const cc = Math.min(19.5, 9 + ((i * 3 + j * 5) % 10) + (i === 0 ? 3 : 0) + 0.5);
      grades.push({
        id: `${s.uid}_${courseId}`,
        uid: s.uid,
        courseId,
        term: 1,
        level: 1,
        continuous: cc,
        exam: j < 2 ? Math.min(19, cc - 1 + ((i + j) % 4)) : null,
        resit: null,
        published: true,
        publishedAt: iso(addDays(now, -3)),
      });
    });
  });

  /* ── Présences : 6 séances passées par cours du T1 ─────────────────── */
  const attendance: AttendanceSession[] = [];
  const marksCycle: AttendanceMark[] = ["present", "present", "present", "late", "present", "absent", "present", "excused"];
  ["a1-01", "a1-02", "a1-03", "a1-04", "a1-05", "a1-06"].forEach((courseId, c) => {
    for (let k = 0; k < 6; k++) {
      const marks: Record<string, AttendanceMark> = {};
      students.forEach((s, i) => {
        if (s.level !== 1) return;
        const m = marksCycle[(i * 5 + k * 3 + c) % marksCycle.length] ?? "present";
        if (m !== "present") marks[s.uid] = i === 0 && m === "absent" ? "late" : m;
      });
      // Un étudiant fictif en situation d'alerte d'assiduité (démontre le signalement).
      if (courseId === "a1-02" && k < 3) marks["demo-student-05"] = "absent";
      attendance.push({ id: `${courseId}-s${k + 1}`, courseId, date: iso(addDays(now, -7 * (6 - k))), marks });
    }
  });

  /* ── Paiements ─────────────────────────────────────────────────────── */
  const payments: Payment[] = [];
  students.forEach((s, i) => {
    const push = (feeId: string, label: string, amount: number, daysAgo: number) =>
      payments.push({
        id: `${s.uid}_${feeId}`,
        uid: s.uid,
        feeId,
        label,
        amount,
        currency: "XAF",
        paidAt: iso(addDays(now, -daysAgo)),
        method: i % 3 === 0 ? "cash" : "mobile_money",
        receiptNo: `MBI-${String(1000 + i * 3).padStart(5, "0")}`,
      });
    push("registration", "Frais d’inscription", 15000, 50 - i);
    if (i % 4 !== 3) push("tuition-1", "Pension — 1re tranche", 40000, 40 - i);
    if (i % 3 === 0) push("tuition-2", "Pension — 2e tranche", 40000, 10 - (i % 5));
    if (i % 2 === 0) {
      push("badge", "Badge", 1000, 45 - i);
      push("student_card", "Carte d’étudiant", 1000, 45 - i);
    }
  });

  /* ── Calendrier : séances hebdomadaires + échéances ────────────────── */
  const events: CalendarEvent[] = [];
  const [thu, sat] = DEFAULT_SETTINGS.schedule;
  for (let w = 0; w < 4; w++) {
    if (thu) {
      const { start, end } = nextSlot(thu, now, w);
      events.push({ id: `class-thu-${w}`, title: "Introduction à la Bible · Homilétique", kind: "class", start: iso(start), end: iso(end), courseId: "a1-01", location: "Salle principale — Nkomo", audience: "students" });
    }
    if (sat) {
      const { start, end } = nextSlot(sat, now, w);
      events.push({ id: `class-sat-${w}`, title: "Théologie 1 · Les épîtres générales · Anglais 1", kind: "class", start: iso(start), end: iso(end), courseId: "a1-04", location: "Salle principale — Nkomo", audience: "students" });
    }
  }
  events.push(
    { id: "deadline-fiche", title: "Remise de la fiche de lecture — Homilétique", kind: "deadline", start: iso(addDays(now, 4)), end: iso(addDays(now, 4)), courseId: "a1-02", audience: "students" },
    { id: "exam-a1-01", title: "Examen de fin de trimestre — Introduction à la Bible", kind: "exam", start: iso(addDays(now, 11)), end: iso(addDays(now, 11)), courseId: "a1-01", location: "Salle principale — Nkomo", audience: "students" },
    { id: "exam-a1-04", title: "Examen — Théologie 1 : Doctrine sur Dieu", kind: "exam", start: iso(addDays(now, 13)), end: iso(addDays(now, 13)), courseId: "a1-04", audience: "students" },
    { id: "rentree", title: "Rentrée académique 2026 – 2027", kind: "ceremony", start: DEFAULT_SETTINGS.academicYear.startDate, end: DEFAULT_SETTINGS.academicYear.startDate, location: "Complexe El Dorado, Nkomo", audience: "public" },
  );

  /* ── Annonces ──────────────────────────────────────────────────────── */
  const announcements: Announcement[] = [
    {
      id: "ann-rentree",
      title: "Rentrée académique le samedi 7 novembre 2026",
      body: "Les inscriptions sont ouvertes. Munissez-vous des pièces du dossier et prenez rendez-vous pour l’entretien préalable.",
      audience: "public",
      pinned: true,
      publishedAt: iso(addDays(now, -14)),
      author: "Secrétariat académique",
    },
    {
      id: "ann-examens",
      title: "Examens de fin de trimestre",
      body: "Le calendrier des examens du premier trimestre est publié. Rappel : au-delà de 25 % d’absences dans une matière, l’accès à l’examen est refusé.",
      audience: "students",
      pinned: false,
      publishedAt: iso(addDays(now, -2)),
      author: "Direction des études",
    },
    {
      id: "ann-tenue",
      title: "Tenue académique",
      body: "Le nœud papillon est bleu en première année et vert en deuxième année. Merci de vous présenter en tenue lors des cours du samedi.",
      audience: "students",
      pinned: false,
      publishedAt: iso(addDays(now, -6)),
      author: "Secrétariat académique",
    },
    {
      id: "ann-conseil",
      title: "Conseil académique",
      body: "Réunion du Conseil académique : validation de la répartition des cours par trimestre.",
      audience: "staff",
      pinned: false,
      publishedAt: iso(addDays(now, -1)),
      author: "Doyen académique",
    },
  ];

  /* ── Candidatures ──────────────────────────────────────────────────── */
  const applications: Application[] = [
    ["Rodrigue Ateba", "Église évangélique de Mvog-Ada", "Yaoundé", "interview"],
    ["Clarisse Ondoa", "Assemblée de Biyem-Assi", "Yaoundé", "received"],
    ["Hervé Tamba", "Communauté de Bafoussam", "Bafoussam", "received"],
    ["Mireille Ngo", "Église de la MIRESAN", "Yaoundé", "accepted"],
    ["Blaise Ekotto", "Église locale d’Obala", "Obala", "received"],
  ].map(([fullName, church, city, status], i) => ({
    id: `app-${i + 1}`,
    fullName: fullName!,
    phone: "+237 6•• ••• •••",
    church: church!,
    city: city!,
    status: status as Application["status"],
    submittedAt: iso(addDays(now, -i * 2 - 1)),
    checklist: { photos: i % 2 === 0, folder: true, form: true, recommendation: i !== 1, testimony: i % 3 !== 2, paper: i === 3, fees: i === 3 },
  }));

  /* ── Messagerie & bibliothèque ─────────────────────────────────────── */
  const threads: MessageThread[] = [
    { id: "t1", participantIds: [me.uid, teacher.uid], subject: "Fiche de lecture — Homilétique", lastMessage: "Pensez à citer vos sources bibliques en marge.", lastAt: iso(addDays(now, -1)), unreadFor: [me.uid] },
    { id: "t2", participantIds: [me.uid, admin.uid], subject: "Reçu de la première tranche", lastMessage: "Votre reçu est disponible au secrétariat.", lastAt: iso(addDays(now, -5)), unreadFor: [] },
  ];

  const library: LibraryResource[] = [
    { id: "lib-lsg", title: "La Sainte Bible — Louis Segond 1910", author: "Trad. Louis Segond", kind: "book", courseIds: [], description: "Traduction de référence du domaine public, utilisée pour les versets cités dans les leçons.", publicDomain: true },
    { id: "lib-homiletique", title: "Guide de préparation d’une prédication", author: "Ressource de démonstration", kind: "pdf", courseIds: ["a1-02"], description: "Fiche méthodologique : du texte au message.", publicDomain: false },
    { id: "lib-carte", title: "Cartes du monde biblique", author: "Ressource de démonstration", kind: "pdf", courseIds: ["a1-01", "a1-13"], description: "Palestine au temps de Jésus, voyages de Paul, empires de l’Antiquité.", publicDomain: false },
    { id: "lib-audio", title: "Lecture audio de l’Évangile de Marc", author: "Ressource de démonstration", kind: "audio", courseIds: ["a1-09"], description: "Écoute continue, idéale pour les trajets.", publicDomain: false },
  ];

  return {
    settings: { institution: { id: "institution", ...DEFAULT_SETTINGS } },
    programs: byId(PROGRAMS),
    courses: byId(courses),
    lessons: byId(lessons),
    assessments: byId([DEMO_QUIZ]),
    assessmentKeys: byId([DEMO_QUIZ_KEY]),
    attempts: {},
    users: byId([admin, teacher, ...students]),
    enrollments: byId(enrollments),
    progress: byId(progress),
    grades: byId(grades),
    attendance: byId(attendance),
    payments: byId(payments),
    announcements: byId(announcements),
    events: byId(events),
    applications: byId(applications),
    highlights: {},
    threads: byId(threads),
    library: byId(library),
  };
}
