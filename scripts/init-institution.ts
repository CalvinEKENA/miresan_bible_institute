/**
 * Écrit les données RÉELLES de l'Institut : paramètres, programme, 36 cours.
 * Idempotent : n'écrase pas les modifications faites depuis l'administration,
 * sauf option --force.
 *
 *   npm run init:institution            # crée ce qui manque
 *   npm run init:institution -- --force # réinitialise aux valeurs de référence
 */
import { OFFICIAL_COURSES } from "../src/data/catalog";
import { DEFAULT_SETTINGS, PROGRAMS } from "../src/data/institution";
import { admin, describeTarget, flag } from "./lib/admin";

async function main() {
  const { db } = admin();
  const force = flag("force");
  console.log(`→ Cible : ${describeTarget()}${force ? " (--force)" : ""}`);

  const writeIfMissing = async (path: string, data: object) => {
    const ref = db.doc(path);
    if (!force && (await ref.get()).exists) return false;
    await ref.set(JSON.parse(JSON.stringify(data)) as Record<string, unknown>);
    return true;
  };

  let written = 0;
  if (await writeIfMissing("settings/institution", { id: "institution", ...DEFAULT_SETTINGS, updatedAt: new Date().toISOString() })) written++;
  for (const program of PROGRAMS) if (await writeIfMissing(`programs/${program.id}`, program)) written++;
  for (const course of OFFICIAL_COURSES) if (await writeIfMissing(`courses/${course.id}`, course)) written++;

  console.log(`✓ ${written} document(s) écrit(s) — ${OFFICIAL_COURSES.length} cours de référence, aucune donnée fictive.`);
}

main().catch((error: unknown) => {
  console.error(`✗ ${(error as Error).message}`);
  process.exit(1);
});
