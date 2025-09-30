import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import gifsicle from 'gifsicle';

const execFilePromise = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_DIR = path.join(__dirname, '..', 'public', 'images');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'optimized');

async function optimizeGif() {
  const inputPath = path.join(IMAGE_DIR, 'fire.gif');
  const outputPath = path.join(OUTPUT_DIR, 'fire-optimized.gif');

  const originalStat = await fs.stat(inputPath);
  const originalSize = originalStat.size / 1024 / 1024; // MB

  console.log(`🔥 Original fire.gif size: ${originalSize.toFixed(2)}MB\n`);

  try {
    console.log('🔄 Optimizing with gifsicle...');
    console.log('   - Reducing colors to 128');
    console.log('   - Applying lossy compression (80)');
    console.log('   - Optimizing frame differences\n');

    await execFilePromise(gifsicle, [
      '--optimize=3',
      '--lossy=80',
      '--colors=128',
      '--scale=0.8',
      inputPath,
      '-o',
      outputPath
    ]);

    const optimizedStat = await fs.stat(outputPath);
    const optimizedSize = optimizedStat.size / 1024 / 1024; // MB
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

    console.log(`✅ Optimized fire.gif created!`);
    console.log(`   Size: ${optimizedSize.toFixed(2)}MB (${savings}% smaller)`);
    console.log(`   Saved: ${(originalSize - optimizedSize).toFixed(2)}MB\n`);

    if (optimizedSize > 2) {
      console.log('⚠️  Warning: GIF is still large (>2MB)');
      console.log('💡 Recommendations:');
      console.log('   1. Consider using a video format (MP4/WebM) for better compression');
      console.log('   2. Reduce frame count or dimensions further');
      console.log('   3. Use lazy loading for this asset');
    }
  } catch (error) {
    console.error('❌ Error optimizing GIF:', error.message);
    process.exit(1);
  }
}

optimizeGif().catch(console.error);