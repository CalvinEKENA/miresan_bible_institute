/** Formatage localisé (fr-CM) — Intl natif, aucune dépendance. */
const LOCALE = "fr-FR";
const TZ = "Africa/Douala";

export function formatXAF(amount: number): string {
  return `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(amount).replace(/ | /g, " ")} FCFA`;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }): string {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, ...opts }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso)).replace(":", "h");
}

export function formatHHmm(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return `${Number(h)}h${m}`;
}

export const WEEKDAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const;

export function weekdayName(index: number): string {
  return WEEKDAYS[((index % 7) + 7) % 7] ?? "";
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function initials(name: string): string {
  return name
    .replace(/^(Rév\.|Rev\.|Pasteur|Pr\.|Dr\.)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function relativeDays(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const days = Math.round((d.setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 86_400_000);
  if (days === 0) return "aujourd’hui";
  if (days === 1) return "demain";
  if (days === -1) return "hier";
  if (days > 1) return `dans ${days} jours`;
  return `il y a ${-days} jours`;
}

export function greeting(now: Date = new Date()): string {
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(now));
  return h >= 18 || h < 4 ? "Bonsoir" : "Bonjour";
}
