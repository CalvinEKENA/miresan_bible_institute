/**
 * Configuration publique (préfixe NEXT_PUBLIC_, inlinée au build).
 * La configuration Web Firebase n'est pas un secret : l'accès est contrôlé par
 * Firebase Auth, les Security Rules et (optionnellement) App Check.
 * Aucune variable serveur (BOOTSTRAP_*, GOOGLE_APPLICATION_CREDENTIALS) ne doit apparaître ici.
 */
export const DATA_MODE: "demo" | "firebase" = process.env.NEXT_PUBLIC_DATA_MODE === "firebase" ? "firebase" : "demo";

export const USE_EMULATORS = process.env.NEXT_PUBLIC_USE_EMULATORS === "true";

/**
 * URL publique réelle, fournie par la configuration d'hébergement (apphosting*.yaml).
 * En local, repli sur le serveur de développement : aucune URL fictive n'est exposée.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Mode preview (version de présentation client) : tout le site est exclu des
 * moteurs de recherche (métadonnées robots, robots.txt, en-tête X-Robots-Tag).
 */
export const PREVIEW_MODE = process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";

export const IDENTITY_DOMAIN = process.env.NEXT_PUBLIC_IDENTITY_DOMAIN ?? "id.miresan-bible-institute.app";

export const APP_CHECK_SITE_KEY = process.env.NEXT_PUBLIC_APP_CHECK_SITE_KEY ?? "";

export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyBfzzOiNoeih01dGkk9BCqXwjH9vndEbkI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "miresan-bible-institute.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "miresan-bible-institute",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "miresan-bible-institute.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "478813803912",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:478813803912:web:196ce8fea3e06e1c87963d",
} as const;
