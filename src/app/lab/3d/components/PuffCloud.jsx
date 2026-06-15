'use client';

import { Clouds, Cloud } from '@react-three/drei';
import { SUN_DIR } from './SkyDome';

const SUN_POS = [SUN_DIR.x * 40, SUN_DIR.y * 40, SUN_DIR.z * 40];

export function PuffCloud({ position = [0, 0, 0], selfLit = true, opacity = 1.0 }) {
  return (
    <group position={position}>
      {selfLit && (
        <>
          <directionalLight position={SUN_POS} intensity={1.4} color="#FFE8CC" />
          <hemisphereLight args={['#EEF0FF', '#9098C8', 0.7]} />
        </>
      )}

      <Clouds frustumCulled={false}>
        <Cloud
          seed={42}
          position={[0, 0.2, 0]}
          segments={20}
          bounds={[1.6, 0.8, 1.2]}
          volume={3}
          smallestVolume={0.3}
          growth={4}
          speed={0.12}
          fade={10}
          opacity={0.75 * opacity}
          color="#FFFAF6"
          concentrate="inside"
        />
        <Cloud
          seed={17}
          position={[0, 0.7, 0]}
          segments={10}
          bounds={[1.0, 0.5, 0.8]}
          volume={1.5}
          smallestVolume={0.2}
          growth={3}
          speed={0.08}
          fade={8}
          opacity={0.55 * opacity}
          color="#FFFFFF"
          concentrate="outside"
        />
      </Clouds>
    </group>
  );
}
