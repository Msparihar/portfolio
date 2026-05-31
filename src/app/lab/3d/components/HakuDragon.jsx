'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Constants ────────────────────────────────────────────────────────────────
const ORBIT_RADIUS  = 7.5;
const ORBIT_HEIGHT  = 3.8;
const TUBE_RADIAL   = 10;     // radial segments of tube
const BODY_POINTS   = 80;     // points sampled from curve → tube verts
const CURVE_CTRL    = 18;     // CatmullRom control point count
const BODY_RADIUS   = 0.09;   // max tube radius at head
const MIST_COUNT    = 8;

// ─── Iridescent scale shader ─────────────────────────────────────────────────
const SCALE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormal   = normalize(normalMatrix * normal);
    vViewDir  = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SCALE_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
  }

  void main() {
    // Fine scale cell texture
    float scalePat = noise(vUv * vec2(18.0, 40.0));
    float scaleHighlight = smoothstep(0.3, 0.7, scalePat);

    float nDotV  = max(dot(vNormal, vViewDir), 0.0);
    float fresnel = pow(1.0 - nDotV, 2.2);

    // Pearl-white center, cool blue+green iridescence at edges
    vec3 pearlCenter = vec3(0.92, 0.95, 0.98);
    vec3 blueEdge    = vec3(0.45, 0.75, 1.00);
    vec3 greenSheen  = vec3(0.55, 0.95, 0.78);

    float iriAngle = abs(sin(fresnel * 3.14159 + uTime * 0.2));
    vec3 iridescent = mix(blueEdge, greenSheen, iriAngle);

    vec3 col = mix(pearlCenter, iridescent, fresnel * 0.75);
    col += vec3(0.08) * scaleHighlight * (1.0 - fresnel);

    // Head end glows slightly (vUv.y ~0 = head end of tube)
    col += blueEdge * (1.0 - smoothstep(0.0, 0.15, vUv.y)) * 0.18;

    // Tail end fades out
    float alpha = mix(0.95, 0.18, smoothstep(0.75, 1.0, vUv.y));

    gl_FragColor = vec4(col, alpha);
  }
`;

// ─── Build static tube geometry we'll update in-place each frame ───────────
function makeTubeGeo(points, radii) {
  // Manually build a tube-like BufferGeometry from centerline points + per-point radii
  // so we can update positions without dispose/recreate.
  const N     = points.length;
  const SEGS  = TUBE_RADIAL;
  const verts = [];
  const uvArr = [];
  const idxArr = [];

  for (let i = 0; i < N; i++) {
    const pt  = points[i];
    const r   = radii[i];
    // Compute tangent
    const prev = points[Math.max(i - 1, 0)];
    const next = points[Math.min(i + 1, N - 1)];
    const tan  = new THREE.Vector3().subVectors(next, prev).normalize();
    // Build a frame (up heuristic)
    const up   = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(tan, up).normalize();
    const norm = new THREE.Vector3().crossVectors(side, tan).normalize();

    for (let j = 0; j <= SEGS; j++) {
      const a = (j / SEGS) * Math.PI * 2;
      const cx = Math.cos(a) * side.x + Math.sin(a) * norm.x;
      const cy = Math.cos(a) * side.y + Math.sin(a) * norm.y;
      const cz = Math.cos(a) * side.z + Math.sin(a) * norm.z;
      verts.push(pt.x + cx * r, pt.y + cy * r, pt.z + cz * r);
      uvArr.push(j / SEGS, i / (N - 1));
    }
  }

  for (let i = 0; i < N - 1; i++) {
    for (let j = 0; j < SEGS; j++) {
      const a = i * (SEGS + 1) + j;
      const b = a + 1;
      const c = a + (SEGS + 1);
      const d = c + 1;
      idxArr.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
  geo.setAttribute('uv',       new THREE.BufferAttribute(new Float32Array(uvArr), 2));
  geo.setIndex(idxArr);
  geo.computeVertexNormals();
  return geo;
}

// ─── Trailing mist ────────────────────────────────────────────────────────────
function TrailingMist({ tailHistRef }) {
  const mistRefs = useRef([]);
  const mistMats = useRef([]);

  useFrame(() => {
    const hist = tailHistRef.current;
    mistRefs.current.forEach((m, i) => {
      if (!m) return;
      const idx = Math.min(i * 3 + 4, hist.length - 1);
      const s   = hist[idx];
      if (!s) return;
      m.position.set(
        s[0] + Math.sin(i * 1.7) * 0.15,
        s[1] - i * 0.05,
        s[2] + Math.cos(i * 1.3) * 0.15,
      );
      const fade = 1 - i / MIST_COUNT;
      if (mistMats.current[i]) mistMats.current[i].opacity = fade * 0.28;
      m.scale.setScalar(Math.max(0.12 - i * 0.012, 0.03));
    });
  });

  return (
    <>
      {Array.from({ length: MIST_COUNT }).map((_, i) => (
        <mesh key={i} ref={(el) => { mistRefs.current[i] = el; }}>
          <sphereGeometry args={[1, 6, 5]} />
          <meshBasicMaterial
            ref={(el) => { mistMats.current[i] = el; }}
            color="#C8E8FF"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Animated whisker ─────────────────────────────────────────────────────────
function Whisker({ side }) {
  const lineRef = useRef();
  const sign    = side === 'left' ? -1 : 1;
  const phaseOff = side === 'left' ? 0 : Math.PI;

  const initPositions = useMemo(() => {
    const pts = [
      new THREE.Vector3(sign * 0.04,  0,     0),
      new THREE.Vector3(sign * 0.22,  0.04, -0.12),
      new THREE.Vector3(sign * 0.38, -0.02, -0.28),
      new THREE.Vector3(sign * 0.50,  0.06, -0.45),
    ];
    const curve   = new THREE.CatmullRomCurve3(pts);
    const samples = curve.getPoints(12);
    const arr     = new Float32Array(samples.length * 3);
    samples.forEach((p, i) => { arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z; });
    return { arr, count: samples.length };
  }, [sign]);

  useFrame((state) => {
    if (!lineRef.current) return;
    const t  = state.clock.elapsedTime;
    const ph = phaseOff;
    const pts = [
      new THREE.Vector3(sign * 0.04, 0, 0),
      new THREE.Vector3(
        sign * 0.22 + Math.sin(t * 1.5 + ph) * 0.03,
        0.04 + Math.sin(t * 1.2 + ph) * 0.02,
        -0.12,
      ),
      new THREE.Vector3(
        sign * 0.38 + Math.sin(t * 1.5 + ph + 0.4) * 0.06,
        -0.02 + Math.sin(t * 1.2 + ph + 0.4) * 0.04,
        -0.28,
      ),
      new THREE.Vector3(
        sign * 0.50 + Math.sin(t * 1.5 + ph + 0.8) * 0.09,
        0.06 + Math.sin(t * 1.2 + ph + 0.8) * 0.06,
        -0.45,
      ),
    ];
    const curve   = new THREE.CatmullRomCurve3(pts);
    const samples = curve.getPoints(12);
    const attr    = lineRef.current.geometry.attributes.position;
    samples.forEach((p, i) => { attr.setXYZ(i, p.x, p.y, p.z); });
    attr.needsUpdate = true;
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={initPositions.arr}
          count={initPositions.count}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#C8D8F0" transparent opacity={0.7} />
    </line>
  );
}

// ─── HakuDragon ───────────────────────────────────────────────────────────────
export function HakuDragon() {
  const meshRef   = useRef();
  const headRef   = useRef();
  const histRef   = useRef([]);     // head world-position history
  const tailHistRef = useRef([]);

  // Control points updated each frame
  const ctrlPts = useRef(
    Array.from({ length: CURVE_CTRL }, (_, i) => {
      const a = (i / CURVE_CTRL) * Math.PI * 2;
      return new THREE.Vector3(
        Math.cos(a) * ORBIT_RADIUS,
        ORBIT_HEIGHT + Math.sin(a * 2) * 0.5,
        Math.sin(a) * ORBIT_RADIUS,
      );
    })
  );

  // Shader uniforms
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  // Build initial geometry once
  const geo = useMemo(() => {
    const pts  = ctrlPts.current;
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const samplePts = curve.getPoints(BODY_POINTS - 1);
    const radii = samplePts.map((_, i) => {
      const taper = 1 - i / (BODY_POINTS - 1);
      return BODY_RADIUS * (0.25 + taper * 0.75);
    });
    return makeTubeGeo(samplePts, radii);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;

    // Head orbit
    const headAngle = t * 0.14 * Math.PI * 2;
    const wobble    = Math.sin(t * 0.5) * 0.6;
    const hx = Math.cos(headAngle) * (ORBIT_RADIUS + wobble);
    const hy = ORBIT_HEIGHT + Math.sin(t * 0.7) * 0.7 + Math.sin(t * 0.35) * 0.3;
    const hz = Math.sin(headAngle) * (ORBIT_RADIUS + wobble);

    histRef.current.unshift([hx, hy, hz]);
    if (histRef.current.length > CURVE_CTRL * 6) histRef.current.length = CURVE_CTRL * 6;

    // Drift control points toward history samples
    const hist = histRef.current;
    const step = Math.max(1, Math.floor(hist.length / CURVE_CTRL));
    ctrlPts.current.forEach((pt, i) => {
      const idx    = Math.min(i * step, hist.length - 1);
      const sample = hist[idx];
      if (sample) {
        pt.x += (sample[0] - pt.x) * 0.18;
        pt.y += (sample[1] - pt.y) * 0.18;
        pt.z += (sample[2] - pt.z) * 0.18;
      }
    });

    // Swim wave perpendicular to forward direction
    const prev = hist[Math.min(step, hist.length - 1)] ?? [hx, hy, hz];
    const fwdX = hx - prev[0];
    const fwdZ = hz - prev[2];
    const len  = Math.sqrt(fwdX * fwdX + fwdZ * fwdZ) || 1;
    const perpX = -fwdZ / len;
    const perpZ =  fwdX / len;
    ctrlPts.current.forEach((pt, i) => {
      const wave = Math.sin(t * 2.0 + i * 0.45) * 0.10 * (i / CURVE_CTRL);
      pt.x += perpX * wave;
      pt.z += perpZ * wave;
    });

    // Update geometry position buffer in-place
    if (meshRef.current) {
      const curve      = new THREE.CatmullRomCurve3(ctrlPts.current, true);
      const samplePts  = curve.getPoints(BODY_POINTS - 1);
      const N          = BODY_POINTS;
      const SEGS       = TUBE_RADIAL;
      const posAttr    = meshRef.current.geometry.attributes.position;

      for (let i = 0; i < N; i++) {
        const pt    = samplePts[i];
        const taper = 1 - i / (N - 1);
        const r     = BODY_RADIUS * (0.25 + taper * 0.75);
        const prev2 = samplePts[Math.max(i - 1, 0)];
        const next2 = samplePts[Math.min(i + 1, N - 1)];
        const tan   = new THREE.Vector3().subVectors(next2, prev2).normalize();
        const up    = new THREE.Vector3(0, 1, 0);
        const side  = new THREE.Vector3().crossVectors(tan, up).normalize();
        const nrm   = new THREE.Vector3().crossVectors(side, tan).normalize();

        for (let j = 0; j <= SEGS; j++) {
          const a  = (j / SEGS) * Math.PI * 2;
          const cx = Math.cos(a) * side.x + Math.sin(a) * nrm.x;
          const cy = Math.cos(a) * side.y + Math.sin(a) * nrm.y;
          const cz = Math.cos(a) * side.z + Math.sin(a) * nrm.z;
          const vi = i * (SEGS + 1) + j;
          posAttr.setXYZ(vi, pt.x + cx * r, pt.y + cy * r, pt.z + cz * r);
        }
      }
      posAttr.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }

    // Head group position
    if (headRef.current) headRef.current.position.set(hx, hy, hz);

    // Tail history for mist
    const tail = ctrlPts.current[CURVE_CTRL - 1];
    tailHistRef.current.unshift([tail.x, tail.y, tail.z]);
    if (tailHistRef.current.length > MIST_COUNT * 4) tailHistRef.current.length = MIST_COUNT * 4;
  });

  return (
    <group>
      {/* Serpent body — single mesh, position buffer updated in-place */}
      <mesh ref={meshRef} geometry={geo} castShadow>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={SCALE_VERT}
          fragmentShader={SCALE_FRAG}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Head detail group */}
      <group ref={headRef}>
        {/* Glowing eye */}
        <mesh position={[0.06, 0.04, 0.10]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshBasicMaterial color="#00FFCC" />
        </mesh>
        <mesh position={[0.06, 0.04, 0.10]}>
          <sphereGeometry args={[0.016, 6, 5]} />
          <meshBasicMaterial color="#003322" />
        </mesh>
        <pointLight position={[0.06, 0.04, 0.10]} color="#00FFAA" intensity={0.6} distance={1.5} decay={2} />

        {/* Horns */}
        <mesh position={[-0.04, 0.10, 0.06]} rotation={[0.4, 0, -0.2]}>
          <coneGeometry args={[0.012, 0.08, 5]} />
          <meshStandardMaterial color="#D8E8F0" roughness={0.4} />
        </mesh>
        <mesh position={[0.04, 0.10, 0.06]} rotation={[0.4, 0, 0.2]}>
          <coneGeometry args={[0.012, 0.08, 5]} />
          <meshStandardMaterial color="#D8E8F0" roughness={0.4} />
        </mesh>

        {/* Narrow snout */}
        <mesh position={[0, -0.02, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.035, 0.09, 6]} />
          <meshStandardMaterial color="#F0F4F8" roughness={0.5} />
        </mesh>

        {/* Animated whiskers */}
        <Whisker side="left" />
        <Whisker side="right" />
      </group>

      {/* Trailing mist at tail */}
      <TrailingMist tailHistRef={tailHistRef} />
    </group>
  );
}
