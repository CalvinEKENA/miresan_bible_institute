// Copie la logique de domaine partagée (source unique : src/domain) vers les Cloud Functions.
// Exécuté automatiquement avant la compilation des fonctions (functions/package.json → prebuild).
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const target = path.join(root, "functions/src/shared");
const files = ["types.ts", "roles.ts", "quiz.ts", "identity.ts", "attendance.ts"];

await mkdir(target, { recursive: true });
for (const file of files) {
  await copyFile(path.join(root, "src/domain", file), path.join(target, file));
}
console.log(`Domaine partagé synchronisé → functions/src/shared (${files.length} fichiers)`);
