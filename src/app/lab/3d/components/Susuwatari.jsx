'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

function seedRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Small black soot sprites — fuzzy black spheres with two tiny white eyes.
// They scuttle around in tight patches near the cherry trees.
function Sprite({ home, phase, speed, scale }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + phase;
    // tight wandering pattern near home
    const wanderX = Math.sin(t * speed) * 0.35;
    const wanderZ = Math.cos(t * speed * 0.8 + phase) * 0.3;
    // tiny hop
    const hop = Math.abs(Math.sin(t * speed * 3)) * 0.12;
    ref.current.position.set(home[0] + wanderX, home[1] + hop, home[2] + wanderZ);
    // body wobble
    ref.current.rotation.y = Math.sin(t * speed * 2) * 0.4;
    ref.current.rotation.z = Math.cos(t * speed * 1.5) * 0.15;
  });

  return (
    <group ref={ref} scale={[scale, scale, scale]}>
      {/* Azure flame wisp surrounding the dark body */}
      <mesh scale={[1.7, 2.0, 1.7]} position={[0, 0.04, 0]}>
        <sphereGeometry args={[0.13, 12, 14]} />
        <meshBasicMaterial
          color="#5AB8FF"
          transparent
          opacity={0.28}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Inner brighter flame */}
      <mesh scale={[1.25, 1.4, 1.25]} position={[0, 0.04, 0]}>
        <sphereGeometry args={[0.13, 12, 14]} />
        <meshBasicMaterial
          color="#A0DDFF"
          transparent
          opacity={0.32}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Fuzzy body — dark core inside the flame */}
      <mesh castShadow>
        <icosahedronGeometry args={[0.13, 0]} />
        <meshLambertMaterial color="#1a1a1a" flatShading />
      </mesh>
      {/* Eyes — glowing white */}
      <mesh position={[0.05, 0.04, 0.11]}>
        <sphereGeometry args={[0.025, 6, 5]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.05, 0.04, 0.11]}>
        <sphereGeometry args={[0.025, 6, 5]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      {/* Pupils */}
      <mesh position={[0.055, 0.04, 0.13]}>
        <sphereGeometry args={[0.012, 5, 4]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.055, 0.04, 0.13]}>
        <sphereGeometry args={[0.012, 5, 4]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      {/* Soft point glow on surroundings */}
      <pointLight color="#7AC8FF" intensity={0.2} distance={0.9} decay={2} />
    </group>
  );
}

const r = seedRand(91);

// Three clusters of 3 sprites each, near cherry tree bases
const HOMES = [
  // Near cherry tree 1 (-1.0, _, 1.4)
  { home: [-1.0, 0.55, 1.4], phase: 0, speed: 1.0, scale: 0.9 },
  { home: [-0.8, 0.55, 1.6], phase: 1.2, speed: 1.1, scale: 0.75 },
  { home: [-1.2, 0.55, 1.2], phase: 2.4, speed: 0.95, scale: 0.85 },
  // Near cherry tree 2 (1.6, _, -0.4)
  { home: [1.6, 0.55, -0.4], phase: 0.5, speed: 1.05, scale: 0.85 },
  { home: [1.4, 0.55, -0.2], phase: 1.7, speed: 0.9, scale: 0.7 },
  { home: [1.8, 0.55, -0.6], phase: 2.9, speed: 1.15, scale: 0.95 },
  // Near cherry tree 3 (-1.9, _, -1.2)
  { home: [-1.9, 0.55, -1.2], phase: 0.8, speed: 1.0, scale: 0.9 },
  { home: [-2.1, 0.55, -1.0], phase: 2.0, speed: 1.05, scale: 0.75 },
];

export function Susuwatari() {
  return (
    <group>
      {HOMES.map((s, i) => <Sprite key={i} {...s} />)}
    </group>
  );
}
