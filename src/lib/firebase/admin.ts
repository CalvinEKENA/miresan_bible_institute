import "server-only";
import { type App, applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Admin SDK — usage serveur exclusif (route handlers, server actions, scripts).
 * `server-only` fait échouer le build si ce module est importé côté client.
 * Identifiants : GOOGLE_APPLICATION_CREDENTIALS ou identité par défaut de l'hébergement.
 */
let app: App | undefined;

export function adminApp(): App {
  if (app) return app;
  app =
    getApps()[0] ??
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  return app;
}

export const adminAuth = () => getAuth(adminApp());
export const adminDb = () => getFirestore(adminApp());
