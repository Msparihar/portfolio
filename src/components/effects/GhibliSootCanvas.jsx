'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
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

const INTERACTIVE_CHROME = '[data-kitsune-platform], [data-kitsune-dock], .window-panel';

export default function GhibliSootCanvas() {
  const puffIdRef = useRef(0);

  const spawnPuff = useCallback((x, y) => {
    const el = document.createElement('div');
    const id = ++puffIdRef.current;
    el.dataset.sootPuff = id;
    Object.assign(el.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(40,30,20,0.55) 0%, rgba(40,30,20,0) 70%)',
      transform: 'translate(-50%, -50%) scale(0.4)',
      opacity: '1',
      pointerEvents: 'none',
      zIndex: '9999',
      transition: 'transform 400ms ease-out, opacity 400ms ease-out',
    });
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = 'translate(-50%, -50%) scale(2.2)';
      el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), 420);
    window.dispatchEvent(new CustomEvent('soot-caught'));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handler = (e) => {
      if (mq.matches) return;
      if (e.target.closest(INTERACTIVE_CHROME)) return;
      spawnPuff(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handler);
    return () => window.removeEventListener('pointerdown', handler);
  }, [spawnPuff]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 'var(--sg-z-soot, 15)',
      }}
    >
      <Canvas
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        camera={{ near: 0.1, far: 10 }}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        dpr={[1, 1]}
        events={false}
      >
        <SootPlane />
      </Canvas>
    </div>
  );
}
