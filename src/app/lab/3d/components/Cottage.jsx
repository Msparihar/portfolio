'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWind } from './WindContext';

// ─── Shader sources ───────────────────────────────────────────────────────────

const baseVert = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const woodFrag = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uPlankCount;
  uniform float uSeed;

  float hash(float n) { return fract(sin(n * 127.1 + uSeed) * 43758.5453); }

  void main() {
    float plank = floor(vUv.x * uPlankCount);
    float jitter = hash(plank) * 0.18 - 0.09;
    vec3 col = mix(uColorA, uColorB, hash(plank + 7.3) + jitter);
    float seam = fract(vUv.x * uPlankCount);
    float ao = smoothstep(0.0, 0.06, seam) * smoothstep(1.0, 0.94, seam);
    col *= (0.78 + 0.22 * ao);
    float grain = sin(vUv.y * 120.0 + hash(plank) * 60.0) * 0.03;
    col += grain;
    float ndl = dot(vNormal, normalize(vec3(1.0, 1.5, 0.8))) * 0.5 + 0.5;
    col *= (0.7 + 0.3 * ndl);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const stoneFrag = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;

  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 uv = vUv * vec2(4.0, 2.5);
    vec2 cell = floor(uv);
    float h = hash2(cell);
    vec3 stone = mix(vec3(0.52, 0.48, 0.44), vec3(0.72, 0.68, 0.62), h);
    vec2 f = fract(uv);
    float grout = smoothstep(0.0, 0.08, f.x) * smoothstep(1.0, 0.92, f.x)
                * smoothstep(0.0, 0.10, f.y) * smoothstep(1.0, 0.90, f.y);
    stone *= (0.65 + 0.35 * grout);
    gl_FragColor = vec4(stone, 1.0);
  }
`;

const roofFrag = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;

  float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

  void main() {
    float row = floor(vUv.y * 10.0);
    float rowPos = fract(vUv.y * 10.0);
    float col = floor(vUv.x * 8.0 + row * 0.5);
    vec3 base = mix(vec3(0.42, 0.22, 0.12), vec3(0.58, 0.30, 0.16), hash(row * 13.0 + col));
    float mossAmt = smoothstep(0.55, 0.95, vUv.y) * 0.45;
    vec3 moss = vec3(0.27, 0.40, 0.18);
    base = mix(base, moss, mossAmt * hash(col + 3.1));
    float edgeAO = smoothstep(0.0, 0.12, rowPos) * smoothstep(1.0, 0.88, rowPos);
    base *= (0.72 + 0.28 * edgeAO);
    float ndl = dot(normalize(vNormal), normalize(vec3(1.0, 2.0, 0.5))) * 0.5 + 0.5;
    base *= (0.65 + 0.35 * ndl);
    gl_FragColor = vec4(base, 1.0);
  }
`;

// ─── Material factories ───────────────────────────────────────────────────────

function makeWoodMat(seed = 3.71) {
  return new THREE.ShaderMaterial({
    vertexShader: baseVert,
    fragmentShader: woodFrag,
    uniforms: {
      uColorA: { value: new THREE.Color('#A0652A') },
      uColorB: { value: new THREE.Color('#7A4A1E') },
      uPlankCount: { value: 9.0 },
      uSeed: { value: seed },
    },
  });
}

function makeStoneMat() {
  return new THREE.ShaderMaterial({
    vertexShader: baseVert,
    fragmentShader: stoneFrag,
  });
}

function makeRoofMat() {
  return new THREE.ShaderMaterial({
    vertexShader: baseVert,
    fragmentShader: roofFrag,
  });
}

// ─── Smoke particles ──────────────────────────────────────────────────────────
function ChimneySmoke() {
  const count = 18;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const ref = useRef(null);
  const wind = useWind();

  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      phase: (i / count) * Math.PI * 2,
      speed: 0.18 + (i * 0.007),
      drift: ((i % 3) - 1) * 0.03,
      startScale: 0.018 + (i % 5) * 0.004,
    })), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const w = wind?.current ?? { dirX: 1, dirZ: 0.4, strength: 0.4 };

    particles.forEach((p, i) => {
      const life = ((t * p.speed + p.phase / (Math.PI * 2)) % 1.0);
      const y = life * 0.9;
      const windX = w.dirX * w.strength * life * 0.12;
      const windZ = w.dirZ * w.strength * life * 0.08;
      const curl = Math.sin(t * 1.2 + p.phase) * 0.04 * life;

      dummy.position.set(windX + curl + p.drift, y + 0.06, windZ + p.drift * 0.5);
      const s = p.startScale * (1.0 + life * 3.5);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);

      const opacity = (1.0 - life) * (1.0 - life) * 0.55 + 0.45;
      ref.current.setColorAt(i, new THREE.Color(opacity, opacity, opacity + 0.02));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, count]} position={[0.25, 1.12, -0.10]}>
      <sphereGeometry args={[1, 6, 4]} />
      <meshStandardMaterial
        transparent
        opacity={0.38}
        depthWrite={false}
        roughness={1}
        metalness={0}
        vertexColors
      />
    </instancedMesh>
  );
}

// ─── Hanging vine ─────────────────────────────────────────────────────────────
function HangingVine() {
  const wind = useWind();
  const ref = useRef(null);

  const { tubeGeo, leafPositions } = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push(new THREE.Vector3(t * 0.08, -t * 0.55 + Math.sin(t * Math.PI) * 0.05, t * 0.04));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const leafPos = [];
    for (let i = 2; i <= 11; i++) {
      leafPos.push(curve.getPoint(i / 12));
    }
    return { tubeGeo: new THREE.TubeGeometry(curve, 12, 0.008, 4, false), leafPositions: leafPos };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const w = wind?.current ?? { strength: 0.4 };
    ref.current.rotation.z = Math.sin(t * 0.8) * 0.04 * w.strength;
  });

  return (
    <group ref={ref} position={[-0.46, 0.82, 0.39]}>
      <mesh geometry={tubeGeo}>
        <meshLambertMaterial color="#3A5C2A" />
      </mesh>
      {leafPositions.map((pt, i) => (
        <mesh
          key={i}
          position={[pt.x + (i % 2 === 0 ? 0.025 : -0.025), pt.y, pt.z]}
          rotation={[0, 0, i % 2 === 0 ? 0.4 : -0.4]}
        >
          <sphereGeometry args={[0.018, 4, 3]} />
          <meshLambertMaterial color={i % 3 === 0 ? '#4A7A32' : '#3D6828'} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Window pane helper ───────────────────────────────────────────────────────
function WindowPane({ position, w = 0.19, h = 0.19 }) {
  return (
    <group position={position}>
      {/* Frame (behind glass) */}
      <mesh position={[0, 0, -0.004]}>
        <boxGeometry args={[w + 0.028, h + 0.028, 0.022]} />
        <meshLambertMaterial color="#4A2E10" />
      </mesh>
      {/* Glass glow */}
      <mesh>
        <boxGeometry args={[w, h, 0.025]} />
        <meshStandardMaterial
          color="#FFD070"
          emissive="#FFC060"
          emissiveIntensity={1.8}
          roughness={0.2}
          metalness={0}
        />
      </mesh>
      {/* Horizontal divider */}
      <mesh position={[0, 0, 0.014]}>
        <boxGeometry args={[w * 0.94, 0.013, 0.01]} />
        <meshLambertMaterial color="#5C3A1A" />
      </mesh>
      {/* Vertical divider */}
      <mesh position={[0, 0, 0.014]}>
        <boxGeometry args={[0.013, h * 0.94, 0.01]} />
        <meshLambertMaterial color="#5C3A1A" />
      </mesh>
    </group>
  );
}

// ─── Main Cottage ─────────────────────────────────────────────────────────────
export function Cottage() {
  const matFront  = useMemo(() => makeWoodMat(3.71), []);
  const matBack   = useMemo(() => makeWoodMat(7.13), []);
  const matLeft   = useMemo(() => makeWoodMat(1.57), []);
  const matRight  = useMemo(() => makeWoodMat(5.27), []);
  const stoneMatA = useMemo(() => makeStoneMat(), []);
  const stoneMatB = useMemo(() => makeStoneMat(), []);
  // 5 separate instances — one per roof tier (primitives can't share owners)
  const roofMats  = useMemo(() => Array.from({ length: 5 }, () => makeRoofMat()), []);

  const tileRows = 5;
  const roofTiles = useMemo(() => {
    const W = 1.18;
    const D = 1.02;
    return Array.from({ length: tileRows }, (_, i) => {
      const t = i / (tileRows - 1);
      return {
        w: W * (1.0 - t * 0.82),
        d: D * (1.0 - t * 0.82),
        y: 0.82 + t * 0.42,
        t,
      };
    });
  }, []);

  return (
    <group position={[-1.6, 0.65, -0.4]} rotation={[0, 0.4, 0]}>

      {/* ── Stone foundation ─────────────────────────────── */}
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[1.02, 0.14, 0.88]} />
        <primitive object={stoneMatA} attach="material" />
      </mesh>

      {/* ── Wall fill (interior) ──────────────────────────── */}
      <mesh position={[0, 0.41, 0]} receiveShadow>
        <boxGeometry args={[0.90, 0.74, 0.76]} />
        <meshLambertMaterial color="#7A4A1E" />
      </mesh>

      {/* ── Walls (wood plank shader, one per face) ───────── */}
      <mesh position={[0, 0.41, 0.39]} castShadow receiveShadow>
        <boxGeometry args={[0.94, 0.76, 0.02]} />
        <primitive object={matFront} attach="material" />
      </mesh>
      <mesh position={[0, 0.41, -0.39]} castShadow receiveShadow>
        <boxGeometry args={[0.94, 0.76, 0.02]} />
        <primitive object={matBack} attach="material" />
      </mesh>
      <mesh position={[-0.46, 0.41, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.02, 0.76, 0.78]} />
        <primitive object={matLeft} attach="material" />
      </mesh>
      <mesh position={[0.46, 0.41, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.02, 0.76, 0.78]} />
        <primitive object={matRight} attach="material" />
      </mesh>

      {/* ── Eave overhang ────────────────────────────────── */}
      <mesh position={[0, 0.80, 0]} castShadow>
        <boxGeometry args={[1.10, 0.045, 0.96]} />
        <meshLambertMaterial color="#5C3820" />
      </mesh>

      {/* ── Tiled roof tiers ──────────────────────────────── */}
      {roofTiles.map(({ w, d, y, t }, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <boxGeometry args={[w, 0.055 + t * 0.03, d]} />
          <primitive object={roofMats[i]} attach="material" />
        </mesh>
      ))}

      {/* Ridge cap */}
      <mesh position={[0, 1.26, 0]} castShadow>
        <boxGeometry args={[0.18, 0.06, 0.92]} />
        <meshLambertMaterial color="#4A2810" />
      </mesh>

      {/* ── Windows ──────────────────────────────────────── */}
      <WindowPane position={[-0.29, 0.46, 0.402]} />
      <WindowPane position={[0.29, 0.46, 0.402]} />
      <WindowPane position={[0, 0.44, -0.402]} w={0.16} h={0.15} />

      {/* ── Door ─────────────────────────────────────────── */}
      {/* Frame */}
      <mesh position={[0, 0.21, 0.399]}>
        <boxGeometry args={[0.25, 0.44, 0.012]} />
        <meshLambertMaterial color="#3A1E08" />
      </mesh>
      {/* Panel */}
      <mesh position={[0, 0.20, 0.402]}>
        <boxGeometry args={[0.21, 0.38, 0.018]} />
        <meshLambertMaterial color="#4A2C10" />
      </mesh>
      {/* Arch top */}
      <mesh position={[0, 0.395, 0.403]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.018, 12, 1, false, 0, Math.PI]} />
        <meshLambertMaterial color="#4A2C10" />
      </mesh>
      {/* Brass knob */}
      <mesh position={[0.085, 0.22, 0.415]}>
        <sphereGeometry args={[0.012, 6, 4]} />
        <meshStandardMaterial
          color="#C8A040"
          emissive="#A07820"
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* ── Chimney ───────────────────────────────────────── */}
      <mesh position={[0.25, 1.06, -0.10]} castShadow>
        <cylinderGeometry args={[0.065, 0.072, 0.40, 8]} />
        <primitive object={stoneMatB} attach="material" />
      </mesh>
      {/* Chimney cap */}
      <mesh position={[0.25, 1.27, -0.10]}>
        <cylinderGeometry args={[0.082, 0.065, 0.04, 8]} />
        <meshLambertMaterial color="#444038" />
      </mesh>

      {/* ── Smoke ─────────────────────────────────────────── */}
      <ChimneySmoke />

      {/* ── Vine ──────────────────────────────────────────── */}
      <HangingVine />

    </group>
  );
}
