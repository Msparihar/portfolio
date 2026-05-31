'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Flame shader ────────────────────────────────────────────────────────────
// Multi-octave noise for organic flicker + upward-flowing UV streaks
const FLAME_VERT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vFlicker;
  varying vec3 vWorldNormal;

  // Simple hash for pseudo-random noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
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

    // Upward-flowing UV for streak sampling
    vec2 flowUv = uv + vec2(0.0, -uTime * 0.55);

    // 3 octaves of noise for organic body wobble
    float n1 = noise(vec2(position.y * 5.0 + uTime * 3.5, position.x * 4.0));
    float n2 = noise(vec2(position.x * 8.0 + uTime * 5.0, position.z * 6.0)) * 0.5;
    float n3 = noise(flowUv * 6.0) * 0.25;
    float wobble = (n1 + n2 + n3) * 0.09;
    vec3 pos = position;
    pos.xz *= 1.0 + wobble * 0.5;
    pos.y  += wobble * 0.3;

    // Squash-stretch: body gently pulses
    float squash = sin(uTime * 2.0) * 0.06;
    pos.y  *= 1.0 + squash;
    pos.xz *= 1.0 - squash * 0.5;

    vFlicker = 0.80 + n1 * 0.20;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FLAME_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vFlicker;
  varying vec3 vWorldNormal;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
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
    // Upward flowing streaks
    vec2 flowUv = vUv + vec2(sin(vUv.x * 8.0 + uTime) * 0.04, -uTime * 0.6);
    float streak1 = noise(flowUv * vec2(3.0, 6.0));
    float streak2 = noise(flowUv * vec2(5.0, 12.0) + 1.7) * 0.5;
    float streak3 = noise(flowUv * vec2(8.0, 18.0) + 3.3) * 0.25;
    float streaks = (streak1 + streak2 + streak3) / 1.75;

    float verticalFade = smoothstep(1.0, 0.02, vUv.y);
    vec2 center = vec2(0.5);
    float radial = 1.0 - smoothstep(0.0, 0.48, distance(vUv, center));

    // Color: deep indigo-azure at base → pale cyan → near-white at tip
    vec3 deep  = vec3(0.05, 0.30, 0.90);
    vec3 mid   = vec3(0.35, 0.80, 1.00);
    vec3 hot   = vec3(0.90, 0.97, 1.00);
    vec3 col   = mix(deep, mid, pow(vUv.y, 0.6));
    col        = mix(col, hot, smoothstep(0.55, 1.0, vUv.y));
    // Streak tint: brighter streaks push toward white
    col        = mix(col, vec3(1.0), streaks * 0.25);

    float a = verticalFade * radial * vFlicker * (0.7 + streaks * 0.3);
    gl_FragColor = vec4(col, a);
  }
`;

// ─── Body shader (SSS fake: fresnel rim + inner emissive glow) ───────────────
const BODY_VERT = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    // Squash-stretch wobble matching flame
    vec3 pos = position;
    float squash = sin(uTime * 2.0) * 0.06;
    pos.y  *= 1.0 + squash;
    pos.xz *= 1.0 - squash * 0.5;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vNormal  = normalize(normalMatrix * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const BODY_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    // Fresnel rim — how much the surface faces away from camera
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);

    // Base: ghostly white with azure SSS tint
    vec3 baseColor = vec3(0.88, 0.93, 0.97);
    // Inner glow: azure flame visible through semi-translucent body
    vec3 innerGlow = vec3(0.30, 0.65, 1.00);
    // Rim light: bright cyan at silhouette edges (Ghibli backlight)
    vec3 rimColor  = vec3(0.55, 0.88, 1.00);

    vec3 col = mix(baseColor, innerGlow, 0.35);
    col = mix(col, rimColor, fresnel * 0.7);

    // Subtle pulse using time
    float pulse = 0.5 + 0.5 * sin(uTime * 1.8);
    col += innerGlow * pulse * 0.08;

    // Opacity: translucent center, more opaque at rim for SSS feel
    float alpha = 0.65 + fresnel * 0.25;

    gl_FragColor = vec4(col, alpha);
  }
`;

// ─── Flame component ─────────────────────────────────────────────────────────
function AzureFlame({ scale = 1 }) {
  const matRef = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh scale={[0.34 * scale, 0.60 * scale, 0.34 * scale]} position={[0, 0.20 * scale, 0]}>
      <sphereGeometry args={[1, 18, 22]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={FLAME_VERT}
        fragmentShader={FLAME_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Trailing wisp: stores last N positions, renders fading instances ─────────
const WISP_COUNT = 4;

function TrailingWisp({ hostRef }) {
  const wispRefs = useRef([]);
  const history = useRef([]);
  const mats = useRef([]);

  useFrame(() => {
    if (!hostRef.current) return;
    const pos = new THREE.Vector3();
    hostRef.current.getWorldPosition(pos);
    history.current.unshift([pos.x, pos.y, pos.z]);
    if (history.current.length > WISP_COUNT * 3) history.current.length = WISP_COUNT * 3;

    wispRefs.current.forEach((w, i) => {
      if (!w) return;
      const sample = history.current[Math.min((i + 1) * 3, history.current.length - 1)];
      if (sample) {
        w.position.set(sample[0], sample[1], sample[2]);
        const fade = 1 - i / WISP_COUNT;
        if (mats.current[i]) mats.current[i].opacity = fade * 0.45;
        const s = (0.08 - i * 0.015) * fade;
        w.scale.setScalar(Math.max(s, 0.01));
      }
    });
  });

  return (
    <>
      {Array.from({ length: WISP_COUNT }).map((_, i) => (
        <mesh key={i} ref={(el) => { wispRefs.current[i] = el; }}>
          <sphereGeometry args={[1, 6, 5]} />
          <meshBasicMaterial
            ref={(el) => { mats.current[i] = el; }}
            color="#6BBFFF"
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

// ─── Single spirit ────────────────────────────────────────────────────────────
function Spirit({ radius, height, phase, scale = 1, speed = 1 }) {
  const groupRef = useRef();
  const bodyMatRef = useRef();
  const bodyUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const eyeLeftRef  = useRef();
  const eyeRightRef = useRef();

  // Blink state
  const blinkState = useRef({ nextBlink: 3 + Math.random() * 3, blinking: false, blinkTimer: 0 });

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;

    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(t * 0.3) * radius;
      groupRef.current.position.z = Math.sin(t * 0.3) * radius;
      groupRef.current.position.y = height + Math.sin(t * 1.5) * 0.18;
      groupRef.current.rotation.y = -t * 0.3 + Math.PI / 2;
      groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.12;
    }

    if (bodyMatRef.current) bodyMatRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    // Eye blink: every ~3-5s, scale Y collapses over 0.15s
    const bs = blinkState.current;
    bs.nextBlink -= state.clock.getDelta ? 0 : 0; // getDelta would reset — use elapsedTime diff
    const elapsed = state.clock.elapsedTime;
    if (!bs.blinking && elapsed > bs.nextBlink) {
      bs.blinking = true;
      bs.blinkTimer = elapsed;
    }
    if (bs.blinking) {
      const blinkProgress = (elapsed - bs.blinkTimer) / 0.15;
      const scaleY = blinkProgress < 0.5
        ? 1 - blinkProgress * 2
        : (blinkProgress - 0.5) * 2;
      if (eyeLeftRef.current)  eyeLeftRef.current.scale.y  = Math.max(scaleY, 0.05);
      if (eyeRightRef.current) eyeRightRef.current.scale.y = Math.max(scaleY, 0.05);
      if (blinkProgress >= 1) {
        bs.blinking = false;
        bs.nextBlink = elapsed + 3 + Math.random() * 4;
        if (eyeLeftRef.current)  eyeLeftRef.current.scale.y  = 1;
        if (eyeRightRef.current) eyeRightRef.current.scale.y = 1;
      }
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Trailing wisps behind each spirit */}
      <TrailingWisp hostRef={groupRef} />

      {/* Azure flame aura — rendered first so body sits inside */}
      <AzureFlame />

      {/* Body — SSS shader: translucent with fresnel rim + inner azure glow */}
      <mesh castShadow>
        <sphereGeometry args={[0.18, 18, 14]} />
        <shaderMaterial
          ref={bodyMatRef}
          uniforms={bodyUniforms}
          vertexShader={BODY_VERT}
          fragmentShader={BODY_FRAG}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Eyes */}
      <mesh ref={eyeLeftRef} position={[0.07, 0.05, 0.15]}>
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshBasicMaterial color="#1A2A4A" />
      </mesh>
      <mesh ref={eyeRightRef} position={[-0.07, 0.05, 0.15]}>
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshBasicMaterial color="#1A2A4A" />
      </mesh>
      {/* Eye specular highlights */}
      <mesh position={[0.08, 0.065, 0.168]}>
        <sphereGeometry args={[0.007, 5, 4]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.062, 0.065, 0.168]}>
        <sphereGeometry args={[0.007, 5, 4]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      {/* Nose */}
      <mesh position={[0, -0.02, 0.17]}>
        <sphereGeometry args={[0.012, 6, 5]} />
        <meshBasicMaterial color="#1A2A4A" />
      </mesh>

      {/* Soft glow — tints surroundings azure */}
      <pointLight color="#7AC8FF" intensity={0.5} distance={1.8} decay={2} />
    </group>
  );
}

// ─── Spirit configs ───────────────────────────────────────────────────────────
const SPIRITS = [
  { radius: 4.2, height: 1.2, phase: 0,   scale: 1.0,  speed: 1.0 },
  { radius: 4.8, height: 1.6, phase: 2.0, scale: 0.85, speed: 0.7 },
  { radius: 3.8, height: 2.2, phase: 4.0, scale: 1.1,  speed: 1.2 },
  { radius: 5.2, height: 0.9, phase: 1.0, scale: 0.9,  speed: 0.85 },
  { radius: 4.0, height: 1.9, phase: 3.0, scale: 0.95, speed: 1.1 },
];

export function Kodama() {
  return (
    <group>
      {SPIRITS.map((cfg, i) => <Spirit key={i} {...cfg} />)}
    </group>
  );
}
