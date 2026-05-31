'use client';

// Small red wooden arched bridge — Ghibli-style garden footbridge
// Positioned next to the lake (Lake.jsx places lake around x=-1.5, z=0.2 area)
export function Bridge({ position = [-1.4, 0.5, 0.2], rotationY = 0.6, scale = 1 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
      {/* Deck (arched) — built from 5 short box segments at varying heights */}
      {[-0.6, -0.3, 0, 0.3, 0.6].map((x, i) => {
        // arch height: peak at center
        const arch = 0.12 * (1 - Math.pow(x / 0.7, 2));
        return (
          <mesh
            key={i}
            position={[x, 0.18 + arch, 0]}
            rotation={[0, 0, Math.atan(-x * 0.4)]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.32, 0.05, 0.4]} />
            <meshLambertMaterial color="#C9421E" />
          </mesh>
        );
      })}

      {/* Side rails */}
      <mesh position={[0, 0.3, 0.22]} castShadow>
        <boxGeometry args={[1.5, 0.04, 0.04]} />
        <meshLambertMaterial color="#C9421E" />
      </mesh>
      <mesh position={[0, 0.3, -0.22]} castShadow>
        <boxGeometry args={[1.5, 0.04, 0.04]} />
        <meshLambertMaterial color="#C9421E" />
      </mesh>

      {/* Support posts at each end */}
      <mesh position={[-0.7, 0.18, 0.22]} castShadow>
        <boxGeometry args={[0.06, 0.36, 0.06]} />
        <meshLambertMaterial color="#8B2C19" />
      </mesh>
      <mesh position={[-0.7, 0.18, -0.22]} castShadow>
        <boxGeometry args={[0.06, 0.36, 0.06]} />
        <meshLambertMaterial color="#8B2C19" />
      </mesh>
      <mesh position={[0.7, 0.18, 0.22]} castShadow>
        <boxGeometry args={[0.06, 0.36, 0.06]} />
        <meshLambertMaterial color="#8B2C19" />
      </mesh>
      <mesh position={[0.7, 0.18, -0.22]} castShadow>
        <boxGeometry args={[0.06, 0.36, 0.06]} />
        <meshLambertMaterial color="#8B2C19" />
      </mesh>
    </group>
  );
}
