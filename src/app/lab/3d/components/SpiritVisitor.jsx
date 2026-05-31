'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// A small humanoid spirit visitor — red kimono / dress.
// Stands near the cottage looking out across the scene.
export function SpiritVisitor({ position = [-1.0, 0.5, -0.3], rotationY = 0.4 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      // gentle breathing / sway
      ref.current.rotation.y = rotationY + Math.sin(t * 0.5) * 0.06;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Body — red kimono (cone shape, wide at bottom) */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <coneGeometry args={[0.09, 0.32, 8]} />
        <meshLambertMaterial color="#C73A3A" />
      </mesh>
      {/* Belt — yellow obi */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.03, 8]} />
        <meshLambertMaterial color="#E8C040" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.055, 10, 8]} />
        <meshLambertMaterial color="#F0D8B5" />
      </mesh>
      {/* Hair — dark cap */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.057, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshLambertMaterial color="#2A2018" />
      </mesh>
      {/* Hair bow / accessory */}
      <mesh position={[0, 0.46, 0.04]} castShadow>
        <boxGeometry args={[0.04, 0.015, 0.02]} />
        <meshLambertMaterial color="#E8C040" />
      </mesh>
      {/* Arms hint — two tiny side bumps */}
      <mesh position={[-0.07, 0.24, 0]}>
        <sphereGeometry args={[0.02, 6, 5]} />
        <meshLambertMaterial color="#F0D8B5" />
      </mesh>
      <mesh position={[0.07, 0.24, 0]}>
        <sphereGeometry args={[0.02, 6, 5]} />
        <meshLambertMaterial color="#F0D8B5" />
      </mesh>
    </group>
  );
}
