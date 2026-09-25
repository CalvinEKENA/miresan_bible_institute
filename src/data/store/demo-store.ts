import { applyQuery } from "./query";
import { type CollectionName, type DataStore, type Doc, type ListQuery } from "./types";

type Tables = { [K in CollectionName]?: Record<string, Doc<K>> };

const STORAGE_KEY = "mbi-demo-overlay-v1";

/**
 * Magasin de démonstration : amorcé par le seed, écritures conservées dans une
 * surcouche localStorage (try/catch : navigation privée, quota, SSR).
 * Aucun appel réseau, aucune dépendance Firebase.
 */
export class DemoStore implements DataStore {
  readonly mode = "demo" as const;
  private tables: Tables;

  constructor(seed: Tables) {
    this.tables = structuredClone(seed);
    this.loadOverlay();
  }

  private loadOverlay() {
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
      if (!raw) return;
      const overlay = JSON.parse(raw) as Record<string, Record<string, unknown> | null>;
      for (const [collection, rows] of Object.entries(overlay)) {
        const table = ((this.tables as Record<string, Record<string, unknown>>)[collection] ??= {});
        for (const [id, value] of Object.entries(rows ?? {})) {
          if (value === null) delete table[id];
          else table[id] = value;
        }
      }
    } catch {
      /* surcouche illisible : on repart du seed */
    }
  }

  private persist(collection: CollectionName, id: string, value: unknown) {
    try {
      const storage = globalThis.localStorage;
      if (!storage) return;
      const overlay = JSON.parse(storage.getItem(STORAGE_KEY) ?? "{}") as Record<string, Record<string, unknown>>;
      (overlay[collection] ??= {})[id] = value;
      storage.setItem(STORAGE_KEY, JSON.stringify(overlay));
    } catch {
      /* stockage indisponible : les écritures restent en mémoire */
    }
  }

  private table<K extends CollectionName>(collection: K): Record<string, Doc<K>> {
    return ((this.tables as Record<string, Record<string, Doc<K>>>)[collection] ??= {});
  }

  async get<K extends CollectionName>(collection: K, id: string): Promise<Doc<K> | null> {
    const row = this.table(collection)[id];
    return row ? structuredClone(row) : null;
  }

  async list<K extends CollectionName>(collection: K, query?: ListQuery): Promise<Doc<K>[]> {
    return structuredClone(applyQuery(Object.values(this.table(collection)), query));
  }

  async set<K extends CollectionName>(collection: K, id: string, data: Doc<K>): Promise<void> {
    this.table(collection)[id] = structuredClone(data);
    this.persist(collection, id, data);
  }

  async update<K extends CollectionName>(collection: K, id: string, patch: Partial<Doc<K>>): Promise<void> {
    const current = this.table(collection)[id];
    if (!current) throw new Error(`Document introuvable : ${collection}/${id}`);
    const next = { ...current, ...patch } as Doc<K>;
    this.table(collection)[id] = next;
    this.persist(collection, id, next);
  }

  async remove(collection: CollectionName, id: string): Promise<void> {
    delete (this.table(collection) as Record<string, unknown>)[id];
    this.persist(collection, id, null);
  }

  static reset() {
    try {
      globalThis.localStorage?.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}
