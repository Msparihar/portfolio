'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import sootGlsl from '@/shaders/soot.js';

const VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

function SootPlane() {
  const meshRef = useRef(null);
  const { size } = useThree();
  const mouse = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handler = (e) => {
      mouse.current.set(e.clientX, size.height - e.clientY);
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, [size.height]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: sootGlsl,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(size.width, size.height) },
        u_mouse: { value: new THREE.Vector2(0, 0) },
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
    material.uniforms.u_mouse.value.copy(mouse.current);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function GhibliSootCanvas() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 250,
      }}
    >
      <Canvas
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        camera={{ near: 0.1, far: 10 }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1]}
      >
        <SootPlane />
      </Canvas>
    </div>
  );
}
