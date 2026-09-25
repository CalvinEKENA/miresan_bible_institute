/**
 * Injecte le jeu de données FICTIF dans les émulateurs Firebase.
 * Refuse de s'exécuter contre un projet réel, sauf double confirmation explicite :
 *   --allow-production ET SEED_DEMO_CONFIRM=<id du projet>
 * (réservé à un projet de préproduction dédié).
 */
import { DEMO_PASSWORD } from "../src/data/demo/accounts";
import { buildDemoSeed } from "../src/data/demo/seed";
import { identifierToAuthEmail } from "../src/domain/identity";
import { admin, describeTarget, flag, projectId, usingEmulators } from "./lib/admin";

const IDENTITY_DOMAIN = process.env.NEXT_PUBLIC_IDENTITY_DOMAIN ?? "id.miresan-bible-institute.app";

async function main() {
  if (!usingEmulators && !(flag("allow-production") && process.env.SEED_DEMO_CONFIRM === projectId)) {
    throw new Error("Refus : le seed de démonstration ne s'exécute que sur les émulateurs (FIRESTORE_EMULATOR_HOST).");
  }
  const { auth, db } = admin();
  console.log(`→ Cible : ${describeTarget()}`);

  const seed = buildDemoSeed();
  let count = 0;
  for (const [collection, rows] of Object.entries(seed)) {
    let batch = db.batch();
    let inBatch = 0;
    for (const [id, row] of Object.entries(rows ?? {})) {
      batch.set(db.doc(`${collection}/${id}`), JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
      count++;
      if (++inBatch === 400) {
        await batch.commit();
        batch = db.batch();
        inBatch = 0;
      }
    }
    await batch.commit();
  }

  // Comptes d'authentification des profils fictifs (mot de passe « demo »).
  for (const user of Object.values(seed.users ?? {})) {
    const email = identifierToAuthEmail(user.username, IDENTITY_DOMAIN);
    try {
      await auth.createUser({ uid: user.uid, email, password: DEMO_PASSWORD, displayName: user.displayName, emailVerified: true });
    } catch (error) {
      if ((error as { code?: string }).code !== "auth/uid-already-exists") throw error;
    }
    await auth.setCustomUserClaims(user.uid, { role: user.role });
  }
  console.log(`✓ ${count} documents fictifs et ${Object.keys(seed.users ?? {}).length} comptes de démonstration créés.`);
}

main().catch((error: unknown) => {
  console.error(`✗ ${(error as Error).message}`);
  process.exit(1);
});
