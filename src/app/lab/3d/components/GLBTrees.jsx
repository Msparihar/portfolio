'use client';

import { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWind } from './WindContext';

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

const TREE_VARIANTS = [
  'tree_default',
  'tree_default_dark',
  'tree_fat',
  'tree_fat_darkh',
  'tree_oak',
  'tree_oak_dark',
  'tree_blocks',
  'tree_blocks_dark',
  'tree_cone',
  'tree_cone_dark',
  'tree_detailed',
  'tree_detailed_dark',
];

const BASE = '/models/ghibli/kenney/Models/gltf/';

function GLBTree({ url, position, scale, rotY, phase }) {
  const { scene } = useGLTF(url);
  const ref = useRef();
  const wind = useWind();

  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true);
    enableShadows(cloned);
    return cloned;
  }, [scene]);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      const w = wind?.current;
      const strength = w?.strength ?? 0;
      const windBendZ = strength * 0.05 * (w?.dirX ?? 0);
      const windBendX = strength * 0.05 * (w?.dirZ ?? 0);
      ref.current.rotation.z = Math.sin(t * 0.6 + phase) * 0.025 + windBendZ;
      ref.current.rotation.x = Math.sin(t * 0.44 + phase + 1.2) * 0.012 + windBendX;
    }
  });

  return (
    <primitive
      ref={ref}
      object={clonedScene}
      position={position}
      scale={[scale, scale, scale]}
      rotation={[0, rotY, 0]}
    />
  );
}

const r = seededRand(42);

const TREES = (() => {
  const list = [];
  const count = 15;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + r() * 0.6;
    const rad = 0.5 + r() * 1.8;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const variantIdx = Math.floor(r() * TREE_VARIANTS.length);
    const scale = 0.55 + r() * 0.4;
    const rotY = r() * Math.PI * 2;
    const phase = r() * Math.PI * 2;
    list.push({ x, z, scale, rotY, phase, variant: TREE_VARIANTS[variantIdx] });
  }
  return list;
})();

// Preload all tree variants
TREE_VARIANTS.forEach((v) => useGLTF.preload(`${BASE}${v}.glb`));

export function GLBTrees() {
  return (
    <group>
      {TREES.map((t, i) => (
        <GLBTree
          key={i}
          url={`${BASE}${t.variant}.glb`}
          position={[t.x, 0.52, t.z]}
          scale={t.scale}
          rotY={t.rotY}
          phase={t.phase}
        />
      ))}
    </group>
  );
}
