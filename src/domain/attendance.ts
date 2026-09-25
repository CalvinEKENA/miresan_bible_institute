import { type AttendanceMark, type AttendancePolicy, type AttendanceSession } from "./types";

export const DEFAULT_ATTENDANCE: AttendancePolicy = {
  maxAbsenceRate: 0.25,
  latesPerAbsence: 3,
  justificationDays: 7,
};

export interface AttendanceSummary {
  sessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  /** Absences effectives : absences non justifiées + retards convertis. */
  effectiveAbsences: number;
  absenceRate: number;
  excludedFromExam: boolean;
}

export function summarizeAttendance(
  sessions: AttendanceSession[],
  uid: string,
  policy: AttendancePolicy = DEFAULT_ATTENDANCE,
): AttendanceSummary {
  const counts: Record<AttendanceMark, number> = { present: 0, absent: 0, late: 0, excused: 0 };
  let total = 0;
  for (const session of sessions) {
    // Par défaut, un étudiant non marqué est présent (convention de saisie).
    const mark = session.marks[uid] ?? "present";
    counts[mark] += 1;
    total += 1;
  }
  const converted = policy.latesPerAbsence > 0 ? Math.floor(counts.late / policy.latesPerAbsence) : 0;
  const effectiveAbsences = counts.absent + converted;
  const absenceRate = total === 0 ? 0 : effectiveAbsences / total;
  return {
    sessions: total,
    ...counts,
    effectiveAbsences,
    absenceRate,
    excludedFromExam: absenceRate > policy.maxAbsenceRate,
  };
}

/** Une absence peut encore être justifiée si le délai réglementaire n'est pas écoulé. */
export function canStillJustify(absenceDate: Date, now: Date, policy: AttendancePolicy = DEFAULT_ATTENDANCE): boolean {
  const limit = absenceDate.getTime() + policy.justificationDays * 24 * 60 * 60 * 1000;
  return now.getTime() <= limit;
}
