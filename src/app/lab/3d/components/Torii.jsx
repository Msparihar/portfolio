'use client';

import { useGLTF } from '@react-three/drei';

const URL = '/models/ghibli/polypizza/torii_inari.glb';

export function Torii({ position = [2.1, 0.5, 0.6], rotationY = -0.6, scale = 3.5 }) {
  const { scene } = useGLTF(URL);
  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
    />
  );
}

useGLTF.preload(URL);
