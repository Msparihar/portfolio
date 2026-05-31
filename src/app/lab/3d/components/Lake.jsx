'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Vertex shader — multi-octave fractal ripple displacement
// ---------------------------------------------------------------------------
const LAKE_VERT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vFresnel;

  // value noise
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
    vUv = uv;
    vec3 pos = position;

    // --- Octave 1: large slow swells ---
    float n1 = vnoise(vec2(pos.x * 3.0 + uTime * 0.25, pos.z * 3.0 + uTime * 0.18)) * 2.0 - 1.0;
    // --- Octave 2: medium ripples ---
    float n2 = vnoise(vec2(pos.x * 7.5 - uTime * 0.55, pos.z * 6.5 + uTime * 0.42)) * 2.0 - 1.0;
    // --- Octave 3: fine surface chop ---
    float n3 = vnoise(vec2(pos.x * 17.0 + uTime * 1.1, pos.z * 18.0 - uTime * 0.9)) * 2.0 - 1.0;

    float ripple = n1 * 0.035 + n2 * 0.018 + n3 * 0.007;
    pos.y += ripple;

    // Fresnel approximation in view space — steeper angles = more reflection
    vec3 worldNorm = normalize(normalMatrix * normal);
    vec3 worldPos4 = (modelViewMatrix * vec4(pos, 1.0)).xyz;
    vFresnel = pow(1.0 - abs(dot(normalize(-worldPos4), worldNorm)), 2.5);

    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Fragment shader — painterly Ghibli water surface
// ---------------------------------------------------------------------------
const LAKE_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vFresnel;

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

  // Fractal noise (fbm) for brush-stroke patterns
  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      val += amp * (vnoise(p) * 2.0 - 1.0);
      p = p * 2.1 + vec2(1.3, 0.7);
      amp *= 0.48;
    }
    return val;
  }

  void main() {
    vec2 center = vec2(0.5);
    float dist = length(vUv - center) * 2.0;   // 0 centre, 1 edge

    // --- Base depth gradient ---
    // Center (deep): dark teal. Edge (shallow): bright cyan
    vec3 deepColor    = vec3(0.04, 0.18, 0.42);
    vec3 shallowColor = vec3(0.28, 0.72, 0.88);
    vec3 color = mix(deepColor, shallowColor, smoothstep(0.0, 1.0, dist));

    // --- Brush-stroke highlights ---
    // Horizontal curved streaks drift slowly — fbm gives the irregular waviness
    vec2 brushUv = vec2(vUv.x * 4.0, vUv.y * 1.8 + uTime * 0.07);
    float stroke = fbm(brushUv + vec2(uTime * 0.04, 0.0));
    // A second layer at different scale for layering
    float stroke2 = fbm(brushUv * 1.7 + vec2(-uTime * 0.03, 0.5));
    float brushMask = smoothstep(0.1, 0.55, stroke) * smoothstep(-0.05, 0.3, stroke2);
    vec3 highlightColor = vec3(0.55, 0.88, 0.97);  // bright cyan stroke
    color = mix(color, highlightColor, brushMask * 0.38);

    // --- Fresnel reflection tint ---
    // Edges of water reflect sky → pale cyan bloom
    vec3 fresnelColor = vec3(0.80, 0.95, 1.0);
    color = mix(color, fresnelColor, vFresnel * 0.45);

    // --- Subtle specular shimmer ---
    float shimmer = vnoise(vec2(vUv.x * 22.0 + uTime * 1.8, vUv.y * 18.0 - uTime * 2.3));
    color += shimmer * shimmer * 0.14;

    // --- Soft caustics ring where lily pads and shore meet ---
    // Inner bright ring at dist ~0.82-0.95 simulates caustic edge glow
    float causticRing = smoothstep(0.78, 0.88, dist) * smoothstep(0.98, 0.88, dist);
    color += causticRing * vec3(0.4, 0.85, 0.95) * 0.22;

    // --- Alpha: slightly transparent, fading at rim ---
    float alpha = 0.84 - dist * 0.16;
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

export function Lake() {
  const matRef = useRef();

  const geo = useMemo(() => new THREE.CircleGeometry(1.1, 56), []);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: LAKE_VERT,
    fragmentShader: LAKE_FRAG,
    uniforms: {
      uTime: { value: 0 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  matRef.current = mat;

  // Lily pad bob state — one phase offset each
  const lilyRefs = [useRef(), useRef(), useRef()];
  const lilyPhases = [0, 1.4, 2.8];

  useFrame((state) => {
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    // Gentle vertical bob on each lily pad
    lilyRefs.forEach((ref, i) => {
      if (ref.current) {
        ref.current.position.y = 0.01 + Math.sin(state.clock.elapsedTime * 0.5 + lilyPhases[i]) * 0.008;
      }
    });
  });

  // Lily pads — simple scaled discs
  const lilyPositions = [
    [0.5, 0.01, 0.3],
    [-0.45, 0.01, -0.35],
    [0.1, 0.01, -0.6],
  ];

  return (
    <group position={[-1.5, 0.5, 1.6]}>
      {/* Lake surface */}
      <mesh geometry={geo} material={mat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} />

      {/* Lily pads with gentle floating bob */}
      {lilyPositions.map((pos, i) => (
        <group key={i} ref={lilyRefs[i]} position={pos}>
          <mesh rotation={[-Math.PI / 2, 0, i * 1.1]}>
            <circleGeometry args={[0.14 + i * 0.04, 12]} />
            <meshLambertMaterial color="#4a9e3a" transparent opacity={0.92} />
          </mesh>
          {/* Pink lotus bloom on the middle pad */}
          {i === 1 && (
            <group position={[0, 0.04, 0]}>
              <mesh>
                <sphereGeometry args={[0.05, 6, 5]} />
                <meshLambertMaterial color="#FFB8D1" />
              </mesh>
              <mesh position={[0.05, 0.02, 0]}>
                <sphereGeometry args={[0.04, 6, 5]} />
                <meshLambertMaterial color="#FFCCDC" />
              </mesh>
              <mesh position={[-0.04, 0.02, 0.03]}>
                <sphereGeometry args={[0.035, 6, 5]} />
                <meshLambertMaterial color="#FF9FB6" />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* Koi fish — swim in lazy circles just below the surface */}
      <Koi color="#FF8030" radius={0.55} phase={0} speed={0.6} />
      <Koi color="#FFFFFF" radius={0.4} phase={2.5} speed={0.45} />
      <Koi color="#FFD060" radius={0.7} phase={5.0} speed={0.5} />

      {/* Lake-glow point light — cool blue */}
      <pointLight color="#60AAFF" intensity={0.6} distance={4.0} decay={2} position={[0, 0.4, 0]} />
    </group>
  );
}

function Koi({ radius, phase, speed }) {
  const ref = useRef();
  const { scene } = useGLTF('/models/ghibli/polypizza/koi_orange.glb');

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + phase;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = -0.025;
    ref.current.rotation.y = -t + Math.PI / 2;
  });

  return (
    <group ref={ref} scale={0.0035}>
      <primitive object={scene.clone()} />
    </group>
  );
}

useGLTF.preload('/models/ghibli/polypizza/koi_orange.glb');
