'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function CloudPuff({ offset = [0, 0, 0], radius = 0.5 }) {
  return (
    <mesh position={offset}>
      <sphereGeometry args={[radius, 7, 5]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.75} />
    </mesh>
  );
}

function Cloud({ initialX, initialY, initialZ, speed, puffs }) {
  const ref = useRef();
  const time = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    time.current += delta * speed;
    if (ref.current) {
      ref.current.position.x = initialX + Math.sin(time.current * 0.3) * 2;
      ref.current.position.z = initialZ + Math.cos(time.current * 0.2) * 1.5;
    }
  });

  return (
    <group ref={ref} position={[initialX, initialY, initialZ]}>
      {puffs.map((p, i) => (
        <CloudPuff key={i} offset={p.offset} radius={p.radius} />
      ))}
    </group>
  );
}

const CLOUD_CONFIGS = [
  {
    initialX: 4,
    initialY: 3.5,
    initialZ: 2,
    speed: 0.18,
    puffs: [
      { offset: [0, 0, 0], radius: 0.65 },
      { offset: [0.8, -0.1, 0], radius: 0.5 },
      { offset: [-0.7, -0.1, 0.1], radius: 0.45 },
    ],
  },
  {
    initialX: -5,
    initialY: 4,
    initialZ: -1,
    speed: 0.12,
    puffs: [
      { offset: [0, 0, 0], radius: 0.7 },
      { offset: [0.9, -0.15, 0], radius: 0.55 },
      { offset: [-0.85, -0.1, 0], radius: 0.5 },
      { offset: [0.1, 0.2, 0], radius: 0.4 },
    ],
  },
  {
    initialX: 1,
    initialY: 4.5,
    initialZ: -4,
    speed: 0.22,
    puffs: [
      { offset: [0, 0, 0], radius: 0.55 },
      { offset: [0.7, -0.05, 0], radius: 0.45 },
    ],
  },
  {
    initialX: -3,
    initialY: 3.2,
    initialZ: 3.5,
    speed: 0.15,
    puffs: [
      { offset: [0, 0, 0], radius: 0.6 },
      { offset: [0.75, -0.1, 0.1], radius: 0.48 },
      { offset: [-0.6, -0.05, 0], radius: 0.42 },
    ],
  },
];

export function Clouds() {
  return (
    <>
      {CLOUD_CONFIGS.map((cfg, i) => (
        <Cloud key={i} {...cfg} />
      ))}
    </>
  );
}
