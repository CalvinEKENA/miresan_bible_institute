// Génère les variantes optimisées du logo officiel et les icônes PWA.
// Source unique : public/branding/logo-ib-miresan.png (logo officiel, fond transparent).
// Usage : npm run assets
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "public/branding/logo-ib-miresan.png");
const ivory = { r: 251, g: 248, b: 241, alpha: 1 };
const forest = { r: 11, g: 42, b: 31, alpha: 1 };

async function squareLogo(size, { padding = 0, background = { r: 0, g: 0, b: 0, alpha: 0 } } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const logo = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } }).composite([
    { input: logo, gravity: "center" },
  ]);
}

async function main() {
  await mkdir(path.join(root, "public/icons"), { recursive: true });

  // Variantes webp du logo pour l'interface (le PNG source pèse ~450 Ko).
  for (const width of [96, 192, 384, 640]) {
    await sharp(source)
      .resize({ width })
      .webp({ quality: 78, alphaQuality: 85, effort: 6 })
      .toFile(path.join(root, `public/branding/logo-ib-miresan-${width}.webp`));
  }

  // Icônes PWA
  await (await squareLogo(192)).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(path.join(root, "public/icons/icon-192.png"));
  await (await squareLogo(512)).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(path.join(root, "public/icons/icon-512.png"));
  // Maskable : zone de sécurité de 10 % sur fond ivoire
  await (await squareLogo(512, { padding: 0.1, background: ivory })).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(
    path.join(root, "public/icons/maskable-512.png"),
  );

  // Conventions de fichiers Next.js (favicon + Apple)
  await (await squareLogo(64)).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(path.join(root, "src/app/icon.png"));
  await (await squareLogo(180, { padding: 0.06, background: ivory })).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(
    path.join(root, "src/app/apple-icon.png"),
  );

  // Image Open Graph (1200×630) : logo centré sur vert profond
  const logoOg = await sharp(source).resize(420, 420, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: forest } })
    .composite([{ input: logoOg, gravity: "center" }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(root, "src/app/opengraph-image.jpg"));

  console.log("Assets de marque générés.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
