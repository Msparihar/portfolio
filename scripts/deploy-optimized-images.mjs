import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPTIMIZED_DIR = path.join(__dirname, '..', 'public', 'images', 'optimized');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const BACKUP_DIR = path.join(__dirname, '..', 'public', 'images', 'originals-backup');

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function backupOriginals() {
  console.log('📦 Backing up original images...\n');

  await ensureDir(BACKUP_DIR);

  const files = await fs.readdir(IMAGES_DIR);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.gif'].includes(ext);
  });

  for (const file of imageFiles) {
    const sourcePath = path.join(IMAGES_DIR, file);
    const destPath = path.join(BACKUP_DIR, file);

    try {
      // Check if it's a file (not a directory)
      const stats = await fs.stat(sourcePath);
      if (stats.isFile()) {
        await fs.copyFile(sourcePath, destPath);
        console.log(`   ✅ Backed up: ${file}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Skipped: ${file} (${error.message})`);
    }
  }

  console.log('\n✨ Backup complete!\n');
}

async function replaceWithOptimized() {
  console.log('🔄 Replacing images with optimized versions...\n');

  const files = await fs.readdir(OPTIMIZED_DIR);

  let replacedCount = 0;
  let totalSavings = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();

    // Only replace with optimized PNG/JPG, not WebP/AVIF
    // (WebP/AVIF will be served automatically by Next.js)
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const optimizedPath = path.join(OPTIMIZED_DIR, file);
      const destPath = path.join(IMAGES_DIR, file);

      try {
        const optimizedStats = await fs.stat(optimizedPath);

        // Get original size if backup exists
        const backupPath = path.join(BACKUP_DIR, file);
        let originalSize = 0;
        try {
          const originalStats = await fs.stat(backupPath);
          originalSize = originalStats.size;
        } catch {
          // Backup doesn't exist, use current file
          try {
            const currentStats = await fs.stat(destPath);
            originalSize = currentStats.size;
          } catch {
            originalSize = 0;
          }
        }

        await fs.copyFile(optimizedPath, destPath);

        const savings = originalSize - optimizedStats.size;
        totalSavings += savings;
        const savingsPercent = originalSize > 0
          ? ((savings / originalSize) * 100).toFixed(1)
          : 0;

        console.log(`   ✅ ${file}: ${(optimizedStats.size / 1024).toFixed(2)}KB (${savingsPercent}% smaller)`);
        replacedCount++;
      } catch (error) {
        console.log(`   ❌ Failed to replace ${file}: ${error.message}`);
      }
    }
  }

  console.log(`\n✨ Replaced ${replacedCount} images`);
  console.log(`💾 Total savings: ${(totalSavings / 1024 / 1024).toFixed(2)}MB\n`);
}

async function generateImageManifest() {
  console.log('📝 Generating image manifest...\n');

  const files = await fs.readdir(OPTIMIZED_DIR);
  const manifest = {
    generated: new Date().toISOString(),
    images: []
  };

  for (const file of files) {
    const filePath = path.join(OPTIMIZED_DIR, file);
    const stats = await fs.stat(filePath);

    if (stats.isFile()) {
      const ext = path.extname(file).toLowerCase();
      const baseName = path.basename(file, ext);

      manifest.images.push({
        name: file,
        baseName,
        extension: ext,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2),
        path: `/images/optimized/${file}`
      });
    }
  }

  const manifestPath = path.join(OPTIMIZED_DIR, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`   ✅ Created manifest.json with ${manifest.images.length} images\n`);
}

async function showUsageInstructions() {
  console.log('📚 Usage Instructions:\n');
  console.log('1. Original images backed up to: public/images/originals-backup/');
  console.log('2. Optimized images remain in: public/images/optimized/');
  console.log('3. PNG/JPG images replaced with optimized versions');
  console.log('\n4. Next.js will automatically serve:');
  console.log('   - WebP to browsers that support it');
  console.log('   - AVIF to browsers that support it');
  console.log('   - Fallback to optimized PNG/JPG for older browsers');
  console.log('\n5. Update image imports in your code:');
  console.log('   - Use Next.js <Image> component for automatic optimization');
  console.log('   - Next.js will handle format selection automatically');
  console.log('\n6. For fire.gif:');
  console.log('   - Still 7.7MB (requires manual optimization)');
  console.log('   - Consider converting to video format or compressing manually');
  console.log('\n✨ Done! Run `bun run dev` to test the optimizations.\n');
}

async function main() {
  console.log('🚀 Deploying Optimized Images\n');
  console.log('═'.repeat(50) + '\n');

  try {
    // Step 1: Backup originals
    await backupOriginals();

    // Step 2: Replace with optimized versions
    await replaceWithOptimized();

    // Step 3: Generate manifest
    await generateImageManifest();

    // Step 4: Show instructions
    await showUsageInstructions();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPlease check the error and try again.');
    process.exit(1);
  }
}

main().catch(console.error);