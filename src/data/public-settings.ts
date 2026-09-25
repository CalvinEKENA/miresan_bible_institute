import "server-only";
import { DEFAULT_SETTINGS } from "./institution";
import { DATA_MODE, FIREBASE_CONFIG } from "@/lib/env";
import { type InstitutionSettings } from "@/domain/types";

/**
 * Paramètres institutionnels pour les pages publiques (rendu serveur).
 * - Mode `firebase` : lecture du document public `settings/institution` via l'API REST
 *   Firestore (aucun SDK embarqué côté client), revalidée toutes les 10 minutes.
 * - Sinon, ou en cas d'erreur réseau : valeurs par défaut (src/data/institution.ts).
 */
type FsValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { arrayValue: { values?: FsValue[] } }
  | { mapValue: { fields?: Record<string, FsValue> } };

export function decodeFirestoreValue(v: FsValue): unknown {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) return (v.arrayValue.values ?? []).map(decodeFirestoreValue);
  if ("mapValue" in v) return Object.fromEntries(Object.entries(v.mapValue.fields ?? {}).map(([k, x]) => [k, decodeFirestoreValue(x)]));
  return null;
}

export async function getPublicSettings(): Promise<InstitutionSettings> {
  if (DATA_MODE !== "firebase") return DEFAULT_SETTINGS;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/settings/institution?key=${FIREBASE_CONFIG.apiKey}`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) return DEFAULT_SETTINGS;
    const json = (await res.json()) as { fields?: Record<string, FsValue> };
    const remote = decodeFirestoreValue({ mapValue: { fields: json.fields } }) as Partial<InstitutionSettings>;
    return { ...DEFAULT_SETTINGS, ...remote };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function primaryEmail(settings: InstitutionSettings): string {
  return (settings.emails.find((e) => e.primary) ?? settings.emails[0])?.address ?? "";
}
