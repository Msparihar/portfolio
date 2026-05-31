'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Simple seeded pseudo-random for deterministic rock placement
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Displaced cylinder top for a bumpy terrain surface
function BumpyTerrain() {
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(3.0, 2.9, 0.3, 48, 8);
    const pos = g.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // Only displace the top face verts
      if (y > 0.1) {
        const noise =
          Math.sin(x * 2.1 + z * 1.7) * 0.06 +
          Math.sin(x * 4.3 - z * 3.1) * 0.035 +
          Math.sin(x * 1.1 + z * 5.2) * 0.025;
        pos.setY(i, y + noise);
      }
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} position={[0, 0.22, 0]} receiveShadow>
      <meshLambertMaterial color="#7ab83a" />
    </mesh>
  );
}

// Improved underside — multiple rock chunks with slow drift
function RockUnderbelly() {
  const r = useMemo(() => seededRand(99), []);

  const chunks = useMemo(() => {
    const list = [];
    // main taper cone
    list.push({ type: 'cone', pos: [0, -2.2, 0], args: [2.5, 4.0, 10], color: '#7A5A3E', rot: [0, 0, 0] });
    // dirt band
    list.push({ type: 'cyl', pos: [0, -0.15, 0], args: [3.0, 2.6, 0.45, 16], color: '#A87850', rot: [0, 0, 0] });

    // many dangling rock chunks
    const rockCount = 12;
    for (let i = 0; i < rockCount; i++) {
      const angle = r() * Math.PI * 2;
      const rad = r() * 1.8 + 0.4;
      const yd = -(r() * 2.5 + 1.0);
      const size = r() * 0.55 + 0.2;
      list.push({
        type: 'dodec',
        pos: [Math.cos(angle) * rad, yd, Math.sin(angle) * rad],
        args: [size],
        color: i % 2 === 0 ? '#8A6649' : '#7A5A3E',
        rot: [r() * 0.8, r() * 1.5, r() * 0.8],
      });
    }
    return list;
  }, [r]);

  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {chunks.map((c, i) => {
        const col = <meshLambertMaterial key="mat" color={c.color} flatShading />;
        if (c.type === 'cone') return (
          <mesh key={i} position={c.pos} rotation={c.rot} castShadow>
            <coneGeometry args={c.args} />
            {col}
          </mesh>
        );
        if (c.type === 'cyl') return (
          <mesh key={i} position={c.pos} rotation={c.rot} castShadow>
            <cylinderGeometry args={c.args} />
            <meshLambertMaterial color={c.color} />
          </mesh>
        );
        return (
          <mesh key={i} position={c.pos} rotation={c.rot} castShadow>
            <dodecahedronGeometry args={c.args} />
            {col}
          </mesh>
        );
      })}
    </group>
  );
}

function Crystals() {
  const r = useMemo(() => seededRand(7), []);
  const crystals = useMemo(() => {
    const list = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = r() * Math.PI * 2;
      const rad = r() * 1.7 + 0.4;
      const yd = -(r() * 2.8 + 0.4);
      const size = r() * 0.28 + 0.16;
      list.push({
        pos: [Math.cos(angle) * rad, yd, Math.sin(angle) * rad],
        size,
        rot: [r() * Math.PI, r() * Math.PI, r() * Math.PI],
        cool: i % 2 === 0,
      });
    }
    return list;
  }, [r]);

  return (
    <group>
      {crystals.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={c.rot}>
          <octahedronGeometry args={[c.size, 0]} />
          <meshStandardMaterial
            color={c.cool ? '#7EE0F0' : '#A8E8FF'}
            emissive={c.cool ? '#4FB8D9' : '#7AC8E8'}
            emissiveIntensity={1.4}
            transparent
            opacity={0.7}
            metalness={0.3}
            roughness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Island() {
  return (
    <group>
      <BumpyTerrain />
      <RockUnderbelly />
      <Crystals />
      {/* Wildflowers scattered on top */}
      <FlowerCluster position={[1.4, 0.55, 0.8]} />
      <FlowerCluster position={[-1.5, 0.55, -0.5]} />
      <FlowerCluster position={[0.3, 0.58, 1.8]} />
      <FlowerCluster position={[-2.0, 0.52, 1.0]} />
      <FlowerCluster position={[2.1, 0.5, -1.2]} />
      <FlowerCluster position={[-0.8, 0.56, -1.9]} />
    </group>
  );
}

function FlowerCluster({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshLambertMaterial color="#F5A6C0" />
      </mesh>
      <mesh position={[0.13, -0.01, 0.09]}>
        <sphereGeometry args={[0.065, 6, 6]} />
        <meshLambertMaterial color="#FFE066" />
      </mesh>
      <mesh position={[-0.11, -0.01, 0.07]}>
        <sphereGeometry args={[0.065, 6, 6]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}
