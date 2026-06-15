'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

const KOI_COLORS = [
  { body: '#F5F0E8', patch: '#E8501A' },
  { body: '#F5F0E8', patch: '#C8200A' },
  { body: '#E8651A', patch: '#D04A10' },
  { body: '#E85A10', patch: '#F5F0E8' },
  { body: '#1A1A1A', patch: '#E8501A' },
];

function seedRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildParams(count, baseRadius) {
  const r = seedRand(42);
  return Array.from({ length: count }, (_, i) => ({
    colorIndex: i % KOI_COLORS.length,
    radius: baseRadius + (r() - 0.5) * 0.3,
    phase: r() * Math.PI * 2,
    speed: 0.28 + r() * 0.18,
    yOffset: -0.12 - r() * 0.1,
    wiggleSpeed: 1.8 + r() * 1.0,
    wiggleAmp: 0.18 + r() * 0.12,
    bodyScale: 0.38 + r() * 0.08,
    tailScale: 0.26 + r() * 0.06,
    direction: r() > 0.5 ? 1 : -1,
  }));
}

function KoiFish({ params }) {
  const groupRef = useRef();
  const tailRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * params.speed * params.direction + params.phase;
    const x = Math.cos(t) * params.radius;
    const z = Math.sin(t) * params.radius;
    groupRef.current.position.set(x, params.yOffset, z);

    const wiggle = Math.sin(state.clock.elapsedTime * params.wiggleSpeed + params.phase) * params.wiggleAmp;
    groupRef.current.rotation.y = -t * params.direction + Math.PI / 2 + wiggle;

    if (tailRef.current) {
      tailRef.current.rotation.y = wiggle * 1.6;
    }
  });

  const { body, patch } = KOI_COLORS[params.colorIndex];
  const bs = params.bodyScale;
  const ts = params.tailScale;

  return (
    <group ref={groupRef}>
      {/* body — elongated sphere */}
      <mesh scale={[bs * 2.6, bs * 0.55, bs]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshLambertMaterial color={body} />
      </mesh>

      {/* color patch on upper-mid body */}
      <mesh position={[0.05, bs * 0.3, 0]} scale={[bs * 1.1, bs * 0.42, bs * 0.85]}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshLambertMaterial color={patch} />
      </mesh>

      {/* left pectoral fin */}
      <mesh position={[0, -bs * 0.1, bs * 0.9]} rotation={[0.3, 0, 0.4]} scale={[bs * 1.2, bs * 0.08, bs * 0.55]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial color={body} transparent opacity={0.75} />
      </mesh>

      {/* right pectoral fin */}
      <mesh position={[0, -bs * 0.1, -bs * 0.9]} rotation={[-0.3, 0, 0.4]} scale={[bs * 1.2, bs * 0.08, bs * 0.55]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial color={body} transparent opacity={0.75} />
      </mesh>

      {/* tail group — offset to rear of body, pivots for wiggle */}
      <group ref={tailRef} position={[-bs * 2.5, 0, 0]}>
        {/* upper tail lobe */}
        <mesh rotation={[0, 0, 0.4]} scale={[ts * 1.8, ts * 1.1, ts * 0.18]}>
          <coneGeometry args={[1, 2, 4]} />
          <meshLambertMaterial color={patch} transparent opacity={0.88} />
        </mesh>
        {/* lower tail lobe */}
        <mesh rotation={[0, 0, -0.55]} scale={[ts * 1.5, ts * 0.9, ts * 0.18]}>
          <coneGeometry args={[1, 2, 4]} />
          <meshLambertMaterial color={body} transparent opacity={0.82} />
        </mesh>
      </group>

      {/* dorsal fin */}
      <mesh position={[bs * 0.3, bs * 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[bs * 1.6, bs * 0.08, bs * 0.6]}>
        <coneGeometry args={[1, 2, 4]} />
        <meshLambertMaterial color={body} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export function KoiSchool({ count = 5, radius = 0.9, scale = 1.0 }) {
  const params = useMemo(() => buildParams(count, radius), [count, radius]);

  return (
    <group scale={scale}>
      {params.map((p, i) => (
        <KoiFish key={i} params={p} />
      ))}
    </group>
  );
}
