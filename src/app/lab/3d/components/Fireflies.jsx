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

const COUNT = 45;

function buildFlies() {
  const r = seedRand(99);
  const list = [];
  for (let i = 0; i < COUNT; i++) {
    list.push({
      baseX: (r() - 0.5) * 6,
      baseY: 0.7 + r() * 2.5,
      baseZ: (r() - 0.5) * 6,
      ampX: 0.4 + r() * 0.8,
      ampY: 0.2 + r() * 0.6,
      ampZ: 0.4 + r() * 0.8,
      speedX: 0.3 + r() * 0.6,
      speedY: 0.5 + r() * 0.8,
      speedZ: 0.25 + r() * 0.55,
      phase: r() * Math.PI * 2,
      pulse: 0.4 + r() * 0.7,
      size: 0.025 + r() * 0.02,
    });
  }
  return list;
}

export function Fireflies() {
  const meshRef = useRef();
  const flies = useMemo(buildFlies, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    flies.forEach((f, i) => {
      const x = f.baseX + Math.sin(t * f.speedX + f.phase) * f.ampX;
      const y = f.baseY + Math.sin(t * f.speedY + f.phase * 1.3) * f.ampY;
      const z = f.baseZ + Math.cos(t * f.speedZ + f.phase) * f.ampZ;
      // pulsing scale (twinkle)
      const pulse = f.size * (1 + Math.sin(t * f.pulse * 3 + f.phase) * 0.4);
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
      <sphereGeometry args={[1, 6, 5]} />
      <meshBasicMaterial
        color="#FFEC8A"
        transparent
        opacity={0.95}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
