'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Distant V-formation of birds flying past the island
function Bird({ offset, phase }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.15 + phase;
    // Big slow loop across the sky
    const x = Math.cos(t) * 22 + offset[0];
    const z = Math.sin(t) * 14 + offset[2];
    const y = 6 + Math.sin(t * 2) * 0.3 + offset[1];
    ref.current.position.set(x, y, z);
    ref.current.rotation.y = -t + Math.PI / 2;
    // wing flap (subtle via z-rotation)
    const flap = Math.sin(state.clock.elapsedTime * 8 + phase * 5) * 0.4;
    if (ref.current.children[0]) ref.current.children[0].rotation.z = flap;
    if (ref.current.children[1]) ref.current.children[1].rotation.z = -flap;
  });

  return (
    <group ref={ref}>
      {/* Left wing */}
      <mesh position={[-0.18, 0, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.34, 0.02, 0.12]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      {/* Right wing */}
      <mesh position={[0.18, 0, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.34, 0.02, 0.12]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.05, 0.18]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

const FLOCK = [
  { offset: [0, 0, 0], phase: 0 },
  { offset: [0.5, 0.2, -0.5], phase: 0.18 },
  { offset: [-0.5, 0.2, -0.5], phase: 0.18 },
  { offset: [1.0, 0.4, -1.0], phase: 0.32 },
  { offset: [-1.0, 0.4, -1.0], phase: 0.32 },
];

export function Birds() {
  return (
    <group>
      {FLOCK.map((b, i) => <Bird key={i} {...b} />)}
    </group>
  );
}
