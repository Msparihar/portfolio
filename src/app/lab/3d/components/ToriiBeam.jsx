'use client';

// Volumetric-ish light beam through the torii arch.
// A thin tapered cone with very low opacity gives the "godrays" illusion.
export function ToriiBeam() {
  // Position aligned with the torii at world position [2.1, 0.65, 0.6]
  // The torii faces along its rotation (Y=-0.6), so the beam goes outward along
  // the perpendicular of that.
  return (
    <group position={[2.5, 1.2, 1.0]} rotation={[0, -0.6, 0.45]}>
      <mesh>
        <coneGeometry args={[0.55, 3.5, 24, 1, true]} />
        <meshBasicMaterial
          color="#FFE8B0"
          transparent
          opacity={0.12}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
