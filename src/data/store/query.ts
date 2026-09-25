import { type ListQuery, type Where } from "./types";

function read(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), obj);
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function matches(doc: unknown, [field, op, value]: Where): boolean {
  const v = read(doc, field);
  switch (op) {
    case "==":
      return v === value;
    case "!=":
      return v !== value;
    case "<":
      return compare(v, value) < 0;
    case "<=":
      return compare(v, value) <= 0;
    case ">":
      return compare(v, value) > 0;
    case ">=":
      return compare(v, value) >= 0;
    case "in":
      return Array.isArray(value) && value.includes(v);
    case "array-contains":
      return Array.isArray(v) && v.includes(value);
  }
}

/** Évaluation en mémoire d'une requête (sémantique alignée sur Firestore). */
export function applyQuery<T>(docs: T[], query: ListQuery = {}): T[] {
  let out = docs.filter((d) => (query.where ?? []).every((w) => matches(d, w)));
  if (query.orderBy) {
    const [field, dir = "asc"] = query.orderBy;
    out = [...out].sort((a, b) => compare(read(a, field), read(b, field)) * (dir === "desc" ? -1 : 1));
  }
  if (query.limit != null) out = out.slice(0, query.limit);
  return out;
}
