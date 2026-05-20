'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky } from '@react-three/drei';
import { Island } from './components/Island';
import { Trees } from './components/Trees';
import { Clouds } from './components/Clouds';

// TODO(v0.9): integrate story content here

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows={{ type: 'BasicShadowMap', mapSize: [1024, 1024] }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={50} />

      {/* Controls — orbit only, no pan, no going below the island */}
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.1}
      />

      {/* Sky — warm Ghibli golden hour */}
      <Sky
        sunPosition={[100, 20, 100]}
        turbidity={1.5}
        rayleigh={0.5}
        mieCoefficient={0.003}
        mieDirectionalG={0.85}
      />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        color="#FFE4B5"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Scene objects */}
      <Island />
      <Trees />
      <Clouds />
    </Canvas>
  );
}
