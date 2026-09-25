/**
 * Crée (ou met à jour) le compte d'administration initial — rôle super_admin.
 *
 *   BOOTSTRAP_ADMIN_USERNAME=pasteurarmel \
 *   BOOTSTRAP_ADMIN_PASSWORD='••••••••' \
 *   BOOTSTRAP_ADMIN_DISPLAY_NAME='Pasteur Armel' \
 *   npm run bootstrap:admin
 *
 * - Le mot de passe n'est lu QUE depuis l'environnement : il n'apparaît dans
 *   aucun fichier, aucun log, aucune donnée Firestore.
 * - Un compte existant garde son mot de passe, sauf option --reset-password.
 * - Le rôle est posé en custom claim (source d'autorité des Security Rules).
 */
import { identifierToAuthEmail, isValidUsername, normalizeUsername } from "../src/domain/identity";
import { admin, describeTarget, flag } from "./lib/admin";

const IDENTITY_DOMAIN = process.env.NEXT_PUBLIC_IDENTITY_DOMAIN ?? "id.miresan-bible-institute.app";

async function main() {
  const username = normalizeUsername(process.env.BOOTSTRAP_ADMIN_USERNAME ?? "");
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "";
  const displayName = process.env.BOOTSTRAP_ADMIN_DISPLAY_NAME || "Pasteur Armel";

  if (!isValidUsername(username)) throw new Error("BOOTSTRAP_ADMIN_USERNAME manquant ou invalide.");
  if (password.length < 8) throw new Error("BOOTSTRAP_ADMIN_PASSWORD manquant (8 caractères minimum).");

  const { auth, db } = admin();
  const email = identifierToAuthEmail(username, IDENTITY_DOMAIN);
  console.log(`→ Cible : ${describeTarget()}`);

  let uid: string;
  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    if (flag("reset-password")) {
      await auth.updateUser(uid, { password, displayName });
      console.log(`✓ Compte « ${username} » existant : mot de passe réinitialisé.`);
    } else {
      console.log(`✓ Compte « ${username} » existant : mot de passe conservé.`);
    }
  } catch (error) {
    if ((error as { code?: string }).code !== "auth/user-not-found") throw error;
    const created = await auth.createUser({ email, password, displayName, emailVerified: true });
    uid = created.uid;
    console.log(`✓ Compte « ${username} » créé.`);
  }

  await auth.setCustomUserClaims(uid, { role: "super_admin" });
  const [firstName = displayName, ...rest] = displayName.replace(/^Pasteur\s+/i, "").split(" ");
  await db.doc(`users/${uid}`).set(
    {
      uid,
      username,
      displayName,
      title: "Pasteur",
      firstName,
      lastName: rest.join(" ") || "SEUWOU",
      role: "super_admin",
      status: "active",
      mustChangePassword: flag("keep-password") ? false : true,
      createdAt: new Date().toISOString(),
    },
    { merge: true },
  );
  await db.collection("auditLogs").add({ action: "bootstrap.super_admin", actorUid: "script", target: { uid, username }, at: new Date() });
  console.log(`✓ Rôle super_admin attribué (custom claim). Identifiant visible : ${username}`);
}

main().catch((error: unknown) => {
  console.error(`✗ ${(error as Error).message}`);
  process.exit(1);
});
