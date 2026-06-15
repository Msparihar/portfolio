'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function seedRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const vertexShader = /* glsl */`
  uniform float uTime;
  attribute float aPhase;
  attribute float aSpeedX;
  attribute float aSpeedY;
  attribute float aSpeedZ;
  attribute float aAmpX;
  attribute float aAmpY;
  attribute float aAmpZ;
  attribute float aSize;
  attribute float aPulseSpeed;
  attribute vec3 aBasePos;

  varying float vAlpha;

  void main() {
    float px = aBasePos.x + sin(uTime * aSpeedX + aPhase) * aAmpX;
    float py = aBasePos.y + sin(uTime * aSpeedY + aPhase * 1.37) * aAmpY;
    float pz = aBasePos.z + cos(uTime * aSpeedZ + aPhase) * aAmpZ;

    float pulse = 0.5 + 0.5 * sin(uTime * aPulseSpeed + aPhase * 2.71);
    pulse = pulse * pulse;
    vAlpha = pulse;

    vec4 mvPos = modelViewMatrix * vec4(px, py, pz, 1.0);
    gl_PointSize = aSize * (220.0 / -mvPos.z) * (0.60 + 0.40 * pulse);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragmentShader = /* glsl */`
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 coord = gl_PointCoord - 0.5;
    float dist = length(coord);
    if (dist > 0.5) discard;

    float core = 1.0 - smoothstep(0.0, 0.10, dist);
    float halo = 1.0 - smoothstep(0.08, 0.42, dist);
    halo = halo * halo * halo;

    vec3 coreColor = min(uColor + vec3(0.02, 0.02, 0.03), vec3(0.82));
    vec3 haloColor = uColor * 0.55;

    vec3 col = mix(haloColor, coreColor, core);
    float alpha = (core * 0.50 + halo * 0.22) * vAlpha;

    gl_FragColor = vec4(col, alpha);
  }
`;

const DEFAULT_COLOR = new THREE.Color('#FFE6A0');

export function FireflySwarm({ count = 90, radius = 3.0, height = 2.0, color }) {
  const timeUniform = useRef({ value: 0 });
  const colorUniform = useRef({ value: color ? new THREE.Color(color) : DEFAULT_COLOR });

  const { geometry, material } = useMemo(() => {
    const r = seedRand(7331);
    const n = Math.max(1, Math.min(count, 300));

    const basePos   = new Float32Array(n * 3);
    const phase     = new Float32Array(n);
    const speedX    = new Float32Array(n);
    const speedY    = new Float32Array(n);
    const speedZ    = new Float32Array(n);
    const ampX      = new Float32Array(n);
    const ampY      = new Float32Array(n);
    const ampZ      = new Float32Array(n);
    const size      = new Float32Array(n);
    const pulseSpeed = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      const angle = r() * Math.PI * 2;
      const rad   = Math.sqrt(r()) * radius;
      basePos[i * 3 + 0] = Math.cos(angle) * rad;
      basePos[i * 3 + 1] = (r() - 0.3) * height;
      basePos[i * 3 + 2] = Math.sin(angle) * rad;

      phase[i]      = r() * Math.PI * 2;
      speedX[i]     = 0.25 + r() * 0.45;
      speedY[i]     = 0.35 + r() * 0.55;
      speedZ[i]     = 0.20 + r() * 0.40;
      ampX[i]       = 0.30 + r() * 0.70;
      ampY[i]       = 0.15 + r() * 0.45;
      ampZ[i]       = 0.30 + r() * 0.70;
      size[i]       = 3.5 + r() * 4.5;
      pulseSpeed[i] = 1.2 + r() * 2.4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',  new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('aBasePos',  new THREE.BufferAttribute(basePos, 3));
    geo.setAttribute('aPhase',    new THREE.BufferAttribute(phase, 1));
    geo.setAttribute('aSpeedX',   new THREE.BufferAttribute(speedX, 1));
    geo.setAttribute('aSpeedY',   new THREE.BufferAttribute(speedY, 1));
    geo.setAttribute('aSpeedZ',   new THREE.BufferAttribute(speedZ, 1));
    geo.setAttribute('aAmpX',     new THREE.BufferAttribute(ampX, 1));
    geo.setAttribute('aAmpY',     new THREE.BufferAttribute(ampY, 1));
    geo.setAttribute('aAmpZ',     new THREE.BufferAttribute(ampZ, 1));
    geo.setAttribute('aSize',     new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aPulseSpeed', new THREE.BufferAttribute(pulseSpeed, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { uTime: timeUniform.current, uColor: colorUniform.current },
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    return { geometry: geo, material: mat };
  }, [count, radius, height]);

  useFrame(({ clock }) => {
    timeUniform.current.value = clock.elapsedTime;
  });

  return <points geometry={geometry} material={material} />;
}
