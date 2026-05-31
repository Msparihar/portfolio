'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function CloudPuff({ position, scale }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshLambertMaterial
        color="#FFFFFF"
        emissive="#FFFFFF"
        emissiveIntensity={0.35}
        transparent
        opacity={0.90}
      />
    </mesh>
  );
}

function Cloud({ initialX, initialY, initialZ, speed, puffs }) {
  const ref = useRef();
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    t.current += delta * speed;
    if (ref.current) {
      ref.current.position.x = initialX + Math.sin(t.current * 0.25) * 2.5;
      ref.current.position.z = initialZ + Math.cos(t.current * 0.18) * 1.8;
    }
  });

  return (
    <group ref={ref} position={[initialX, initialY, initialZ]}>
      {puffs.map((p, i) => (
        <CloudPuff key={i} position={p.position} scale={p.scale} />
      ))}
    </group>
  );
}

const CLOUD_CONFIGS = [
  {
    initialX: 6, initialY: 4.0, initialZ: 2, speed: 0.12,
    puffs: [
      { position: [0, 0, 0], scale: [1.1, 0.65, 1.0] },
      { position: [1.2, -0.05, 0.2], scale: [0.85, 0.5, 0.8] },
      { position: [-1.1, -0.05, 0.1], scale: [0.8, 0.48, 0.72] },
      { position: [0.4, 0.2, -0.2], scale: [0.65, 0.42, 0.6] },
      { position: [-0.5, 0.15, 0.3], scale: [0.55, 0.38, 0.5] },
    ],
  },
  {
    initialX: -6.5, initialY: 4.8, initialZ: -1.5, speed: 0.09,
    puffs: [
      { position: [0, 0, 0], scale: [1.2, 0.7, 1.05] },
      { position: [1.3, -0.05, 0], scale: [0.95, 0.55, 0.85] },
      { position: [-1.2, -0.1, 0.15], scale: [0.88, 0.5, 0.78] },
      { position: [-0.3, 0.25, -0.2], scale: [0.65, 0.42, 0.58] },
      { position: [0.6, 0.18, 0.3], scale: [0.58, 0.38, 0.52] },
    ],
  },
  {
    initialX: 1, initialY: 5.5, initialZ: -6, speed: 0.18,
    puffs: [
      { position: [0, 0, 0], scale: [0.8, 0.5, 0.75] },
      { position: [0.95, -0.05, 0], scale: [0.62, 0.42, 0.56] },
      { position: [-0.8, 0, 0.1], scale: [0.58, 0.38, 0.52] },
    ],
  },
  {
    initialX: -4, initialY: 3.5, initialZ: 4.5, speed: 0.11,
    puffs: [
      { position: [0, 0, 0], scale: [1.0, 0.58, 0.9] },
      { position: [1.1, -0.05, 0.1], scale: [0.75, 0.45, 0.68] },
      { position: [-0.9, -0.05, 0], scale: [0.7, 0.42, 0.62] },
      { position: [0.1, 0.22, -0.18], scale: [0.52, 0.36, 0.46] },
    ],
  },
  {
    initialX: 9, initialY: 6, initialZ: -3.5, speed: 0.07,
    puffs: [
      { position: [0, 0, 0], scale: [1.3, 0.72, 1.12] },
      { position: [1.4, -0.05, 0], scale: [1.0, 0.58, 0.88] },
      { position: [-1.3, -0.1, 0.15], scale: [0.92, 0.54, 0.8] },
      { position: [0.3, 0.28, 0.2], scale: [0.7, 0.44, 0.62] },
    ],
  },
];

export function Clouds() {
  return (
    <>
      {CLOUD_CONFIGS.map((cfg, i) => <Cloud key={i} {...cfg} />)}
    </>
  );
}
