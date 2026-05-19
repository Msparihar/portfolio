/**
 * Upload all public/images/ assets to Cloudflare R2 bucket "portfolio-cdn".
 * Preserves directory structure: local public/images/foo.png → R2 key images/foo.png
 *
 * Usage:
 *   CLOUDFLARE_ACCOUNT_ID=<id> node scripts/upload-to-r2.mjs
 *   (API credentials read from CLOUDFLARE_API_KEY + CLOUDFLARE_EMAIL env vars,
 *    or from .env.local in the project root)
 *
 * To add a new image: drop it in public/images/ and re-run this script.
 * The script is idempotent — already-uploaded files are overwritten with the latest version.
 */

import { execSync } from "child_process";
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join, relative, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

// ── Config ────────────────────────────────────────────────────────────────────
const BUCKET = "portfolio-cdn";
const CDN_BASE = "https://cdn.manishsingh.tech";
const R2_DEV_BASE = "https://pub-17427c9fa145483faa827eedd3fddbe1.r2.dev"; // fallback
const IMAGES_DIR = join(projectRoot, "public/images");
const MANIFEST_PATH = join(projectRoot, "docs/r2-asset-manifest.json");

// ── Load env vars ─────────────────────────────────────────────────────────────
function loadEnv() {
  const envFile = join(projectRoot, ".env.local");
  if (existsSync(envFile)) {
    const lines = readFileSync(envFile, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx < 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}
loadEnv();

const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || "fc7a0d1868d4e4c274b6fcf49bef29d3";

// ── MIME types ────────────────────────────────────────────────────────────────
const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

// ── Collect all files ─────────────────────────────────────────────────────────
function walk(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, results);
    } else {
      results.push(full);
    }
  }
  return results;
}

const allFiles = walk(IMAGES_DIR);
console.log(`Found ${allFiles.length} files to upload.\n`);

// ── Upload via wrangler r2 object put ─────────────────────────────────────────
const wrangler = join(projectRoot, "node_modules/.bin/wrangler");
const assets = {};
let uploaded = 0;
let failed = 0;
let totalBytes = 0;

for (const filePath of allFiles) {
  const relToPublic = relative(join(projectRoot, "public"), filePath)
    .replace(/\\/g, "/"); // normalize Windows paths
  const r2Key = relToPublic; // e.g. images/worlds/ghibli/wallpaper-ai.png
  const ext = extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const fileSize = statSync(filePath).size;
  totalBytes += fileSize;

  const cdnUrl = `${CDN_BASE}/${r2Key}`;
  const localKey = `public/${relToPublic}`; // matches manifest convention

  try {
    execSync(
      `"${wrangler}" r2 object put "${BUCKET}/${r2Key}" --file "${filePath}" --content-type "${contentType}" --remote`,
      {
        env: {
          ...process.env,
          CLOUDFLARE_ACCOUNT_ID: CF_ACCOUNT,
          CLOUDFLARE_API_KEY: process.env.CLOUDFLARE_API_KEY,
          CLOUDFLARE_EMAIL: process.env.CLOUDFLARE_EMAIL || "manishsparihar2020@gmail.com",
        },
        stdio: "pipe",
      }
    );
    assets[localKey] = cdnUrl;
    uploaded++;
    process.stdout.write(`  ✓ ${r2Key}\n`);
  } catch (err) {
    failed++;
    console.error(`  ✗ FAILED: ${r2Key}`);
    console.error("   ", err.stderr?.toString().trim() || err.message);
  }
}

// ── Write manifest ────────────────────────────────────────────────────────────
const manifest = {
  bucket: BUCKET,
  cdnBase: CDN_BASE,
  r2DevBase: R2_DEV_BASE,
  uploadedAt: new Date().toISOString(),
  assets,
};

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
console.log(`\n── Summary ──────────────────────────────`);
console.log(`  Uploaded: ${uploaded}  Failed: ${failed}`);
console.log(`  Total size: ${totalMB} MB`);
console.log(`  Manifest: ${MANIFEST_PATH}`);
