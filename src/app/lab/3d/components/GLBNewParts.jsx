'use client';

import { BASE, seededRand, GLBInstance } from './glbScatterUtils';
import { useGLTF } from '@react-three/drei';

// ---------- Rocks ----------
const ROCK_VARIANTS = [
  'rock_largeA', 'rock_largeB', 'rock_largeC', 'rock_largeD',
  'rock_tallA', 'rock_tallB', 'rock_tallC', 'rock_tallD',
  'rock_tallE', 'rock_tallF',
];

const rr = seededRand(101);
const ROCKS = (() => {
  const list = [];
  for (let i = 0; i < 10; i++) {
    const angle = rr() * Math.PI * 2;
    const rad = 0.4 + rr() * 2.2;
    list.push({
      url: `${BASE}${ROCK_VARIANTS[Math.floor(rr() * ROCK_VARIANTS.length)]}.glb`,
      position: [Math.cos(angle) * rad, 0.5, Math.sin(angle) * rad],
      scale: 0.4 + rr() * 0.45,
      rotY: rr() * Math.PI * 2,
    });
  }
  return list;
})();

// ---------- Cliffs — 3×4 grid, 90°-snapped rotations so tiles read as an assembled formation ----------
const CLIFF_VARIANTS = [
  'cliff_block_rock', 'cliff_block_stone',
  'cliff_blockHalf_rock', 'cliff_blockHalf_stone',
  'cliff_corner_rock', 'cliff_corner_stone',
  'cliff_large_rock', 'cliff_large_stone',
  'cliff_steps_rock', 'cliff_steps_stone',
  'cliff_cave_rock', 'cliff_cave_stone',
];

const HALF_PI = Math.PI / 2;
const CLIFF_ROTATIONS = [0, HALF_PI, Math.PI, HALF_PI * 3];

const CLIFFS = (() => {
  const rcl = seededRand(203);
  const list = [];
  const cols = 3;
  const rows = 4;
  const spacing = 1.1;
  const offsetX = ((cols - 1) * spacing) / 2;
  const offsetZ = ((rows - 1) * spacing) / 2;
  let idx = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * spacing - offsetX;
      const z = row * spacing - offsetZ;
      const rotY = CLIFF_ROTATIONS[Math.floor(rcl() * CLIFF_ROTATIONS.length)];
      const scale = 0.42 + rcl() * 0.16;
      list.push({
        url: `${BASE}${CLIFF_VARIANTS[idx % CLIFF_VARIANTS.length]}.glb`,
        position: [x, 0.0, z],
        scale,
        rotY,
      });
      idx++;
    }
  }
  return list;
})();

// ---------- Garden Crops ----------
const CROP_VARIANTS = [
  'crops_cornStageA', 'crops_cornStageB', 'crops_cornStageC', 'crops_cornStageD',
  'crops_bambooStageA', 'crops_bambooStageB',
  'crop_carrot', 'crop_pumpkin', 'crop_melon', 'crop_turnip',
  'crops_leafsStageA', 'crops_leafsStageB',
];

const rcr = seededRand(317);
const CROPS = (() => {
  const list = [];
  for (let i = 0; i < 12; i++) {
    const angle = rcr() * Math.PI * 2;
    const rad = 0.5 + rcr() * 2.0;
    list.push({
      url: `${BASE}${CROP_VARIANTS[Math.floor(rcr() * CROP_VARIANTS.length)]}.glb`,
      position: [Math.cos(angle) * rad, 0.5, Math.sin(angle) * rad],
      scale: 0.5 + rcr() * 0.4,
      rotY: rcr() * Math.PI * 2,
    });
  }
  return list;
})();

// ---------- Fences ----------
const FENCE_VARIANTS = [
  'fence_simple', 'fence_corner', 'fence_gate',
  'fence_planks', 'fence_bend', 'fence_simpleHigh', 'fence_simpleLow',
];

const rfn = seededRand(409);
const FENCES = (() => {
  const list = [];
  for (let i = 0; i < 9; i++) {
    const angle = rfn() * Math.PI * 2;
    const rad = 0.6 + rfn() * 1.8;
    list.push({
      url: `${BASE}${FENCE_VARIANTS[Math.floor(rfn() * FENCE_VARIANTS.length)]}.glb`,
      position: [Math.cos(angle) * rad, 0.5, Math.sin(angle) * rad],
      scale: 0.5 + rfn() * 0.35,
      rotY: rfn() * Math.PI * 2,
    });
  }
  return list;
})();

// ---------- Stone Paths ----------
const PATH_VARIANTS = [
  'path_stone', 'path_stoneCorner', 'path_stoneEnd', 'path_stoneCircle',
  'path_wood', 'path_woodCorner', 'path_woodEnd',
];

const rp = seededRand(511);
const PATHS = (() => {
  const list = [];
  for (let i = 0; i < 9; i++) {
    const angle = rp() * Math.PI * 2;
    const rad = 0.3 + rp() * 2.1;
    list.push({
      url: `${BASE}${PATH_VARIANTS[Math.floor(rp() * PATH_VARIANTS.length)]}.glb`,
      position: [Math.cos(angle) * rad, 0.5, Math.sin(angle) * rad],
      scale: 0.5 + rp() * 0.35,
      rotY: rp() * Math.PI * 2,
    });
  }
  return list;
})();

// ---------- Decorative Props ----------
const DECO_VARIANTS = [
  'statue_block', 'statue_column', 'statue_columnDamaged', 'statue_head', 'statue_obelisk',
  'pot_large', 'pot_small',
  'tent_detailedClosed', 'tent_smallClosed',
  'canoe', 'log_stack', 'log_stackLarge',
];

const rd = seededRand(613);
const DECOS = (() => {
  const list = [];
  for (let i = 0; i < 10; i++) {
    const angle = rd() * Math.PI * 2;
    const rad = 0.5 + rd() * 2.2;
    list.push({
      url: `${BASE}${DECO_VARIANTS[Math.floor(rd() * DECO_VARIANTS.length)]}.glb`,
      position: [Math.cos(angle) * rad, 0.5, Math.sin(angle) * rad],
      scale: 0.4 + rd() * 0.45,
      rotY: rd() * Math.PI * 2,
    });
  }
  return list;
})();

// Preload all variants
[
  ...ROCK_VARIANTS,
  ...CLIFF_VARIANTS,
  ...CROP_VARIANTS,
  ...FENCE_VARIANTS,
  ...PATH_VARIANTS,
  ...DECO_VARIANTS,
].forEach((v) => useGLTF.preload(`${BASE}${v}.glb`));

export function GLBRocks() {
  return (
    <group>
      {ROCKS.map((r, i) => (
        <GLBInstance key={i} {...r} />
      ))}
    </group>
  );
}

export function GLBCliffs() {
  return (
    <group>
      {CLIFFS.map((c, i) => (
        <GLBInstance key={i} {...c} />
      ))}
    </group>
  );
}

export function GLBCrops() {
  return (
    <group>
      {CROPS.map((c, i) => (
        <GLBInstance key={i} {...c} />
      ))}
    </group>
  );
}

export function GLBFences() {
  return (
    <group>
      {FENCES.map((f, i) => (
        <GLBInstance key={i} {...f} />
      ))}
    </group>
  );
}

export function GLBPaths() {
  return (
    <group>
      {PATHS.map((p, i) => (
        <GLBInstance key={i} {...p} />
      ))}
    </group>
  );
}

export function GLBDecoProps() {
  return (
    <group>
      {DECOS.map((d, i) => (
        <GLBInstance key={i} {...d} />
      ))}
    </group>
  );
}
