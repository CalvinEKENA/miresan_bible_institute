import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { type Auth, connectAuthEmulator, getAuth } from "firebase/auth";
import { type Firestore, connectFirestoreEmulator, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { APP_CHECK_SITE_KEY, FIREBASE_CONFIG, USE_EMULATORS } from "@/lib/env";

/**
 * Initialisation paresseuse du SDK Firebase côté navigateur.
 * Ce module n'est importé que dynamiquement (mode `firebase`), jamais par les pages publiques.
 */
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

export function firebaseApp(): FirebaseApp {
  if (app) return app;
  app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  if (APP_CHECK_SITE_KEY && typeof window !== "undefined") {
    void import("firebase/app-check").then(({ initializeAppCheck, ReCaptchaEnterpriseProvider }) => {
      initializeAppCheck(app!, {
        provider: new ReCaptchaEnterpriseProvider(APP_CHECK_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
    });
  }
  return app;
}

export function firebaseAuth(): Auth {
  if (auth) return auth;
  auth = getAuth(firebaseApp());
  auth.languageCode = "fr";
  if (USE_EMULATORS) connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  return auth;
}

export function firestore(): Firestore {
  if (db) return db;
  // Cache persistant IndexedDB : lecture hors ligne et économie de données sur réseau mobile.
  db = initializeFirestore(firebaseApp(), {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  if (USE_EMULATORS) connectFirestoreEmulator(db, "127.0.0.1", 8080);
  return db;
}
