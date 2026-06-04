'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import pollenGlsl from '@/shaders/pollen.js';
import sootGlsl from '@/shaders/soot.js';

const VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

function ShaderPlane({ fragmentShader, trackMouse, renderOrder }) {
  const meshRef = useRef(null);
  const { size } = useThree();
  const mouse = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    if (!trackMouse) return;
    const handler = (e) => {
      mouse.current.set(e.clientX, size.height - e.clientY);
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, [trackMouse, size.height]);

  const material = useMemo(() => {
    const hasMouse = fragmentShader.includes('u_mouse');
    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    };
    if (hasMouse) uniforms.u_mouse = { value: new THREE.Vector2(0, 0) };
    if (fragmentShader.includes('u_color_top')) {
      uniforms.u_color_top = { value: new THREE.Color('#fff1c4') };
      uniforms.u_color_bottom = { value: new THREE.Color('#ffb24a') };
    }
    return new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
  }, [fragmentShader, size.width, size.height]);

  useFrame(({ clock }) => {
    material.uniforms.u_time.value = clock.getElapsedTime();
    if (material.uniforms.u_mouse) {
      material.uniforms.u_mouse.value.copy(mouse.current);
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={renderOrder}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function GlslCanvas({ showPollen = true, showSoot = true, zIndex }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: zIndex ?? 'var(--sg-z-shaders, 4)',
      }}
      aria-hidden="true"
    >
      <Canvas
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        camera={{ near: 0.1, far: 10 }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1]}
      >
        {showPollen && (
          <ShaderPlane
            fragmentShader={pollenGlsl}
            trackMouse={false}
            renderOrder={0}
          />
        )}
        {showSoot && (
          <ShaderPlane
            fragmentShader={sootGlsl}
            trackMouse={true}
            renderOrder={1}
          />
        )}
      </Canvas>
    </div>
  );
}
