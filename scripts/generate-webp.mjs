/**
 * One-off script: generate WebP variants of AI wallpapers.
 * Usage: node --experimental-strip-types scripts/generate-webp.mjs
 *   (or: node scripts/generate-webp.mjs)
 */

import sharp from "sharp";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const AI_WALLPAPERS = [
  "public/images/worlds/elden-ring/wallpaper-ai.png",
  "public/images/worlds/ghibli/wallpaper-ai.png",
  "public/images/worlds/got/north/wallpaper-ai.png",
];

const WEBP_QUALITY = 85;

async function generateWebP(relPath) {
  const src = join(projectRoot, relPath);
  const dest = src.replace(/\.png$/, ".webp");

  if (!existsSync(src)) {
    console.error(`  SKIP (not found): ${relPath}`);
    return null;
  }

  const srcMeta = await sharp(src).metadata();
  const srcSize = (await sharp(src).toBuffer()).length;

  await sharp(src)
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(dest);

  const destBuf = await sharp(dest).toBuffer();
  const destSize = destBuf.length;

  const saving = (((srcSize - destSize) / srcSize) * 100).toFixed(1);
  console.log(
    `  ${relPath.split("/").pop().replace(".png", "")} → WebP`,
    `  ${(srcSize / 1024).toFixed(0)} KB → ${(destSize / 1024).toFixed(0)} KB  (${saving}% smaller)`
  );

  return { relPath: relPath.replace(".png", ".webp"), sizeKB: destSize / 1024 };
}

console.log("Generating WebP variants (quality=85)…\n");
for (const p of AI_WALLPAPERS) {
  await generateWebP(p);
}
console.log("\nDone.");
