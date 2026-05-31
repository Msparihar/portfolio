'use client';

// Layered mountain silhouettes on the horizon — fades into fog for depth.
// Three rings of cone-shaped peaks at varied distances and colors.

function seedRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildRing(seed, count, ringRadius, yBase, baseSize, color) {
  const r = seedRand(seed);
  const peaks = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + r() * 0.15;
    const radius = ringRadius + (r() - 0.5) * 4;
    const height = baseSize.h + r() * baseSize.hVar;
    const width = baseSize.w + r() * baseSize.wVar;
    const snow = height > baseSize.h + baseSize.hVar * 0.55;
    peaks.push({
      pos: [Math.cos(angle) * radius, yBase, Math.sin(angle) * radius],
      height,
      width,
      color,
      snow,
    });
  }
  return peaks;
}

// Three depth layers — colors tuned to blend into the dusky sky via fog
const FAR_RING = buildRing(11, 18, 62, -3, { h: 9, hVar: 5, w: 5.0, wVar: 2.2 }, '#A892A8');
const MID_RING = buildRing(23, 14, 48, -3, { h: 7, hVar: 4, w: 4.2, wVar: 1.6 }, '#B89DAE');
const NEAR_RING = buildRing(37, 10, 36, -3, { h: 5.5, hVar: 2.5, w: 3.4, wVar: 1.2 }, '#C6A8B6');

function Peak({ m, sides }) {
  const capH = m.height * 0.28;
  const capW = m.width * (capH / m.height); // proportional cap width
  const capY = m.pos[1] + m.height / 2 - capH / 2;
  return (
    <>
      <mesh position={m.pos}>
        <coneGeometry args={[m.width, m.height, sides]} />
        <meshLambertMaterial color={m.color} flatShading />
      </mesh>
      {m.snow && (
        <mesh position={[m.pos[0], capY, m.pos[2]]}>
          <coneGeometry args={[capW, capH, sides]} />
          <meshLambertMaterial color="#F4ECEC" flatShading />
        </mesh>
      )}
    </>
  );
}

export function DistantMountains() {
  return (
    <group>
      {FAR_RING.map((m, i) => <Peak key={`f${i}`} m={m} sides={5} />)}
      {MID_RING.map((m, i) => <Peak key={`m${i}`} m={m} sides={5} />)}
      {NEAR_RING.map((m, i) => <Peak key={`n${i}`} m={m} sides={6} />)}
    </group>
  );
}
