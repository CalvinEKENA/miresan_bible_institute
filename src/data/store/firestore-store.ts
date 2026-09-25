import {
  type Firestore,
  collection as fsCollection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query as fsQuery,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { type CollectionName, type DataStore, type Doc, type ListQuery } from "./types";

/**
 * Implémentation Firestore. Chargée uniquement en mode `firebase`, via import
 * dynamique (voir ./index.ts) : jamais embarquée sur les pages publiques.
 */
export class FirestoreStore implements DataStore {
  readonly mode = "firebase" as const;

  constructor(private readonly db: Firestore) {}

  async get<K extends CollectionName>(collection: K, id: string): Promise<Doc<K> | null> {
    const snap = await getDoc(doc(this.db, collection, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Doc<K>) : null;
  }

  async list<K extends CollectionName>(collection: K, q: ListQuery = {}): Promise<Doc<K>[]> {
    const constraints = [
      ...(q.where ?? []).map(([field, op, value]) => where(field, op, value)),
      ...(q.orderBy ? [orderBy(q.orderBy[0], q.orderBy[1] ?? "asc")] : []),
      ...(q.limit != null ? [limit(q.limit)] : []),
    ];
    const snap = await getDocs(fsQuery(fsCollection(this.db, collection), ...constraints));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Doc<K>);
  }

  async set<K extends CollectionName>(collection: K, id: string, data: Doc<K>): Promise<void> {
    await setDoc(doc(this.db, collection, id), data as unknown as Record<string, unknown>);
  }

  async update<K extends CollectionName>(collection: K, id: string, patch: Partial<Doc<K>>): Promise<void> {
    await updateDoc(doc(this.db, collection, id), patch as Record<string, unknown>);
  }

  async remove(collection: CollectionName, id: string): Promise<void> {
    await deleteDoc(doc(this.db, collection, id));
  }
}
