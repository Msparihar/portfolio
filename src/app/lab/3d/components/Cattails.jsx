'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWind } from './WindContext';

function CattailStem({ position, scale = 1, phase = 0 }) {
  const ref = useRef();
  const wind = useWind();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + phase;
    const w = wind?.current;
    const s = w?.strength ?? 0;
    ref.current.rotation.z = Math.sin(t * 1.8) * 0.05 + s * 0.12 * (w?.dirX ?? 0);
    ref.current.rotation.x = s * 0.08 * (w?.dirZ ?? 0);
  });

  return (
    <group ref={ref} position={position} scale={[scale, scale, scale]}>
      {/* Stem */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.018, 0.7, 5]} />
        <meshLambertMaterial color="#557B3E" />
      </mesh>
      {/* Furry head (cattail spike) */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.038, 0.16, 8]} />
        <meshLambertMaterial color="#6B4A2A" />
      </mesh>
      {/* Tip */}
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.06, 4]} />
        <meshLambertMaterial color="#557B3E" />
      </mesh>
      {/* A blade leaf next to stem */}
      <mesh position={[0.04, 0.4, 0]} rotation={[0, 0, 0.18]}>
        <boxGeometry args={[0.012, 0.55, 0.04]} />
        <meshLambertMaterial color="#5D8042" />
      </mesh>
    </group>
  );
}

// Cluster of cattails at lake edge — lake center is around (-1.5, 0.5, 1.6)
const STEMS = [
  { pos: [-2.45, 0.5, 1.6], scale: 0.85, phase: 0 },
  { pos: [-2.4, 0.5, 1.45], scale: 1.0, phase: 1.2 },
  { pos: [-2.35, 0.5, 1.75], scale: 0.7, phase: 2.5 },
  { pos: [-2.55, 0.5, 1.55], scale: 0.95, phase: 3.7 },
  { pos: [-2.5, 0.5, 1.7], scale: 0.8, phase: 0.6 },
  { pos: [-1.45, 0.5, 2.55], scale: 0.9, phase: 1.5 },
  { pos: [-1.6, 0.5, 2.6], scale: 0.75, phase: 2.8 },
];

export function Cattails() {
  return (
    <group>
      {STEMS.map((s, i) => <CattailStem key={i} {...s} />)}
    </group>
  );
}
