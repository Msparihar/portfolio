"use client";

import { Canvas } from "@react-three/fiber";
import { Float, Sphere, Torus, Box, MeshDistortMaterial } from "@react-three/drei";
import { Suspense } from "react";

const GeometricShape = ({ position, type = "sphere", color = "#22c55e" }) => {
  const shapeProps = {
    position,
    scale: 0.5,
  };

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={1}
      floatingRange={[-0.5, 0.5]}
    >
      {type === "sphere" && (
        <Sphere {...shapeProps} args={[1, 32, 32]}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0.4}
            metalness={0.8}
            transparent
            opacity={0.3}
          />
        </Sphere>
      )}
      {type === "torus" && (
        <Torus {...shapeProps} args={[1, 0.3, 16, 100]}>
          <meshStandardMaterial
            color={color}
            wireframe
            transparent
            opacity={0.2}
          />
        </Torus>
      )}
      {type === "box" && (
        <Box {...shapeProps} args={[1.5, 1.5, 1.5]}>
          <meshStandardMaterial
            color={color}
            wireframe
            transparent
            opacity={0.15}
          />
        </Box>
      )}
    </Float>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />

      {/* Multiple floating shapes at different positions */}
      <GeometricShape position={[-4, 2, -5]} type="sphere" color="#22c55e" />
      <GeometricShape position={[4, -2, -8]} type="torus" color="#3b82f6" />
      <GeometricShape position={[6, 3, -6]} type="box" color="#a855f7" />
      <GeometricShape position={[-5, -3, -7]} type="torus" color="#22c55e" />
      <GeometricShape position={[2, 4, -9]} type="sphere" color="#06b6d4" />
      <GeometricShape position={[-3, -1, -6]} type="box" color="#8b5cf6" />
    </>
  );
};

export const FloatingShapes = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};

