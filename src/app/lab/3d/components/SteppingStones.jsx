'use client';

// Stepping stones — small flat discs across the grass, like a garden path.
const STONES = [
  { pos: [-1.0, 0.51, 0.4], scale: 0.16 },
  { pos: [-0.4, 0.51, 0.6], scale: 0.18 },
  { pos: [0.2, 0.51, 0.8], scale: 0.15 },
  { pos: [0.8, 0.51, 1.0], scale: 0.17 },
  { pos: [1.4, 0.51, 1.1], scale: 0.16 },
];

export function SteppingStones() {
  return (
    <group>
      {STONES.map((s, i) => (
        <mesh
          key={i}
          position={s.pos}
          rotation={[0, (i * 0.7) % Math.PI, 0]}
          scale={[s.scale, s.scale * 0.3, s.scale * 0.85]}
          receiveShadow
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshLambertMaterial color="#8A8478" flatShading />
        </mesh>
      ))}
    </group>
  );
}
