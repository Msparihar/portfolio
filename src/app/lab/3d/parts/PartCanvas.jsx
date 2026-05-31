'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { WindProvider } from '../components/WindContext';

// Standalone Canvas for rendering one component in isolation.
// Used both by the hover tile preview and the fullscreen modal.
export function PartCanvas({ part, controls = true, autoRotate = false, dpr = [1, 1.5], shadows = false }) {
  const {
    render,
    cameraPos = [3, 2, 3.5],
    targetY = 0.6,
    showGround = true,
  } = part;

  return (
    <Canvas
      dpr={dpr}
      shadows={shadows}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
    >
      <color attach="background" args={['#E8C8B0']} />
      <fog attach="fog" args={['#E8C8B0', 8, 30]} />

      <PerspectiveCamera makeDefault position={cameraPos} fov={42} />
      {controls && (
        <OrbitControls
          enablePan={false}
          minDistance={1.2}
          maxDistance={20}
          minPolarAngle={0.05}
          maxPolarAngle={Math.PI - 0.05}
          target={[0, targetY, 0]}
          autoRotate={autoRotate}
          autoRotateSpeed={0.6}
        />
      )}

      <ambientLight intensity={0.5} color="#FFE9CF" />
      <hemisphereLight args={['#FFE6D0', '#7BA85A', 0.4]} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} color="#FFD9A8" />
      <directionalLight position={[-3, -2, -3]} intensity={0.18} color="#A8C8FF" />

      {showGround && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[6, 32]} />
          <meshLambertMaterial color="#7FA85A" />
        </mesh>
      )}

      <Suspense fallback={null}>
        <WindProvider>{render()}</WindProvider>
      </Suspense>
    </Canvas>
  );
}
