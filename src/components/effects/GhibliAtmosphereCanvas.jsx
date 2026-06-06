'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import godraysGlsl from '@/shaders/godrays.js';
import mistGlsl from '@/shaders/mist.js';
import wispsGlsl from '@/shaders/wisps.js';

const VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const COLOR_DEFAULTS = {
  godrays: '#fff0c0',
  mist: '#e8f0e0',
  wisps_top: '#eaf7ff',
  wisps_bottom: '#8fd0ff',
};

function AtmospherePlane({ fragmentShader, renderOrder, colorKey }) {
  const meshRef = useRef(null);
  const { size } = useThree();

  const material = useMemo(() => {
    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    };

    if (fragmentShader.includes('u_color_top')) {
      uniforms.u_color_top = { value: new THREE.Color(COLOR_DEFAULTS.wisps_top) };
      uniforms.u_color_bottom = { value: new THREE.Color(COLOR_DEFAULTS.wisps_bottom) };
    } else if (fragmentShader.includes('u_color')) {
      uniforms.u_color = { value: new THREE.Color(COLOR_DEFAULTS[colorKey] ?? '#ffffff') };
    }

    return new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
  }, [fragmentShader, size.width, size.height, colorKey]);

  useEffect(() => {
    material.uniforms.u_resolution.value.set(size.width, size.height);
  }, [size.width, size.height, material]);

  useFrame(({ clock }) => {
    material.uniforms.u_time.value = clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef} renderOrder={renderOrder}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function GhibliAtmosphereCanvas({ godRaysOnlyMode = true }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 8,
      }}
    >
      <Canvas
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        camera={{ near: 0.1, far: 10 }}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        dpr={[1, 1]}
        events={false}
      >
        <AtmospherePlane fragmentShader={godraysGlsl} renderOrder={0} colorKey="godrays" />
        {!godRaysOnlyMode && (
          <AtmospherePlane fragmentShader={mistGlsl} renderOrder={1} colorKey="mist" />
        )}
        {!godRaysOnlyMode && (
          <AtmospherePlane fragmentShader={wispsGlsl} renderOrder={2} colorKey="wisps_top" />
        )}
      </Canvas>
    </div>
  );
}
