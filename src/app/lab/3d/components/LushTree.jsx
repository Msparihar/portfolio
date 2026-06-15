'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWind } from './WindContext';

// ─── Foliage vertex shader ───────────────────────────────────────────────────
// World-space Y-proportional sway so the crown rocks more than the base.
// Uses uTime + per-instance phase; no GLSL ES 3.00 builtins.
const FOLIAGE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uSwayAmp;
  uniform float uAnchorY;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vLight;

  void main() {
    vec4 worldPos4 = modelMatrix * vec4(position, 1.0);
    vec3 worldPos = worldPos4.xyz;

    float heightFactor = clamp((worldPos.y - uAnchorY) / 1.8, 0.0, 1.0);
    float sway = sin(uTime * 0.85 + uPhase) * uSwayAmp * heightFactor;
    float swayZ = cos(uTime * 0.65 + uPhase + 1.1) * uSwayAmp * 0.5 * heightFactor;
    worldPos.x += sway;
    worldPos.z += swayZ;

    vNormal = normalize(normalMatrix * normal);
    vec3 toCam = cameraPosition - worldPos;
    vViewDir = length(toCam) > 0.0001 ? normalize(toCam) : vec3(0.0, 1.0, 0.0);

    // Hemisphere-style lighting: sun from upper-right
    vec3 sunDir = normalize(vec3(0.5, 1.0, 0.4));
    float diffuse = max(dot(vNormal, sunDir), 0.0);
    vLight = 0.55 + 0.45 * diffuse;

    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
  }
`;

const FOLIAGE_FRAG = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uRimColor;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vLight;

  void main() {
    float fresnel = 1.0 - max(dot(vNormal, vViewDir), 0.0);
    fresnel = pow(fresnel, 2.2);
    vec3 col = mix(uBaseColor * vLight, uRimColor, fresnel * 0.45);
    gl_FragColor = vec4(col, 1.0);
  }
`;

// ─── Bark shader (static — same cheap noise streaks as CherryBlossoms) ───────
const BARK_VERT = /* glsl */ `
  varying float vY;
  varying vec3 vPos;
  void main() {
    vY = position.y;
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BARK_FRAG = /* glsl */ `
  varying float vY;
  varying vec3 vPos;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    float n = hash(vec2(floor(vPos.x * 7.0), floor(vY * 5.0)));
    float streak = smoothstep(0.45, 0.72, n) * 0.16;
    // Warm taupe-brown base
    vec3 bark = vec3(0.45, 0.30, 0.18) - streak;
    gl_FragColor = vec4(bark, 1.0);
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function seedRand(seed) {
  let s = seed | 0;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function mergeGeos(geos) {
  const expanded = geos.map(g => (g.index ? g.toNonIndexed() : g));
  let total = 0;
  for (const g of expanded) total += g.attributes.position.count;

  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  let off = 0;
  for (const g of expanded) {
    const n = g.attributes.position.count;
    pos.set(g.attributes.position.array, off * 3);
    if (g.attributes.normal) nor.set(g.attributes.normal.array, off * 3);
    off += n;
  }
  expanded.forEach((g, i) => { if (g !== geos[i]) g.dispose(); });

  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return out;
}

// Tapered cylinder oriented between two world-space points
function BranchMesh({ start, end, r0, r1, mat }) {
  const geo = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(end, start);
    return new THREE.CylinderGeometry(r1, r0, dir.length(), 7, 1);
  }, [start, end, r0, r1]);

  const midpoint = useMemo(
    () => new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5),
    [start, end]
  );

  const rotation = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return new THREE.Euler().setFromQuaternion(q);
  }, [start, end]);

  return (
    <mesh
      geometry={geo}
      material={mat}
      position={midpoint}
      rotation={rotation}
      castShadow
    />
  );
}

// One merged foliage blob cluster — several overlapping icosahedrons displaced for organic silhouette
function FoliageCluster({ position, anchorY, leafColor, rimColor, phase, swayAmp, seed }) {
  const geo = useMemo(() => {
    const rng = seedRand(seed);
    const blobs = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const radius = 0.28 + rng() * 0.18;
      const blob = new THREE.IcosahedronGeometry(radius, 2);

      // Slight noise displacement for an organic silhouette
      const posArr = blob.attributes.position.array;
      const rng2 = seedRand(seed * 31 + i * 7);
      for (let v = 0; v < posArr.length; v += 3) {
        const nx = posArr[v], ny = posArr[v + 1], nz = posArr[v + 2];
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len < 0.0001) continue;
        const bump = 1.0 + (rng2() - 0.5) * 0.22;
        posArr[v] = nx * bump;
        posArr[v + 1] = ny * bump;
        posArr[v + 2] = nz * bump;
      }
      blob.computeVertexNormals();

      // Scatter blobs within cluster
      const ox = (rng() - 0.5) * 0.55;
      const oy = (rng() - 0.5) * 0.38;
      const oz = (rng() - 0.5) * 0.55;
      blob.translate(ox, oy, oz);
      blobs.push(blob);
    }
    const merged = mergeGeos(blobs);
    blobs.forEach(g => g.dispose());
    return merged;
  }, [seed]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: FOLIAGE_VERT,
    fragmentShader: FOLIAGE_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uPhase: { value: phase },
      uSwayAmp: { value: swayAmp },
      uAnchorY: { value: anchorY },
      uBaseColor: { value: new THREE.Color(leafColor) },
      uRimColor: { value: new THREE.Color(rimColor) },
    },
    side: THREE.FrontSide,
  }), [leafColor, rimColor, phase, swayAmp, anchorY]);

  useFrame((state) => {
    mat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh geometry={geo} material={mat} position={position} castShadow />
  );
}

// ─── Default palette ──────────────────────────────────────────────────────────
const AUTUMN_TINT = {
  layers: ['#D4872A', '#C06020', '#E8A030'],
  rim: '#F5C060',
};

function resolvePalette(season) {
  if (season === 'autumn') return AUTUMN_TINT;
  // Default: lush greens — 3 tones for depth layering
  return {
    layers: ['#5A9A3C', '#4A8830', '#6EAA48'],
    rim: '#B8E06A',
  };
}

// ─── LushTree ─────────────────────────────────────────────────────────────────
export function LushTree({ scale = 1, season = 'summer', leafColor = null }) {
  const groupRef = useRef();
  const wind = useWind();

  const palette = useMemo(() => resolvePalette(season), [season]);

  // Allow an explicit leafColor override to tint the base layer
  const layers = useMemo(() => {
    if (leafColor) return [leafColor, leafColor, palette.layers[2]];
    return palette.layers;
  }, [leafColor, palette]);

  const barkMat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: BARK_VERT, fragmentShader: BARK_FRAG }),
    []
  );

  // --- Trunk geometry: two segments, slight lean for personality ---
  const trunkStart = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const trunkMid = useMemo(() => new THREE.Vector3(0.06, 1.0, 0.04), []);
  const trunkTop = useMemo(() => new THREE.Vector3(0.1, 1.85, 0.06), []);

  // Three main branches fanning out from upper trunk
  const branchDefs = useMemo(() => [
    {
      start: new THREE.Vector3(0.08, 1.45, 0.05),
      end: new THREE.Vector3(0.55, 2.0, 0.30),
      r0: 0.07, r1: 0.035,
    },
    {
      start: new THREE.Vector3(0.09, 1.5, 0.05),
      end: new THREE.Vector3(-0.42, 1.95, 0.20),
      r0: 0.065, r1: 0.030,
    },
    {
      start: new THREE.Vector3(0.09, 1.55, 0.05),
      end: new THREE.Vector3(0.12, 2.05, -0.45),
      r0: 0.060, r1: 0.028,
    },
  ], []);

  // Foliage cluster positions — layered around branch tips + crown centre
  // anchorY marks the sway pivot (base of trunk in world space, i.e. 0 * scale)
  const clusterDefs = useMemo(() => [
    // Crown centre blob — largest
    { pos: [0.12, 2.25, 0.04], layer: 0, phase: 0.0, amp: 0.10, seed: 11 },
    // Three branch-tip primary blobs
    { pos: [0.58, 2.15, 0.32], layer: 1, phase: 1.3, amp: 0.12, seed: 23 },
    { pos: [-0.44, 2.10, 0.22], layer: 2, phase: 2.7, amp: 0.11, seed: 37 },
    { pos: [0.14, 2.18, -0.48], layer: 0, phase: 4.1, amp: 0.11, seed: 53 },
    // Infill blobs between branches — gives the billowy mass
    { pos: [0.30, 2.35, -0.10], layer: 1, phase: 0.8, amp: 0.09, seed: 67 },
    { pos: [-0.18, 2.30, 0.28], layer: 2, phase: 2.0, amp: 0.09, seed: 79 },
    { pos: [0.10, 2.50, -0.12], layer: 0, phase: 3.4, amp: 0.08, seed: 91 },
    // Lower skirt blobs for depth
    { pos: [0.40, 1.85, 0.18], layer: 1, phase: 1.6, amp: 0.10, seed: 101 },
    { pos: [-0.28, 1.80, 0.10], layer: 2, phase: 3.0, amp: 0.10, seed: 113 },
  ], []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const w = wind?.current;
    const s = w?.strength ?? 0;
    // Wind bends the whole group slightly; foliage clusters add their own per-vertex sway on top
    groupRef.current.rotation.z = Math.sin(t * 0.62) * 0.018 + s * 0.028 * (w?.dirX ?? 0);
    groupRef.current.rotation.x = Math.sin(t * 0.51 + 0.9) * 0.012 + s * 0.020 * (w?.dirZ ?? 0);
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Two-segment trunk */}
      <BranchMesh start={trunkStart} end={trunkMid} r0={0.13} r1={0.10} mat={barkMat} />
      <BranchMesh start={trunkMid} end={trunkTop} r0={0.10} r1={0.065} mat={barkMat} />

      {/* Main branches */}
      {branchDefs.map((b, i) => (
        <BranchMesh key={i} start={b.start} end={b.end} r0={b.r0} r1={b.r1} mat={barkMat} />
      ))}

      {/* Foliage clusters */}
      {clusterDefs.map((c, i) => (
        <FoliageCluster
          key={i}
          position={c.pos}
          anchorY={0}
          leafColor={layers[c.layer]}
          rimColor={palette.rim}
          phase={c.phase}
          swayAmp={c.amp}
          seed={c.seed}
        />
      ))}
    </group>
  );
}
