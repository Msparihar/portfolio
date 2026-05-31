'use client';

import { useGLTF } from '@react-three/drei';

const URL = '/models/ghibli/polypizza/stone_lantern.glb';

export function StoneLantern({ position = [-2.3, 0.5, 0.5], scale = 1, rotationY = 0 }) {
  const { scene } = useGLTF(URL);
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[scale * 1.6, scale * 1.6, scale * 1.6]}>
      <primitive object={scene.clone()} />
      <pointLight position={[0, 0.7, 0]} color="#FFC060" intensity={0.7} distance={1.6} decay={2} />
    </group>
  );
}

useGLTF.preload(URL);
