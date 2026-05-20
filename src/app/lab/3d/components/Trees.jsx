'use client';

// Seeded pseudo-random so trees are always in the same positions
function seededRand(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const TREE_COUNT = 7;
const rand = seededRand(42);

const trees = Array.from({ length: TREE_COUNT }, (_, i) => {
  const angle = rand() * Math.PI * 2;
  const radius = rand() * 1.8 + 0.5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const scale = rand() * 0.4 + 0.7;
  return { x, z, scale, key: i };
});

function Tree({ x, z, scale }) {
  return (
    <group position={[x, 0.25, z]} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.6, 5]} />
        <meshLambertMaterial color="#6B4423" />
      </mesh>
      {/* Lower foliage */}
      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.5, 0.9, 6]} />
        <meshLambertMaterial color="#4A7C59" />
      </mesh>
      {/* Upper foliage */}
      <mesh position={[0, 1.45, 0]}>
        <coneGeometry args={[0.35, 0.7, 6]} />
        <meshLambertMaterial color="#5A9068" />
      </mesh>
    </group>
  );
}

export function Trees() {
  return (
    <group>
      {trees.map((t) => (
        <Tree key={t.key} x={t.x} z={t.z} scale={t.scale} />
      ))}
    </group>
  );
}
