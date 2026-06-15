'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

import { SkyDome, SUN_DIR } from './components/SkyDome';
import { Island } from './components/Island';
import { GrassField } from './components/GrassField';
import { PuffCloud } from './components/PuffCloud';
import { Kodama } from "./components/Kodama";
import { Torii } from './components/Torii';
import { Cottage } from "./components/Cottage";
import { GLBTrees } from './components/GLBTrees';
import { GLBMushrooms, GLBFlowers, GLBStumps } from './components/GLBScatter';
import { Waterfall } from "./components/Waterfall";
import { Campfire } from './components/Campfire';
import { Lake } from "./components/Lake";
import { CherryBlossoms } from './components/CherryBlossoms';
import { HangingLanterns } from './components/HangingLanterns';
import { DistantClouds } from "./components/DistantClouds";
import { SakuraPetals } from './components/SakuraPetals';
import { HakuDragon } from "./components/HakuDragon";
import { ForestSpirit } from "./components/ForestSpirit";
import { StoneLantern } from './components/StoneLantern';
import { TallGrass } from './components/TallGrass';
import { FireflySwarm } from './components/FireflySwarm';
import { SpiritWisps } from './components/SpiritWisps';
import { DriftingSpores } from './components/DriftingSpores';
import { Bridge } from './components/Bridge';
import { SteppingStones } from './components/SteppingStones';
import { Moon } from './components/Moon';
import { Birds } from './components/Birds';
import { UndersideMist } from './components/UndersideMist';
import { CameraKeys } from './components/CameraKeys';
import { CameraIntro } from './components/CameraIntro';
import { WindProvider } from './components/WindContext';
import { SpiritVisitor } from './components/SpiritVisitor';
import { PoleLanterns } from './components/PoleLanterns';
import { ToriiBeam } from './components/ToriiBeam';
import { Susuwatari } from './components/Susuwatari';
import { WindChime } from './components/WindChime';
import { Cattails } from './components/Cattails';
import { PerchedCrane } from './components/PerchedCrane';
import { DistantMountains } from './components/DistantMountains';
import { Airship } from './components/Airship';

const SUN_DISC_POS = SUN_DIR.clone().multiplyScalar(56);

function SunDisc() {
  return (
    <mesh position={[SUN_DISC_POS.x, SUN_DISC_POS.y, SUN_DISC_POS.z]}>
      <sphereGeometry args={[2.2, 24, 16]} />
      <meshStandardMaterial
        color="#FFE0A0"
        emissive="#FFD060"
        emissiveIntensity={2}
        fog={false}
      />
    </mesh>
  );
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows
      style={{ width: '100%', height: '100%' }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
    >
      <PerspectiveCamera makeDefault position={[8, 4.5, 8]} fov={45} />
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={30}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI - 0.05}
        target={[0, 0.5, 0]}
        autoRotate
        autoRotateSpeed={0.22}
      />

      <CameraIntro />
      <CameraKeys />
      <SkyDome />
      <DistantMountains />
      <SunDisc />
      <Moon />
      <fog attach="fog" args={['#EDC4A8', 25, 80]} />

      <ambientLight intensity={0.55} color="#FFE9CF" />
      <hemisphereLight args={['#FFE6D0', '#7BA85A', 0.45]} />
      <directionalLight
        position={[10, 14, 8]}
        intensity={1.4}
        color="#FFD9A8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-5, -4, -5]} intensity={0.22} color="#A8C8FF" />
      <pointLight position={[-1.6, 1.1, 0.2]} intensity={1.5} color="#FFB830" distance={4} decay={2} />
      {/* Underglow — magic floating feel */}
      <pointLight position={[0, -3.5, 0]} intensity={0.7} color="#7EC8FF" distance={9} decay={2} />

      <Suspense fallback={null}>
        <WindProvider>
        <Island />
        <GrassField count={12000} radius={2.75} yBase={0.5} />
        <GLBTrees />
        <CherryBlossoms />
        <HangingLanterns />
        <GLBMushrooms />
        <GLBFlowers />
        <GLBStumps />
        <Waterfall />
        <Campfire position={[0.8, 0.52, 1.8]} />
        <Lake />
        <Cottage />
        <Torii />
        <group position={[-22, 5, -10]} scale={1.4}><PuffCloud selfLit={false} opacity={0.5} /></group>
        <group position={[20,  6,  12]} scale={1.8}><PuffCloud selfLit={false} opacity={0.45} /></group>
        <group position={[-8,  4, -28]} scale={1.2}><PuffCloud selfLit={false} opacity={0.4} /></group>
        <DistantClouds />
        <Kodama />
        <SakuraPetals />
        <HakuDragon />
        <ForestSpirit position={[1.85, 0.55, 1.3]} rotationY={-0.6} />
        <StoneLantern position={[-2.25, 0.55, 0.8]} scale={1.1} />
        <StoneLantern position={[1.4, 0.55, -1.9]} scale={0.85} />
        <TallGrass />
        <group position={[0, 0.8, 0]}><FireflySwarm count={85} radius={3.5} height={2.0} /></group>
        <group position={[0, 0.3, 0]}><SpiritWisps count={50} radius={3} height={3} /></group>
        <group position={[0, 0.5, 0]}><DriftingSpores count={60} radius={4} height={3} /></group>
        <Bridge position={[-1.5, 0.5, 1.6]} rotationY={1.0} scale={0.85} />
        <SteppingStones />
        <Birds />
        <UndersideMist />
        <SpiritVisitor position={[-1.05, 0.5, -0.35]} rotationY={0.5} />
        <PoleLanterns />
        <ToriiBeam />
        <Susuwatari />
        <WindChime position={[-1.0, 2.0, 1.2]} />
        <WindChime position={[1.7, 2.0, -0.5]} />
        <Cattails />
        <PerchedCrane position={[2.0, 2.45, 0.55]} rotationY={-0.6} />
        <Airship variant="chunky" scale={0.006} />
        <Airship variant="chunky" radius={20} altitude={10} speed={-0.025} phase={2.1} scale={0.004} />
        <Airship variant="prop" radius={11} altitude={5.5} speed={0.06} phase={4.2} scale={0.0014} />

        </WindProvider>
        {/* EffectComposer disabled — CherryBlossoms' ShaderMaterial was one culprit
            (fixed by switching to MeshLambertMaterial vertexColors). One or more
            other components still incompatible: Cottage / Lake / Waterfall / Kodama
            / HakuDragon / DistantClouds all use custom ShaderMaterials. Audit
            needed: check for `color` attribute collisions with Three's auto-
            injected vertex color attribute, and for NaN-producing shader math
            (normalize of zero vector, etc). */}
      </Suspense>
    </Canvas>
  );
}
