'use client';

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

export const BASE = '/models/ghibli/kenney/Models/gltf/';

export function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function enableShadows(scene) {
  scene.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
}

export function GLBInstance({ url, position, scale, rotY }) {
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
