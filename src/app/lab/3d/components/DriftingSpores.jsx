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

const VERT = /* glsl */ `
  uniform float uTime;

  attribute float aPhase;
  attribute float aBreezeSpeed;
  attribute float aBreezeAmpX;
  attribute float aBreezeAmpZ;
  attribute float aBobSpeed;
  attribute float aBobAmp;
  attribute float aBaseX;
  attribute float aBaseY;
  attribute float aBaseZ;
  attribute float aSize;
  attribute float aDriftOffset;

  varying float vAlpha;

  void main() {
    float volume = 7.0;
    float halfVol = volume * 0.5;

    float breezeT = uTime * aBreezeSpeed + aDriftOffset;

    float dx = sin(breezeT + aPhase) * aBreezeAmpX
             + cos(breezeT * 0.61 + aPhase * 2.1) * aBreezeAmpX * 0.4;
    float dz = cos(breezeT * 0.73 + aPhase) * aBreezeAmpZ;
    float dy = sin(uTime * aBobSpeed + aPhase * 3.7) * aBobAmp;

    float rawX = aBaseX + dx;
    float rawY = aBaseY + dy;
    float rawZ = aBaseZ + dz;

    float wx = mod(rawX + halfVol, volume) - halfVol;
    float wy = mod(rawY + halfVol, volume) - halfVol;
    float wz = mod(rawZ + halfVol, volume) - halfVol;

    float edgeX = 1.0 - smoothstep(halfVol * 0.78, halfVol, abs(wx));
    float edgeY = 1.0 - smoothstep(halfVol * 0.78, halfVol, abs(wy));
    float edgeZ = 1.0 - smoothstep(halfVol * 0.78, halfVol, abs(wz));
    vAlpha = edgeX * edgeY * edgeZ;

    vec4 mvPos = modelViewMatrix * vec4(wx, wy, wz, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float depth = clamp(-mvPos.z, 0.5, 20.0);
    gl_PointSize = aSize * (180.0 / depth);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float core  = 1.0 - smoothstep(0.0, 0.18, d);
    float body  = 1.0 - smoothstep(0.12, 0.38, d);
    float fringe = 1.0 - smoothstep(0.30, 0.50, d);
    fringe = fringe * fringe;

    float alpha = (core * 0.28 + body * 0.13 + fringe * 0.06) * vAlpha;
    alpha = clamp(alpha, 0.0, 1.0);

    vec3 col = mix(uColor, vec3(1.0), core * 0.22);

    gl_FragColor = vec4(col, alpha);
  }
`;

const DEFAULT_COLOR = new THREE.Color('#D8EDD4');

export function DriftingSpores({
  count  = 70,
  radius = 3.5,
  height = 3.0,
  color,
}) {
  const timeRef   = useRef({ value: 0 });
  const colorRef  = useRef({ value: color ? new THREE.Color(color) : DEFAULT_COLOR });

  const { geo, mat } = useMemo(() => {
    const r = seedRand(4229);
    const n = Math.max(1, Math.min(count, 300));

    const baseX        = new Float32Array(n);
    const baseY        = new Float32Array(n);
    const baseZ        = new Float32Array(n);
    const phase        = new Float32Array(n);
    const breezeSpeed  = new Float32Array(n);
    const breezeAmpX   = new Float32Array(n);
    const breezeAmpZ   = new Float32Array(n);
    const bobSpeed     = new Float32Array(n);
    const bobAmp       = new Float32Array(n);
    const size         = new Float32Array(n);
    const driftOffset  = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      const angle = r() * Math.PI * 2;
      const dist  = Math.sqrt(r()) * radius;

      baseX[i]       = Math.cos(angle) * dist;
      baseY[i]       = (r() - 0.5) * height;
      baseZ[i]       = Math.sin(angle) * dist;
      phase[i]       = r() * Math.PI * 2;
      breezeSpeed[i] = 0.08 + r() * 0.10;
      breezeAmpX[i]  = 0.35 + r() * 0.55;
      breezeAmpZ[i]  = 0.15 + r() * 0.30;
      bobSpeed[i]    = 0.18 + r() * 0.22;
      bobAmp[i]      = 0.08 + r() * 0.18;
      size[i]        = 0.4 + r() * 0.8;
      driftOffset[i] = r() * Math.PI * 6;
    }

    const positions = new Float32Array(n * 3);

    const g = new THREE.BufferGeometry();
    g.setAttribute('position',    new THREE.BufferAttribute(positions,   3));
    g.setAttribute('aBaseX',      new THREE.BufferAttribute(baseX,       1));
    g.setAttribute('aBaseY',      new THREE.BufferAttribute(baseY,       1));
    g.setAttribute('aBaseZ',      new THREE.BufferAttribute(baseZ,       1));
    g.setAttribute('aPhase',      new THREE.BufferAttribute(phase,       1));
    g.setAttribute('aBreezeSpeed', new THREE.BufferAttribute(breezeSpeed, 1));
    g.setAttribute('aBreezeAmpX', new THREE.BufferAttribute(breezeAmpX,  1));
    g.setAttribute('aBreezeAmpZ', new THREE.BufferAttribute(breezeAmpZ,  1));
    g.setAttribute('aBobSpeed',   new THREE.BufferAttribute(bobSpeed,    1));
    g.setAttribute('aBobAmp',     new THREE.BufferAttribute(bobAmp,      1));
    g.setAttribute('aSize',       new THREE.BufferAttribute(size,        1));
    g.setAttribute('aDriftOffset', new THREE.BufferAttribute(driftOffset, 1));

    const m = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime:  timeRef.current,
        uColor: colorRef.current,
      },
      blending:    THREE.NormalBlending,
      depthWrite:  false,
      transparent: true,
    });

    return { geo: g, mat: m };
  }, [count, radius, height]);

  useFrame(({ clock }) => {
    timeRef.current.value = clock.elapsedTime;
  });

  return <points geometry={geo} material={mat} />;
}
