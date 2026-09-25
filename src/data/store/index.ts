import { DATA_MODE } from "@/lib/env";
import { type DataStore } from "./types";

let storePromise: Promise<DataStore> | undefined;

/**
 * Point d'accès unique au magasin de données (navigateur).
 * Les deux implémentations sont chargées dynamiquement : le seed démo et le SDK
 * Firebase ne pèsent donc jamais sur le bundle initial.
 */
export function getStore(): Promise<DataStore> {
  storePromise ??=
    DATA_MODE === "firebase"
      ? Promise.all([import("./firestore-store"), import("@/lib/firebase/client")]).then(
          ([{ FirestoreStore }, { firestore }]) => new FirestoreStore(firestore()),
        )
      : Promise.all([import("./demo-store"), import("@/data/demo/seed")]).then(
          ([{ DemoStore }, { buildDemoSeed }]) => new DemoStore(buildDemoSeed()),
        );
  return storePromise;
}

export type { DataStore } from "./types";
