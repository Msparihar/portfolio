'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function PoleLantern({ position, swayPhase = 0 }) {
  const lanternRef = useRef();

  useFrame((state) => {
    if (lanternRef.current) {
      const t = state.clock.elapsedTime + swayPhase;
      lanternRef.current.rotation.z = Math.sin(t * 0.9) * 0.06;
    }
  });

  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 1.1, 8]} />
        <meshLambertMaterial color="#3A2A1C" />
      </mesh>
      {/* Cross-arm */}
      <mesh position={[0.12, 1.0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.22, 6]} />
        <meshLambertMaterial color="#3A2A1C" />
      </mesh>
      {/* Hanging string */}
      <mesh position={[0.22, 0.88, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.18, 4]} />
        <meshBasicMaterial color="#222" />
      </mesh>
      {/* Lantern body — swaying */}
      <group ref={lanternRef} position={[0.22, 0.7, 0]}>
        {/* Cylindrical paper body, glowing */}
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.22, 14]} />
          <meshStandardMaterial
            color="#F4D38C"
            emissive="#FFB050"
            emissiveIntensity={1.6}
          />
        </mesh>
        {/* Top cap */}
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.095, 0.08, 0.04, 14]} />
          <meshLambertMaterial color="#2C1810" />
        </mesh>
        {/* Bottom cap */}
        <mesh position={[0, -0.13, 0]}>
          <cylinderGeometry args={[0.08, 0.095, 0.04, 14]} />
          <meshLambertMaterial color="#2C1810" />
        </mesh>
      </group>
      {/* Inner glow */}
      <pointLight
        position={[0.22, 0.7, 0]}
        color="#FFB050"
        intensity={0.6}
        distance={1.8}
        decay={2}
      />
    </group>
  );
}

export function PoleLanterns() {
  return (
    <group>
      <PoleLantern position={[-2.2, 0.5, -1.4]} swayPhase={0} />
      <PoleLantern position={[2.3, 0.5, 1.4]} swayPhase={1.8} />
    </group>
  );
}
