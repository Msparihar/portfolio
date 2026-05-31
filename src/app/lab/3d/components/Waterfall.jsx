'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Vertex shader — curved geometry (outward bulge) + wobble
// ---------------------------------------------------------------------------
const VERTEX = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Subtle outward bulge in Z — parabolic, strongest at horizontal center
    float bulge = (1.0 - pow(uv.x * 2.0 - 1.0, 2.0)) * 0.12;
    pos.z += bulge;

    // Gentle horizontal wobble — stronger near the bottom (gives curtain feel)
    float wobbleMix = smoothstep(1.0, 0.0, uv.y);
    pos.x += sin(pos.y * 5.0 + uTime * 1.8) * 0.055 * wobbleMix;
    pos.z += cos(pos.y * 4.0 + uTime * 1.3) * 0.035 * wobbleMix;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Fragment shader — vertical noise + foam + brush-painted streaks
// ---------------------------------------------------------------------------
const FRAGMENT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }

  void main() {
    vec2 uv = vUv;
    uv.y += uTime * 0.55;   // scroll downward

    // Two-scale vertical streaks — coarse + fine
    float n1 = vnoise(vec2(uv.x * 8.0, uv.y * 2.5));
    float n2 = vnoise(vec2(uv.x * 18.0, uv.y * 5.5));
    float n3 = vnoise(vec2(uv.x * 32.0, uv.y * 9.0 + 0.3));  // fine sparkle
    float streaks = smoothstep(0.25, 0.85, n1 * 0.55 + n2 * 0.3 + n3 * 0.15);

    // --- Foam at top lip (cream ring where water pours over cliff) ---
    float topFoam = smoothstep(0.88, 1.0, vUv.y);
    // Pulse subtly — subliminal rhythm like a real waterfall
    float foamPulse = 1.0 + sin(uTime * 2.0) * 0.05;
    topFoam *= foamPulse;

    // Foam noise texture on the top band
    float foamNoise = vnoise(vec2(vUv.x * 12.0 + uTime * 0.3, vUv.y * 6.0));
    topFoam *= 0.7 + foamNoise * 0.5;

    // Bottom mist fade
    float bottomFoam = smoothstep(0.90, 1.0, 1.0 - vUv.y) * 0.5;

    vec3 deepBlue = vec3(0.50, 0.76, 0.94);
    vec3 lightBlue = vec3(0.84, 0.96, 1.0);
    vec3 cream = vec3(0.98, 0.98, 0.95);   // cream foam

    vec3 color = mix(deepBlue, lightBlue, streaks);
    color = mix(color, cream, topFoam);
    color = mix(color, cream, bottomFoam);

    // Soft horizontal edge falloff
    float edgeFade = smoothstep(0.0, 0.12, vUv.x) * smoothstep(0.0, 0.12, 1.0 - vUv.x);
    // Vertical fade — transparent at very bottom (merges into mist)
    float vertFade = 1.0 - smoothstep(0.80, 1.0, 1.0 - vUv.y);

    float alpha = 0.88 * edgeFade * vertFade;

    gl_FragColor = vec4(color, alpha);
  }
`;

// ---------------------------------------------------------------------------
// Spray particle shader — instanced, curl-noise upward drift + fade
// ---------------------------------------------------------------------------
const SPRAY_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aOffset;

  varying float vAlpha;

  // Simple 2D curl-like drift
  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    float t = mod(uTime * aSpeed + aPhase, 1.0);
    float ease = t * (1.0 - t) * 4.0;   // 0→1→0 arc

    vec3 pos = aOffset;
    pos.y += t * 0.55;                          // upward drift
    pos.x += sin(aPhase * 6.28 + uTime * 1.2) * 0.08 * ease;  // curl sideways
    pos.z += cos(aPhase * 6.28 + uTime * 0.9) * 0.06 * ease;

    vAlpha = (1.0 - t) * (1.0 - t) * 0.85;    // fade out as they rise

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 5.0 * (1.0 - t) * (300.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const SPRAY_FRAG = /* glsl */ `
  varying float vAlpha;
  void main() {
    // Circular soft particle
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.1, d);
    gl_FragColor = vec4(0.9, 0.97, 1.0, vAlpha * soft);
  }
`;

// ---------------------------------------------------------------------------
// Crash splash ring shader — expanding ripple at base
// ---------------------------------------------------------------------------
const SPLASH_VERT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SPLASH_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 center = vec2(0.5);
    float dist = length(vUv - center) * 2.0;

    // Three expanding rings, staggered in phase
    float ring = 0.0;
    for (int i = 0; i < 3; i++) {
      float phase = mod(uTime * 1.1 + float(i) * 0.33, 1.0);
      float r = phase;
      float ripple = smoothstep(0.04, 0.0, abs(dist - r)) * (1.0 - phase);
      ring += ripple;
    }

    // Fade at the rim of the disc
    float rim = smoothstep(1.0, 0.7, dist);
    float alpha = ring * 0.45 * rim;

    gl_FragColor = vec4(0.75, 0.92, 1.0, alpha);
  }
`;

// ---------------------------------------------------------------------------
// Spray particles component (instanced-ish via BufferGeometry points)
// ---------------------------------------------------------------------------
function SprayParticles() {
  const COUNT = 18;
  const ref = useRef();

  const { geometry, sprayMat } = useMemo(() => {
    const phases   = new Float32Array(COUNT);
    const speeds   = new Float32Array(COUNT);
    const offsets  = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const angle = (i / COUNT) * Math.PI * 2;
      const r = 0.15 + (i % 3) * 0.12;
      phases[i]         = i / COUNT;
      speeds[i]         = 0.55 + (i % 5) * 0.12;
      offsets[i * 3]     = Math.cos(angle) * r;
      offsets[i * 3 + 1] = 0;
      offsets[i * 3 + 2] = Math.sin(angle) * r * 0.5;
    }

    const geo = new THREE.BufferGeometry();
    // Single dummy point — the actual position is computed per-particle in vertex shader
    const dummyPos = new Float32Array(COUNT * 3);  // all zeros → offset drives position
    geo.setAttribute('position', new THREE.BufferAttribute(dummyPos, 3));
    geo.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aSpeed',   new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aOffset',  new THREE.BufferAttribute(offsets, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader: SPRAY_VERT,
      fragmentShader: SPRAY_FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, sprayMat: mat };
  }, []);

  useFrame((state) => {
    sprayMat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points ref={ref} geometry={geometry} material={sprayMat} position={[0, -1.85, 0]} />
  );
}

// ---------------------------------------------------------------------------
// Crash splash ring
// ---------------------------------------------------------------------------
function SplashRing() {
  const matRef = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
      <circleGeometry args={[0.5, 32]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={SPLASH_VERT}
        fragmentShader={SPLASH_FRAG}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Mist puff — shader-driven opacity flicker for variation
// ---------------------------------------------------------------------------
const MIST_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }

  void main() {
    // Soft sphere falloff from UV center
    vec2 c = vUv - 0.5;
    float d = length(c) * 2.0;
    float sphere = smoothstep(1.0, 0.2, d);

    // Flicker: noise-driven opacity shift per puff (uPhase keeps them out of sync)
    float flicker = vnoise(vec2(uTime * 0.6 + uPhase, uPhase * 3.1)) * 0.28;
    float alpha = (0.35 + flicker) * sphere;

    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`;

const MIST_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function MistPuff({ position, scale, phase }) {
  const matRef = useRef();
  const ref = useRef();
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPhase: { value: phase },
  }), [phase]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + phase;
    ref.current.position.y = position[1] + Math.sin(t * 0.8) * 0.06;
    ref.current.scale.setScalar(scale + Math.sin(t * 0.5) * 0.04);
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.4, 14, 10]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={MIST_VERT}
        fragmentShader={MIST_FRAG}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function Waterfall() {
  const matRef = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group position={[3.05, -1.05, -0.4]} rotation={[0, -Math.PI / 2.2, 0]}>
      {/* Main waterfall — curved plane geometry (24 height segments, 6 width for curve) */}
      <mesh>
        <planeGeometry args={[1.0, 3.4, 6, 24]} />
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={VERTEX}
          fragmentShader={FRAGMENT}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Spray particles at crash point */}
      <SprayParticles />

      {/* Expanding splash ring at base */}
      <SplashRing />

      {/* Mist puffs — shader-driven flicker opacity */}
      <MistPuff position={[0, -1.85, 0.05]}   scale={0.55} phase={0} />
      <MistPuff position={[0.18, -1.78, -0.1]} scale={0.40} phase={1.5} />
      <MistPuff position={[-0.15, -1.9, 0.08]} scale={0.45} phase={3.0} />
    </group>
  );
}
