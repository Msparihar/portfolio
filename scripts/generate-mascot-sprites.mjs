#!/usr/bin/env node
// Generate transparent kitsune mascot sprites for each world via OpenAI gpt-image-1.
// 3 poses per world × 6 worlds = 18 images. Cost ~$0.17 each, cap ~$3.
// Saves to: public/images/mascot/<world-key>/{idle,blink,wave}.png
// Run: node scripts/generate-mascot-sprites.mjs [--only=ghibli,got-north]

import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';

const ENV_FILE = 'C:/Users/manis/.env.local';
const OUT_BASE = path.resolve('public/images/mascot');
const MODEL = 'gpt-image-1';
const SIZE = '1024x1024';
const COST_PER = 0.04; // gpt-image-1 medium quality 1024x1024 ≈ $0.04
const COST_CAP = 3.0;
const CONCURRENCY = 4;

function loadApiKey() {
  const txt = fs.readFileSync(ENV_FILE, 'utf-8');
  for (const line of txt.split(/\r?\n/)) {
    if (line.startsWith('OPENAI_API_KEY=')) {
      return line.slice('OPENAI_API_KEY='.length).trim().replace(/^["']|["']$/g, '');
    }
  }
  throw new Error('OPENAI_API_KEY not found in env file');
}

const BASE_RULES =
  'isolated character only on PURE TRANSPARENT background. ' +
  'NO scene, NO environment, NO background elements, NO frame, NO border, NO ground shadow. ' +
  'Front-facing or slight 3/4 view. Clean PNG cutout style, soft cel-shading, expressive face. ' +
  'Centered character. Square 1024x1024.';

const POSES = {
  idle: 'standing in a relaxed neutral pose, eyes open, tiny friendly smile, three fluffy tails behind',
  blink: 'same standing relaxed neutral pose, but EYES FULLY CLOSED in a gentle blink (two small curved arcs for eyes), tiny friendly smile, three fluffy tails behind',
  wave: 'standing pose with one front paw lifted up to its ear height in a cheerful hello gesture, big smile, eyes open and bright, ears perked up, three fluffy tails behind',
};

const WORLDS = {
  ghibli: {
    style:
      'A small chibi 3-tail kitsune fox spirit character, Studio Ghibli watercolor style, ' +
      'soft cream-and-white fur, large warm amber eyes, peaceful Miyazaki aesthetic, painterly pastel palette',
  },
  'elden-ring': {
    style:
      'A small chibi 3-tail kitsune fox spirit character, dark fantasy Tarnished style, ' +
      'deep amber-and-rust fur with faint glowing golden ember motes, tails tipped with subtle golden flame, ' +
      'watchful golden eyes, painterly cel-shaded',
  },
  'got-north': {
    style:
      'A small chibi 3-tail kitsune fox spirit, House Stark of the North aesthetic, ' +
      'thick silver-white winter fur dusted with snow, frosted blue eyes, breath fogging slightly, ' +
      'muted slate and pale blue accents',
  },
  'got-kings-landing': {
    style:
      'A small chibi 3-tail kitsune fox spirit, House Lannister of King\'s Landing aesthetic, ' +
      'rich crimson-and-gold fur, golden eyes, tiny gold lion-mane accent around the neck, regal but cute',
  },
  'got-nights-watch': {
    style:
      'A small chibi 3-tail kitsune fox spirit, Night\'s Watch sworn brother aesthetic, ' +
      'jet black fur with a tiny weathered black cloak draped over the shoulders, sharp pale blue eyes, ' +
      'somber but cute',
  },
  'got-dragonstone': {
    style:
      'A small chibi 3-tail kitsune fox spirit, House Targaryen of Dragonstone aesthetic, ' +
      'platinum-silver fur with faint silver scale highlights, glowing violet eyes, ' +
      'tails tipped with subtle red dragon-flame accents',
  },
};

function buildPrompt(worldKey, poseKey) {
  return `${WORLDS[worldKey].style}, ${POSES[poseKey]}. ${BASE_RULES}`;
}

async function genOne(client, worldKey, poseKey) {
  const outDir = path.join(OUT_BASE, worldKey);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${poseKey}.png`);
  const prompt = buildPrompt(worldKey, poseKey);
  const t0 = Date.now();
  let resp;
  try {
    resp = await client.images.generate({
      model: MODEL,
      prompt,
      size: SIZE,
      n: 1,
      background: 'transparent',
      quality: 'medium',
      output_format: 'png',
    });
  } catch (err) {
    return { worldKey, poseKey, ok: false, info: `${err?.status || ''} ${err?.message || err}`.slice(0, 300), dt: 0 };
  }
  const item = resp.data?.[0];
  if (!item) return { worldKey, poseKey, ok: false, info: 'no data', dt: 0 };
  let buf;
  if (item.b64_json) {
    buf = Buffer.from(item.b64_json, 'base64');
  } else if (item.url) {
    const r = await fetch(item.url);
    buf = Buffer.from(await r.arrayBuffer());
  } else {
    return { worldKey, poseKey, ok: false, info: 'no image data', dt: 0 };
  }
  fs.writeFileSync(outPath, buf);
  return { worldKey, poseKey, ok: true, info: outPath, dt: (Date.now() - t0) / 1000 };
}

async function runPool(tasks, fn, concurrency) {
  const results = [];
  let idx = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (idx < tasks.length) {
      const i = idx++;
      const r = await fn(tasks[i]);
      results.push(r);
      const tag = r.ok ? 'OK ' : 'ERR';
      const wkPad = (r.worldKey + '                  ').slice(0, 20);
      const pkPad = (r.poseKey + '       ').slice(0, 7);
      process.stdout.write(`[${tag}] ${wkPad} ${pkPad} ${r.dt.toFixed(1)}s  ${r.info}\n`);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const onlyArg = args.find((a) => a.startsWith('--only='));
  const only = onlyArg ? onlyArg.slice('--only='.length).split(',') : null;

  const apiKey = loadApiKey();
  const client = new OpenAI({ apiKey });

  const worldKeys = only ? only.filter((k) => k in WORLDS) : Object.keys(WORLDS);
  const tasks = [];
  for (const w of worldKeys) {
    for (const p of Object.keys(POSES)) tasks.push({ worldKey: w, poseKey: p });
  }

  const estCost = tasks.length * COST_PER;
  process.stdout.write(`Generating ${tasks.length} sprites (${worldKeys.length} worlds × ${Object.keys(POSES).length} poses).\n`);
  process.stdout.write(`Estimated cost: $${estCost.toFixed(2)} (cap $${COST_CAP}).\n`);
  if (estCost > COST_CAP) {
    process.stdout.write('ERROR: Estimated cost exceeds cap. Aborting.\n');
    process.exit(1);
  }

  const t0 = Date.now();
  const results = await runPool(tasks, (t) => genOne(client, t.worldKey, t.poseKey), CONCURRENCY);
  const okCount = results.filter((r) => r.ok).length;
  const errCount = results.length - okCount;
  process.stdout.write(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s — ${okCount} ok, ${errCount} err.\n`);
  process.stdout.write(`Approx spend: $${(okCount * COST_PER).toFixed(2)}\n`);
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e?.stack || e}\n`);
  process.exit(1);
});
