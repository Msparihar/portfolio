import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const width = 1200;
const height = 630;

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>

  <!-- Terminal window chrome -->
  <rect x="60" y="40" width="1080" height="550" rx="12" fill="#111111" stroke="#1a1a1a" stroke-width="1"/>

  <!-- Title bar -->
  <rect x="60" y="40" width="1080" height="40" rx="12" fill="#1a1a1a"/>
  <rect x="60" y="68" width="1080" height="12" fill="#1a1a1a"/>

  <!-- Traffic lights -->
  <circle cx="90" cy="60" r="7" fill="#ff5f57"/>
  <circle cx="114" cy="60" r="7" fill="#febc2e"/>
  <circle cx="138" cy="60" r="7" fill="#28c840"/>

  <!-- Terminal title -->
  <text x="600" y="65" text-anchor="middle" fill="#666" font-family="monospace" font-size="14">manishsingh.tech</text>

  <!-- Terminal content -->
  <text x="100" y="130" fill="#22c55e" font-family="monospace" font-size="16">$ whoami</text>

  <text x="100" y="180" fill="#e2e8f0" font-family="monospace" font-size="36" font-weight="bold">Manish Singh Parihar</text>

  <text x="100" y="230" fill="#00b4d8" font-family="monospace" font-size="22">Full Stack Developer &amp; AI Engineer</text>

  <text x="100" y="290" fill="#22c55e" font-family="monospace" font-size="16">$ cat skills.txt</text>

  <text x="100" y="330" fill="#a1a1aa" font-family="monospace" font-size="16">Next.js • React • FastAPI • Python • TypeScript</text>
  <text x="100" y="360" fill="#a1a1aa" font-family="monospace" font-size="16">LangChain • PyTorch • PostgreSQL • Docker</text>

  <text x="100" y="420" fill="#22c55e" font-family="monospace" font-size="16">$ echo $WEBSITE</text>
  <text x="100" y="460" fill="#00b4d8" font-family="monospace" font-size="18">https://manishsingh.tech</text>

  <!-- Blinking cursor -->
  <text x="100" y="510" fill="#22c55e" font-family="monospace" font-size="16">$</text>
  <rect x="118" y="496" width="10" height="20" fill="#22c55e" opacity="0.8"/>

  <!-- Scanlines effect -->
  <rect x="60" y="80" width="1080" height="510" fill="url(#scanlines)" opacity="0.03"/>

  <defs>
    <pattern id="scanlines" width="100%" height="4" patternUnits="userSpaceOnUse">
      <rect width="100%" height="1" fill="#22c55e"/>
    </pattern>
  </defs>
</svg>
`;

async function generate() {
  const outputPath = path.join(__dirname, '..', 'public', 'images', 'og-image.png');
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  console.log('Generated og-image.png (1200x630) at:', outputPath);
}

generate().catch(console.error);
