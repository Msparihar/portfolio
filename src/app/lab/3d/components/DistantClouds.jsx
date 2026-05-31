'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWind } from './WindContext';

// ---------------------------------------------------------------------------
// Cloud sphere shader — painterly Fresnel + internal noise drift
// ---------------------------------------------------------------------------
const CLOUD_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uNoiseSpeed;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vNoiseuv;

  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir  = normalize(-mvPos.xyz);
    // Use sphere's world-space normal as a stable UV for noise
    vNoiseuv  = normal.xz * 0.5 + 0.5;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const CLOUD_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uNoiseSpeed;
  uniform float uDistanceFade;   // 0 = close, 1 = far

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vNoiseuv;

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
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * vnoise(p);
      p = p * 2.1 + vec2(0.7, 1.3);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // --- Fresnel-based feathered edge ---
    float ndotv = dot(vNormal, vViewDir);
    float fresnel = pow(1.0 - clamp(ndotv, 0.0, 1.0), 2.2);

    // --- Internal drifting noise (cloud "living" motion) ---
    vec2 driftUv = vNoiseuv + uTime * uNoiseSpeed * vec2(0.04, 0.02);
    float noiseVal = fbm(driftUv * 3.5);

    // --- Color: cream-white dense core → pale lavender at transparent edges ---
    vec3 coreColor    = vec3(0.98, 0.98, 0.96);       // warm cream
    vec3 edgeColor    = vec3(0.86, 0.86, 0.95);       // pale lavender
    vec3 color = mix(coreColor, edgeColor, fresnel);

    // Slight warm/cool variation from noise — hand-painted feel
    color += vec3(noiseVal * 0.04, noiseVal * 0.02, -noiseVal * 0.02);

    // --- Opacity: dense centre, feathered edge, plus noise breaks for realism ---
    float baseAlpha = (1.0 - fresnel * 0.85) * (0.72 + noiseVal * 0.18);
    // Distance fade — farther clouds more transparent
    float alpha = baseAlpha * (1.0 - uDistanceFade * 0.5);

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

// ---------------------------------------------------------------------------
// Seeded RNG
// ---------------------------------------------------------------------------
function seedRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------------------------------------------------------------------------
// CloudPuff — a cluster of shaded spheres with deterministic layout variation
// ---------------------------------------------------------------------------
function CloudPuff({ position, baseScale, scaleXYZ, phase, seed, distanceFade }) {
  const ref      = useRef();
  const windRef  = useWind();   // may be null if not inside WindProvider

  // Deterministic sub-sphere layout from seed
  const { subs, noiseSpeed } = useMemo(() => {
    let s = seed;
    const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

    const subCount = 3 + Math.floor(r() * 2);   // 3 or 4 spheres per puff

    // Shape archetype from seed — long/stretched, round puffy, or fragmented
    const archetype = Math.floor(r() * 3);
    const built = [];
    for (let i = 0; i < subCount; i++) {
      let ox, oy, oz, rad;
      if (archetype === 0) {
        // Long stretched (horizontal sausage)
        ox = (r() - 0.5) * 2.4;
        oy = (r() - 0.5) * 0.25;
        oz = (r() - 0.5) * 0.6;
        rad = 0.45 + r() * 0.35;
      } else if (archetype === 1) {
        // Round puffy (compact cluster)
        ox = (r() - 0.5) * 1.0;
        oy = (r() - 0.5) * 0.6;
        oz = (r() - 0.5) * 0.8;
        rad = 0.55 + r() * 0.45;
      } else {
        // Fragmented (sparse scattered blobs)
        ox = (r() - 0.5) * 1.8;
        oy = (r() - 0.5) * 0.5;
        oz = (r() - 0.5) * 1.2;
        rad = 0.35 + r() * 0.4;
      }
      built.push({ pos: [ox, oy, oz], r: rad });
    }
    return { subs: built, noiseSpeed: 0.5 + r() * 0.8 };
  }, [seed]);

  // Per-sub uniforms (share time, vary noiseSpeed per puff)
  const subMats = useMemo(() => {
    return subs.map(() => new THREE.ShaderMaterial({
      vertexShader: CLOUD_VERT,
      fragmentShader: CLOUD_FRAG,
      uniforms: {
        uTime:         { value: 0 },
        uNoiseSpeed:   { value: noiseSpeed },
        uDistanceFade: { value: distanceFade },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    }));
  }, [subs, noiseSpeed, distanceFade]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;

    // Slow drift in wind direction
    let driftX = 0.004;
    let driftZ = 0.001;
    if (windRef && windRef.current) {
      const w = windRef.current;
      driftX = w.dirX * w.strength * 0.0018;
      driftZ = w.dirZ * w.strength * 0.0008;
    }
    ref.current.position.x += driftX;
    ref.current.position.z += driftZ;

    // Wrap around at extreme distances so clouds don't drift away forever
    if (ref.current.position.x > 50)  ref.current.position.x = -50;
    if (ref.current.position.x < -50) ref.current.position.x = 50;
    if (ref.current.position.z > 50)  ref.current.position.z = -50;
    if (ref.current.position.z < -50) ref.current.position.z = 50;

    // Gentle vertical bob
    ref.current.position.y = position[1] + Math.sin(t * 0.15 + phase) * 0.15;

    // Update time uniform in each sub-sphere material
    subMats.forEach((mat) => {
      mat.uniforms.uTime.value = t;
    });
  });

  return (
    <group ref={ref} position={position} scale={[scaleXYZ[0], scaleXYZ[1], scaleXYZ[2]]}>
      {subs.map((p, i) => (
        <mesh key={i} position={p.pos} material={subMats[i]}>
          <sphereGeometry args={[p.r, 10, 8]} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Generate puff data — deterministic, 44 puffs
// ---------------------------------------------------------------------------
const r = seedRand(2026);

const PUFFS = (() => {
  const list = [];
  const count = 44;
  for (let i = 0; i < count; i++) {
    const angle = r() * Math.PI * 2;
    const rad   = 14 + r() * 28;
    const x     = Math.cos(angle) * rad;
    const z     = Math.sin(angle) * rad;
    const y     = -7 - r() * 9;
    const s     = 1.0 + r() * 1.6;

    // Stretch factor varies — long or puffy or flat
    const stretchX = s * (0.85 + r() * 0.6);
    const stretchY = s * (0.35 + r() * 0.25);
    const stretchZ = s * (0.65 + r() * 0.45);

    // Normalized distance (0 = close, 1 = far edge)
    const distanceFade = Math.min(1.0, (rad - 14) / 28);

    list.push({
      position:     [x, y, z],
      baseScale:    s,
      scaleXYZ:     [stretchX, stretchY, stretchZ],
      phase:        r() * 10,
      seed:         Math.floor(r() * 1e6) + 1,
      distanceFade,
    });
  }
  return list;
})();

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export function DistantClouds() {
  return (
    <group>
      {PUFFS.map((p, i) => <CloudPuff key={i} {...p} />)}
    </group>
  );
}
