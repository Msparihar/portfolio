'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWind } from './WindContext';

// Hanging wind chime — a bell with dangling clapper, swaying with global wind.
export function WindChime({ position = [-1.0, 2.0, 1.2] }) {
  const wholeRef = useRef();
  const clapperRef = useRef();
  const wind = useWind();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const w = wind?.current;
    const s = w?.strength ?? 0;
    if (wholeRef.current) {
      wholeRef.current.rotation.z = (Math.sin(t * 1.3) * 0.06) + s * 0.15 * (w?.dirX ?? 0);
      wholeRef.current.rotation.x = s * 0.1 * (w?.dirZ ?? 0);
    }
    if (clapperRef.current) {
      // clapper swings differently — slightly faster
      clapperRef.current.rotation.z = (Math.sin(t * 2.1 + 0.4) * 0.18) + s * 0.25 * (w?.dirX ?? 0);
    }
  });

  return (
    <group position={position}>
      {/* String to branch */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.36, 4]} />
        <meshBasicMaterial color="#222" />
      </mesh>
      {/* Bell — swings together with clapper */}
      <group ref={wholeRef}>
        {/* Bell body */}
        <mesh castShadow>
          <coneGeometry args={[0.08, 0.16, 14]} />
          <meshStandardMaterial color="#C7A35E" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Bell rim */}
        <mesh position={[0, -0.08, 0]}>
          <torusGeometry args={[0.078, 0.012, 8, 20]} />
          <meshStandardMaterial color="#A8853E" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Tassel string */}
        <mesh ref={clapperRef} position={[0, -0.13, 0]}>
          <cylinderGeometry args={[0.0025, 0.0025, 0.16, 4]} />
          <meshBasicMaterial color="#5C3F23" />
          {/* Paper tag at the bottom */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.04, 0.06, 0.005]} />
            <meshLambertMaterial color="#FFFAF0" />
          </mesh>
        </mesh>
      </group>
    </group>
  );
}
