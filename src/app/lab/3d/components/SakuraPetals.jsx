'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWind } from './WindContext';

function seedRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PINKS = ['#FFB8D1', '#FFA5BD', '#FFCBDC', '#FF9FB6', '#FFD8E4'];

const COUNT = 60;
const FALL_HEIGHT = 7; // span petals fall through before reset

function buildPetals() {
  const r = seedRand(13);
  const list = [];
  for (let i = 0; i < COUNT; i++) {
    list.push({
      baseX: (r() - 0.5) * 7,
      baseZ: (r() - 0.5) * 7,
      yOffset: r() * FALL_HEIGHT,
      fallSpeed: 0.18 + r() * 0.18,
      driftSpeed: 0.4 + r() * 0.6,
      driftPhase: r() * Math.PI * 2,
      spinSpeed: 0.5 + r() * 1.2,
      color: PINKS[Math.floor(r() * PINKS.length)],
      size: 0.05 + r() * 0.04,
    });
  }
  return list;
}

export function SakuraPetals() {
  const meshRef = useRef();
  const petals = useMemo(buildPetals, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const wind = useWind();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const w = wind?.current;
    const ws = w?.strength ?? 0;
    const wx = (w?.dirX ?? 0) * ws * 0.35;
    const wz = (w?.dirZ ?? 0) * ws * 0.35;
    petals.forEach((p, i) => {
      const y = 5 - ((p.yOffset + t * p.fallSpeed) % FALL_HEIGHT);
      const x = p.baseX + Math.sin(t * p.driftSpeed + p.driftPhase) * 0.5 + wx * (1 - y / 5);
      const z = p.baseZ + Math.cos(t * p.driftSpeed * 0.7 + p.driftPhase) * 0.5 + wz * (1 - y / 5);
      dummy.position.set(x, y, z);
      dummy.rotation.set(t * p.spinSpeed, t * p.spinSpeed * 0.6, t * p.spinSpeed * 0.4);
      dummy.scale.setScalar(p.size);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
      <planeGeometry args={[1, 1]} />
      <meshLambertMaterial
        color="#FFB8D1"
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}
