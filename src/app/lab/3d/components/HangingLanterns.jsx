'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWind } from './WindContext';

function Lantern({ position, swayPhase }) {
  const ref = useRef();
  const wind = useWind();
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + swayPhase;
      const w = wind?.current;
      const s = w?.strength ?? 0;
      const windSway = s * 0.18 * (w?.dirX ?? 0);
      const windSwayX = s * 0.18 * (w?.dirZ ?? 0);
      ref.current.rotation.z = Math.sin(t * 1.2) * 0.1 + windSway;
      ref.current.rotation.x = windSwayX;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* String */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.4, 4]} />
        <meshBasicMaterial color="#222" />
      </mesh>
      {/* Lantern body — bigger and more saturated, with strong emissive */}
      <mesh position={[0, -0.07, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.26, 16]} />
        <meshStandardMaterial
          color="#E0331F"
          emissive="#FF7050"
          emissiveIntensity={1.4}
        />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.15, 0.12, 0.05, 16]} />
        <meshLambertMaterial color="#2C1810" />
      </mesh>
      {/* Bottom cap */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.05, 16]} />
        <meshLambertMaterial color="#2C1810" />
      </mesh>
      {/* Tassel */}
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.01, 0.015, 0.08, 6]} />
        <meshLambertMaterial color="#FFD060" />
      </mesh>
    </group>
  );
}

// Hung near each cherry tree
const LANTERNS = [
  { position: [-1.0, 1.85, 1.4], swayPhase: 0 },
  { position: [-1.25, 1.6, 1.05], swayPhase: 1 },
  { position: [-0.75, 1.55, 1.65], swayPhase: 2 },
  { position: [1.6, 1.8, -0.4], swayPhase: 0.6 },
  { position: [1.85, 1.55, -0.15], swayPhase: 1.7 },
  { position: [1.35, 1.5, -0.65], swayPhase: 2.4 },
  { position: [-1.9, 1.9, -1.2], swayPhase: 0.9 },
  { position: [-2.15, 1.6, -1.4], swayPhase: 2.1 },
  { position: [0.6, 1.7, 2.0], swayPhase: 3.4 },
  { position: [0.85, 1.5, 2.15], swayPhase: 4.1 },
];

export function HangingLanterns() {
  return (
    <group>
      {LANTERNS.map((l, i) => <Lantern key={i} {...l} />)}
    </group>
  );
}
