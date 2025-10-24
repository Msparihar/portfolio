"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float, Sphere } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import { SkillSphereParticles } from "./SkillSphereParticles";

// Skill Tag Component
const SkillTag = ({ position, text, category, onClick, isActive }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Category colors
  const colors = {
    languages: "#22c55e",    // green
    frameworks: "#3b82f6",   // blue
    tools: "#a855f7",        // purple
    aiml: "#f97316",         // orange
  };

  const color = colors[category] || "#22c55e";

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.2}
      floatIntensity={0.5}
      floatingRange={[-0.1, 0.1]}
    >
      <group position={position}>
        <Text
          ref={meshRef}
          position={[0, 0, 0]}
          fontSize={hovered || isActive ? 0.35 : 0.3}
          color={isActive ? "#ffffff" : color}
          anchorX="center"
          anchorY="middle"
          onClick={() => onClick(text, category)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          font="/fonts/FiraCode-Regular.ttf"
        >
          {text}
          <meshStandardMaterial
            color={isActive ? "#ffffff" : color}
            emissive={isActive ? color : "#000000"}
            emissiveIntensity={isActive ? 0.5 : hovered ? 0.3 : 0}
          />
        </Text>

        {/* Glow effect on hover or active */}
        {(hovered || isActive) && (
          <pointLight
            position={[0, 0, 0]}
            intensity={isActive ? 2 : 1}
            distance={3}
            color={color}
          />
        )}
      </group>
    </Float>
  );
};

// Wireframe Sphere Background
const WireframeSphere = () => {
  const sphereRef = useRef();

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      sphereRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[6, 32, 32]}>
      <meshBasicMaterial
        color="#22c55e"
        wireframe
        transparent
        opacity={0.1}
      />
    </Sphere>
  );
};

// Main 3D Scene
const Scene = ({ skills, activeSkills, onSkillClick, showParticles = true }) => {
  // Position skills in spherical coordinates
  const skillPositions = useMemo(() => {
    const positions = [];
    const allSkills = Object.entries(skills).flatMap(([category, skillList]) =>
      skillList.map(skill => ({ skill, category }))
    );

    const count = allSkills.length;
    const radius = 5;

    allSkills.forEach((item, i) => {
      // Fibonacci sphere distribution for even spacing
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push({
        position: [x, y, z],
        text: item.skill,
        category: item.category,
      });
    });

    return positions;
  }, [skills]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[10, -10, 5]} intensity={0.5} color="#a855f7" />

      {/* Wireframe Sphere Background */}
      <WireframeSphere />

      {/* Particle Effects */}
      {showParticles && <SkillSphereParticles count={500} />}

      {/* Skill Tags */}
      {skillPositions.map((item, index) => (
        <SkillTag
          key={index}
          position={item.position}
          text={item.text}
          category={item.category}
          onClick={onSkillClick}
          isActive={activeSkills.includes(item.text)}
        />
      ))}

      {/* Orbit Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={8}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// Main Component
export const SkillSphere = ({ skills, onSkillSelect, showParticles = true }) => {
  const [activeSkills, setActiveSkills] = useState([]);

  const handleSkillClick = (skill, category) => {
    const newActiveSkills = activeSkills.includes(skill)
      ? activeSkills.filter(s => s !== skill)
      : [...activeSkills, skill];

    setActiveSkills(newActiveSkills);

    if (onSkillSelect) {
      onSkillSelect(newActiveSkills, category);
    }
  };

  const handleClearFilters = () => {
    setActiveSkills([]);
    if (onSkillSelect) {
      onSkillSelect([], null);
    }
  };

  return (
    <div className="relative w-full h-[600px] md:h-[700px] rounded-xl overflow-hidden bg-black/20 border border-border/30">
      {/* Instructions */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-green-500/30">
        <p className="text-sm text-green-400 font-mono">
          🖱️ Drag to rotate • 🔍 Scroll to zoom • 👆 Click skills to filter
        </p>
      </div>

      {/* Active Filters */}
      {activeSkills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 left-4 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-green-500/30"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-green-400">Active Filters:</span>
            {activeSkills.map((skill, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded border border-green-500/30"
              >
                {skill}
              </span>
            ))}
            <button
              onClick={handleClearFilters}
              className="px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              ✕ Clear
            </button>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-sm px-4 py-3 rounded-lg border border-border/30">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-300">Languages</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-300">Frameworks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-300">Tools</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-300">AI/ML</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene
          skills={skills}
          activeSkills={activeSkills}
          onSkillClick={handleSkillClick}
          showParticles={showParticles}
        />
      </Canvas>
    </div>
  );
};

