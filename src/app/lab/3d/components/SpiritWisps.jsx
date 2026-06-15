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
  attribute float aRiseSpeed;
  attribute float aSwayAmp;
  attribute float aSwayFreq;
  attribute float aBaseX;
  attribute float aBaseZ;
  attribute float aSize;
  attribute float aTwinklePhase;

  varying float vAlpha;
  varying float vTwinkle;
  varying float vT;

  void main() {
    float height = 4.0;

    float t = mod(uTime * aRiseSpeed + aPhase, 1.0);

    float x = aBaseX + sin(uTime * aSwayFreq + aPhase * 6.2831) * aSwayAmp;
    float y = position.y + t * height;
    float z = aBaseZ + cos(uTime * aSwayFreq * 0.73 + aPhase * 6.2831 + 1.1) * aSwayAmp * 0.7;

    vT = t;

    float fadeIn  = smoothstep(0.0, 0.18, t);
    float fadeOut = 1.0 - smoothstep(0.72, 1.0, t);
    vAlpha = fadeIn * fadeOut;

    float twinkle = 0.7 + 0.3 * sin(uTime * 3.5 + aTwinklePhase);
    vTwinkle = twinkle;

    vec4 mvPos = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float sizeBase = aSize * (1.0 + twinkle * 0.25);
    gl_PointSize = sizeBase * (200.0 / -mvPos.z);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColorCool;
  uniform vec3 uColorWarm;

  varying float vAlpha;
  varying float vTwinkle;
  varying float vT;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float core  = 1.0 - smoothstep(0.0, 0.10, d);
    float halo  = 1.0 - smoothstep(0.06, 0.44, d);
    float glow  = core * 0.42 + halo * halo * halo * 0.20;

    vec3 col = mix(uColorCool, uColorWarm, clamp(vT * 1.4 - 0.2, 0.0, 1.0));
    col = mix(col, vec3(1.0), core * 0.18);

    float alpha = glow * vAlpha * vTwinkle;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
  }
`;

function buildWispData(count, radius) {
  const r = seedRand(77);
  const phase        = new Float32Array(count);
  const riseSpeed    = new Float32Array(count);
  const swayAmp      = new Float32Array(count);
  const swayFreq     = new Float32Array(count);
  const baseX        = new Float32Array(count);
  const baseZ        = new Float32Array(count);
  const size         = new Float32Array(count);
  const twinklePhase = new Float32Array(count);
  const positions    = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const angle = r() * Math.PI * 2;
    const dist  = r() * radius;

    phase[i]        = r();
    riseSpeed[i]    = 0.06 + r() * 0.10;
    swayAmp[i]      = 0.08 + r() * 0.22;
    swayFreq[i]     = 0.25 + r() * 0.45;
    baseX[i]        = Math.cos(angle) * dist;
    baseZ[i]        = Math.sin(angle) * dist;
    size[i]         = 5.0 + r() * 7.0;
    twinklePhase[i] = r() * Math.PI * 2;

    positions[i * 3 + 0] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
  }

  return { phase, riseSpeed, swayAmp, swayFreq, baseX, baseZ, size, twinklePhase, positions };
}

export function SpiritWisps({
  count   = 60,
  radius  = 2.5,
  height  = 0.0,
  colors  = ['#CFEFFF', '#F2E6D0'],
}) {
  const pointsRef = useRef();

  const { geo, mat } = useMemo(() => {
    const data = buildWispData(count, radius);

    const g = new THREE.BufferGeometry();
    g.setAttribute('position',    new THREE.BufferAttribute(data.positions,    3));
    g.setAttribute('aPhase',      new THREE.BufferAttribute(data.phase,        1));
    g.setAttribute('aRiseSpeed',  new THREE.BufferAttribute(data.riseSpeed,    1));
    g.setAttribute('aSwayAmp',    new THREE.BufferAttribute(data.swayAmp,      1));
    g.setAttribute('aSwayFreq',   new THREE.BufferAttribute(data.swayFreq,     1));
    g.setAttribute('aBaseX',      new THREE.BufferAttribute(data.baseX,        1));
    g.setAttribute('aBaseZ',      new THREE.BufferAttribute(data.baseZ,        1));
    g.setAttribute('aSize',       new THREE.BufferAttribute(data.size,         1));
    g.setAttribute('aTwinklePhase', new THREE.BufferAttribute(data.twinklePhase, 1));

    const cool = new THREE.Color(colors[0] || '#CFEFFF');
    const warm = new THREE.Color(colors[1] || '#F2E6D0');

    const m = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime:      { value: 0 },
        uColorCool: { value: cool },
        uColorWarm: { value: warm },
      },
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      transparent: true,
    });

    return { geo: g, mat: m };
  }, [count, radius, colors]);

  useFrame((state) => {
    mat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <points ref={pointsRef} geometry={geo} material={mat} position={[0, height, 0]} />;
}
