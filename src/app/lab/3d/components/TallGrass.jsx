'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWind } from './WindContext';

// ─── Blade shader ─────────────────────────────────────────────────────────────
// Triangular blade via alpha-clip on a thin plane geometry.
// Vertical gradient: dark base → bright mid → cream tip.
// Wind sway weighted by uv.y (tips bend, base stays).
const BLADE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uWindStrength;
  uniform float uWindDirX;
  uniform float uWindDirZ;

  attribute float aPhase;       // per-blade wind phase offset
  attribute float aWorldX;      // blade world X for spatial wind variation
  attribute float aWorldZ;      // blade world Z

  varying vec2 vUv;
  varying float vHeight;        // 0 (base) .. 1 (tip)

  void main() {
    vUv = uv;
    vHeight = uv.y;             // PlaneGeometry UV: y=0 bottom, y=1 top

    // Wind sway: only tips (uv.y near 1) bend
    float sway = sin(uTime * 1.5 + aWorldX * 2.0 + aPhase) * 0.15 * uWindStrength;
    float gustBend = sin(uTime * 0.7 + aPhase) * 0.06 * uWindStrength;
    float totalBend = (sway + gustBend) * vHeight * vHeight; // quadratic: base fixed

    vec3 pos = position;
    pos.x += totalBend * uWindDirX;
    pos.z += totalBend * uWindDirZ;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const BLADE_FRAG = /* glsl */ `
  uniform vec3 uBaseColor;    // dark green base #3A6B2E
  uniform vec3 uMidColor;     // bright #9DD06A
  uniform vec3 uTipColor;     // cream-yellow #E8E0A0
  uniform vec3 uColorVariant; // per-blade tint (some bluer, some yellower)

  varying vec2 vUv;
  varying float vHeight;

  void main() {
    // Alpha clip: triangular blade shape
    // blade narrows toward tip: width at height h is (1-h)
    float halfBlade = 0.5 - vUv.x; // -0.5..0.5 centered
    float edgeDist = abs(halfBlade * 2.0); // 0=center, 1=edge
    float bladeWidth = 1.0 - vHeight;      // taper
    if (edgeDist > bladeWidth * 1.05) discard;

    // Vertical color gradient with 3 stops
    vec3 col;
    if (vHeight < 0.4) {
      col = mix(uBaseColor, uMidColor, vHeight / 0.4);
    } else {
      col = mix(uMidColor, uTipColor, (vHeight - 0.4) / 0.6);
    }

    // Per-blade color variant
    col += uColorVariant * 0.18;

    // Fake AO: darken bottom 20%
    float ao = smoothstep(0.0, 0.2, vHeight) * 0.35 + 0.65;
    col *= ao;

    // Soft edge anti-alias
    float edgeAlpha = 1.0 - smoothstep(bladeWidth * 0.85, bladeWidth * 1.05, edgeDist);

    gl_FragColor = vec4(col, edgeAlpha);
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function seedRand(seed) {
  let s = seed | 0;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

// Build a single PlaneGeometry blade with UV and custom per-vertex attributes.
// position = local offset within tuft group.
// tuftWorldPos = the tuft's world XZ for spatial wind variation in shader.
function buildBladeMesh(position, rotY, phase, colorVariant, tuftWorldPos) {
  const height = 0.35 + Math.random() * 0.2;
  const width = 0.1 + Math.random() * 0.04;
  const geo = new THREE.PlaneGeometry(width, height, 1, 4);

  // Per-vertex attributes (same value broadcast across all verts of this blade)
  const vertCount = geo.attributes.position.count;
  const phases = new Float32Array(vertCount).fill(phase);
  // Use tuft world XZ for spatially coherent wind field sampling
  const worldXArr = new Float32Array(vertCount).fill(tuftWorldPos[0]);
  const worldZArr = new Float32Array(vertCount).fill(tuftWorldPos[2]);
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geo.setAttribute('aWorldX', new THREE.BufferAttribute(worldXArr, 1));
  geo.setAttribute('aWorldZ', new THREE.BufferAttribute(worldZArr, 1));

  return { geo, height, width, rotY, position, colorVariant };
}

// ─── Tuft positions (same seed as before for spatial consistency) ─────────────
const TUFT_POSITIONS = (() => {
  const r = seedRand(31);
  const list = [];
  for (let i = 0; i < 14; i++) {
    const angle = r() * Math.PI * 2;
    const rad = r() * 2.3 + 0.4;
    list.push({
      pos: [Math.cos(angle) * rad, 0.52, Math.sin(angle) * rad],
      scale: 0.7 + r() * 0.4,
      phase: r() * Math.PI * 2,
      bladeCount: 5 + Math.floor(r() * 4), // 5–8 blades
    });
  }
  return list;
})();

// Color variants: some blades lean bluer, some yellower
const COLOR_VARIANTS = [
  new THREE.Color(0.0, 0.05, -0.02),
  new THREE.Color(-0.02, 0.04, 0.0),
  new THREE.Color(0.03, 0.0, -0.03),
  new THREE.Color(-0.01, 0.06, 0.01),
  new THREE.Color(0.02, -0.02, 0.0),
];

// ─── Single Tuft ──────────────────────────────────────────────────────────────
function Tuft({ pos, scale, phase, bladeCount }) {
  const wind = useWind();
  const matsRef = useRef([]);

  const blades = useMemo(() => {
    const r = seedRand(Math.floor(phase * 1000) + 7);
    return Array.from({ length: bladeCount }, (_, i) => {
      // Local offsets within the tuft (not world positions)
      const ox = (r() - 0.5) * 0.18;
      const oz = (r() - 0.5) * 0.18;
      const localPos = [ox, 0, oz]; // relative to tuft group origin
      const rotY = r() * Math.PI * 2;
      const bladephase = phase + r() * 1.5;
      const variantIdx = i % COLOR_VARIANTS.length;
      return buildBladeMesh(localPos, rotY, bladephase, COLOR_VARIANTS[variantIdx], pos);
    });
  }, [pos, phase, bladeCount]);

  const materials = useMemo(() => blades.map((b, i) => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: BLADE_VERT,
      fragmentShader: BLADE_FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uWindStrength: { value: 0.5 },
        uWindDirX: { value: 1.0 },
        uWindDirZ: { value: 0.4 },
        uBaseColor: { value: new THREE.Color('#3A6B2E') },
        uMidColor: { value: new THREE.Color('#9DD06A') },
        uTipColor: { value: new THREE.Color('#E8E0A0') },
        uColorVariant: { value: b.colorVariant },
      },
    });
    return mat;
  }), [blades]);

  // Store refs to mats for useFrame
  matsRef.current = materials;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const w = wind?.current;
    const s = w?.strength ?? 0.5;
    const dx = w?.dirX ?? 1.0;
    const dz = w?.dirZ ?? 0.4;
    for (const mat of matsRef.current) {
      mat.uniforms.uTime.value = t;
      mat.uniforms.uWindStrength.value = s;
      mat.uniforms.uWindDirX.value = dx;
      mat.uniforms.uWindDirZ.value = dz;
    }
  });

  return (
    <group position={pos} scale={[scale, scale, scale]}>
      {blades.map((b, i) => {
        // Place blade center at half-height (PlaneGeometry is centered at origin)
        const bladePos = [b.position[0], b.height * 0.5, b.position[2]];
        return (
          <mesh
            key={i}
            geometry={b.geo}
            material={materials[i]}
            position={bladePos}
            rotation={[0, b.rotY, 0]}
            castShadow={false}
          />
        );
      })}
    </group>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function TallGrass() {
  return (
    <group>
      {TUFT_POSITIONS.map((t, i) => (
        <Tuft key={i} {...t} />
      ))}
    </group>
  );
}
