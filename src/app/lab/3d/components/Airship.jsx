'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

const MODELS = {
  chunky: '/models/ghibli/polypizza/airship_chunky.glb',
  prop: '/models/ghibli/polypizza/airship_prop.glb',
};

export function Airship({
  radius = 14,
  altitude = 7,
  speed = 0.04,
  phase = 0,
  scale = 1,
  variant = 'chunky',
}) {
  const ref = useRef();
  const { scene } = useGLTF(MODELS[variant] || MODELS.chunky);
  const instance = useMemo(() => scene.clone(), [scene]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      const angle = t * speed + phase;
      ref.current.position.x = Math.cos(angle) * radius;
      ref.current.position.z = Math.sin(angle) * radius;
      ref.current.position.y = altitude + Math.sin(t * 0.15 + phase) * 0.4;
      ref.current.rotation.y = -angle + Math.PI / 2;
      ref.current.rotation.x = Math.sin(t * 0.3 + phase) * 0.04;
      ref.current.rotation.z = Math.sin(t * 0.22 + phase) * 0.05;
    }
  });

  return (
    <group ref={ref} scale={scale}>
      <primitive object={instance} />
    </group>
  );
}

Object.values(MODELS).forEach((url) => useGLTF.preload(url));
