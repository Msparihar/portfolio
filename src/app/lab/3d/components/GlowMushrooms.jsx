'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function seedRand(seed) {
  let s = seed | 0;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const STEM_VERT = /* glsl */`
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const STEM_FRAG = /* glsl */`
  varying vec3 vNormal;
  void main() {
    float ndl = dot(normalize(vNormal), normalize(vec3(0.5, 1.0, 0.4))) * 0.4 + 0.6;
    vec3 col = vec3(0.93, 0.90, 0.82) * ndl;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const CAP_VERT = /* glsl */`
  uniform float uTime;
  uniform float uPhase;
  uniform vec3 uGlowColor;
  varying vec3 vNormal;
  varying vec3 vGlow;

  void main() {
    vNormal = normalize(normalMatrix * normal);

    float pulse = 0.72 + 0.28 * sin(uTime * 1.1 + uPhase);
    vGlow = uGlowColor * pulse;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CAP_FRAG = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vGlow;

  void main() {
    vec3 n = normalize(vNormal);
    float ndl = dot(n, normalize(vec3(0.5, 1.0, 0.4))) * 0.35 + 0.65;

    vec3 baseCol = vGlow * 0.70;
    vec3 litCol = baseCol * ndl;

    vec3 emissive = vGlow * 0.55;
    vec3 col = litCol + emissive;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const SPORE_VERT = /* glsl */`
  uniform float uTime;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSwayX;
  attribute float aSwayZ;
  attribute float aBaseX;
  attribute float aBaseY;
  attribute float aBaseZ;
  attribute float aSize;

  varying float vAlpha;

  void main() {
    float t = mod(uTime * aSpeed + aPhase, 1.0);

    float x = aBaseX + sin(uTime * 0.7 + aPhase * 6.28) * aSwayX;
    float y = aBaseY + t * 1.8;
    float z = aBaseZ + cos(uTime * 0.5 + aPhase * 6.28 + 1.1) * aSwayZ;

    float fadeIn  = smoothstep(0.0, 0.15, t);
    float fadeOut = 1.0 - smoothstep(0.65, 1.0, t);
    vAlpha = fadeIn * fadeOut * 0.55;

    vec4 mvPos = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_PointSize = aSize * (180.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const SPORE_FRAG = /* glsl */`
  uniform vec3 uGlowColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float core = 1.0 - smoothstep(0.0, 0.18, d);
    float halo = 1.0 - smoothstep(0.10, 0.48, d);
    halo = halo * halo;

    float alpha = (core * 0.7 + halo * 0.3) * vAlpha;
    vec3 col = mix(uGlowColor * 0.6, uGlowColor + vec3(0.05, 0.08, 0.06), core);

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`;

function Mushroom({ position, stemH, capR, rotY, glowColor, phase }) {
  const stemMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: STEM_VERT,
    fragmentShader: STEM_FRAG,
  }), []);

  const capMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: CAP_VERT,
    fragmentShader: CAP_FRAG,
    uniforms: {
      uTime:     { value: 0 },
      uPhase:    { value: phase },
      uGlowColor: { value: new THREE.Color(glowColor) },
    },
  }), [glowColor, phase]);

  useFrame(({ clock }) => {
    capMat.uniforms.uTime.value = clock.elapsedTime;
  });

  const stemRadTop = capR * 0.28;
  const stemRadBot = capR * 0.22;

  const stemY = stemH * 0.5;
  const capFlattenY = 0.58;
  const capY = stemH + capR * capFlattenY * 0.72;

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, stemY, 0]} castShadow>
        <cylinderGeometry args={[stemRadTop, stemRadBot, stemH, 9]} />
        <primitive object={stemMat} attach="material" />
      </mesh>
      <mesh position={[0, capY, 0]} scale={[capR, capR * capFlattenY, capR]} castShadow>
        <sphereGeometry args={[1, 14, 10]} />
        <primitive object={capMat} attach="material" />
      </mesh>
      <pointLight
        position={[0, capY + capR * 0.2, 0]}
        color={glowColor}
        intensity={0.35 + capR * 0.4}
        distance={capR * 5.5}
        decay={2}
      />
    </group>
  );
}

function Spores({ mushrooms, glowColor }) {
  const count = 28;
  const timeUniform = useRef({ value: 0 });

  const { geo, mat } = useMemo(() => {
    const r = seedRand(9913);

    const phase  = new Float32Array(count);
    const speed  = new Float32Array(count);
    const swayX  = new Float32Array(count);
    const swayZ  = new Float32Array(count);
    const baseX  = new Float32Array(count);
    const baseY  = new Float32Array(count);
    const baseZ  = new Float32Array(count);
    const size   = new Float32Array(count);
    const positions = new Float32Array(count * 3);

    const src = mushrooms;
    for (let i = 0; i < count; i++) {
      const m = src[i % src.length];
      phase[i]  = r();
      speed[i]  = 0.10 + r() * 0.14;
      swayX[i]  = 0.04 + r() * 0.08;
      swayZ[i]  = 0.04 + r() * 0.06;
      baseX[i]  = m.px + (r() - 0.5) * m.capR * 1.4;
      baseY[i]  = m.stemH + m.capR * 0.3;
      baseZ[i]  = m.pz + (r() - 0.5) * m.capR * 1.4;
      size[i]   = 2.0 + r() * 2.5;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aPhase',   new THREE.BufferAttribute(phase, 1));
    g.setAttribute('aSpeed',   new THREE.BufferAttribute(speed, 1));
    g.setAttribute('aSwayX',   new THREE.BufferAttribute(swayX, 1));
    g.setAttribute('aSwayZ',   new THREE.BufferAttribute(swayZ, 1));
    g.setAttribute('aBaseX',   new THREE.BufferAttribute(baseX, 1));
    g.setAttribute('aBaseY',   new THREE.BufferAttribute(baseY, 1));
    g.setAttribute('aBaseZ',   new THREE.BufferAttribute(baseZ, 1));
    g.setAttribute('aSize',    new THREE.BufferAttribute(size, 1));

    const sporeMat = new THREE.ShaderMaterial({
      vertexShader:   SPORE_VERT,
      fragmentShader: SPORE_FRAG,
      uniforms: {
        uTime:      timeUniform.current,
        uGlowColor: { value: new THREE.Color(glowColor) },
      },
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      transparent: true,
    });

    return { geo: g, mat: sporeMat };
  }, [mushrooms, glowColor]);

  useFrame(({ clock }) => {
    timeUniform.current.value = clock.elapsedTime;
  });

  return <points geometry={geo} material={mat} />;
}

const PALETTE = [
  '#7FE8D8',
  '#A8F0C0',
  '#9BE8FF',
  '#C8F0A0',
  '#80DDB0',
];

export function GlowMushrooms({ count = 7, scale = 1, glowColor = null }) {
  const mushrooms = useMemo(() => {
    const r = seedRand(4421);
    const n = Math.max(3, Math.min(count, 12));
    return Array.from({ length: n }, (_, i) => {
      const angle  = (i / n) * Math.PI * 2 + r() * 0.5;
      const radius = 0.08 + r() * 0.32;
      const stemH  = 0.38 + r() * 0.72;
      const capR   = 0.28 + r() * 0.52;
      const px     = Math.cos(angle) * radius;
      const pz     = Math.sin(angle) * radius;
      const rotY   = r() * Math.PI * 2;
      const phase  = r() * Math.PI * 2;
      const col    = glowColor ?? PALETTE[i % PALETTE.length];
      return { px, pz, stemH, capR, rotY, phase, col };
    });
  }, [count, glowColor]);

  return (
    <group scale={[scale, scale, scale]}>
      {mushrooms.map((m, i) => (
        <Mushroom
          key={i}
          position={[m.px, 0, m.pz]}
          stemH={m.stemH}
          capR={m.capR}
          rotY={m.rotY}
          glowColor={m.col}
          phase={m.phase}
        />
      ))}
      <Spores mushrooms={mushrooms} glowColor={glowColor ?? PALETTE[0]} />
    </group>
  );
}
