'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWind } from './WindContext';

// ─── Shader sources ───────────────────────────────────────────────────────────

const flameVert = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453); }
  float noise(float x) {
    float i = floor(x); float f = fract(x);
    return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f));
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    float sway  = sin(uv.y * 5.0 + uTime * 3.8) * 0.035 * uv.y;
    float sway2 = cos(uv.y * 3.2 + uTime * 2.5 + 1.1) * 0.025 * uv.y;
    float ns    = noise(uv.y * 8.0 + uTime * 2.0) * 0.03 * uv.y;
    pos.x += sway + ns;
    pos.z += sway2;

    float taper = 1.0 - uv.y * 0.55;
    pos.x *= taper;
    pos.z *= taper;

    float base = smoothstep(0.0, 0.18, uv.y) * (1.0 - smoothstep(0.18, 0.5, uv.y));
    pos.x *= (1.0 - base * 0.15);
    pos.z *= (1.0 - base * 0.15);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const flameFrag = /* glsl */`
  varying vec2 vUv;

  void main() {
    float h = vUv.y;
    vec3 cOuter = vec3(0.85, 0.18, 0.04);
    vec3 cMid   = vec3(1.00, 0.52, 0.08);
    vec3 cInner = vec3(0.92, 0.82, 0.20);
    vec3 cCore  = vec3(1.00, 0.98, 0.90);

    vec3 col;
    if (h < 0.15)      col = mix(cOuter, cMid,   h / 0.15);
    else if (h < 0.45) col = mix(cMid,   cInner, (h - 0.15) / 0.30);
    else               col = mix(cInner, cCore,  (h - 0.45) / 0.55);

    // Blue-white hot core at base
    float coreBlue = smoothstep(0.18, 0.0, h) * 0.5;
    col = mix(col, vec3(0.75, 0.85, 1.0), coreBlue);

    float alpha = (1.0 - h * h) * smoothstep(0.0, 0.08, h);
    float radial = 1.0 - length(vec2(vUv.x - 0.5, 0.0)) * 2.2;
    alpha *= clamp(radial + 0.35, 0.0, 1.0) * 0.90;

    gl_FragColor = vec4(col, alpha);
  }
`;

const barkVert = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const barkFrag = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;

  float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
  float fbm(float x) {
    float v = 0.0; float a = 0.5; float shift = 100.0;
    for (int i = 0; i < 4; i++) {
      v += a * (sin(x * 3.14159) * 0.5 + 0.5);
      x = x * 2.1 + shift; a *= 0.5;
    }
    return v;
  }

  void main() {
    float stripe = fbm(vUv.x * 18.0 + hash(floor(vUv.y * 6.0)) * 10.0);
    vec3 dark = vec3(0.22, 0.14, 0.08);
    vec3 light = vec3(0.48, 0.32, 0.18);
    vec3 col = mix(dark, light, stripe * 0.85);
    float ndl = dot(normalize(vNormal), normalize(vec3(1.0, 2.0, 1.0))) * 0.5 + 0.5;
    col *= (0.6 + 0.4 * ndl);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const stoneVert = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const stoneFrag = /* glsl */`
  varying vec2 vUv;
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 uv = vUv * vec2(3.0, 1.5);
    vec2 cell = floor(uv);
    float h = hash2(cell);
    vec3 stone = mix(vec3(0.38, 0.35, 0.31), vec3(0.60, 0.55, 0.48), h);
    vec2 f = fract(uv);
    float grout = smoothstep(0.0, 0.09, f.x) * smoothstep(1.0, 0.91, f.x)
                * smoothstep(0.0, 0.12, f.y) * smoothstep(1.0, 0.88, f.y);
    stone *= (0.55 + 0.45 * grout);
    gl_FragColor = vec4(stone, 1.0);
  }
`;

// ─── Material factories (one instance per call) ───────────────────────────────
function makeBarkMat() {
  return new THREE.ShaderMaterial({ vertexShader: barkVert, fragmentShader: barkFrag });
}
function makeStoneMat() {
  return new THREE.ShaderMaterial({ vertexShader: stoneVert, fragmentShader: stoneFrag });
}
function makeFlameMat(timeRef) {
  return new THREE.ShaderMaterial({
    vertexShader: flameVert,
    fragmentShader: flameFrag,
    uniforms: { uTime: timeRef },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

// ─── Logs ─────────────────────────────────────────────────────────────────────
function Logs() {
  // Create 4 independent material instances so each mesh owns one
  const mats = useMemo(() => [makeBarkMat(), makeBarkMat(), makeBarkMat(), makeBarkMat()], []);

  const configs = useMemo(() => [
    { pos: [0, 0.028, 0],  rot: [Math.PI * 0.08,  0.0,             0], r: [0.024, 0.021] },
    { pos: [0, 0.028, 0],  rot: [Math.PI * 0.08,  Math.PI * 0.5,   0], r: [0.022, 0.020] },
    { pos: [0, 0.028, 0],  rot: [Math.PI * 0.09,  Math.PI * 0.25,  0], r: [0.020, 0.018] },
    { pos: [0, 0.028, 0],  rot: [Math.PI * 0.09,  Math.PI * 0.75,  0], r: [0.021, 0.019] },
  ], []);

  return (
    <>
      {configs.map(({ pos, rot, r }, i) => (
        <mesh key={i} position={pos} rotation={rot} castShadow>
          <cylinderGeometry args={[r[0], r[1], 0.30, 7]} />
          <primitive object={mats[i]} attach="material" />
        </mesh>
      ))}
    </>
  );
}

// ─── Stone ring ───────────────────────────────────────────────────────────────
function StoneRing() {
  const stoneCount = 8;
  const mats = useMemo(() => Array.from({ length: stoneCount }, () => makeStoneMat()), []);

  const stones = useMemo(() =>
    Array.from({ length: stoneCount }, (_, i) => {
      const angle = (i / stoneCount) * Math.PI * 2;
      const r = 0.115 + (i % 3) * 0.006;
      return {
        x:  Math.cos(angle) * r,
        z:  Math.sin(angle) * r,
        ry: angle + (i % 2) * 0.4,
        sx: 0.038 + (i % 4) * 0.004,
        sy: 0.022 + (i % 3) * 0.005,
        sz: 0.030 + (i % 5) * 0.003,
      };
    }), []);

  return (
    <>
      {stones.map((s, i) => (
        <mesh key={i} position={[s.x, 0.012, s.z]} rotation={[0, s.ry, 0]} castShadow receiveShadow>
          <boxGeometry args={[s.sx, s.sy, s.sz]} />
          <primitive object={mats[i]} attach="material" />
        </mesh>
      ))}
    </>
  );
}

// ─── Ember particles ──────────────────────────────────────────────────────────
function Embers() {
  const count = 38;
  const ref = useRef(null);
  const wind = useWind();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      phase:  (i / count) * Math.PI * 2,
      speed:  0.22 + (i % 7) * 0.026,
      radius: (i % 5) * 0.011,
      angle:  (i / count) * Math.PI * 2 * 3.7,
      size:   0.007 + (i % 4) * 0.003,
    })), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const w = wind?.current ?? { dirX: 1, dirZ: 0, strength: 0.4 };

    particles.forEach((p, i) => {
      const life = ((t * p.speed + p.phase / (Math.PI * 2)) % 1.0);
      const y = life * 0.55;
      const spiral = p.angle + life * 2.0;
      const r = p.radius * (1.0 - life * 0.5);
      const wx = w.dirX * w.strength * life * 0.06;
      const wz = w.dirZ * w.strength * life * 0.04;

      dummy.position.set(Math.cos(spiral) * r + wx, y + 0.08, Math.sin(spiral) * r + wz);
      dummy.scale.setScalar(Math.max(p.size * (1.0 - life * 0.7), 0.001));
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);

      const brightness = (1.0 - life) * 0.9 + 0.1;
      ref.current.setColorAt(i, new THREE.Color(brightness, brightness * 0.35, 0.0));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <sphereGeometry args={[1, 4, 3]} />
      <meshStandardMaterial
        emissive="#FF6600"
        emissiveIntensity={2.5}
        transparent
        opacity={0.9}
        depthWrite={false}
        vertexColors
        toneMapped={false}
      />
    </instancedMesh>
  );
}

// ─── Flame (three additive shader layers) ─────────────────────────────────────
function FireFlame() {
  const timeUniform = useRef({ value: 0 });

  // Each layer needs its own material instance
  const [matA, matB, matC] = useMemo(() => [
    makeFlameMat(timeUniform.current),
    makeFlameMat(timeUniform.current),
    makeFlameMat(timeUniform.current),
  ], []);

  useFrame(({ clock }) => {
    timeUniform.current.value = clock.elapsedTime;
  });

  return (
    <group position={[0, 0.10, 0]}>
      {/* Outer flame envelope */}
      <mesh>
        <sphereGeometry args={[0.10, 10, 12]} />
        <primitive object={matA} attach="material" />
      </mesh>
      {/* Inner core — rotated, narrower */}
      <mesh rotation={[0, Math.PI * 0.3, 0]} scale={[0.62, 0.75, 0.62]}>
        <sphereGeometry args={[0.10, 10, 12]} />
        <primitive object={matB} attach="material" />
      </mesh>
      {/* Third volumetric layer */}
      <mesh rotation={[0, Math.PI * 0.7, 0]} scale={[0.45, 0.55, 0.45]}>
        <sphereGeometry args={[0.10, 10, 12]} />
        <primitive object={matC} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Flickering point light ───────────────────────────────────────────────────
function FlickerLight() {
  const lightRef = useRef(null);

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const t = clock.elapsedTime;
    const flicker = Math.sin(t * 8.3) * 0.10
                  + Math.sin(t * 13.7 + 1.2) * 0.06
                  + Math.sin(t * 4.1 + 2.4) * 0.08;
    lightRef.current.intensity = 2.4 + flicker;
    lightRef.current.color.setRGB(1.0, 0.48 + flicker * 0.08, 0.06 + flicker * 0.04);
  });

  return (
    <pointLight
      ref={lightRef}
      color="#FF8820"
      intensity={2.4}
      distance={4.0}
      decay={2}
      position={[0, 0.22, 0]}
    />
  );
}

// ─── Main Campfire ────────────────────────────────────────────────────────────
export function Campfire({ position = [0.8, 0.52, 1.8] }) {
  return (
    <group position={position}>
      {/* Ground char disc */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.16, 20]} />
        <meshLambertMaterial color="#1A1208" transparent opacity={0.72} depthWrite={false} />
      </mesh>

      {/* Stone ring */}
      <StoneRing />

      {/* Logs */}
      <Logs />

      {/* Flame */}
      <FireFlame />

      {/* Embers */}
      <Embers />

      {/* Flickering light */}
      <FlickerLight />
    </group>
  );
}
