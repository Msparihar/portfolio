'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function Island() {
  const ref = useRef();

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={ref}>
      {/* Island base */}
      <mesh
        position={[0, 0, 0]}
        receiveShadow
        castShadow
      >
        <cylinderGeometry args={[3, 2.5, 0.5, 8]} />
        <meshLambertMaterial color="#7BA85A" />
      </mesh>
      {/* Slightly darker underside lip */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[2.5, 2.2, 0.2, 8]} />
        <meshLambertMaterial color="#5C7A3A" />
      </mesh>
    </group>
  );
}
