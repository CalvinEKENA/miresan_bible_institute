/**
 * Initialisation de l'Admin SDK pour les scripts (jamais importé par l'application).
 * - Émulateurs : définir FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST.
 * - Production : GOOGLE_APPLICATION_CREDENTIALS ou `gcloud auth application-default login`.
 */
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "miresan-bible-institute";
export const usingEmulators = Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST);

export function admin() {
  if (!getApps().length) {
    initializeApp(usingEmulators ? { projectId } : { credential: applicationDefault(), projectId });
  }
  return { auth: getAuth(), db: getFirestore() };
}

export function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

export function describeTarget(): string {
  return usingEmulators ? `émulateurs (${projectId})` : `PROJET RÉEL ${projectId}`;
}
