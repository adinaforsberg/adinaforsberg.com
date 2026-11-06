#!/usr/bin/env node
// Prepares a photo for the site: fixes rotation, shrinks it to at most 1500px on the
// long side and saves it as WebP in public/images/.
// Usage: node scripts/add-image.mjs <photo> [name]
//   e.g. node scripts/add-image.mjs ~/Desktop/IMG_1234.HEIC "concert-2026"
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const [input, nameArg] = process.argv.slice(2);
if (!input) {
  console.error("usage: node scripts/add-image.mjs <photo> [name]");
  process.exit(1);
}
const name = (nameArg ?? path.parse(input).name)
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/images", `${name}.webp`);

const info = await sharp(input)
  .rotate()
  .resize({ width: 1500, height: 1500, fit: "inside", withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile(out);

console.log(`Saved public/images/${name}.webp (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
console.log(`<img src="images/${name}.webp" alt="DESCRIBE THE IMAGE" width="${info.width}" height="${info.height}" loading="lazy">`);
