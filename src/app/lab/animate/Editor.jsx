'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { VrmStage } from './three/VrmStage';
import { PlaybackBar } from './ui/PlaybackBar';
import { useAnimateStore } from './store';

export default function Editor() {
  const loadError = useAnimateStore((s) => s.loadError);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%' }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 1.3, 3]} fov={40} />
        <OrbitControls
          target={[0, 1, 0]}
          enablePan={false}
          minDistance={1.0}
          maxDistance={8}
          minPolarAngle={0.05}
          maxPolarAngle={Math.PI - 0.05}
        />

        <ambientLight intensity={0.6} color="#fff5e8" />
        <directionalLight position={[3, 6, 4]} intensity={1.4} color="#ffe8d0" />
        <directionalLight position={[-2, 2, -3]} intensity={0.25} color="#c8d8ff" />

        <Suspense fallback={null}>
          <VrmStage />
        </Suspense>
      </Canvas>

      {loadError ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            pointerEvents: 'none',
          }}
        >
          Couldn’t load the character. {loadError}
        </div>
      ) : (
        <PlaybackBar />
      )}
    </div>
  );
}
