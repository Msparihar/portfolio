'use client';

import { Suspense, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { WindProvider } from '../components/WindContext';

const HORIZON_COLOR = '#F2DCC8';

function SceneBackground() {
  const { scene } = useThree();

  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 2;
    c.height = 256;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0,    '#B0BADC');
    grad.addColorStop(0.45, '#D9C9E2');
    grad.addColorStop(0.78, '#EDD6C4');
    grad.addColorStop(1,    HORIZON_COLOR);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);

  scene.background = texture;
  return null;
}

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
      <SceneBackground />
      <fog attach="fog" args={[HORIZON_COLOR, 8, 30]} />

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
