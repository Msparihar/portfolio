'use client';

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function enableShadows(scene) {
  scene.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
}

const BASE = '/models/ghibli/kenney/Models/gltf/';

function GLBInstance({ url, position, scale, rotY }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    enableShadows(c);
    return c;
  }, [scene]);

  return (
    <primitive
      object={cloned}
      position={position}
      scale={[scale, scale, scale]}
      rotation={[0, rotY, 0]}
    />
  );
}

// ---------- Mushrooms ----------
const MUSHROOM_VARIANTS = [
  'mushroom_red',
  'mushroom_redTall',
  'mushroom_tan',
  'mushroom_tanTall',
  'mushroom_redGroup',
  'mushroom_tanGroup',
];

const rm = seededRand(77);
const MUSHROOMS = (() => {
  const list = [];
  for (let i = 0; i < 9; i++) {
    const angle = rm() * Math.PI * 2;
    const rad = 0.8 + rm() * 2.0;
    list.push({
      url: `${BASE}${MUSHROOM_VARIANTS[Math.floor(rm() * MUSHROOM_VARIANTS.length)]}.glb`,
      position: [Math.cos(angle) * rad, 0.5, Math.sin(angle) * rad],
      scale: 0.45 + rm() * 0.35,
      rotY: rm() * Math.PI * 2,
    });
  }
  return list;
})();

// ---------- Flowers ----------
const FLOWER_VARIANTS = [
  'flower_purpleA', 'flower_purpleB', 'flower_purpleC',
  'flower_redA', 'flower_redB', 'flower_redC',
  'flower_yellowA', 'flower_yellowB', 'flower_yellowC',
];

const rf = seededRand(55);
const FLOWERS = (() => {
  const list = [];
  for (let i = 0; i < 20; i++) {
    // Scatter near island edges (rad 1.5 – 2.8)
    const angle = rf() * Math.PI * 2;
    const rad = 1.5 + rf() * 1.3;
    list.push({
      url: `${BASE}${FLOWER_VARIANTS[Math.floor(rf() * FLOWER_VARIANTS.length)]}.glb`,
      position: [Math.cos(angle) * rad, 0.5, Math.sin(angle) * rad],
      scale: 0.5 + rf() * 0.4,
      rotY: rf() * Math.PI * 2,
    });
  }
  return list;
})();

// ---------- Cliff blocks (underside) ----------
const CLIFF_VARIANTS = ['cliff_block_rock', 'cliff_block_stone'];
const rc = seededRand(33);
const CLIFFS = (() => {
  const list = [];
  for (let i = 0; i < 10; i++) {
    const angle = rc() * Math.PI * 2;
    const rad = 0.3 + rc() * 1.6;
    const yd = -(1.8 + rc() * 1.4);
    list.push({
      url: `${BASE}${CLIFF_VARIANTS[Math.floor(rc() * CLIFF_VARIANTS.length)]}.glb`,
      position: [Math.cos(angle) * rad, yd, Math.sin(angle) * rad],
      scale: 0.4 + rc() * 0.5,
      rotY: rc() * Math.PI * 2,
    });
  }
  return list;
})();

// ---------- Stumps & logs ----------
const STUMP_VARIANTS = ['stump_old', 'stump_round', 'log_large'];
const rs = seededRand(19);
const STUMPS = (() => {
  const list = [];
  for (let i = 0; i < 5; i++) {
    const angle = rs() * Math.PI * 2;
    const rad = 0.5 + rs() * 1.8;
    list.push({
      url: `${BASE}${STUMP_VARIANTS[Math.floor(rs() * STUMP_VARIANTS.length)]}.glb`,
      position: [Math.cos(angle) * rad, 0.5, Math.sin(angle) * rad],
      scale: 0.5 + rs() * 0.3,
      rotY: rs() * Math.PI * 2,
    });
  }
  return list;
})();

// Preload
[...MUSHROOM_VARIANTS, ...FLOWER_VARIANTS, ...CLIFF_VARIANTS, ...STUMP_VARIANTS].forEach((v) =>
  useGLTF.preload(`${BASE}${v}.glb`)
);

export function GLBMushrooms() {
  return (
    <group>
      {MUSHROOMS.map((m, i) => (
        <GLBInstance key={i} {...m} />
      ))}
    </group>
  );
}

export function GLBFlowers() {
  return (
    <group>
      {FLOWERS.map((f, i) => (
        <GLBInstance key={i} {...f} />
      ))}
    </group>
  );
}

export function GLBCliffBlocks() {
  return (
    <group position={[0, -0.5, 0]}>
      {CLIFFS.map((c, i) => (
        <GLBInstance key={i} {...c} />
      ))}
    </group>
  );
}

export function GLBStumps() {
  return (
    <group>
      {STUMPS.map((s, i) => (
        <GLBInstance key={i} {...s} />
      ))}
    </group>
  );
}
