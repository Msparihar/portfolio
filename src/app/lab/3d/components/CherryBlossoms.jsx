'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWind } from './WindContext';

// ─── Blossom canopy shader ────────────────────────────────────────────────────
// Per-vertex pink jitter + fresnel rim (cream/white glow at silhouette edges)
const BLOSSOM_VERT = /* glsl */ `
  attribute vec3 aBlossomColor;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vColor;

  // cheap hash for per-vertex color jitter
  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vec3 toCam = cameraPosition - worldPos.xyz;
    vViewDir = length(toCam) > 0.0001 ? normalize(toCam) : vec3(0.0, 0.0, 1.0);

    // jitter per vertex: ±0.06 on each channel
    float jitter = (hash(position.x * 13.7 + position.y * 7.3 + position.z * 5.1) - 0.5) * 0.12;
    vColor = aBlossomColor + vec3(jitter, jitter * 0.5, jitter * 0.3);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const BLOSSOM_FRAG = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vColor;

  void main() {
    float fresnel = 1.0 - max(dot(vNormal, vViewDir), 0.0);
    fresnel = pow(fresnel, 2.5);

    // Rim: cream-white glow
    vec3 rimColor = vec3(1.0, 0.97, 0.92);
    vec3 col = mix(vColor, rimColor, fresnel * 0.65);

    // Soft ambient
    float light = 0.72 + 0.28 * max(dot(vNormal, normalize(vec3(0.5, 1.0, 0.3))), 0.0);
    gl_FragColor = vec4(col * light, 1.0);
  }
`;

// ─── Bark shader ─────────────────────────────────────────────────────────────
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
    // dark noise streaks along the bark
    float n = hash(vec2(floor(vPos.x * 8.0), floor(vY * 6.0)));
    float streak = smoothstep(0.4, 0.7, n) * 0.18;
    vec3 bark = vec3(0.420, 0.291, 0.180) - streak; // #6B4A2E base
    gl_FragColor = vec4(bark, 1.0);
  }
`;

// ─── Falling petals shader ────────────────────────────────────────────────────
const PETAL_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aOrigin;
  attribute float aSwayAmp;

  void main() {
    float t = mod(uTime * aSpeed + aPhase, 4.0); // 0..4 fall cycle
    float y = aOrigin.y - t * 0.7;
    float sway = sin(uTime * 1.4 + aPhase * 3.1) * aSwayAmp;
    float spin = uTime * aSpeed * 1.2 + aPhase;
    float x = aOrigin.x + sway + cos(spin) * 0.06;
    float z = aOrigin.z + sin(spin) * 0.06;

    // tiny quad rotation (billboard-ish via position offset baked in geometry)
    gl_Position = projectionMatrix * viewMatrix * vec4(x, y, z, 1.0);
    gl_PointSize = 4.0;
  }
`;

const PETAL_FRAG = /* glsl */ `
  void main() {
    // Soft circular petal
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float d = dot(uv, uv);
    if (d > 1.0) discard;
    float alpha = 1.0 - smoothstep(0.5, 1.0, d);
    gl_FragColor = vec4(1.0, 0.78, 0.86, alpha * 0.85); // soft pink
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function seedRand(seed) {
  let s = seed | 0;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function makeBarkMat() {
  return new THREE.ShaderMaterial({ vertexShader: BARK_VERT, fragmentShader: BARK_FRAG });
}

// Procedural tapered branch: returns positions for a curved cylinder approximation
// Start + End + a gentle curve via midpoint offset
function BranchMesh({ start, end, radiusStart, radiusEnd, barkMat, segments = 6 }) {
  const geo = useMemo(() => {
    // Build a simple tapered cylinder between two points
    const dir = new THREE.Vector3().subVectors(end, start);
    const length = dir.length();
    const g = new THREE.CylinderGeometry(radiusEnd, radiusStart, length, segments, 1);
    return g;
  }, [start, end, radiusStart, radiusEnd, segments]);

  const position = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    return [mid.x, mid.y, mid.z];
  }, [start, end]);

  const rotation = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
    const euler = new THREE.Euler().setFromQuaternion(q);
    return [euler.x, euler.y, euler.z];
  }, [start, end]);

  return (
    <mesh geometry={geo} material={barkMat} position={position} rotation={rotation} castShadow />
  );
}

// A blossom cluster: 5-8 overlapping subdivided spheres with per-vertex color
function BlossomCluster({ position, count, baseRadius, baseColor, seed }) {
  const geo = useMemo(() => {
    const r = seedRand(seed);
    const merged = [];
    for (let i = 0; i < count; i++) {
      const sphere = new THREE.IcosahedronGeometry(baseRadius * (0.6 + r() * 0.5), 2);
      // Offset within cluster
      const ox = (r() - 0.5) * baseRadius * 1.2;
      const oy = (r() - 0.5) * baseRadius * 0.8;
      const oz = (r() - 0.5) * baseRadius * 1.2;
      sphere.translate(ox, oy, oz);

      // Add per-vertex color attribute with pink jitter
      const vertCount = sphere.attributes.position.count;
      const colors = new Float32Array(vertCount * 3);
      const base = new THREE.Color(baseColor);
      for (let v = 0; v < vertCount; v++) {
        const jitter = (r() - 0.5) * 0.12;
        colors[v * 3 + 0] = THREE.MathUtils.clamp(base.r + jitter, 0, 1);
        colors[v * 3 + 1] = THREE.MathUtils.clamp(base.g + jitter * 0.5, 0, 1);
        colors[v * 3 + 2] = THREE.MathUtils.clamp(base.b + jitter * 0.3, 0, 1);
      }
      sphere.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      merged.push(sphere);
    }
    // Merge all sphere geometries
    const mergedGeo = mergeGeometries(merged);
    merged.forEach(g => g.dispose());
    return mergedGeo;
  }, [count, baseRadius, baseColor, seed]);

  const mat = useMemo(() => new THREE.MeshLambertMaterial({
    vertexColors: true,
    emissive: new THREE.Color(baseColor).multiplyScalar(0.18),
  }), [baseColor]);

  return <mesh geometry={geo} material={mat} position={position} castShadow />;
}

// Merge geometries into one non-indexed BufferGeometry.
// Converts each input to non-indexed first so index buffers don't cause gaps.
function mergeGeometries(geos) {
  // Expand all to non-indexed
  const expanded = geos.map(g => (g.index ? g.toNonIndexed() : g));

  let totalVerts = 0;
  for (const g of expanded) totalVerts += g.attributes.position.count;

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const colors = new Float32Array(totalVerts * 3);

  let offset = 0;
  for (const g of expanded) {
    const n = g.attributes.position.count;
    positions.set(g.attributes.position.array, offset * 3);
    if (g.attributes.normal) normals.set(g.attributes.normal.array, offset * 3);
    if (g.attributes.color) colors.set(g.attributes.color.array, offset * 3);
    offset += n;
  }

  // Dispose the temporary non-indexed copies (not the originals)
  expanded.forEach((g, i) => { if (g !== geos[i]) g.dispose(); });

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return merged;
}

// Falling petals particle system for one tree
function FallingPetals({ canopyTips, count = 14 }) {
  const { geo, mat } = useMemo(() => {
    const r = seedRand(canopyTips.length * 31 + 7);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    const origins = new Float32Array(count * 3);
    const swayAmps = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Pick a random canopy tip as spawn origin, spread slightly
      const tip = canopyTips[i % canopyTips.length];
      phases[i] = r() * Math.PI * 2;
      speeds[i] = 0.4 + r() * 0.3;
      origins[i * 3 + 0] = tip[0] + (r() - 0.5) * 0.4;
      origins[i * 3 + 1] = tip[1] + r() * 0.3;
      origins[i * 3 + 2] = tip[2] + (r() - 0.5) * 0.4;
      swayAmps[i] = 0.1 + r() * 0.15;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3)); // dummy
    g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    g.setAttribute('aOrigin', new THREE.BufferAttribute(origins, 3));
    g.setAttribute('aSwayAmp', new THREE.BufferAttribute(swayAmps, 1));

    const m = new THREE.ShaderMaterial({
      vertexShader: PETAL_VERT,
      fragmentShader: PETAL_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
    });

    return { geo: g, mat: m };
  }, [canopyTips, count]);

  useFrame((state) => {
    mat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <points geometry={geo} material={mat} />;
}

// ─── Per-tree config ──────────────────────────────────────────────────────────
const TREE_CONFIGS = [
  {
    position: [-1.0, 0.5, 1.4],
    trunkHeight: 1.1,
    trunkRadiusBase: 0.11,
    trunkRadiusTop: 0.065,
    branches: [
      { dir: new THREE.Vector3(0.55, 0.8, 0.3).normalize(), len: 0.7, r0: 0.055, r1: 0.028 },
      { dir: new THREE.Vector3(-0.5, 0.9, -0.2).normalize(), len: 0.65, r0: 0.05, r1: 0.025 },
      { dir: new THREE.Vector3(0.1, 1.0, 0.6).normalize(), len: 0.55, r0: 0.045, r1: 0.022 },
    ],
    blossomColor: '#FFB8D1',
    blossomCount: [6, 5, 5],
    blossomRadius: [0.32, 0.28, 0.26],
    swayPhase: 0.0,
    scale: 1.05,
  },
  {
    position: [1.6, 0.5, -0.4],
    trunkHeight: 0.95,
    trunkRadiusBase: 0.095,
    trunkRadiusTop: 0.055,
    branches: [
      { dir: new THREE.Vector3(0.6, 0.7, 0.2).normalize(), len: 0.6, r0: 0.048, r1: 0.023 },
      { dir: new THREE.Vector3(-0.4, 0.85, 0.4).normalize(), len: 0.5, r0: 0.042, r1: 0.02 },
      { dir: new THREE.Vector3(0.0, 0.95, -0.5).normalize(), len: 0.55, r0: 0.044, r1: 0.021 },
      { dir: new THREE.Vector3(-0.5, 0.75, -0.3).normalize(), len: 0.48, r0: 0.04, r1: 0.019 },
    ],
    blossomColor: '#FFA5BD',
    blossomCount: [5, 5, 5, 4],
    blossomRadius: [0.28, 0.26, 0.27, 0.24],
    swayPhase: 1.5,
    scale: 0.9,
  },
  {
    position: [-1.9, 0.5, -1.2],
    trunkHeight: 1.25,
    trunkRadiusBase: 0.13,
    trunkRadiusTop: 0.075,
    branches: [
      { dir: new THREE.Vector3(0.45, 0.85, 0.35).normalize(), len: 0.8, r0: 0.062, r1: 0.03 },
      { dir: new THREE.Vector3(-0.55, 0.82, -0.25).normalize(), len: 0.72, r0: 0.058, r1: 0.028 },
      { dir: new THREE.Vector3(0.15, 0.92, -0.55).normalize(), len: 0.65, r0: 0.052, r1: 0.025 },
      { dir: new THREE.Vector3(-0.2, 0.78, 0.6).normalize(), len: 0.6, r0: 0.048, r1: 0.023 },
      { dir: new THREE.Vector3(0.55, 0.7, -0.4).normalize(), len: 0.58, r0: 0.045, r1: 0.022 },
    ],
    blossomColor: '#FFCBDC',
    blossomCount: [7, 6, 6, 5, 5],
    blossomRadius: [0.34, 0.31, 0.30, 0.28, 0.26],
    swayPhase: 3.0,
    scale: 1.15,
  },
  {
    position: [0.6, 0.5, 2.0],
    trunkHeight: 0.85,
    trunkRadiusBase: 0.085,
    trunkRadiusTop: 0.05,
    branches: [
      { dir: new THREE.Vector3(0.5, 0.78, 0.35).normalize(), len: 0.52, r0: 0.042, r1: 0.02 },
      { dir: new THREE.Vector3(-0.45, 0.88, -0.3).normalize(), len: 0.48, r0: 0.038, r1: 0.018 },
      { dir: new THREE.Vector3(0.0, 0.9, -0.5).normalize(), len: 0.45, r0: 0.036, r1: 0.017 },
    ],
    blossomColor: '#FF9FB6',
    blossomCount: [5, 4, 4],
    blossomRadius: [0.25, 0.23, 0.22],
    swayPhase: 4.2,
    scale: 0.8,
  },
];

// ─── Single tree ──────────────────────────────────────────────────────────────
function CherryTree({ config }) {
  const { position, trunkHeight, trunkRadiusBase, trunkRadiusTop,
    branches, blossomColor, blossomCount, blossomRadius,
    swayPhase, scale } = config;

  const groupRef = useRef();
  const canopyRef = useRef();
  const wind = useWind();

  const barkMat = useMemo(() => makeBarkMat(), []);

  // Trunk start/end
  const trunkStart = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const trunkEnd = useMemo(() => new THREE.Vector3(0, trunkHeight, 0), [trunkHeight]);

  // Branch endpoints from trunk top
  const branchData = useMemo(() => branches.map(b => ({
    ...b,
    start: new THREE.Vector3(0, trunkHeight * 0.75, 0),
    end: new THREE.Vector3(
      b.dir.x * b.len,
      trunkHeight * 0.75 + b.dir.y * b.len,
      b.dir.z * b.len
    ),
  })), [branches, trunkHeight]);

  // Canopy tip positions (branch ends) for petal spawn
  const canopyTips = useMemo(() => branchData.map(b => [b.end.x, b.end.y, b.end.z]), [branchData]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const w = wind?.current;
    const s = w?.strength ?? 0;
    const windZ = s * 0.05 * (w?.dirX ?? 0);
    const windX = s * 0.05 * (w?.dirZ ?? 0);
    // Trunk sways gently
    groupRef.current.rotation.z = Math.sin(t * 0.65 + swayPhase) * 0.025 + windZ;
    groupRef.current.rotation.x = windX * 0.5;

    // Canopy tips lag more — extra multiplier
    if (canopyRef.current) {
      canopyRef.current.rotation.z = Math.sin(t * 0.9 + swayPhase + 0.4) * 0.045 + windZ * 0.6;
      canopyRef.current.rotation.x = windX * 0.35;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <BranchMesh
        start={trunkStart}
        end={trunkEnd}
        radiusStart={trunkRadiusBase}
        radiusEnd={trunkRadiusTop}
        barkMat={barkMat}
        segments={8}
      />
      {/* Main branches */}
      {branchData.map((b, i) => (
        <BranchMesh
          key={i}
          start={b.start}
          end={b.end}
          radiusStart={b.r0}
          radiusEnd={b.r1}
          barkMat={barkMat}
          segments={6}
        />
      ))}
      {/* Canopy — extra sway group */}
      <group ref={canopyRef}>
        {branchData.map((b, i) => (
          <BlossomCluster
            key={i}
            position={[b.end.x, b.end.y, b.end.z]}
            count={blossomCount[i]}
            baseRadius={blossomRadius[i]}
            baseColor={blossomColor}
            seed={i * 73 + swayPhase * 100}
          />
        ))}
        {/* Falling petals */}
        <FallingPetals canopyTips={canopyTips} count={13} />
      </group>
    </group>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function CherryBlossoms() {
  return (
    <group>
      {TREE_CONFIGS.map((config, i) => (
        <CherryTree key={i} config={config} />
      ))}
    </group>
  );
}
