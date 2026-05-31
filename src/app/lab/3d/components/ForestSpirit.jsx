'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Fur / body shader ────────────────────────────────────────────────────────
// Noise-based color variation: lighter fur tips, darker base, subtle dark side
// stripes, and a warm Ghibli backlit fresnel rim.
const BODY_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal   = normalize(normalMatrix * normal);
    vViewDir  = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BODY_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  // Value noise
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    return noise(p) * 0.5 + noise(p * 2.1 + 1.3) * 0.3 + noise(p * 4.4 + 2.7) * 0.2;
  }

  void main() {
    // ── Fur color variation ──
    // Use world position on sphere surface to drive fur noise
    vec2 furUv = vUv * vec2(8.0, 6.0);
    float fur = fbm(furUv);

    // Base gray (Totoro mid tone), lighter tips, darker base
    vec3 darkBase  = vec3(0.30, 0.28, 0.26);   // dark fur base
    vec3 midGray   = vec3(0.42, 0.40, 0.38);   // mid body
    vec3 lightTip  = vec3(0.62, 0.60, 0.58);   // lighter fur tips
    vec3 bodyCol   = mix(darkBase, midGray, fur);
    bodyCol        = mix(bodyCol, lightTip, fur * fur);

    // Subtle lateral stripes (dark along sides) — driven by world X
    float stripeX = abs(vNormal.x);
    float stripe = smoothstep(0.35, 0.75, stripeX) * 0.18;
    bodyCol -= stripe;

    // ── Fresnel rim: warm amber-cream for Ghibli backlight ──
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.5);
    vec3 rimColor = vec3(0.98, 0.88, 0.65);    // warm candlelight rim
    bodyCol = mix(bodyCol, rimColor, fresnel * 0.55);

    gl_FragColor = vec4(bodyCol, 1.0);
  }
`;

// ─── Floating sparkle ────────────────────────────────────────────────────────
function Sparkle({ offset, phase }) {
  const ref = useRef();
  const mat = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime + phase;
    if (ref.current) {
      // Drift in a small drifting orbit
      ref.current.position.set(
        offset[0] + Math.sin(t * 0.9 + phase) * 0.12,
        offset[1] + Math.sin(t * 1.3 + phase * 2) * 0.10,
        offset[2] + Math.cos(t * 0.7 + phase) * 0.10,
      );
      // Twinkle: scale + opacity pulse
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(t * 2.5 + phase));
      ref.current.scale.setScalar(twinkle * 0.018);
    }
    if (mat.current) {
      mat.current.opacity = 0.3 + 0.7 * Math.abs(Math.sin(t * 2.5 + phase));
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 5, 4]} />
      <meshBasicMaterial
        ref={mat}
        color="#FFFBE8"
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Sparkle positions relative to spirit center
const SPARKLE_OFFSETS = [
  [ 0.45,  0.60,  0.10],
  [-0.40,  0.55,  0.15],
  [ 0.25,  0.80, -0.20],
  [-0.30,  0.70,  0.25],
  [ 0.50,  0.35,  0.30],
  [-0.45,  0.40, -0.20],
  [ 0.10,  0.90,  0.30],
  [-0.15,  0.85, -0.30],
];

// ─── Forest Spirit ────────────────────────────────────────────────────────────
export function ForestSpirit({ position = [1.8, 0.55, 1.5], rotationY = -0.5 }) {
  const ref = useRef();
  const bodyUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const bodyMatRef = useRef();

  useFrame((state) => {
    if (bodyMatRef.current) bodyMatRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    if (ref.current) {
      const t = state.clock.elapsedTime;
      // Breathing: subtle scale Y oscillation
      const breathY = 1 + Math.sin(t * 0.8) * 0.02;
      const breathXZ = 1 - Math.sin(t * 0.8) * 0.008;
      ref.current.scale.set(breathXZ, breathY, breathXZ);
    }
  });

  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]}>
      {/* Floating sparkles */}
      {SPARKLE_OFFSETS.map((off, i) => (
        <Sparkle key={i} offset={off} phase={i * 0.8} />
      ))}

      {/* Body — round egg, higher detail for smooth wobble */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.35, 32, 24]} />
        <shaderMaterial
          ref={bodyMatRef}
          uniforms={bodyUniforms}
          vertexShader={BODY_VERT}
          fragmentShader={BODY_FRAG}
        />
      </mesh>

      {/* White belly patch */}
      <mesh position={[0, 0.30, 0.18]} castShadow>
        <sphereGeometry args={[0.24, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#F2EEE3" roughness={0.9} />
      </mesh>

      {/* Left ear */}
      <mesh position={[-0.13, 0.62, 0]} rotation={[0, 0, -0.2]} castShadow>
        <coneGeometry args={[0.07, 0.22, 8]} />
        <meshStandardMaterial color="#524E4A" roughness={0.85} />
      </mesh>
      {/* Right ear */}
      <mesh position={[0.13, 0.62, 0]} rotation={[0, 0, 0.2]} castShadow>
        <coneGeometry args={[0.07, 0.22, 8]} />
        <meshStandardMaterial color="#524E4A" roughness={0.85} />
      </mesh>

      {/* Left eye — white sclera */}
      <mesh position={[-0.10, 0.42, 0.32]}>
        <sphereGeometry args={[0.038, 10, 8]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.0} />
      </mesh>
      {/* Left pupil */}
      <mesh position={[-0.10, 0.42, 0.352]}>
        <sphereGeometry args={[0.020, 8, 6]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
      {/* Left eye specular highlight */}
      <mesh position={[-0.088, 0.432, 0.368]}>
        <sphereGeometry args={[0.007, 5, 4]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Right eye — white sclera */}
      <mesh position={[0.10, 0.42, 0.32]}>
        <sphereGeometry args={[0.038, 10, 8]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.0} />
      </mesh>
      {/* Right pupil */}
      <mesh position={[0.10, 0.42, 0.352]}>
        <sphereGeometry args={[0.020, 8, 6]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
      {/* Right eye specular highlight */}
      <mesh position={[0.112, 0.432, 0.368]}>
        <sphereGeometry args={[0.007, 5, 4]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.34, 0.345]}>
        <sphereGeometry args={[0.025, 7, 6]} />
        <meshBasicMaterial color="#1A1A1A" />
      </mesh>

      {/* Chevron belly markings */}
      <mesh position={[0, 0.24, 0.38]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.03, 0.06, 0.02]} />
        <meshBasicMaterial color="#3A3530" />
      </mesh>
      <mesh position={[0, 0.18, 0.39]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.03, 0.06, 0.02]} />
        <meshBasicMaterial color="#3A3530" />
      </mesh>

      {/* Soft ambient glow */}
      <pointLight color="#FFE8A0" intensity={0.25} distance={2.0} decay={2} />
    </group>
  );
}
