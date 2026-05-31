'use client';

// A subtle moon on the opposite side of the sky from the sun.
// Visible when the camera orbits to face it.
export function Moon() {
  return (
    <group>
      {/* Moon disc */}
      <mesh position={[-22, 12, 25]}>
        <sphereGeometry args={[1.6, 24, 16]} />
        <meshStandardMaterial
          color="#F2E8D5"
          emissive="#D8CFB8"
          emissiveIntensity={1.4}
          fog={false}
        />
      </mesh>
      {/* Soft halo */}
      <mesh position={[-22, 12, 24.9]}>
        <sphereGeometry args={[2.4, 16, 12]} />
        <meshBasicMaterial
          color="#F0E5C8"
          transparent
          opacity={0.18}
          fog={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
