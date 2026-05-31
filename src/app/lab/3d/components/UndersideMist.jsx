'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function seedRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const COUNT = 24;

function buildPuffs() {
  const r = seedRand(53);
  const list = [];
  for (let i = 0; i < COUNT; i++) {
    const angle = r() * Math.PI * 2;
    const radius = r() * 1.5 + 0.5;
    list.push({
      baseX: Math.cos(angle) * radius,
      baseY: -(r() * 3 + 0.8),
      baseZ: Math.sin(angle) * radius,
      ampX: 0.15 + r() * 0.25,
      ampY: 0.1 + r() * 0.2,
      ampZ: 0.15 + r() * 0.25,
      speed: 0.1 + r() * 0.2,
      phase: r() * Math.PI * 2,
      size: 0.45 + r() * 0.55,
    });
  }
  return list;
}

export function UndersideMist() {
  const meshRef = useRef();
  const puffs = useMemo(buildPuffs, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    puffs.forEach((p, i) => {
      const x = p.baseX + Math.sin(t * p.speed + p.phase) * p.ampX;
      const y = p.baseY + Math.cos(t * p.speed * 0.7 + p.phase) * p.ampY;
      const z = p.baseZ + Math.sin(t * p.speed * 0.9 + p.phase * 1.3) * p.ampZ;
      dummy.position.set(x, y, z);
      const breath = p.size * (1 + Math.sin(t * 0.3 + p.phase) * 0.08);
      dummy.scale.setScalar(breath);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshLambertMaterial
        color="#E8DEEF"
        emissive="#D8C8E5"
        emissiveIntensity={0.2}
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
