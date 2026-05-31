'use client';

// Grass shader technique adapted from Nitash Biswas (github.com/NitashEU/grass-shader-glsl)
// Instanced grass blades with Perlin-noise wind, tip-to-base color gradient,
// per-instance color variation, fake AO at base, and per-blade wind phase offset.
// Adapted for a circular floating island top.

import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useWind } from './WindContext';

const GRASS_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uWindStrength;
  uniform float uWindDirX;
  uniform float uWindDirZ;

  attribute float aPhaseOffset;   // per-instance random phase
  attribute vec3  aColorVariant;  // per-instance color shift

  varying float vElevation;
  varying vec3  vColorVariant;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  vec4 permute4(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec2 fade2(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
  float cnoise(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0);
    vec4 ix = Pi.xzxz, iy = Pi.yyww;
    vec4 fx = Pf.xzxz, fy = Pf.yyww;
    vec4 i = permute4(permute4(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0;
    vec4 gy = abs(gx) - 0.5;
    gx -= floor(gx + 0.5);
    vec2 g00 = vec2(gx.x, gy.x), g10 = vec2(gx.y, gy.y);
    vec2 g01 = vec2(gx.z, gy.z), g11 = vec2(gx.w, gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 *
      vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11));
    g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade2(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
  }

  void main() {
    vec3 bladeRoot = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
    float h = hash(bladeRoot.xz);

    // position.y is 0..1 (base to tip)
    float t = clamp(position.y, 0.0, 1.0);

    // Low-freq noise wind field
    float wave = cnoise(bladeRoot.xz * 0.4 + vec2(uTime * 0.55, 0.0));
    // High-freq per-blade tip oscillation
    float tipSway = sin(uTime * 1.5 + bladeRoot.x * 2.0 + aPhaseOffset) * 0.18;
    float gustSway = sin(uTime * 0.7 + aPhaseOffset * 1.3) * 0.07 * uWindStrength;

    float bend = (wave * uWindStrength * 0.8 + tipSway + gustSway) * t * t; // quadratic weight

    vec3 pos = position;
    pos.x += bend * uWindDirX;
    pos.z += bend * uWindDirZ;

    // natural lean per blade (in wind direction)
    float lean = mix(0.06, 0.22, h);
    pos.x += lean * uWindDirX * t * t;
    pos.z += lean * uWindDirZ * t * t;

    vElevation = t;
    vColorVariant = aColorVariant;

    vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const GRASS_FRAG = /* glsl */ `
  uniform vec3 uBaseColor;   // dark green #3a6b1a
  uniform vec3 uMidColor;    // mid green #5a9a2a
  uniform vec3 uTipColor;    // bright tip #90cc40

  varying float vElevation;
  varying vec3  vColorVariant;

  void main() {
    // 3-stop gradient: base → mid → tip
    vec3 color;
    if (vElevation < 0.45) {
      color = mix(uBaseColor, uMidColor, vElevation / 0.45);
    } else {
      color = mix(uMidColor, uTipColor, (vElevation - 0.45) / 0.55);
    }

    // Per-instance color shift (some bluer, some yellower, some darker)
    color += vColorVariant;

    // Fake AO: darken bottom 20% significantly
    float ao = smoothstep(0.0, 0.22, vElevation) * 0.45 + 0.55;
    color *= ao;

    // Clamp to avoid blown-out colors
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function buildBladeGeometry(segments = 5) {
  const positions = [];
  const uvs = [];
  const halfW = 0.038;
  const taper = 0.006;

  for (let i = 0; i < segments - 1; i++) {
    const y0 = i / segments;
    const y1 = (i + 1) / segments;
    const w0 = halfW - taper * i;
    const w1 = halfW - taper * (i + 1);

    // Two triangles per segment
    positions.push(
      -w0, y0, 0,   w0, y0, 0,   -w1, y1, 0,
      -w1, y1, 0,   w0, y0, 0,    w1, y1, 0,
    );
    // UV: x = 0..1 (left to right), y = elevation
    uvs.push(
      0, y0,   1, y0,   0, y1,
      0, y1,   1, y0,   1, y1,
    );
  }
  // Tip triangle
  const lastY = (segments - 1) / segments;
  const lastW = halfW - taper * (segments - 1);
  positions.push(-lastW, lastY, 0,  lastW, lastY, 0,  0, 1, 0);
  uvs.push(0, lastY,  1, lastY,  0.5, 1.0);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
  return geo;
}

// Color variant table: some blades lean blue-green, some warm yellow, some muted
const COLOR_VARIANTS = [
  [0.0, 0.05, -0.02],   // greener
  [-0.02, 0.03, 0.02],  // bluer
  [0.04, 0.02, -0.04],  // yellower-warm
  [-0.03, -0.02, 0.0],  // darker
  [0.02, 0.06, -0.01],  // bright fresh
  [0.0, -0.03, 0.03],   // cooler
];

export function GrassField({ count = 12000, radius = 2.75, yBase = 0.5 }) {
  const meshRef = useRef();
  const wind = useWind();

  const geo = useMemo(() => buildBladeGeometry(5), []);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: GRASS_VERT,
    fragmentShader: GRASS_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uWindStrength: { value: 0.5 },
      uWindDirX: { value: 1.0 },
      uWindDirZ: { value: 0.4 },
      uBaseColor: { value: new THREE.Color('#3a6b1a') },
      uMidColor: { value: new THREE.Color('#5a9a2a') },
      uTipColor: { value: new THREE.Color('#90cc40') },
    },
    side: THREE.DoubleSide,
  }), []);

  // Precompute blade positions + per-instance attributes once
  const { matrices, phaseOffsets, colorVariants } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const mats = [];
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      let x, z;
      do {
        x = (Math.random() - 0.5) * 2 * radius;
        z = (Math.random() - 0.5) * 2 * radius;
      } while (x * x + z * z > radius * radius);

      dummy.position.set(x, yBase, z);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      const s = 0.14 + Math.random() * 0.09;
      const h = 0.16 + Math.random() * 0.13;
      dummy.scale.set(s, h, s);
      dummy.updateMatrix();
      const m = new THREE.Matrix4();
      m.copy(dummy.matrix);
      mats.push(m);

      // Per-instance wind phase offset for tip variation
      phases[i] = Math.random() * Math.PI * 2;

      // Per-instance color variant
      const v = COLOR_VARIANTS[i % COLOR_VARIANTS.length];
      colors[i * 3 + 0] = v[0];
      colors[i * 3 + 1] = v[1];
      colors[i * 3 + 2] = v[2];
    }
    return {
      matrices: mats,
      phaseOffsets: phases,
      colorVariants: colors,
    };
  }, [count, radius, yBase]);

  // Apply matrices and per-instance attributes after mount
  useEffect(() => {
    if (!meshRef.current) return;

    matrices.forEach((m, i) => {
      meshRef.current.setMatrixAt(i, m);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Add per-instance attributes
    const mesh = meshRef.current;
    mesh.geometry.setAttribute(
      'aPhaseOffset',
      new THREE.InstancedBufferAttribute(phaseOffsets, 1)
    );
    mesh.geometry.setAttribute(
      'aColorVariant',
      new THREE.InstancedBufferAttribute(colorVariants, 3)
    );
  }, [matrices, phaseOffsets, colorVariants]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    mat.uniforms.uTime.value = t;

    const w = wind?.current;
    if (w) {
      mat.uniforms.uWindStrength.value = w.strength;
      mat.uniforms.uWindDirX.value = w.dirX;
      mat.uniforms.uWindDirZ.value = w.dirZ;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geo, mat, count]}
      frustumCulled={false}
    />
  );
}
