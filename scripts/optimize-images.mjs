import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_DIR = path.join(__dirname, '..', 'public', 'images');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'optimized');

const QUALITY = {
  webp: 85,
  avif: 80,
  jpeg: 85,
  png: 90
};

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function optimizeImage(filePath, fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, ext);

  // Skip GIFs for now - they need special handling
  if (ext === '.gif') {
    console.log(`⏭️  Skipping ${fileName} (GIF requires special handling)`);
    return;
  }

  console.log(`🔄 Processing ${fileName}...`);

  const image = sharp(filePath);
  const metadata = await image.metadata();
  const originalSize = (await fs.stat(filePath)).size / 1024;

  console.log(`   Original: ${metadata.format}, ${metadata.width}x${metadata.height}, ${originalSize.toFixed(2)}KB`);

  // Generate WebP version
  try {
    const webpPath = path.join(OUTPUT_DIR, `${baseName}.webp`);
    await image
      .clone()
      .webp({ quality: QUALITY.webp, effort: 6 })
      .toFile(webpPath);

    const webpSize = (await fs.stat(webpPath)).size / 1024;
    const webpSavings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
    console.log(`   ✅ WebP: ${webpSize.toFixed(2)}KB (${webpSavings}% smaller)`);
  } catch (error) {
    console.error(`   ❌ WebP failed: ${error.message}`);
  }

  // Generate AVIF version
  try {
    const avifPath = path.join(OUTPUT_DIR, `${baseName}.avif`);
    await image
      .clone()
      .avif({ quality: QUALITY.avif, effort: 6 })
      .toFile(avifPath);

    const avifSize = (await fs.stat(avifPath)).size / 1024;
    const avifSavings = ((originalSize - avifSize) / originalSize * 100).toFixed(1);
    console.log(`   ✅ AVIF: ${avifSize.toFixed(2)}KB (${avifSavings}% smaller)`);
  } catch (error) {
    console.error(`   ❌ AVIF failed: ${error.message}`);
  }

  // Optimize original format
  try {
    const optimizedPath = path.join(OUTPUT_DIR, fileName);
    if (ext === '.png') {
      await image
        .clone()
        .png({ quality: QUALITY.png, compressionLevel: 9 })
        .toFile(optimizedPath);
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      await image
        .clone()
        .jpeg({ quality: QUALITY.jpeg, mozjpeg: true })
        .toFile(optimizedPath);
    }

    const optimizedSize = (await fs.stat(optimizedPath)).size / 1024;
    const optimizedSavings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    console.log(`   ✅ Optimized ${ext}: ${optimizedSize.toFixed(2)}KB (${optimizedSavings}% smaller)`);
  } catch (error) {
    console.error(`   ❌ Optimization failed: ${error.message}`);
  }

  console.log('');
}

async function main() {
  console.log('🚀 Starting image optimization...\n');

  await ensureDir(OUTPUT_DIR);

  const files = await fs.readdir(IMAGE_DIR);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.gif'].includes(ext);
  });

  console.log(`Found ${imageFiles.length} images to process\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of imageFiles) {
    const filePath = path.join(IMAGE_DIR, file);
    const stats = await fs.stat(filePath);

    if (stats.isFile()) {
      totalOriginal += stats.size;
      await optimizeImage(filePath, file);
    }
  }

  console.log('✨ Image optimization complete!');
  console.log(`\n📊 Total original size: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB`);
  console.log('\n📝 Next steps:');
  console.log('1. Review optimized images in public/images/optimized/');
  console.log('2. For fire.gif (7.7MB), consider converting to MP4 video format');
  console.log('3. Update image imports to use WebP with PNG/JPG fallbacks');
}

main().catch(console.error);