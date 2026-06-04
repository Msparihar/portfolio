'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import glassShimmerGlsl from '@/shaders/glassShimmer.js';

const VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

function ShimmerPlane() {
  const meshRef = useRef(null);
  const { size } = useThree();

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: glassShimmerGlsl,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(size.width, size.height) },
        u_color: { value: new THREE.Color('#ffffff') },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
  }, [size.width, size.height]);

  useEffect(() => {
    material.uniforms.u_resolution.value.set(size.width, size.height);
  }, [size.width, size.height, material]);

  useFrame(({ clock }) => {
    material.uniforms.u_time.value = clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function GlassShimmerOverlay({ style }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.85,
        mixBlendMode: 'screen',
        ...style,
      }}
    >
      <Canvas
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        camera={{ near: 0.1, far: 10 }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1]}
      >
        <ShimmerPlane />
      </Canvas>
    </div>
  );
}
