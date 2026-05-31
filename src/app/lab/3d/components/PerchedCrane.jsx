'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// A small white crane perched on the torii top beam.
// Occasional head turn and idle pose.
export function PerchedCrane({ position = [2.0, 2.45, 0.5], rotationY = -0.6 }) {
  const headRef = useRef();

  useFrame((state) => {
    if (headRef.current) {
      const t = state.clock.elapsedTime;
      // occasional head turn — slow sine
      headRef.current.rotation.y = Math.sin(t * 0.3) * 0.5;
      headRef.current.rotation.z = Math.sin(t * 0.4 + 1.2) * 0.08;
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Body (elongated ellipsoid) */}
      <mesh scale={[0.08, 0.06, 0.18]} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        <meshLambertMaterial color="#F5F2EA" />
      </mesh>
      {/* Long neck arching up */}
      <mesh position={[0, 0.08, 0.06]} rotation={[-0.4, 0, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.016, 0.16, 6]} />
        <meshLambertMaterial color="#F5F2EA" />
      </mesh>
      {/* Head — turnable */}
      <group ref={headRef} position={[0, 0.14, 0.13]}>
        <mesh castShadow>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshLambertMaterial color="#F5F2EA" />
        </mesh>
        {/* Red crest */}
        <mesh position={[0, 0.018, 0]}>
          <sphereGeometry args={[0.012, 6, 5]} />
          <meshLambertMaterial color="#D63A2E" />
        </mesh>
        {/* Beak */}
        <mesh position={[0, -0.005, 0.025]} rotation={[Math.PI / 2.5, 0, 0]}>
          <coneGeometry args={[0.005, 0.04, 4]} />
          <meshLambertMaterial color="#3A2818" />
        </mesh>
        {/* Eye */}
        <mesh position={[0.012, 0, 0.018]}>
          <sphereGeometry args={[0.005, 5, 4]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      </group>
      {/* Tail feathers (dark accent) */}
      <mesh position={[0, 0.0, -0.16]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.05, 0.1, 5]} />
        <meshLambertMaterial color="#2A2A2A" />
      </mesh>
      {/* Legs (tiny) */}
      <mesh position={[0.03, -0.06, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.08, 4]} />
        <meshLambertMaterial color="#3A2818" />
      </mesh>
      <mesh position={[-0.03, -0.06, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.08, 4]} />
        <meshLambertMaterial color="#3A2818" />
      </mesh>
    </group>
  );
}
